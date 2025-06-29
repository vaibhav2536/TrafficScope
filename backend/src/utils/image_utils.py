import base64

import cv2
import numpy as np


def resize_frame(frame: np.ndarray, max_width: int = 640) -> np.ndarray:
    h, w = frame.shape[:2]
    if w <= max_width:
        return frame
    aspect_ratio = w / h
    new_w = max_width
    new_h = int(new_w / aspect_ratio)
    return cv2.resize(frame, (new_w, new_h))


def encode_frame_to_base64(frame: np.ndarray, format: str = ".jpg") -> str:
    _, buffer = cv2.imencode(format, frame)
    return base64.b64encode(buffer).decode("utf-8")


def image_file_to_base64(image_path: str, format: str = ".jpg") -> str:
    frame = cv2.imread(image_path)
    return encode_frame_to_base64(frame, format)
