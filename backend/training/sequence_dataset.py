from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Callable

import torch
import numpy as np
from PIL import Image, ImageFile
from torch import Tensor
from torch.utils.data import Dataset

try:
    from torchvision import transforms
except Exception:
    transforms = None

ImageFile.LOAD_TRUNCATED_IMAGES = True

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


@dataclass(frozen=True)
class SequenceSample:
    frame_paths: list[str]
    label_idx: int


def natural_sort_key(name: str) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", name)]


def default_frame_transform(image_size: int = 224) -> Callable[[Image.Image], Tensor]:
    if transforms is None:
        mean = torch.tensor(IMAGENET_MEAN, dtype=torch.float32).view(3, 1, 1)
        std = torch.tensor(IMAGENET_STD, dtype=torch.float32).view(3, 1, 1)

        def _fallback_transform(image: Image.Image) -> Tensor:
            resized = image.resize((image_size, image_size), Image.BILINEAR)
            array = np.asarray(resized, dtype=np.float32) / 255.0
            if array.ndim == 2:
                array = np.stack([array, array, array], axis=-1)
            tensor = torch.from_numpy(array).permute(2, 0, 1).contiguous()
            tensor = (tensor - mean) / std
            return tensor

        return _fallback_transform

    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )


class SequenceSignDataset(Dataset[tuple[Tensor, int]]):
    """
    Sequence dataset loader.

    Expected layout:
      root_dir/
        class_name/
          seq_1/
            000.jpg
            ...
          seq_2/
            ...

    Returns:
      - sequence tensor with shape (T, C, H, W)
      - label index
    """

    def __init__(
        self,
        root_dir: str,
        sequence_length: int = 4,
        transform: Callable[[Image.Image], Tensor] | None = None,
        image_size: int = 224,
        strict_sequence_length: bool = True,
        validate_frames: bool = True,
    ) -> None:
        self.root_dir = root_dir
        self.sequence_length = sequence_length
        self.strict_sequence_length = strict_sequence_length
        self.validate_frames = validate_frames
        self.transform = transform or default_frame_transform(image_size=image_size)

        if not os.path.isdir(self.root_dir):
            raise FileNotFoundError(f"Dataset folder not found: {self.root_dir}")

        self.class_names = self._discover_classes()
        self.class_to_idx = {class_name: idx for idx, class_name in enumerate(self.class_names)}
        self.idx_to_class = {idx: class_name for class_name, idx in self.class_to_idx.items()}

        self.samples, skipped_count = self._index_samples()

        print(f"[Dataset] Root: {self.root_dir}")
        print(f"[Dataset] Classes: {len(self.class_names)}")
        print(f"[Dataset] Sequences: {len(self.samples)}")
        if skipped_count:
            print(f"[Dataset] Skipped invalid sequences: {skipped_count}")

    def _discover_classes(self) -> list[str]:
        class_names = [
            name
            for name in os.listdir(self.root_dir)
            if os.path.isdir(os.path.join(self.root_dir, name))
        ]
        class_names.sort(key=natural_sort_key)
        if not class_names:
            raise RuntimeError(f"No class folders found in: {self.root_dir}")
        return class_names

    def _index_samples(self) -> tuple[list[SequenceSample], int]:
        samples: list[SequenceSample] = []
        skipped = 0

        for class_name in self.class_names:
            class_dir = os.path.join(self.root_dir, class_name)
            sequence_dirs = [
                os.path.join(class_dir, seq_name)
                for seq_name in os.listdir(class_dir)
                if os.path.isdir(os.path.join(class_dir, seq_name))
            ]
            sequence_dirs.sort(key=lambda p: natural_sort_key(os.path.basename(p)))

            label_idx = self.class_to_idx[class_name]

            for seq_dir in sequence_dirs:
                frame_paths = self._list_sequence_frames(seq_dir)
                if self.strict_sequence_length and len(frame_paths) != self.sequence_length:
                    skipped += 1
                    continue
                if not self.strict_sequence_length and len(frame_paths) < self.sequence_length:
                    skipped += 1
                    continue

                frame_paths = frame_paths[: self.sequence_length]
                if self.validate_frames and not self._all_frames_readable(frame_paths):
                    skipped += 1
                    continue
                samples.append(SequenceSample(frame_paths=frame_paths, label_idx=label_idx))

        if not samples:
            raise RuntimeError(
                "No valid sequences found. Check sequence folders and frame counts in dataset."
            )

        return samples, skipped

    def _list_sequence_frames(self, seq_dir: str) -> list[str]:
        frame_paths = []
        for file_name in os.listdir(seq_dir):
            full_path = os.path.join(seq_dir, file_name)
            if not os.path.isfile(full_path):
                continue
            ext = os.path.splitext(file_name)[1].lower()
            if ext in VALID_IMAGE_EXTENSIONS:
                frame_paths.append(full_path)

        frame_paths.sort(key=lambda p: natural_sort_key(os.path.basename(p)))
        return frame_paths

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> tuple[Tensor, int]:
        sample = self.samples[index]

        frames: list[Tensor] = []
        for frame_path in sample.frame_paths:
            image = self._safe_load_frame(frame_path)
            if image is None:
                raise RuntimeError(
                    "Encountered corrupted frame at runtime. "
                    "Rebuild dataset index with validate_frames=True."
                )

            frame_tensor = self.transform(image)
            frames.append(frame_tensor)

        sequence_tensor = torch.stack(frames, dim=0)
        return sequence_tensor, sample.label_idx

    @staticmethod
    def _safe_load_frame(frame_path: str) -> Image.Image | None:
        try:
            with Image.open(frame_path) as image:
                return image.convert("RGB")
        except Exception:
            return None

    @staticmethod
    def _all_frames_readable(frame_paths: list[str]) -> bool:
        for frame_path in frame_paths:
            if SequenceSignDataset._safe_load_frame(frame_path) is None:
                return False
        return True
