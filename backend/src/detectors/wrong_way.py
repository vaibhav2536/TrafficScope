import asyncio
import time
from collections import defaultdict, deque
from typing import List, Optional
from uuid import uuid4

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

from ..routes.websockets import ws_manager
from ..utils.image_utils import encode_frame_to_base64, resize_frame

MOVEMENT_THRESHOLD = 3  # Minimum movement to consider as moving


class ViewTransformer:
    def __init__(self, source: np.ndarray, target: np.ndarray) -> None:
        source = source.astype(np.float32)
        target = target.astype(np.float32)
        self.m = cv2.getPerspectiveTransform(source, target)

    def transform_points(self, points: np.ndarray) -> np.ndarray:
        if points.size == 0:
            return points
        reshaped_points = points.reshape(-1, 1, 2).astype(np.float32)
        transformed_points = cv2.perspectiveTransform(reshaped_points, self.m)
        return transformed_points.reshape(-1, 2)


class WrongWayDetector:
    def __init__(
        self,
        model_path: str,
        video_path: str,
        road_polygon: list,
        road_width: float = 15,
        road_height: float = 80,
        correct_direction: str = "down",
        class_names: Optional[List[str]] = None,
        conf_score: float = 0.2,
        iou_threshold: float = 0.7,
    ):
        self.model_path = model_path
        self.video_path = video_path
        self.class_names = class_names
        self.road_polygon = np.array(road_polygon)
        self.road_width = road_width
        self.road_height = road_height
        self.correct_direction = correct_direction
        self.conf_score = conf_score
        self.iou_threshold = iou_threshold

        self.model = YOLO(self.model_path)
        self.video_info = sv.VideoInfo.from_video_path(video_path=self.video_path)

        # Get video properties
        self.video_info.fps = 30 if self.video_info.fps == 0 else self.video_info.fps
        self.frame_delay = 1 / self.video_info.fps

        # Initialize ByteTrack for object tracking
        self.byte_track = sv.ByteTrack(
            frame_rate=self.video_info.fps,
            track_activation_threshold=self.conf_score,
        )
        self.coordinates = defaultdict(lambda: deque(maxlen=self.video_info.fps))

        # Store tracked objects
        self.tracked_objects_map = {}  # Will store: object_id, uuid, violation_reported, current_violation
        self.object_count = 0

        self.view_transformer = ViewTransformer(
            source=self.road_polygon.astype(np.float32),
            target=np.array(
                [
                    [0, 0],
                    [self.road_width - 1, 0],
                    [self.road_width - 1, self.road_height - 1],
                    [0, self.road_height - 1],
                ]
            ).astype(np.float32),
        )

        self._setup_annotators()
        self._setup_zone()

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
        self.trace_annotator = sv.TraceAnnotator(
            thickness=thickness,
            trace_length=self.video_info.fps * 2,
            position=sv.Position.BOTTOM_CENTER,
            color_lookup=sv.ColorLookup.TRACK,
        )

    def _setup_zone(self):
        self.polygon_zone = sv.PolygonZone(polygon=self.road_polygon)

    def _transform_points(self, points: np.ndarray) -> np.ndarray:
        return self.view_transformer.transform_points(points)

    async def process_video(self):
        # Initialize video frame generator
        frame_generator = sv.get_video_frames_generator(source_path=self.video_path)

        with tqdm(
            desc="Frames Processed",
            unit="frame",
            dynamic_ncols=True,
            bar_format="{desc}: {n} [{elapsed}, {rate_fmt}]",
        ) as progress_bar:
            for frame in frame_generator:
                start_time = time.time()

                # Run YOLO model on frame and convert results to supervision format
                detections = sv.Detections.from_ultralytics(
                    self.model(frame, verbose=False)[0]
                )

                # Filter detections by confidence, zone and class if specified
                model_class_names = self.model.names
                if self.class_names is not None:
                    class_mask = np.isin(
                        [model_class_names[cls_id] for cls_id in detections.class_id],
                        self.class_names,
                    )
                    detections = detections[class_mask]

                detections = detections[detections.confidence > self.conf_score]
                detections = detections[self.polygon_zone.trigger(detections)]
                detections = detections.with_nms(threshold=self.iou_threshold)

                # Update tracked objects using ByteTrack algorithm
                detections = self.byte_track.update_with_detections(
                    detections=detections
                )

                # Skip frame if no detections
                if len(detections) == 0:
                    show_frame = resize_frame(frame, max_width=640)
                    _, buffer = cv2.imencode(".jpg", show_frame)
                    show_frame_bytes = buffer.tobytes()
                    yield (
                        b"--frame\r\n"
                        + b"Content-Type: image/jpeg\r\n\r\n"
                        + show_frame_bytes
                        + b"\r\n"
                    )
                    progress_bar.update(1)
                    continue

                # Convert detection coordinates to bird's eye view
                points = detections.get_anchors_coordinates(
                    anchor=sv.Position.BOTTOM_CENTER
                )
                points = self._transform_points(points=points).astype(int)

                # Track Movement and Detect Violations
                labels, violator_mask = [], []
                for tracker_id, [_, y], class_id in zip(
                    detections.tracker_id, points, detections.class_id
                ):
                    # Track y-coordinates for movement analysis
                    self.coordinates[tracker_id].append(y)
                    current_class_name = model_class_names[class_id]

                    # Set up label for tracked object
                    if tracker_id in self.tracked_objects_map:
                        label = f"#{self.tracked_objects_map[tracker_id]['object_id']}"
                    else:
                        label = f"#{tracker_id}"

                    is_violator = False

                    # Analyze movement direction after collecting enough samples
                    if len(self.coordinates[tracker_id]) >= int(
                        self.video_info.fps / 3
                    ):
                        coordinate_start = self.coordinates[tracker_id][-1]
                        coordinate_end = self.coordinates[tracker_id][0]
                        y_change = coordinate_start - coordinate_end

                        # Check if movement exceeds threshold and is in wrong direction
                        if abs(y_change) > MOVEMENT_THRESHOLD:
                            direction = "down" if y_change > 0 else "up"
                            if direction != self.correct_direction:
                                is_violator = True

                                # Register new violator and prepare notification
                                if tracker_id not in self.tracked_objects_map:
                                    self.object_count += 1
                                    self.tracked_objects_map[tracker_id] = {
                                        "object_id": self.object_count,
                                        "uuid": str(uuid4()),
                                        "violation_reported": False,
                                        "current_violation": True,
                                    }
                                else:
                                    self.tracked_objects_map[tracker_id][
                                        "current_violation"
                                    ] = True

                                state = self.tracked_objects_map[tracker_id]
                                # Add [Wrong Way] label for any current violation
                                label += " [Wrong Way]"

                                # Only send websocket notification once
                                if not state["violation_reported"]:
                                    state["violation_reported"] = True

                                    # Prepare violator frame
                                    violator_index = np.where(
                                        detections.tracker_id == tracker_id
                                    )[0][0]
                                    violator_detection = sv.Detections(
                                        xyxy=np.array(
                                            [detections.xyxy[violator_index]]
                                        ),
                                        confidence=np.array(
                                            [detections.confidence[violator_index]]
                                        ),
                                        class_id=np.array(
                                            [detections.class_id[violator_index]]
                                        ),
                                        tracker_id=np.array([tracker_id]),
                                    )
                                    violator_frame = frame.copy()
                                    violator_frame = self.trace_annotator.annotate(
                                        scene=violator_frame,
                                        detections=violator_detection,
                                    )
                                    violator_frame = self.box_annotators[True].annotate(
                                        scene=violator_frame,
                                        detections=violator_detection,
                                    )
                                    violator_frame = self.label_annotators[
                                        True
                                    ].annotate(
                                        scene=violator_frame,
                                        detections=violator_detection,
                                        labels=[label],
                                    )
                                    resized_frame = resize_frame(violator_frame)
                                    img_base64 = encode_frame_to_base64(resized_frame)

                                    # Send violator data
                                    message = {
                                        "id": state["uuid"],
                                        "imgSrc": img_base64,
                                        "detectedAt": time.time() * 1000,
                                        "className": current_class_name,
                                    }
                                    await ws_manager.broadcast(
                                        {"event": "server:wrong-way", "data": message}
                                    )
                            else:
                                # Reset current violation if moving in correct direction
                                if tracker_id in self.tracked_objects_map:
                                    self.tracked_objects_map[tracker_id][
                                        "current_violation"
                                    ] = False

                    labels.append(label)
                    violator_mask.append(is_violator)

                # Separate violators and normal detections
                violator_mask = np.array(violator_mask, dtype=bool)
                dets = {
                    False: detections[~violator_mask],
                    True: detections[violator_mask],
                }
                labs = {
                    False: [
                        label for i, label in enumerate(labels) if not violator_mask[i]
                    ],
                    True: [label for i, label in enumerate(labels) if violator_mask[i]],
                }

                annotated_frame = frame.copy()
                annotated_frame = self.trace_annotator.annotate(
                    scene=annotated_frame, detections=detections
                )
                for violator in (False, True):
                    annotated_frame = self.box_annotators[violator].annotate(
                        scene=annotated_frame, detections=dets[violator]
                    )
                    annotated_frame = self.label_annotators[violator].annotate(
                        scene=annotated_frame,
                        detections=dets[violator],
                        labels=labs[violator],
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

                # Frame Rate Control
                processing_time = time.time() - start_time
                if processing_time < self.frame_delay:
                    time.sleep(self.frame_delay - processing_time)

                await asyncio.sleep(0)
