import argparse
import os
import re
from typing import List

import cv2
import numpy as np


VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VALID_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def natural_sort_key(name: str) -> List[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", name)]


def list_class_dirs(input_root: str) -> List[str]:
    if not os.path.isdir(input_root):
        raise FileNotFoundError(f"Input folder not found: {input_root}")
    class_names = [
        entry
        for entry in os.listdir(input_root)
        if os.path.isdir(os.path.join(input_root, entry))
    ]
    return sorted(class_names, key=natural_sort_key)


def list_frame_files(class_dir: str) -> List[str]:
    frame_files = []
    for name in os.listdir(class_dir):
        full_path = os.path.join(class_dir, name)
        if not os.path.isfile(full_path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext in VALID_IMAGE_EXTENSIONS:
            frame_files.append(full_path)
    return sorted(frame_files, key=lambda p: natural_sort_key(os.path.basename(p)))


def list_video_files(class_dir: str) -> List[str]:
    video_files = []
    for name in os.listdir(class_dir):
        full_path = os.path.join(class_dir, name)
        if not os.path.isfile(full_path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext in VALID_VIDEO_EXTENSIONS:
            video_files.append(full_path)
    return sorted(video_files, key=lambda p: natural_sort_key(os.path.basename(p)))


def list_frame_stream_dirs(class_dir: str) -> List[str]:
    """
    Discover all frame-containing folders inside a class directory.

    Each discovered folder is treated as an independent frame stream for
    sliding-window sequence generation to avoid mixing different recordings.
    """
    stream_dirs = []
    for root, _dirs, files in os.walk(class_dir):
        has_images = any(
            os.path.splitext(file_name)[1].lower() in VALID_IMAGE_EXTENSIONS
            for file_name in files
        )
        if has_images:
            stream_dirs.append(root)

    stream_dirs = sorted(set(stream_dirs), key=lambda p: natural_sort_key(os.path.relpath(p, class_dir)))
    return stream_dirs


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def next_sequence_index(class_output_dir: str) -> int:
    """Return the next available sequence index for seq_<n> folders."""
    max_idx = 0
    if not os.path.isdir(class_output_dir):
        return 1

    for name in os.listdir(class_output_dir):
        full_path = os.path.join(class_output_dir, name)
        if not os.path.isdir(full_path):
            continue
        match = re.fullmatch(r"seq_(\d+)", name)
        if not match:
            continue
        idx = int(match.group(1))
        if idx > max_idx:
            max_idx = idx

    return max_idx + 1


def extract_frames_from_images(frame_paths: List[str], width: int, height: int) -> List[np.ndarray]:
    frames = []
    for frame_path in frame_paths:
        image = cv2.imread(frame_path)
        if image is None:
            continue
        resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
        frames.append(resized)
    return frames


def extract_frames_from_video(video_path: str, width: int, height: int) -> List[np.ndarray]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    frames = []
    while True:
        success, frame = cap.read()
        if not success:
            break
        resized = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
        frames.append(resized)

    cap.release()
    return frames


def write_sequences_from_frames(
    frames: List[np.ndarray],
    class_output_dir: str,
    sequence_length: int,
    stride: int,
    start_index: int,
) -> int:
    if len(frames) < sequence_length:
        return 0

    created = 0
    max_start = len(frames) - sequence_length
    for start in range(0, max_start + 1, stride):
        window = frames[start : start + sequence_length]
        if len(window) < sequence_length:
            continue

        seq_number = start_index + created + 1
        seq_dir = os.path.join(class_output_dir, f"seq_{seq_number}")
        ensure_dir(seq_dir)

        for idx, image in enumerate(window):
            output_name = f"{idx:03d}.jpg"
            output_path = os.path.join(seq_dir, output_name)
            cv2.imwrite(output_path, image)

        created += 1

    return created


def process_class(
    class_name: str,
    class_dir: str,
    output_root: str,
    sequence_length: int,
    stride: int,
    width: int,
    height: int,
    input_type: str,
) -> int:
    class_output_dir = os.path.join(output_root, class_name)
    ensure_dir(class_output_dir)

    next_seq_idx = next_sequence_index(class_output_dir)
    sequence_count = 0
    stream_count = 0

    if input_type in ("auto", "frames"):
        # Layout A/B: class contains direct frames or nested clip folders.
        for stream_dir in list_frame_stream_dirs(class_dir):
            stream_frame_paths = list_frame_files(stream_dir)
            if not stream_frame_paths:
                continue
            stream_frames = extract_frames_from_images(stream_frame_paths, width, height)
            if not stream_frames:
                continue
            created = write_sequences_from_frames(
                stream_frames, class_output_dir, sequence_length, stride, next_seq_idx - 1
            )
            sequence_count += created
            next_seq_idx += created
            stream_count += 1

    if input_type in ("auto", "videos"):
        # Layout C: class folder contains videos (sentence-level datasets).
        for video_path in list_video_files(class_dir):
            video_frames = extract_frames_from_video(video_path, width, height)
            if not video_frames:
                continue
            created = write_sequences_from_frames(
                video_frames, class_output_dir, sequence_length, stride, next_seq_idx - 1
            )
            sequence_count += created
            next_seq_idx += created
            stream_count += 1

    if stream_count == 0:
        print(f"[WARN] {class_name}: no readable frames/videos found")

    return sequence_count


def default_input_dir() -> str:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(os.path.dirname(script_dir))

    candidates = [
        os.path.join(repo_root, "datasets", "Frames_Word_Level"),
        os.path.join(repo_root, "datasets", "Frames_Sentence_Level"),
        os.path.join(repo_root, "datasets", "Videos_Sentence_Level"),
    ]
    for path in candidates:
        if os.path.isdir(path):
            return path

    return candidates[0]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert sign language datasets into fixed-length sequence folders."
    )
    parser.add_argument(
        "--input-dir",
        default=default_input_dir(),
        help="Input root directory with class folders containing frame images.",
    )
    parser.add_argument(
        "--output-dir",
        default=os.path.join("data", "train"),
        help="Output root directory for generated sequences (default: data/train).",
    )
    parser.add_argument("--sequence-length", type=int, default=4, help="Frames per sequence.")
    parser.add_argument("--stride", type=int, default=2, help="Sliding window stride.")
    parser.add_argument("--width", type=int, default=224, help="Resize width.")
    parser.add_argument("--height", type=int, default=224, help="Resize height.")
    parser.add_argument(
        "--input-type",
        choices=["auto", "frames", "videos"],
        default="auto",
        help="Input data type: frames, videos, or auto-detect (default: auto).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.sequence_length <= 0:
        raise ValueError("sequence-length must be > 0")
    if args.stride <= 0:
        raise ValueError("stride must be > 0")

    ensure_dir(args.output_dir)
    class_names = list_class_dirs(args.input_dir)

    total_sequences = 0
    print(f"Found {len(class_names)} class folders in: {args.input_dir}")

    for class_name in class_names:
        class_dir = os.path.join(args.input_dir, class_name)
        sequences_created = process_class(
            class_name=class_name,
            class_dir=class_dir,
            output_root=args.output_dir,
            sequence_length=args.sequence_length,
            stride=args.stride,
            width=args.width,
            height=args.height,
            input_type=args.input_type,
        )
        total_sequences += sequences_created
        print(f"[CLASS] {class_name}: {sequences_created} sequences created")

    print(f"Done. Total sequences created: {total_sequences}")


if __name__ == "__main__":
    main()
