import cv2
import numpy as np
import supervision as sv
from tqdm import tqdm
from ultralytics import YOLO


def red_light_violation(
    model_path,
    video_path,
    target_video_path,
    class_names=None,
    conf_score=0.3,
    safe_zone_polygon=None,
    mask_image_path=None,
):
    """
    Process a video with YOLO model to track objects and save the output.
    Returns: dict with tracked_objects_map and object_count
    """
    if safe_zone_polygon is None:
        raise ValueError("safe_zone_polygon must be provided")

    yolo_model = YOLO(model_path)
    video_info = sv.VideoInfo.from_video_path(video_path=video_path)
    mask_image = cv2.imread(mask_image_path) if mask_image_path else None
    if mask_image_path and mask_image is None:
        raise IOError(f"Unable to load mask image {mask_image_path}")

    # Annotators and colors
    thickness = sv.calculate_optimal_line_thickness(
        resolution_wh=video_info.resolution_wh
    )
    text_scale = sv.calculate_optimal_text_scale(resolution_wh=video_info.resolution_wh)
    color_blue, color_red = sv.Color(r=0, g=0, b=255), sv.Color(r=255, g=0, b=0)
    box_annotators = {
        False: sv.BoxAnnotator(thickness=thickness, color=color_blue),
        True: sv.BoxAnnotator(thickness=thickness, color=color_red),
    }
    label_annotators = {
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
    polygon_zone = sv.PolygonZone(polygon=safe_zone_polygon)
    polygon_zone_annotator = sv.PolygonZoneAnnotator(
        zone=polygon_zone,
        color=color_red,
        thickness=thickness * 2,
        display_in_zone_count=False,
        opacity=0.1,
    )

    byte_track = sv.ByteTrack(
        frame_rate=video_info.fps, track_activation_threshold=conf_score
    )
    tracked_objects_map, object_count = {}, 0
    class_ids = _get_class_ids(yolo_model, class_names)
    frame_generator = sv.get_video_frames_generator(source_path=video_path)

    with tqdm(
        desc="Frames Processed",
        unit="frame",
        dynamic_ncols=True,
        bar_format="{desc}: {n} [{elapsed}, {rate_fmt}]",
    ) as progress_bar:
        with sv.VideoSink(target_video_path, video_info) as sink:
            for frame in frame_generator:
                if mask_image is not None:
                    frame = cv2.bitwise_and(frame, mask_image)

                detections = sv.Detections.from_ultralytics(
                    yolo_model(frame, verbose=False)[0]
                )
                detections = detections[detections.confidence > conf_score]
                if class_ids is not None:
                    detections = (
                        detections[np.isin(detections.class_id, class_ids)]
                        if len(class_ids)
                        else detections[np.array([], dtype=bool)]
                    )
                detections = byte_track.update_with_detections(detections=detections)

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
                in_safe_zone = (
                    np.array(
                        [
                            cv2.pointPolygonTest(
                                safe_zone_polygon.astype(np.int32), tuple(center), False
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
                    if tracker_id not in tracked_objects_map:
                        object_count += 1
                        tracked_objects_map[tracker_id] = {
                            "object_id": object_count,
                            "was_in_safe_zone": in_safe_zone[i],
                            "in_safe_zone": in_safe_zone[i],
                        }
                    else:
                        prev = tracked_objects_map[tracker_id]
                        prev["was_in_safe_zone"] |= in_safe_zone[i]
                        prev["in_safe_zone"] = in_safe_zone[i]

                    state = tracked_objects_map[tracker_id]
                    is_violator = _is_violator(state)
                    violator_mask.append(is_violator)
                    class_name = yolo_model.names[detections.class_id[i]]
                    label = f"{class_name.capitalize()} #{state['object_id']}"
                    if is_violator:
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

                annotated_frame = frame.copy()
                annotated_frame = polygon_zone_annotator.annotate(scene=annotated_frame)
                for violator in (False, True):
                    annotated_frame = box_annotators[violator].annotate(
                        scene=annotated_frame, detections=dets[violator]
                    )
                    annotated_frame = label_annotators[violator].annotate(
                        scene=annotated_frame,
                        detections=dets[violator],
                        labels=labs[violator],
                    )

                sink.write_frame(annotated_frame)
                aspect_ratio = video_info.resolution_wh[0] / video_info.resolution_wh[1]
                show_frame = cv2.resize(annotated_frame, (640, int(640 / aspect_ratio)))
                cv2.imshow("Output Video Frame", show_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
                progress_bar.update(1)
            cv2.destroyAllWindows()
    return {"tracked_objects_map": tracked_objects_map, "object_count": object_count}


def _get_class_ids(yolo_model, class_names):
    if class_names is None:
        return None
    names = yolo_model.names
    class_id_map = {
        i: str(n).lower()
        for i, n in (names.items() if isinstance(names, dict) else enumerate(names))
    }
    class_names_set = set(n.lower() for n in class_names)
    return [i for i, n in class_id_map.items() if n in class_names_set]


def _is_violator(tracker_state):
    return tracker_state["was_in_safe_zone"] and not tracker_state["in_safe_zone"]
