from collections import defaultdict, deque
from typing import List, Optional

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

# Define source and target points for perspective transformation
SOURCE = np.array([[565, 356], [774, 355], [977, 720], [335, 720]])
TARGET_WIDTH = 15  # perspective transform width (in meters)
TARGET_HEIGHT = 80  # perspective transform height (in meters)
TARGET = np.array(
    [
        [0, 0],
        [TARGET_WIDTH - 1, 0],
        [TARGET_WIDTH - 1, TARGET_HEIGHT - 1],
        [0, TARGET_HEIGHT - 1],
    ]
)

MOVEMENT_THRESHOLD = 2  # Minimum movement to consider as moving


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


def detect_wrong_way(
    model_path: str,
    source_video_path: str,
    target_video_path: str,
    confidence_threshold: float = 0.2,
    iou_threshold: float = 0.7,
    correct_direction: str = "down",
    class_names: Optional[List[str]] = None,
):
    # Load video info and model
    video_info = sv.VideoInfo.from_video_path(video_path=source_video_path)
    model = YOLO(model_path)

    byte_track = sv.ByteTrack(
        frame_rate=video_info.fps, track_activation_threshold=confidence_threshold
    )

    thickness = sv.calculate_optimal_line_thickness(
        resolution_wh=video_info.resolution_wh
    )
    text_scale = sv.calculate_optimal_text_scale(resolution_wh=video_info.resolution_wh)
    color_blue = sv.Color(r=0, g=0, b=255)
    color_red = sv.Color(r=255, g=0, b=0)

    # Setup annotators for drawing
    box_annotator_normal = sv.BoxAnnotator(thickness=thickness, color=color_blue)
    box_annotator_violator = sv.BoxAnnotator(thickness=thickness, color=color_red)
    label_annotator_normal = sv.LabelAnnotator(
        text_scale=text_scale,
        text_thickness=thickness,
        text_position=sv.Position.BOTTOM_CENTER,
        color=color_blue,
    )
    label_annotator_violator = sv.LabelAnnotator(
        text_scale=text_scale,
        text_thickness=thickness,
        text_position=sv.Position.BOTTOM_CENTER,
        color=color_red,
    )
    trace_annotator = sv.TraceAnnotator(
        thickness=thickness,
        trace_length=video_info.fps * 2,
        position=sv.Position.BOTTOM_CENTER,
        color_lookup=sv.ColorLookup.TRACK,
    )

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    view_transformer = ViewTransformer(source=SOURCE, target=TARGET)
    polygon_zone = sv.PolygonZone(polygon=SOURCE)
    coordinates = defaultdict(lambda: deque(maxlen=video_info.fps))

    with tqdm(
        desc="Frames Processed",
        unit="frame",
        dynamic_ncols=True,
        bar_format="{desc}: {n} [{elapsed}, {rate_fmt}]",
    ) as progress_bar:
        with sv.VideoSink(target_video_path, video_info) as sink:
            for frame in frame_generator:
                # Run detection model
                result = model(frame, verbose=False)[0]
                detections = sv.Detections.from_ultralytics(result)
                detections = detections[detections.confidence > confidence_threshold]

                # Filter by class if specified
                if class_names is not None:
                    model_class_names = result.names
                    class_mask = np.isin(
                        [model_class_names[cls_id] for cls_id in detections.class_id],
                        class_names,
                    )
                    detections = detections[class_mask]

                # Apply polygon zone and NMS
                detections = detections[polygon_zone.trigger(detections)]
                detections = detections.with_nms(threshold=iou_threshold)
                detections = byte_track.update_with_detections(detections=detections)

                # If no detections, write original frame and continue
                if len(detections) == 0:
                    sink.write_frame(frame)
                    annotated_frame = cv2.resize(frame, (640, 360))
                    cv2.imshow("frame", annotated_frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                    progress_bar.update(1)
                    continue

                # Transform detection points to bird's-eye view
                points = detections.get_anchors_coordinates(
                    anchor=sv.Position.BOTTOM_CENTER
                )
                points = view_transformer.transform_points(points=points).astype(int)

                current_frame_violators = set()

                # Track y-coordinates for each object
                for tracker_id, [_, y] in zip(detections.tracker_id, points):
                    coordinates[tracker_id].append(y)

                labels = []
                is_violator_list = []

                # Determine if each tracked object is a violator
                for tracker_id in detections.tracker_id:
                    label = f"#{tracker_id}"
                    is_violator = False
                    if len(coordinates[tracker_id]) >= int(video_info.fps / 3):
                        coordinate_start = coordinates[tracker_id][-1]
                        coordinate_end = coordinates[tracker_id][0]
                        y_change = coordinate_start - coordinate_end

                        if abs(y_change) > MOVEMENT_THRESHOLD:
                            direction = "down" if y_change > 0 else "up"
                            if direction != correct_direction:
                                label += " [Violator]"
                                is_violator = True
                                current_frame_violators.add(tracker_id)
                    labels.append(label)
                    is_violator_list.append(is_violator)

                mask_violator = np.array(is_violator_list, dtype=bool)

                detections_violator = detections[mask_violator]
                detections_normal = detections[~mask_violator]
                labels_violator = [
                    labels[i] for i in range(len(labels)) if mask_violator[i]
                ]
                labels_normal = [
                    labels[i] for i in range(len(labels)) if not mask_violator[i]
                ]

                # Annotate and display the frame
                annotated_frame = frame.copy()
                annotated_frame = trace_annotator.annotate(
                    scene=annotated_frame, detections=detections
                )
                annotated_frame = box_annotator_normal.annotate(
                    scene=annotated_frame, detections=detections_normal
                )
                annotated_frame = box_annotator_violator.annotate(
                    scene=annotated_frame, detections=detections_violator
                )
                annotated_frame = label_annotator_normal.annotate(
                    scene=annotated_frame,
                    detections=detections_normal,
                    labels=labels_normal,
                )
                annotated_frame = label_annotator_violator.annotate(
                    scene=annotated_frame,
                    detections=detections_violator,
                    labels=labels_violator,
                )

                sink.write_frame(annotated_frame)
                annotated_frame = cv2.resize(annotated_frame, (640, 360))
                cv2.imshow("frame", annotated_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
                progress_bar.update(1)

            cv2.destroyAllWindows()
