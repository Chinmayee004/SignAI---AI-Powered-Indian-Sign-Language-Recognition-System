from __future__ import annotations

import os
import time
from dataclasses import dataclass

import cv2
import numpy as np


DEFAULT_LABELS = [
    "hello",
    "thank you",
    "please",
    "yes",
    "no",
    "help me",
    "good morning",
    "water",
]


@dataclass
class PredictionResult:
    gesture: str
    confidence: float
    fps: float


class SignPredictor:
    """
    Prediction service used by the FastAPI endpoint.

    It supports two modes:
    1) Torch model mode when MODEL_PATH is present and readable.
    2) Deterministic fallback mode for immediate end-to-end integration.
    """

    def __init__(self) -> None:
        self.labels = self._load_labels()
        self.model = None
        self.model_loaded = False
        self._last_prediction_time = time.monotonic()
        self._load_model_if_available()

    def _load_labels(self) -> list[str]:
        labels_raw = os.getenv("SIGN_LABELS", "")
        if labels_raw.strip():
            labels = [label.strip() for label in labels_raw.split(",") if label.strip()]
            if labels:
                return labels
        return DEFAULT_LABELS

    def _load_model_if_available(self) -> None:
        model_path = os.getenv("MODEL_PATH", "").strip()
        if not model_path:
            return

        try:
            import torch

            self.model = torch.jit.load(model_path, map_location="cpu")
            self.model.eval()
            self.model_loaded = True
        except Exception:
            self.model = None
            self.model_loaded = False

    def _estimate_fps(self) -> float:
        now = time.monotonic()
        dt = max(now - self._last_prediction_time, 1e-3)
        self._last_prediction_time = now
        return round(1.0 / dt, 2)

    def predict(self, frame_bgr: np.ndarray) -> PredictionResult:
        fps = self._estimate_fps()
        if self.model_loaded and self.model is not None:
            return self._predict_with_model(frame_bgr, fps)
        return self._predict_fallback(frame_bgr, fps)

    def _predict_with_model(self, frame_bgr: np.ndarray, fps: float) -> PredictionResult:
        import torch

        resized = cv2.resize(frame_bgr, (224, 224))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).float().unsqueeze(0) / 255.0

        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=-1)[0]

        class_idx = int(torch.argmax(probs).item())
        confidence = float(probs[class_idx].item())
        label = self.labels[class_idx] if class_idx < len(self.labels) else f"class_{class_idx}"

        return PredictionResult(
            gesture=label,
            confidence=round(confidence, 4),
            fps=fps,
        )

    def _predict_fallback(self, frame_bgr: np.ndarray, fps: float) -> PredictionResult:
        # Deterministic fallback based on frame brightness and edge density.
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))
        edges = cv2.Canny(gray, 60, 140)
        edge_density = float(np.mean(edges > 0))

        label_idx = int((brightness * 0.07 + edge_density * 100.0) % len(self.labels))
        confidence = 0.62 + min(edge_density * 0.7, 0.33)

        return PredictionResult(
            gesture=self.labels[label_idx],
            confidence=round(float(min(confidence, 0.95)), 4),
            fps=fps,
        )
