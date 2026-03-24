import base64

import cv2
import numpy as np


def decode_base64_frame(frame_b64: str) -> np.ndarray:
    """Decode a base64-encoded JPEG/PNG frame into an OpenCV BGR image."""
    if not frame_b64:
        raise ValueError("Empty frame payload")

    raw_value = frame_b64.strip()
    if "," in raw_value and raw_value.lower().startswith("data:image"):
        raw_value = raw_value.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw_value, validate=False)
    except Exception as exc:
        raise ValueError("Invalid base64 frame payload") from exc

    if not image_bytes:
        raise ValueError("Decoded frame bytes are empty")

    image_np = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image from payload")

    return frame
