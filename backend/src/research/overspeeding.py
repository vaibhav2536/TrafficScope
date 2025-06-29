from collections import defaultdict, deque

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO

# top-left, top-right, bottom-right, bottom-left
SOURCE = np.array([[1252, 787], [2298, 803], [5039, 2159], [-550, 2159]])

TARGET_WIDTH = 20  # perspective transform width (in meters) [Actual Road Width]
TARGET_HEIGHT = 100  # perspective transform height (in meters) [Actual Road Length]

TARGET = np.array(
    [
        [0, 0],
        [TARGET_WIDTH - 1, 0],
        [TARGET_WIDTH - 1, TARGET_HEIGHT - 1],
        [0, TARGET_HEIGHT - 1],
    ]
)


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


def detect_overspeeding(
    model_path: str,
    source_video_path: str,
    target_video_path: str,
    confidence_threshold: float = 0.3,
    iou_threshold: float = 0.7,
):
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

    # Create separate annotators for blue and red (box and label)
    box_annotator_blue = sv.BoxAnnotator(thickness=thickness, color=color_blue)
    box_annotator_red = sv.BoxAnnotator(thickness=thickness, color=color_red)
    label_annotator_blue = sv.LabelAnnotator(
        text_scale=text_scale,
        text_thickness=thickness,
        text_position=sv.Position.BOTTOM_CENTER,
        color=color_blue,
    )
    label_annotator_red = sv.LabelAnnotator(
        text_scale=text_scale,
        text_thickness=thickness,
        text_position=sv.Position.BOTTOM_CENTER,
        color=color_red,
    )
    trace_annotator = sv.TraceAnnotator(
        thickness=thickness,
        trace_length=video_info.fps * 2,
        position=sv.Position.BOTTOM_CENTER,
        color=color_blue,
    )

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    view_transformer = ViewTransformer(source=SOURCE, target=TARGET)

    polygon_zone = sv.PolygonZone(polygon=SOURCE)
    # polygon_zone_annotator = sv.PolygonZoneAnnotator(
    #     zone=polygon_zone,
    #     color=color_red,
    #     thickness=thickness * 2,
    #     display_in_zone_count=False,
    # )

    coordinates = defaultdict(lambda: deque(maxlen=video_info.fps))

    with tqdm(
        desc="Frames Processed",
        unit="frame",
        dynamic_ncols=True,
        bar_format="{desc}: {n} [{elapsed}, {rate_fmt}]",
    ) as progress_bar:
        with sv.VideoSink(target_video_path, video_info) as sink:
            for frame in frame_generator:
                result = model(frame, verbose=False)[0]
                detections = sv.Detections.from_ultralytics(result)
                detections = detections[detections.confidence > confidence_threshold]
                detections = detections[polygon_zone.trigger(detections)]
                detections = detections.with_nms(threshold=iou_threshold)
                detections = byte_track.update_with_detections(detections=detections)

                points = detections.get_anchors_coordinates(
                    anchor=sv.Position.BOTTOM_CENTER
                )
                points = view_transformer.transform_points(points=points).astype(int)

                for tracker_id, [_, y] in zip(detections.tracker_id, points):
                    coordinates[tracker_id].append(y)

                labels = []
                speeds = []

                for tracker_id in detections.tracker_id:
                    if len(coordinates[tracker_id]) < video_info.fps / 2:
                        labels.append(f"#{tracker_id}")
                        speeds.append(0)  # No speed data
                    else:
                        coordinate_start = coordinates[tracker_id][-1]
                        coordinate_end = coordinates[tracker_id][0]
                        distance = abs(coordinate_start - coordinate_end)
                        time = len(coordinates[tracker_id]) / video_info.fps
                        speed = distance / time * 3.6
                        labels.append(f"#{tracker_id} [{int(speed)} Km/h]")
                        speeds.append(speed)

                # Split detections and labels based on speed
                mask_fast = np.array(speeds) > 60
                detections_fast = detections[mask_fast]
                detections_slow = detections[~mask_fast]
                labels_fast = [labels[i] for i in range(len(labels)) if mask_fast[i]]
                labels_slow = [
                    labels[i] for i in range(len(labels)) if not mask_fast[i]
                ]

                # Annotate the frame
                annotated_frame = frame.copy()

                # Draw the polygon zone
                # annotated_frame = polygon_zone_annotator.annotate(scene=annotated_frame)

                # Draw the traces and boxes for fast and slow vehicles
                annotated_frame = trace_annotator.annotate(
                    scene=annotated_frame, detections=detections
                )
                annotated_frame = box_annotator_blue.annotate(
                    scene=annotated_frame, detections=detections_slow
                )
                annotated_frame = box_annotator_red.annotate(
                    scene=annotated_frame, detections=detections_fast
                )
                annotated_frame = label_annotator_blue.annotate(
                    scene=annotated_frame,
                    detections=detections_slow,
                    labels=labels_slow,
                )
                annotated_frame = label_annotator_red.annotate(
                    scene=annotated_frame,
                    detections=detections_fast,
                    labels=labels_fast,
                )

                sink.write_frame(annotated_frame)
                annotated_frame = cv2.resize(annotated_frame, (640, 360))
                cv2.imshow("frame", annotated_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
                progress_bar.update(1)

            cv2.destroyAllWindows()
