import asyncio
import time
from uuid import uuid4

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

from ..routes.websockets import ws_manager
from ..utils.image_utils import encode_frame_to_base64, resize_frame


class RedLightCrossingDetector:
    def __init__(
        self,
        model_path: str,
        video_path: str,
        class_names: list = None,
        conf_score: float = 0.3,
        iou_threshold: float = 0.7,
        safe_zone_polygon: list = None,
    ):
        if safe_zone_polygon is None:
            raise ValueError("safe_zone_polygon must be provided")

        self.model_path = model_path
        self.video_path = video_path
        self.class_names = class_names
        self.conf_score = conf_score
        self.iou_threshold = iou_threshold
        self.safe_zone_polygon = np.array(safe_zone_polygon)

        # Load the YOLO model
        self.yolo_model = YOLO(self.model_path)
        self.video_info = sv.VideoInfo.from_video_path(video_path=self.video_path)

        # Get video properties
        self.video_info.fps = 30 if self.video_info.fps == 0 else self.video_info.fps
        self.frame_delay = 1 / self.video_info.fps

        self._setup_annotators()

        # Initialize ByteTrack for object tracking
        self.byte_track = sv.ByteTrack(
            frame_rate=self.video_info.fps,
            track_activation_threshold=self.conf_score,
        )

        # Store tracked objects
        self.tracked_objects_map = {}
        self.object_count = 0

    def _setup_annotators(self):
        thickness = sv.calculate_optimal_line_thickness(
            resolution_wh=self.video_info.resolution_wh
        )
        text_scale = sv.calculate_optimal_text_scale(
            resolution_wh=self.video_info.resolution_wh
        )
        color_blue, color_red = sv.Color(r=0, g=0, b=255), sv.Color(r=255, g=0, b=0)

        self.box_annotators = {
            False: sv.BoxAnnotator(thickness=thickness, color=color_blue),
            True: sv.BoxAnnotator(thickness=thickness, color=color_red),
        }
        self.label_annotators = {
            False: sv.LabelAnnotator(
                text_scale=text_scale,
                text_thickness=thickness,
                text_position=sv.Position.BOTTOM_CENTER,
                color=color_blue,
            ),
            True: sv.LabelAnnotator(
                text_scale=text_scale,
                text_thickness=thickness,
                text_position=sv.Position.BOTTOM_CENTER,
                color=color_red,
            ),
        }
        self.polygon_zone = sv.PolygonZone(polygon=self.safe_zone_polygon)
        self.polygon_zone_annotator = sv.PolygonZoneAnnotator(
            zone=self.polygon_zone,
            color=color_red,
            thickness=thickness * 2,
            display_in_zone_count=False,
            opacity=0.1,
        )

    def _is_violator(self, tracker_state):
        return tracker_state["was_in_safe_zone"] and not tracker_state["in_safe_zone"]

    async def process_video(self):
        frame_generator = sv.get_video_frames_generator(source_path=self.video_path)

        with tqdm(
            desc="Frames Processed",
            unit="frame",
            dynamic_ncols=True,
            bar_format="{desc}: {n} [{elapsed}, {rate_fmt}]",
        ) as progress_bar:
            for frame in frame_generator:
                start_time = time.time()

                # Perform object detection using YOLO
                detections = sv.Detections.from_ultralytics(
                    self.yolo_model(frame, verbose=False)[0]
                )
                detections = detections[detections.confidence > self.conf_score]

                # Filter by class if specified
                if self.class_names is not None:
                    model_class_names = self.yolo_model.names
                    class_mask = np.isin(
                        [model_class_names[cls_id] for cls_id in detections.class_id],
                        self.class_names,
                    )
                    detections = detections[class_mask]

                detections = detections.with_nms(threshold=self.iou_threshold)

                # Update object tracks using ByteTrack
                detections = self.byte_track.update_with_detections(
                    detections=detections
                )

                # Calculate the center of each detected object
                centers = (
                    np.column_stack(
                        [
                            (detections.xyxy[:, 0] + detections.xyxy[:, 2]) / 2,
                            (detections.xyxy[:, 1] + detections.xyxy[:, 3]) / 2,
                        ]
                    )
                    if len(detections) > 0
                    else np.empty((0, 2))
                )

                # Check if bbox center is in safe zone
                in_safe_zone = (
                    np.array(
                        [
                            cv2.pointPolygonTest(
                                self.safe_zone_polygon.astype(np.int32),
                                tuple(center),
                                False,
                            )
                            >= 0
                            for center in centers
                        ]
                    )
                    if len(centers) > 0
                    else np.array([], dtype=bool)
                )

                labels, violator_mask = [], []
                for i, tracker_id in enumerate(detections.tracker_id):
                    if tracker_id not in self.tracked_objects_map:
                        self.object_count += 1
                        self.tracked_objects_map[tracker_id] = {
                            "object_id": self.object_count,
                            "was_in_safe_zone": in_safe_zone[i],
                            "in_safe_zone": in_safe_zone[i],
                            "violation_reported": False,
                        }
                    else:
                        prev = self.tracked_objects_map[tracker_id]
                        prev["was_in_safe_zone"] |= in_safe_zone[i]
                        prev["in_safe_zone"] = in_safe_zone[i]

                    state = self.tracked_objects_map[tracker_id]
                    is_violator = self._is_violator(state)
                    violator_mask.append(is_violator)
                    class_name = self.yolo_model.names[detections.class_id[i]]
                    label = f"{class_name.capitalize()} #{state['object_id']}"

                    # Check if it's the first time this object is violating
                    if is_violator and not state["violation_reported"]:
                        state["violation_reported"] = True
                        label += " [Violator]"

                        # Create a copy of the frame for the violation snapshot
                        violation_frame = frame.copy()

                        # Annotate the polygon zone
                        violation_frame = self.polygon_zone_annotator.annotate(
                            scene=violation_frame
                        )

                        # Isolate the violator's detection data
                        violator_detection = sv.Detections(
                            xyxy=np.array([detections.xyxy[i]]),
                            confidence=np.array([detections.confidence[i]]),
                            class_id=np.array([detections.class_id[i]]),
                            tracker_id=np.array([detections.tracker_id[i]]),
                        )

                        # Annotate the violator's bounding box
                        violation_frame = self.box_annotators[True].annotate(
                            scene=violation_frame, detections=violator_detection
                        )

                        # Prepare the label for the violation snapshot
                        violation_label = f"{class_name.capitalize()} [Violator]"

                        # Annotate the violator's label
                        violation_frame = self.label_annotators[True].annotate(
                            scene=violation_frame,
                            detections=violator_detection,
                            labels=[violation_label],
                        )

                        # Resize and encode the violation frame using utility functions
                        resized_violation_frame = resize_frame(violation_frame)
                        img_base64 = encode_frame_to_base64(resized_violation_frame)

                        # Broadcast violation message
                        message = {
                            "id": str(uuid4()),
                            "imgSrc": img_base64,
                            "className": class_name,
                            "detectedAt": time.time() * 1000,
                        }
                        await ws_manager.broadcast(
                            {"event": "server:red-light-violation", "data": message}
                        )
                    elif is_violator:
                        label += " [Violator]"

                    labels.append(label)

                violator_mask = np.array(violator_mask, dtype=bool)
                dets = {
                    False: detections[~violator_mask],
                    True: detections[violator_mask],
                }
                labs = {
                    False: [
                        label_text
                        for i, label_text in enumerate(labels)
                        if not violator_mask[i]
                    ],
                    True: [
                        label_text
                        for i, label_text in enumerate(labels)
                        if violator_mask[i]
                    ],
                }

                # Annotate the frame with the polygon zone
                annotated_frame = frame.copy()
                annotated_frame = self.polygon_zone_annotator.annotate(
                    scene=annotated_frame
                )
                # Annotate the frame with bounding boxes and labels
                for violator in (False, True):
                    annotated_frame = self.box_annotators[violator].annotate(
                        scene=annotated_frame, detections=dets[violator]
                    )
                    annotated_frame = self.label_annotators[violator].annotate(
                        scene=annotated_frame,
                        detections=dets[violator],
                        labels=labs[violator],
                    )

                # Resize frame for streaming display
                show_frame = resize_frame(annotated_frame, max_width=640)

                # Encode frame in JPEG format
                _, buffer = cv2.imencode(".jpg", show_frame)
                show_frame_bytes = buffer.tobytes()

                # Yield the frame with a specific format for streaming
                yield (
                    b"--frame\r\n"
                    + b"Content-Type: image/jpeg\r\n\r\n"
                    + show_frame_bytes
                    + b"\r\n"
                )

                progress_bar.update(1)

                processing_time = time.time() - start_time
                if processing_time < self.frame_delay:
                    time.sleep(self.frame_delay - processing_time)

                await asyncio.sleep(0)  # Yield control to the event loop
