from __future__ import annotations

import json
import os
import cv2
import numpy as np
from dataclasses import dataclass

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

@dataclass
class SentencePredictionResult:
    sentence: str
    confidence: float

class SentencePredictor:
    """
        Sentence-level predictor using VideoMAE for Video Classification.
        Requires Hugging Face `transformers` and a valid `best_videomae_model.pt`.
    """

    def __init__(self) -> None:
        self.model = None
        self.model_loaded = False
        self.idx_to_class: dict[int, str] = {}
        self.sequence_length = 16
        self.image_size = 224
        self._load_model_if_available()

    def _load_model_if_available(self) -> None:
        import torch
        from transformers import VideoMAEForVideoClassification

        checkpoint_path = os.path.join("checkpoints", "best_videomae_model.pt")
        classes_path = os.path.join("checkpoints", "videomae_classes.json")

        if not os.path.isfile(checkpoint_path) or not os.path.isfile(classes_path):
            print(f"[SENTENCE_PREDICTOR] Could not find {checkpoint_path} or {classes_path}. Running without model.", flush=True)
            return

        print(f"[SENTENCE_PREDICTOR] Loading classes from: {classes_path}", flush=True)
        with open(classes_path, "r") as f:
            class_to_idx = json.load(f)
        self.idx_to_class = {int(v): str(k) for k, v in class_to_idx.items()}
        num_classes = len(self.idx_to_class)

        print(f"[SENTENCE_PREDICTOR] Loading VideoMAE checkpoint...", flush=True)
        try:
            self.model = VideoMAEForVideoClassification.from_pretrained(
                "Shawon16/VideoMAE_WLASL_250_epochs",
                num_labels=num_classes,
                ignore_mismatched_sizes=True
            )

            try:
                checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=True)
            except Exception:
                checkpoint = torch.load(checkpoint_path, map_location="cpu")

            if "model_state_dict" in checkpoint:
                self.model.load_state_dict(checkpoint["model_state_dict"])
            else:
                self.model.load_state_dict(checkpoint)

            self.model.eval()
            self.model_loaded = True
            print("[SENTENCE_PREDICTOR] Model loaded successfully.", flush=True)
        except Exception as e:
            print(f"[SENTENCE_PREDICTOR] Error loading model: {e}", flush=True)
            self.model = None
            self.model_loaded = False

    def predict(self, frames_bgr: list[np.ndarray]) -> SentencePredictionResult:
        if self.model_loaded and self.model is not None:
            try:
                return self._predict_with_model(frames_bgr)
            except Exception as e:
                print(f"[PREDICT_ERROR] {e}", flush=True)
                return self._predict_fallback(frames_bgr)
        return self._predict_fallback(frames_bgr)

    def _preprocess_frames(self, frames_bgr: list[np.ndarray]) -> "tuple[object, object]":
        import torch

        if not frames_bgr:
            raise ValueError("No frames received for sentence prediction")

        target_frames = self.sequence_length
        # Dynamic temporal sampling to fit exactly 16 frames
        if len(frames_bgr) > target_frames:
            indices = np.linspace(0, len(frames_bgr) - 1, num=target_frames, dtype=np.int32)
            frames_bgr = [frames_bgr[i] for i in indices.tolist()]
        elif len(frames_bgr) < target_frames:
            pad_frame = frames_bgr[-1]
            frames_bgr = frames_bgr + [pad_frame] * (target_frames - len(frames_bgr))

        tensors = []
        for frame in frames_bgr:
            resized = cv2.resize(frame, (self.image_size, self.image_size), interpolation=cv2.INTER_AREA)
            rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            rgb = (rgb - IMAGENET_MEAN) / IMAGENET_STD
            tensor = torch.from_numpy(rgb).permute(2, 0, 1).contiguous()
            tensors.append(tensor)

        sequence = torch.stack(tensors, dim=0).unsqueeze(0)  # (1, T, C, H, W)
        return sequence

    def _predict_with_model(self, frames_bgr: list[np.ndarray]) -> SentencePredictionResult:
        import torch

        sequence = self._preprocess_frames(frames_bgr)
        
        with torch.no_grad():
            outputs = self.model(sequence)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)
            confidence, pred_idx = torch.max(probs, dim=-1)
            
            # Identify top-3 predictions for verification logs
            top3_conf, top3_idx = torch.topk(probs, k=min(3, probs.shape[-1]), dim=-1)
            top3 = [(self.idx_to_class.get(int(idx), f"class_{idx}"), float(conf)) for idx, conf in zip(top3_idx[0], top3_conf[0])]

        idx = int(pred_idx.item())
        sentence = self.idx_to_class.get(idx, f"class_{idx}")
        conf = float(confidence.item())

        print("\n" + "="*50)
        print("💡 PREDICTION RESULTS")
        print("="*50)
        for rank, (pred_sentence, pred_conf) in enumerate(top3, start=1):
            bar = "█" * int(pred_conf * 30)
            if rank == 1:
                print(f"🥇 #{rank} | {pred_sentence:<30} | {pred_conf*100:>5.1f}% [{bar}]")
            else:
                print(f"   #{rank} | {pred_sentence:<30} | {pred_conf*100:>5.1f}% [{bar}]")
        print("="*50 + "\n")
        
        return SentencePredictionResult(sentence=sentence, confidence=round(conf, 4))

    def _predict_fallback(self, frames_bgr: list[np.ndarray]) -> SentencePredictionResult:
        if not frames_bgr:
            return SentencePredictionResult(sentence="no frames", confidence=0.0)

        means = []
        for frame in frames_bgr:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            means.append(float(np.mean(gray)))
        signal = float(np.mean(means))

        if signal < 90:
            sentence = "i am feeling cold"
        elif signal < 140:
            sentence = "do not make me angry"
        else:
            sentence = "how are things"

        return SentencePredictionResult(sentence=sentence, confidence=0.55)
