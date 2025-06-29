import asyncio
import time
from collections import defaultdict
from typing import List, Optional
from uuid import uuid4

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

from ..routes.websockets import ws_manager
from ..utils.image_utils import encode_frame_to_base64, resize_frame


class NoHelmetDetector:
    # Define the specific class name for no-helmet detection
    # *** IMPORTANT: Change this if your model uses a different class name ***
    NO_HELMET_CLASS_NAME = "no_helmet"
    HELMET_CLASS_NAME = "helmet"

    def __init__(
        self,
        model_path: str,
        video_path: str,
        class_names: Optional[List[str]] = None,
        conf_score: float = 0.3,
        iou_threshold: Optional[float] = 0.5,
    ):
        self.model_path = model_path
        self.video_path = video_path
        self.class_names = class_names
        self.conf_score = conf_score
        self.iou_threshold = iou_threshold

        # Load the model
        self.yolo_model = YOLO(self.model_path)
        self.model_class_names = self.yolo_model.names

        # Video input info
        self.video_info = sv.VideoInfo.from_video_path(video_path=self.video_path)
        if self.video_info.fps == 0:
            self.video_info.fps = 30
        self.frame_delay = 1 / self.video_info.fps

        # Initialize tracker
        self.byte_track = sv.ByteTrack(
            frame_rate=self.video_info.fps,
            track_activation_threshold=self.conf_score,
        )

        # Initialize annotators
        self._setup_annotators()

        # Object tracking info storage, including violation state
        self.tracked_objects_info = defaultdict(
            lambda: {
                "violation_reported": False,
                "no_helmet_count": 0,
                "helmet_count": 0,
                "uuid": None,
            }
        )
        self.object_counter = 0

    def _setup_annotators(self):
        thickness = sv.calculate_optimal_line_thickness(
            resolution_wh=self.video_info.resolution_wh
        )
        text_scale = sv.calculate_optimal_text_scale(
            resolution_wh=self.video_info.resolution_wh
        )
        # Standard annotator
        self.box_annotator = sv.BoxAnnotator(thickness=thickness)
        self.label_annotator = sv.LabelAnnotator(
            text_scale=text_scale,
            text_thickness=thickness,
            text_position=sv.Position.BOTTOM_LEFT,
        )
        # Annotator for highlighting violations (e.g., red color)
        self.violator_box_annotator = sv.BoxAnnotator(
            thickness=thickness, color=sv.Color.RED
        )
        self.violator_label_annotator = sv.LabelAnnotator(
            text_scale=text_scale,
            text_thickness=thickness,
            text_position=sv.Position.BOTTOM_LEFT,
            color=sv.Color.RED,
        )

    async def process_video(self):
        frame_generator = sv.get_video_frames_generator(source_path=self.video_path)
        current_frame_number = 0

        with tqdm(
            total=self.video_info.total_frames
            if self.video_info.total_frames
            else None,
            desc="Frames Processed",
            unit="frame",
            dynamic_ncols=True,
            bar_format="{desc}: {n}/{total} [{elapsed}<{remaining}, {rate_fmt}]"
            if self.video_info.total_frames
            else "{desc}: {n} [{elapsed}, {rate_fmt}]",
        ) as progress_bar:
            for frame in frame_generator:
                start_time = time.time()
                current_frame_number += 1

                # Run detection
                results = self.yolo_model(frame, verbose=False)[0]
                detections = sv.Detections.from_ultralytics(results)

                # Filter by confidence
                detections = detections[detections.confidence > self.conf_score]

                # Apply NMS if iou_threshold is provided
                if self.iou_threshold is not None:
                    detections = detections.with_nms(threshold=self.iou_threshold)

                # Filter by class name if specified
                if self.class_names is not None:
                    class_mask = np.array(
                        [
                            self.model_class_names[cls_id] in self.class_names
                            for cls_id in detections.class_id
                        ],
                        dtype=bool,
                    )
                    detections = detections[class_mask]

                # Update tracker
                detections = self.byte_track.update_with_detections(
                    detections=detections
                )

                labels = []
                if len(detections) > 0 and detections.tracker_id is not None:
                    for det_idx, tracker_id in enumerate(detections.tracker_id):
                        class_id = detections.class_id[det_idx]
                        class_name = self.model_class_names[class_id]

                        state = self.tracked_objects_info[tracker_id]
                        # Assign unique object ID and UUID if first time seeing this tracker_id
                        if "object_id" not in state:
                            self.object_counter += 1
                            state["object_id"] = self.object_counter
                            state["uuid"] = str(uuid4())

                        object_id = state["object_id"]
                        display_label = f"{class_name.capitalize()} #{object_id}"

                        # Update detection counts
                        if class_name == self.NO_HELMET_CLASS_NAME:
                            state["no_helmet_count"] += 1
                        elif class_name == self.HELMET_CLASS_NAME:
                            state["helmet_count"] += 1

                        # Determine violation state
                        is_violator = state["no_helmet_count"] > state["helmet_count"]

                        if is_violator and not state["violation_reported"]:
                            state["violation_reported"] = True
                            display_label += " [Violator]"

                            # --- Prepare and send violation snapshot ---
                            violation_frame = frame.copy()
                            violator_detection_data = sv.Detections(
                                xyxy=np.array([detections.xyxy[det_idx]]),
                                confidence=np.array([detections.confidence[det_idx]]),
                                class_id=np.array([detections.class_id[det_idx]]),
                                tracker_id=np.array([detections.tracker_id[det_idx]]),
                            )
                            violation_snapshot_label = f"{class_name.capitalize()}"

                            violation_frame = self.violator_box_annotator.annotate(
                                scene=violation_frame,
                                detections=violator_detection_data,
                            )
                            violation_frame = self.violator_label_annotator.annotate(
                                scene=violation_frame,
                                detections=violator_detection_data,
                                labels=[violation_snapshot_label],
                            )

                            resized_violation_frame = resize_frame(violation_frame)
                            img_base64 = encode_frame_to_base64(resized_violation_frame)

                            message = {
                                "id": state["uuid"],
                                "imgSrc": img_base64,
                                "className": class_name,
                                "detectedAt": time.time() * 1000,
                            }
                            await ws_manager.broadcast(
                                {"event": "server:no-helmet-violation", "data": message}
                            )

                        elif not is_violator and state["violation_reported"]:
                            state["violation_reported"] = False

                            # --- Send update event to frontend ---
                            message = {"id": state["uuid"]}
                            await ws_manager.broadcast(
                                {
                                    "event": "server:remove-no-helmet-violation",
                                    "data": message,
                                }
                            )

                        elif is_violator:
                            display_label += " [Violator]"

                        labels.append(display_label)

                # Annotate the main stream frame
                annotated_frame = frame.copy()
                if len(detections) > 0:
                    annotated_frame = self.box_annotator.annotate(
                        scene=annotated_frame, detections=detections
                    )
                    annotated_frame = self.label_annotator.annotate(
                        scene=annotated_frame, detections=detections, labels=labels
                    )

                show_frame = resize_frame(annotated_frame, max_width=640)
                _, buffer = cv2.imencode(".jpg", show_frame)
                show_frame_bytes = buffer.tobytes()

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
