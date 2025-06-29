from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from src.detectors.no_helmet import NoHelmetDetector
from src.detectors.overspeeding import OverspeedingDetector
from src.detectors.pothole import PotholeDetector
from src.detectors.red_light_passing import RedLightCrossingDetector
from src.detectors.traffic_control import TrafficControl
from src.detectors.vehicle_finder import VehicleFinder
from src.detectors.wrong_way import WrongWayDetector
from src.detectors.person_finder import PersonDetector

router = APIRouter()

VIDEOS_PATH = "./src/assets/videos"

default_video_map = {
    "redLightPassing": f"{VIDEOS_PATH}/red-light-violation-1.mp4",
    "overspeeding": f"{VIDEOS_PATH}/overspeeding-1.mp4",
    "wrongWay": f"{VIDEOS_PATH}/wrong-way-driving-1.mp4",
    "noHelmet": f"{VIDEOS_PATH}/helmet-video-1.mp4",
    "pothole": f"{VIDEOS_PATH}/pothole-video-1.mp4",
    "vehicleFinder": f"{VIDEOS_PATH}/vehicle-finder-2.mp4",
    "personDetector": f"{VIDEOS_PATH}/modig.mp4",
}


async def generate_frames(active_model):
    if active_model == "redLightPassing":
        detector = RedLightCrossingDetector(
            model_path="./src/assets/weights/yolo11n.pt",
            video_path=default_video_map["redLightPassing"],
            class_names=["car", "truck", "bus", "motorcycle"],
            conf_score=0.2,
            iou_threshold=0.7,
            safe_zone_polygon=[[0, 1441], [4000, 1383], [4000, 3000], [0, 3000]],
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "trafficControl":
        detector = TrafficControl(
            model_path="./src/assets/weights/yolo11n.pt",
            video_sources=[
                {
                    "video_id": "Left",
                    "video_path": f"{VIDEOS_PATH}/traffic-video-1.mp4",
                    "region_polygon": [
                        [287 + 329, 200],
                        [812, 200],
                        [1280 + 171, 720],
                        [329, 720],
                    ],
                },
                {
                    "video_id": "Top",
                    "video_path": f"{VIDEOS_PATH}/traffic-video-2.mp4",
                    "region_polygon": [
                        [361 + 101, 720 - 568],
                        [444 + 294, 720 - 568],
                        [1280, 720],
                        [101, 720],
                    ],
                },
                {
                    "video_id": "Right",
                    "video_path": f"{VIDEOS_PATH}/traffic-video-3.mp4",
                    "region_polygon": [
                        [250 + 46, 129],
                        [289 + 294, 124],
                        [1280 + 113, 720],
                        [51, 720],
                    ],
                },
                {
                    "video_id": "Bottom",
                    "video_path": f"{VIDEOS_PATH}/traffic-video-4.mp4",
                    "region_polygon": [
                        [487, 136],
                        [481 + 272, 132],
                        [753 + 336, 720],
                        [0, 720],
                    ],
                },
            ],
            class_names=["car", "truck", "bus", "motorcycle"],
            conf_score=0.3,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "noHelmet":
        detector = NoHelmetDetector(
            model_path="./src/assets/weights/helmet.pt",
            video_path=default_video_map["noHelmet"],
            class_names=["helmet", "no_helmet"],
            conf_score=0.3,
            iou_threshold=0.7,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "overspeeding":
        detector = OverspeedingDetector(
            model_path="./src/assets/weights/yolo11n.pt",
            video_path=default_video_map["overspeeding"],
            class_names=["car", "truck", "bus", "motorcycle"],
            road_polygon=[[1252, 787], [2298, 803], [5039, 2159], [-550, 2159]],
            road_width=20,
            road_height=100,
            conf_score=0.2,
            iou_threshold=0.7,
            speed_limit=60,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "pothole":
        detector = PotholeDetector(
            model_path="./src/assets/weights/pothole.pt",
            video_path=default_video_map["pothole"],
            class_names=["Pothole"],
            conf_score=0.1,
            iou_threshold=0.7,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "wrongWay":
        detector = WrongWayDetector(
            model_path="./src/assets/weights/yolo11n.pt",
            video_path=default_video_map["wrongWay"],
            road_polygon=[[565, 356], [774, 355], [977, 720], [335, 720]],
            road_width=15,
            road_height=80,
            class_names=["car", "truck", "bus", "motorcycle", "person"],
            conf_score=0.2,
            iou_threshold=0.7,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "vehicleFinder":
        detector = VehicleFinder(
            vehicle_model_path="./src/assets/weights/yolo11n.pt",
            plate_model_path="./src/assets/weights/plate.pt",
            video_path=default_video_map["vehicleFinder"],
            vehicle_class_names=["car", "truck", "bus", "motorcycle"],
            # polygon_zone=[[451, 268], [974, 268], [1535, 720], [154, 720]],
            conf_score=0.2,
            iou_threshold=0.7,
        )
        async for frame in detector.process_video():
            yield frame

    elif active_model == "personDetector":
        detector = PersonDetector(
            video_path=default_video_map["personDetector"],
            person_file_names=["modi1.jpg"]

        )
        async for frame in detector.process_video():
            yield frame
    


@router.get("/stream-video")
async def stream_video(
    active_model: str = Query(
        "redLightPassing",
        description="[trafficControl | redLightPassing | overspeeding | wrongWay | noHelmet |  pothole | vehicleFinder | personDetector]",
    ),
):
    if active_model not in [
        "trafficControl",
        "noHelmet",
        "pothole",
        "redLightPassing",
        "overspeeding",
        "wrongWay",
        "vehicleFinder",
        "personDetector"
    ]:
        active_model = "redLightPassing"

    return StreamingResponse(
        generate_frames(active_model),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
