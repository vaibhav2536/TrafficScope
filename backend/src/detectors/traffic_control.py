import asyncio
import math
import time
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import supervision as sv

# from tqdm import tqdm
from ultralytics import YOLO

from ..routes.websockets import ws_manager


class TrafficControl:
    def __init__(
        self,
        model_path: str,
        video_sources: List[Dict[str, Any]],
        class_names: Optional[List[str]] = None,
        conf_score: float = 0.3,
        iou_threshold: Optional[float] = 0.5,
    ):
        self.model_path = model_path
        self.video_sources = video_sources
        self.class_names = class_names
        self.conf_score = conf_score
        self.iou_threshold = iou_threshold

        # Load the model
        self.yolo_model = YOLO(self.model_path)
        self.model_class_names = self.yolo_model.names

        # Video processing setup per source
        self.source_data = {}
        for source in self.video_sources:
            video_id = source["video_id"]
            video_path = source["video_path"]
            polygon_coords = np.array(source["region_polygon"], dtype=np.int32)

            video_info = sv.VideoInfo.from_video_path(video_path=video_path)
            if video_info.fps == 0:
                video_info.fps = 30  # Default FPS if needed

            zone = sv.PolygonZone(
                polygon=polygon_coords  # Removed frame_resolution_wh argument
            )

            self.source_data[video_id] = {
                "video_path": video_path,
                "video_info": video_info,
                "frame_delay": 1 / video_info.fps,
                "byte_track": sv.ByteTrack(
                    frame_rate=video_info.fps,
                    track_activation_threshold=self.conf_score,
                ),
                "zone": zone,
                "tracked_objects_info": defaultdict(
                    lambda: {
                        "firstDetected": None,
                        "lastDetected": None,
                        "object_id": None,
                        "className": None,
                    }
                ),
                "object_counter": 0,
                "frame_generator": sv.get_video_frames_generator(
                    source_path=video_path
                ),
                "last_frame": None,  # To store the last processed frame for the blackboard
                "finished": False,  # Flag to indicate if the source is finished
                "annotators": self._setup_annotators(
                    video_info.resolution_wh, zone, video_info.fps
                ),  # Setup annotators per source
                "coordinates": defaultdict(lambda: deque(maxlen=video_info.fps)),
            }

    def _setup_annotators(
        self, resolution_wh: Tuple[int, int], zone: sv.PolygonZone, fps: int
    ):
        thickness = sv.calculate_optimal_line_thickness(resolution_wh=resolution_wh)
        text_scale = sv.calculate_optimal_text_scale(resolution_wh=resolution_wh)
        box_annotator = sv.BoxAnnotator(thickness=thickness)
        label_annotator = sv.LabelAnnotator(
            text_scale=text_scale,
            text_thickness=thickness,
            text_position=sv.Position.TOP_LEFT,
        )
        zone_annotator = sv.PolygonZoneAnnotator(
            zone=zone,  # Use the passed zone object directly
            color=sv.Color.RED,
            thickness=thickness,
            text_thickness=thickness,
            text_scale=text_scale,
        )
        trace_annotator = sv.TraceAnnotator(
            thickness=thickness,
            trace_length=fps * 2,  # Trace length based on fps
            position=sv.Position.BOTTOM_CENTER,
        )
        return {
            "box": box_annotator,
            "label": label_annotator,
            "zone": zone_annotator,
            "trace": trace_annotator,
        }

    async def process_video(self):
        active_sources = list(self.source_data.keys())
        max_fps = max(data["video_info"].fps for data in self.source_data.values())
        frame_delay = (
            1 / max_fps if max_fps > 0 else 1 / 30
        )  # Use max FPS for sleep delay

        while any(not self.source_data[vid]["finished"] for vid in active_sources):
            start_time = time.time()
            frames_data = {}
            all_finished = True
            websocket_data = []

            for video_id in active_sources:
                source_info = self.source_data[video_id]
                if source_info["finished"]:
                    # Keep showing the last frame if the source finished
                    frames_data[video_id] = source_info["last_frame"]
                    continue

                try:
                    frame = next(source_info["frame_generator"])
                    all_finished = False  # At least one source is still active
                    source_info["last_frame"] = frame  # Store the latest frame

                    # --- Detection and Tracking ---
                    results = self.yolo_model(frame, verbose=False)[0]
                    detections = sv.Detections.from_ultralytics(results)
                    detections = detections[detections.confidence > self.conf_score]
                    if self.iou_threshold is not None:
                        detections = detections.with_nms(threshold=self.iou_threshold)

                    # Filter by class name if specified
                    if self.class_names:
                        class_mask = np.array(
                            [
                                self.model_class_names[cls_id] in self.class_names
                                for cls_id in detections.class_id
                            ],
                            dtype=bool,
                        )
                        detections = detections[class_mask]

                    # Filter detections by zone
                    zone_mask = source_info["zone"].trigger(detections=detections)
                    detections_in_zone = detections[zone_mask]

                    # Update tracker
                    tracked_detections = source_info[
                        "byte_track"
                    ].update_with_detections(detections=detections_in_zone)

                    # --- Process Tracked Objects ---
                    current_detections_for_ws = []
                    labels = []
                    current_time = time.time()

                    # Get points for trace annotator
                    points = tracked_detections.get_anchors_coordinates(
                        anchor=sv.Position.BOTTOM_CENTER
                    )

                    if (
                        len(tracked_detections) > 0
                        and tracked_detections.tracker_id is not None
                    ):
                        for det_idx, tracker_id in enumerate(
                            tracked_detections.tracker_id
                        ):
                            # Update coordinates for tracing
                            point = points[det_idx]
                            source_info["coordinates"][tracker_id].append(point)

                            state = source_info["tracked_objects_info"][tracker_id]
                            class_id = tracked_detections.class_id[det_idx]
                            class_name = self.model_class_names[class_id]

                            if (
                                state["object_id"] is None
                            ):  # First time seeing this object in the zone
                                source_info["object_counter"] += 1
                                state["object_id"] = source_info["object_counter"]
                                state["firstDetected"] = current_time
                                state["className"] = class_name

                            state["lastDetected"] = current_time
                            elapsed_time = int(
                                state["lastDetected"] - state["firstDetected"]
                            )

                            display_label = f"#{state['object_id']} ({elapsed_time}s)"
                            labels.append(display_label)

                            # Prepare data for WebSocket message
                            current_detections_for_ws.append(
                                {
                                    "className": state["className"],
                                    "confScore": float(
                                        tracked_detections.confidence[det_idx]
                                    ),  # Ensure float
                                    "elapsedTime": elapsed_time,
                                }
                            )

                    # --- Annotate Frame ---
                    annotated_frame = frame.copy()
                    # Annotate zone first
                    annotated_frame = source_info["annotators"]["zone"].annotate(
                        scene=annotated_frame
                    )

                    # Annotate detections
                    if len(tracked_detections) > 0:
                        annotated_frame = source_info["annotators"]["box"].annotate(
                            scene=annotated_frame, detections=tracked_detections
                        )
                        annotated_frame = source_info["annotators"]["label"].annotate(
                            scene=annotated_frame,
                            detections=tracked_detections,
                            labels=labels,
                        )
                        # Annotate traces
                        # annotated_frame = source_info["annotators"]["trace"].annotate(
                        #     scene=annotated_frame, detections=tracked_detections
                        # )

                    # Add video_id label
                    cv2.putText(
                        annotated_frame,
                        video_id,
                        (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 0, 0),
                        3,
                        cv2.LINE_AA,
                    )  # Black outline
                    cv2.putText(
                        annotated_frame,
                        video_id,
                        (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (255, 255, 255),
                        2,
                        cv2.LINE_AA,
                    )  # White text

                    frames_data[video_id] = annotated_frame
                    source_info["last_frame"] = (
                        annotated_frame  # Update last frame with annotated one
                    )

                    # Add data for this source to the overall websocket message
                    websocket_data.append(
                        {
                            "video_id": video_id,
                            "detections": current_detections_for_ws,
                        }
                    )

                except StopIteration:
                    source_info["finished"] = True
                    # Keep the last frame available if the source finishes
                    frames_data[video_id] = source_info["last_frame"]
                    # Add empty detections if finished
                    websocket_data.append(
                        {
                            "video_id": video_id,
                            "detections": [],
                        }
                    )
                    continue  # Move to the next source

            # --- Send WebSocket Update ---
            if websocket_data:
                await ws_manager.broadcast(
                    {
                        "event": "server:traffic-control",
                        "data": websocket_data,
                    }
                )

            # --- Create and Yield Blackboard ---
            if frames_data:
                blackboard = self._create_blackboard(frames_data, active_sources)
                if blackboard is not None:
                    _, buffer = cv2.imencode(".jpg", blackboard)
                    blackboard_bytes = buffer.tobytes()

                    yield (
                        b"--frame\r\n"
                        + b"Content-Type: image/jpeg\r\n\r\n"
                        + blackboard_bytes
                        + b"\r\n"
                    )

            # --- Frame Rate Control ---
            processing_time = time.time() - start_time
            if processing_time < frame_delay:
                await asyncio.sleep(frame_delay - processing_time)
            else:
                await asyncio.sleep(
                    0
                )  # Yield control briefly even if processing took longer

            if all_finished and all(
                self.source_data[vid]["finished"] for vid in active_sources
            ):
                print("All video sources finished processing.")
                break  # Exit the main loop

    def _create_blackboard(
        self,
        frames_data: Dict[str, np.ndarray],
        video_ids: List[str],
        cols: int = 2,
        bg_color: Tuple[int, int, int] = (0, 0, 0),
    ) -> Optional[np.ndarray]:
        """Creates a blackboard image by arranging frames side-by-side."""
        valid_frames = {
            vid: frame for vid, frame in frames_data.items() if frame is not None
        }
        if not valid_frames:
            return None

        # Determine layout
        num_frames = len(video_ids)  # Use the original order/count for layout
        rows = math.ceil(num_frames / cols)

        # Get dimensions from the first available frame (assume others are similar or will be resized)
        first_frame = next(iter(valid_frames.values()))
        frame_h, frame_w, _ = first_frame.shape

        # Create blackboard
        board_h = rows * frame_h
        board_w = cols * frame_w
        blackboard = np.full((board_h, board_w, 3), bg_color, dtype=np.uint8)

        # Place frames onto the blackboard
        for i, video_id in enumerate(video_ids):
            frame = valid_frames.get(video_id)  # Get frame by ID
            if frame is None:
                continue  # Skip if this source hasn't provided a frame yet or is finished without one

            # Resize frame if necessary (optional, but good for consistency)
            if frame.shape[0] != frame_h or frame.shape[1] != frame_w:
                frame = cv2.resize(frame, (frame_w, frame_h))

            row_idx = i // cols
            col_idx = i % cols
            y_offset = row_idx * frame_h
            x_offset = col_idx * frame_w

            blackboard[y_offset : y_offset + frame_h, x_offset : x_offset + frame_w] = (
                frame
            )

        return blackboard
