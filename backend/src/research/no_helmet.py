import contextlib
import math
from collections import defaultdict
from datetime import timedelta
from typing import List, Optional

import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO


def track_helmets(
    model_path: str,
    source_video_path: str,
    target_video_path: Optional[str] = None,
    class_names: Optional[List[str]] = None,
    confidence_threshold: float = 0.3,
    iou_threshold: Optional[float] = None,
    mask_image_path: Optional[str] = None,
    show_duration: bool = False,
):
    """
    Process a video with YOLO model using supervision library to track objects.

    Args:
        model_path (str): Path to the YOLO model file.
        source_video_path (str): Path to the input video.
        target_video_path (Optional[str]): Path to save the output video. Defaults to None (no saving).
        class_names (Optional[List[str]]): List of class names to track. Defaults to None (all classes).
        confidence_threshold (float): Minimum confidence required. Defaults to 0.3.
        iou_threshold (Optional[float]): Intersection over Union threshold for NMS. Defaults to None (not used).
        mask_image_path (Optional[str]): Path to the mask image. Defaults to None.
        show_duration (bool): Whether to display tracking duration. Defaults to False.

    Returns:
        dict: Dictionary containing tracked_objects_info and object_count.
    """
    # Load the model
    yolo_model = YOLO(model_path)
    model_class_names = yolo_model.names  # Get class names from the model

    # Video input info
    video_info = sv.VideoInfo.from_video_path(video_path=source_video_path)
    if video_info.fps == 0:
        print(
            f"Warning: Video FPS is {video_info.fps}, defaulting to 30 for calculations."
        )
        video_info.fps = 30  # Set a default FPS if it's 0

    # Load mask if provided
    mask_image = None
    if mask_image_path:
        mask_image = cv2.imread(mask_image_path)
        if mask_image is None:
            raise IOError(f"Error: Unable to load mask image {mask_image_path}")
        # Resize mask to match video resolution if necessary
        if mask_image.shape[:2] != video_info.resolution_wh[::-1]:
            mask_image = cv2.resize(mask_image, video_info.resolution_wh)

    # Initialize tracker
    byte_track = sv.ByteTrack(
        frame_rate=video_info.fps, track_activation_threshold=confidence_threshold
    )

    # Initialize annotators
    thickness = sv.calculate_optimal_line_thickness(
        resolution_wh=video_info.resolution_wh
    )
    text_scale = sv.calculate_optimal_text_scale(resolution_wh=video_info.resolution_wh)
    box_annotator = sv.BoxAnnotator(thickness=thickness)
    label_annotator = sv.LabelAnnotator(
        text_scale=text_scale,
        text_thickness=thickness,
        text_position=sv.Position.BOTTOM_LEFT,
    )

    # Frame generator
    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)

    # Object tracking info storage
    tracked_objects_info = defaultdict(dict)
    object_counter = 0
    current_frame_number = 0

    # Context manager for video saving or just processing
    context_manager = (
        sv.VideoSink(target_path=target_video_path, video_info=video_info)
        if target_video_path
        else contextlib.nullcontext()
    )

    with (
        tqdm(
            total=video_info.total_frames,
            desc="Frames Processed",
            unit="frame",
            dynamic_ncols=True,
            bar_format="{desc}: {n}/{total} [{elapsed}<{remaining}, {rate_fmt}]",
        ) as progress_bar,
        context_manager as sink,
    ):
        for frame in frame_generator:
            current_frame_number += 1
            elapsed_time = timedelta(seconds=current_frame_number / video_info.fps)

            # Apply mask
            processed_frame = (
                cv2.bitwise_and(frame, mask_image) if mask_image is not None else frame
            )

            # Run detection
            results = yolo_model(processed_frame, verbose=False)[0]
            detections = sv.Detections.from_ultralytics(results)

            # Filter by confidence
            detections = detections[detections.confidence > confidence_threshold]

            # Apply NMS if iou_threshold is provided
            if iou_threshold is not None:
                detections = detections.with_nms(threshold=iou_threshold)

            # Filter by class name if specified
            if class_names is not None:
                class_mask = np.array(
                    [
                        model_class_names[cls_id] in class_names
                        for cls_id in detections.class_id
                    ],
                    dtype=bool,
                )
                detections = detections[class_mask]

            # Update tracker
            detections = byte_track.update_with_detections(detections=detections)

            labels = []
            if len(detections) > 0 and detections.tracker_id is not None:
                for det_idx, tracker_id in enumerate(detections.tracker_id):
                    class_id = detections.class_id[det_idx]
                    class_name = model_class_names[class_id]

                    if tracker_id not in tracked_objects_info:
                        object_counter += 1
                        tracked_objects_info[tracker_id] = {
                            "object_id": object_counter,
                            "first_detected_time": elapsed_time,
                            "last_detected_time": elapsed_time,
                        }
                    else:
                        tracked_objects_info[tracker_id]["last_detected_time"] = (
                            elapsed_time
                        )

                    object_id = tracked_objects_info[tracker_id]["object_id"]
                    display_label = f"{class_name.capitalize()} #{object_id}"

                    if show_duration:
                        first_detected = tracked_objects_info[tracker_id][
                            "first_detected_time"
                        ]
                        last_detected = tracked_objects_info[tracker_id][
                            "last_detected_time"
                        ]
                        duration_seconds = math.trunc(
                            (last_detected - first_detected).total_seconds()
                        )
                        display_label = f"#{object_id} {class_name.capitalize()} ({duration_seconds}s)"

                    labels.append(display_label)

            # Annotate frame
            annotated_frame = frame.copy()
            if len(detections) > 0:
                annotated_frame = box_annotator.annotate(
                    scene=annotated_frame, detections=detections
                )
                annotated_frame = label_annotator.annotate(
                    scene=annotated_frame, detections=detections, labels=labels
                )

            # Write frame to target video if path provided
            if sink is not None:
                sink.write_frame(frame=annotated_frame)

            display_frame = cv2.resize(
                annotated_frame,
                (640, int(640 / video_info.width * video_info.height))
                if video_info.width > 0
                else (640, 360),
            )
            cv2.imshow("Output Video Frame", display_frame)
            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

            progress_bar.update(1)

    # Release resources only if display was used
    if target_video_path is None:
        cv2.destroyAllWindows()

    # Convert defaultdict back to dict for return
    return {
        "tracked_objects_info": dict(tracked_objects_info),
        "object_count": object_counter,
    }
