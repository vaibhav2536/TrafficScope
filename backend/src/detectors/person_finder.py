import asyncio
import base64
import os
import time
from typing import List
from uuid import uuid4

import cv2
import cvzone
import supervision as sv
from deepface import DeepFace
from tqdm import tqdm

from ..data.app_data import app_data
from ..routes.websockets import ws_manager
from ..utils.app_data_utils import get_person_name_by_img
from ..utils.image_utils import resize_frame

FACES_PATH = "./src/assets/images/faces"


class PersonDetector:
    def __init__(
        self,
        video_path: str,
        person_file_names: List[str] = ["modi1.jpg"],
    ):
        self.video_path = video_path
        self.file_names = [
            name
            for name in person_file_names
            if os.path.exists(os.path.join(FACES_PATH, name))
        ]
        self.tracked_persons_info = {}  # Track reported status per reference face

        # Video input info
        self.video_info = sv.VideoInfo.from_video_path(video_path=self.video_path)
        if self.video_info.fps == 0:
            self.video_info.fps = 30
        self.frame_delay = 1 / self.video_info.fps

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

                for face_img in self.file_names:
                    ref_img_path = f"{FACES_PATH}/{face_img}"

                    try:
                        result = DeepFace.verify(
                            ref_img_path,
                            frame,
                            model_name="VGG-Face",
                            enforce_detection=False,
                        )
                    except ValueError:
                        continue

                    if result["verified"]:
                        if (
                            "facial_areas" in result
                            and "img2" in result["facial_areas"]
                        ):
                            x, y, w, h = (
                                result["facial_areas"]["img2"]["x"],
                                result["facial_areas"]["img2"]["y"],
                                result["facial_areas"]["img2"]["w"],
                                result["facial_areas"]["img2"]["h"],
                            )

                            # Draw annotations immediately after verification for this face
                            cvzone.cornerRect(frame, (x, y, w, h))
                            cvzone.putTextRect(
                                frame,
                                text=f"DETECTED: {get_person_name_by_img(app_data['personInfos'], face_img)}",
                                pos=(max(0, x), max(30, y)),
                                font=cv2.FONT_HERSHEY_DUPLEX,
                                scale=0.6,
                                thickness=1,
                                offset=3,
                            )

                            # Check if we have already reported this person
                            if not self.tracked_persons_info.get(face_img, False):
                                self.tracked_persons_info[face_img] = True

                                # Check if coordinates are valid before proceeding
                                if (
                                    x >= 0
                                    and y >= 0
                                    and w > 0
                                    and h > 0
                                    and (y + h) <= frame.shape[0]
                                    and (x + w) <= frame.shape[1]
                                ):
                                    # Instead of cropping, resize the *annotated* frame for the WebSocket message
                                    ws_frame = resize_frame(frame, max_width=320)
                                    _, buffer = cv2.imencode(".jpg", ws_frame)
                                    img_base64 = base64.b64encode(buffer).decode(
                                        "utf-8"
                                    )

                                    message = {
                                        "id": str(uuid4()),
                                        "personRef": face_img,
                                        "personName": get_person_name_by_img(
                                            app_data["personInfos"], face_img
                                        ),
                                        "imgSrc": img_base64,
                                        "detectedAt": time.time() * 1000,
                                    }

                                    await ws_manager.broadcast(
                                        {
                                            "event": "server:person_detected",
                                            "data": message,
                                        }
                                    )
                                else:
                                    print(
                                        f"Warning: Invalid face coordinates for {face_img} after verification. Skipping snapshot."
                                    )
                                    self.tracked_persons_info[face_img] = False

                        else:
                            print(
                                f"Warning: Face verified for {face_img} but no facial area data found."
                            )

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

                processing_time = time.time() - start_time
                if processing_time < self.frame_delay:
                    time.sleep(self.frame_delay - processing_time)

                await asyncio.sleep(0)
