import asyncio
import time
from uuid import uuid4

import cv2
import easyocr
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

from ..data.app_data import app_data
from ..routes.websockets import ws_manager
from ..utils.image_utils import encode_frame_to_base64, resize_frame


class VehicleFinder:
    def __init__(
        self,
        vehicle_model_path: str,
        plate_model_path: str,
        video_path: str,
        polygon_zone: list = None,
        vehicle_class_names: list = None,
        conf_score: float = 0.3,
        iou_threshold: float = 0.7,
    ):
        self.vehicle_model = YOLO(vehicle_model_path)
        self.plate_model = YOLO(plate_model_path)
        self.reader = easyocr.Reader(["en"], gpu=True)

        self.video_info = None
        self.video_path = video_path
        self.polygon_zone = np.array(polygon_zone) if polygon_zone else None
        self.vehicle_class_names = vehicle_class_names
        self.conf_score = conf_score
        self.iou_threshold = iou_threshold

        # Colors for normal and lookout vehicles
        self.colors = {
            "normal": sv.Color(r=0, g=0, b=255),  # Blue
            "lookout": sv.Color(r=10, g=145, b=144),  # Green
        }

        # Track reported license plates
        self.reported_plates = set()

        # Setup video info during initialization
        self._setup_video_info(video_path)

    def _setup_video_info(self, video_path: str):
        self.video_info = sv.VideoInfo.from_video_path(video_path)
        self.video_info.fps = 30 if self.video_info.fps == 0 else self.video_info.fps
        self.frame_delay = 1 / self.video_info.fps

        # Initialize ByteTrack
        self.byte_track = sv.ByteTrack(
            frame_rate=self.video_info.fps,
            track_activation_threshold=self.conf_score,
        )

        self._setup_annotators()

    def _setup_annotators(self):
        thickness = sv.calculate_optimal_line_thickness(self.video_info.resolution_wh)
        text_scale = sv.calculate_optimal_text_scale(self.video_info.resolution_wh)

        # Setup zone object if polygon is defined
        if self.polygon_zone is not None:
            self.zone = sv.PolygonZone(polygon=self.polygon_zone)
            # Define color for the polygon zone
            self.polygon_color = sv.Color(r=255, g=0, b=0)
        else:
            self.zone = None
            self.polygon_color = None  # No color needed if no polygon

        self.box_annotators = {
            "normal": sv.BoxAnnotator(thickness=thickness, color=self.colors["normal"]),
            "lookout": sv.BoxAnnotator(
                thickness=thickness, color=self.colors["lookout"]
            ),
        }
        self.label_annotators = {
            "normal": sv.LabelAnnotator(
                text_scale=text_scale,
                text_thickness=thickness,
                text_position=sv.Position.TOP_CENTER,  # Changed to TOP_CENTER
                color=self.colors["normal"],
            ),
            "lookout": sv.LabelAnnotator(
                text_scale=text_scale,
                text_thickness=thickness,
                text_position=sv.Position.TOP_CENTER,  # Changed to TOP_CENTER
                color=self.colors["lookout"],
            ),
        }

    def _detect_license_plate(self, frame, vehicle_box):
        # Extract vehicle region
        x1, y1, x2, y2 = map(int, vehicle_box)
        vehicle_region = frame[y1:y2, x1:x2]

        # Detect license plate
        results = self.plate_model(vehicle_region, verbose=False)[0]
        plates = sv.Detections.from_ultralytics(results)

        if len(plates) == 0:
            return None

        # Get the most confident plate detection
        best_idx = plates.confidence.argmax()
        plate_box = plates.xyxy[best_idx]  # Get the box directly from the index

        # Extract plate region and perform OCR
        px1, py1, px2, py2 = map(int, plate_box)
        plate_region = vehicle_region[py1:py2, px1:px2]

        # Convert to grayscale for better OCR
        gray_plate = cv2.cvtColor(plate_region, cv2.COLOR_BGR2GRAY)
        results = self.reader.readtext(gray_plate)

        if not results:
            return None

        # Get the most confident text
        text = max(results, key=lambda x: x[2])[1]
        return text.upper().strip()

    async def process_video(self):
        frame_generator = sv.get_video_frames_generator(source_path=self.video_path)

        with tqdm(desc="Processing Frames", unit="frame") as progress_bar:
            for frame in frame_generator:
                start_time = time.time()

                # Detect vehicles
                detections = sv.Detections.from_ultralytics(
                    self.vehicle_model(frame, verbose=False)[0]
                )

                # Filter by zone if specified
                if self.zone is not None:
                    in_zone_mask = self.zone.trigger(detections=detections)
                    detections = detections[in_zone_mask]

                # Filter by class and confidence
                if self.vehicle_class_names:
                    class_mask = np.isin(
                        [
                            self.vehicle_model.names[cls_id]
                            for cls_id in detections.class_id
                        ],
                        self.vehicle_class_names,
                    )
                    detections = detections[class_mask]

                detections = detections[detections.confidence > self.conf_score]
                detections = detections.with_nms(threshold=self.iou_threshold)
                detections = self.byte_track.update_with_detections(detections)

                # Process each detection
                labels, is_lookout = [], []
                for i, (xyxy, tracker_id, cls_id) in enumerate(
                    zip(detections.xyxy, detections.tracker_id, detections.class_id)
                ):
                    # Detect license plate
                    plate_text = self._detect_license_plate(frame, xyxy)
                    if not plate_text:
                        labels.append(f"#{tracker_id}")
                        is_lookout.append(False)
                        continue

                    # Check if vehicle is in lookout list
                    found = plate_text in set(
                        v.upper() for v in (app_data["lookoutVehicles"] or [])
                    )
                    labels.append(
                        f"#{tracker_id} {plate_text}" + (" [Found]" if found else "")
                    )
                    is_lookout.append(found)

                    if found and plate_text not in self.reported_plates:
                        # Mark plate as reported
                        self.reported_plates.add(plate_text)

                        # Prepare found vehicle notification
                        vehicle_frame = frame.copy()
                        det = sv.Detections(
                            xyxy=np.array([xyxy]),
                            confidence=np.array([detections.confidence[i]]),
                            class_id=np.array([cls_id]),
                            tracker_id=np.array([tracker_id]),
                        )
                        vehicle_frame = self.box_annotators["lookout"].annotate(
                            scene=vehicle_frame, detections=det
                        )
                        vehicle_frame = self.label_annotators["lookout"].annotate(
                            scene=vehicle_frame, detections=det, labels=[labels[-1]]
                        )

                        # Send to frontend
                        img_base64 = encode_frame_to_base64(resize_frame(vehicle_frame))
                        await ws_manager.broadcast(
                            {
                                "event": "server:vehicle-found",
                                "data": {
                                    "id": str(uuid4()),
                                    "imgSrc": img_base64,
                                    "plateNumber": plate_text,
                                    "detectedAt": time.time() * 1000,
                                    "className": self.vehicle_model.names[cls_id],
                                },
                            }
                        )

                # Annotate frame
                is_lookout = np.array(is_lookout, dtype=bool)  # Ensure boolean array
                dets = {
                    "normal": detections[~is_lookout],  # Use ~ safely
                    "lookout": detections[is_lookout],
                }
                labs = {
                    "normal": [
                        label for label, found in zip(labels, is_lookout) if not found
                    ],
                    "lookout": [
                        label for label, found in zip(labels, is_lookout) if found
                    ],
                }

                # Draw zone first using sv.draw_polygon
                annotated_frame = frame.copy()
                if self.zone is not None and self.polygon_zone is not None:
                    annotated_frame = sv.draw_polygon(
                        scene=annotated_frame,
                        polygon=self.polygon_zone,
                        color=self.polygon_color,
                    )

                # Then draw boxes and labels
                for key in ("normal", "lookout"):
                    annotated_frame = self.box_annotators[key].annotate(
                        scene=annotated_frame, detections=dets[key]
                    )
                    annotated_frame = self.label_annotators[key].annotate(
                        scene=annotated_frame, detections=dets[key], labels=labs[key]
                    )

                # Prepare frame for streaming
                show_frame = resize_frame(annotated_frame, max_width=640)
                _, buffer = cv2.imencode(".jpg", show_frame)
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
                )

                progress_bar.update(1)

                processing_time = time.time() - start_time
                if processing_time < self.frame_delay:
                    time.sleep(self.frame_delay - processing_time)

                await asyncio.sleep(0)
