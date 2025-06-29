import os

import cv2
import cvzone
from deepface import DeepFace
from dotenv import load_dotenv
from src.data.app_data import app_data

load_dotenv()
IMAGES_PATH = os.getenv("IMAGES_PATH")


def detect_face(frame, face_detection_id):
    face_ids_map = {}

    if face_detection_id != "all":
        person_name = app_data["face_ids_map"][face_detection_id]

        if person_name:
            face_ids_map[face_detection_id] = person_name
    else:
        face_ids_map = app_data["face_ids_map"]

    for face_id in face_ids_map.keys():
        ref_img_path = f"{IMAGES_PATH}/face/{face_id}.jpg"
        person_name = face_ids_map[face_id]

        result = DeepFace.verify(
            ref_img_path,
            frame,
            model_name="VGG-Face",
            enforce_detection=False,
        )

        if result["verified"]:
            x, y, w, h, _, _ = result["facial_areas"]["img2"].values()
            cvzone.cornerRect(frame, (x, y, w, h))
            cvzone.putTextRect(
                frame,
                text=person_name,
                pos=(max(0, x), max(30, y)),
                font=cv2.FONT_HERSHEY_DUPLEX,
                scale=0.6,
                thickness=1,
                offset=3,
            )