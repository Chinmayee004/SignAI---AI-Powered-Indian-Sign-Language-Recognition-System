from __future__ import annotations

import argparse
import os
import random
import re
import shutil
from dataclasses import dataclass


def natural_sort_key(name: str) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", name)]


@dataclass
class ClassSplitStats:
    class_name: str
    total: int
    train_count: int
    val_count: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split sequence dataset into train/val with class-wise distribution."
    )
    parser.add_argument(
        "--input-dir",
        default=os.path.join("data", "train"),
        help="Input dataset root containing class/seq_* folders.",
    )
    parser.add_argument(
        "--train-output",
        default=os.path.join("data", "train"),
        help="Output directory for train split.",
    )
    parser.add_argument(
        "--val-output",
        default=os.path.join("data", "val"),
        help="Output directory for validation split.",
    )
    parser.add_argument(
        "--val-ratio",
        type=float,
        default=0.2,
        help="Validation ratio (default: 0.2).",
    )
    parser.add_argument(
        "--mode",
        choices=["move", "copy"],
        default="move",
        help="Move or copy sequence folders into split outputs.",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducible splits.")
    return parser.parse_args()


def list_class_dirs(root_dir: str) -> list[str]:
    class_names = [
        name for name in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, name))
    ]
    return sorted(class_names, key=natural_sort_key)


def list_sequence_dirs(class_dir: str) -> list[str]:
    seq_dirs = [
        os.path.join(class_dir, name)
        for name in os.listdir(class_dir)
        if os.path.isdir(os.path.join(class_dir, name))
    ]
    return sorted(seq_dirs, key=lambda p: natural_sort_key(os.path.basename(p)))


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def move_or_copy(src: str, dst: str, mode: str) -> None:
    if os.path.exists(dst):
        raise FileExistsError(f"Destination already exists: {dst}")
    if mode == "move":
        shutil.move(src, dst)
    else:
        shutil.copytree(src, dst)


def split_sequences_for_class(
    class_name: str,
    class_sequences: list[str],
    val_ratio: float,
    rng: random.Random,
) -> tuple[list[str], list[str]]:
    items = class_sequences[:]
    rng.shuffle(items)

    total = len(items)
    if total == 0:
        return [], []

    val_count = int(round(total * val_ratio))
    if total > 1:
        val_count = max(1, min(val_count, total - 1))
    else:
        val_count = 0

    val_items = sorted(items[:val_count], key=lambda p: natural_sort_key(os.path.basename(p)))
    train_items = sorted(items[val_count:], key=lambda p: natural_sort_key(os.path.basename(p)))
    return train_items, val_items


def main() -> None:
    args = parse_args()

    if not (0.0 < args.val_ratio < 1.0):
        raise ValueError("val-ratio must be in the range (0, 1)")

    input_dir = os.path.abspath(args.input_dir)
    train_output = os.path.abspath(args.train_output)
    val_output = os.path.abspath(args.val_output)

    if not os.path.isdir(input_dir):
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    if train_output == val_output:
        raise ValueError("train-output and val-output must be different")

    if args.mode == "copy" and input_dir == train_output:
        raise ValueError(
            "copy mode with train-output equal to input-dir causes leakage. "
            "Use --mode move or set a different --train-output."
        )

    ensure_dir(train_output)
    ensure_dir(val_output)

    rng = random.Random(args.seed)

    class_names = list_class_dirs(input_dir)
    if not class_names:
        raise RuntimeError(f"No class folders found in: {input_dir}")

    stats: list[ClassSplitStats] = []

    for class_name in class_names:
        src_class_dir = os.path.join(input_dir, class_name)
        train_class_dir = os.path.join(train_output, class_name)
        val_class_dir = os.path.join(val_output, class_name)
        ensure_dir(train_class_dir)
        ensure_dir(val_class_dir)

        sequence_dirs = list_sequence_dirs(src_class_dir)
        train_seqs, val_seqs = split_sequences_for_class(
            class_name=class_name,
            class_sequences=sequence_dirs,
            val_ratio=args.val_ratio,
            rng=rng,
        )

        # When splitting in place in move mode, we only move validation sequences
        # out of input-dir into val-output. Train sequences stay where they are.
        if args.mode == "move" and input_dir == train_output:
            for seq_src in val_seqs:
                seq_name = os.path.basename(seq_src)
                dst_path = os.path.join(val_class_dir, seq_name)
                move_or_copy(seq_src, dst_path, mode="move")
        else:
            for seq_src in train_seqs:
                seq_name = os.path.basename(seq_src)
                dst_path = os.path.join(train_class_dir, seq_name)
                move_or_copy(seq_src, dst_path, mode=args.mode)
            for seq_src in val_seqs:
                seq_name = os.path.basename(seq_src)
                dst_path = os.path.join(val_class_dir, seq_name)
                move_or_copy(seq_src, dst_path, mode=args.mode)

            if args.mode == "move" and input_dir != train_output:
                # Clean up old class dir if moved to separate outputs.
                if os.path.isdir(src_class_dir) and not os.listdir(src_class_dir):
                    os.rmdir(src_class_dir)

        stats.append(
            ClassSplitStats(
                class_name=class_name,
                total=len(sequence_dirs),
                train_count=len(train_seqs),
                val_count=len(val_seqs),
            )
        )

    total_train = sum(s.train_count for s in stats)
    total_val = sum(s.val_count for s in stats)
    total_all = sum(s.total for s in stats)

    print("Class-wise split summary:")
    for row in stats:
        print(
            f"[CLASS] {row.class_name}: total={row.total}, "
            f"train={row.train_count}, val={row.val_count}"
        )

    print("\nTotal summary:")
    print(f"Total sequences: {total_all}")
    print(f"Train sequences: {total_train}")
    print(f"Val sequences: {total_val}")


if __name__ == "__main__":
    main()
