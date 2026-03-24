from __future__ import annotations

import argparse
import os
import random
import re
import shutil
from collections import defaultdict


def natural_sort_key(name: str) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", name)]


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def list_class_names(source_roots: list[str]) -> list[str]:
    class_names: set[str] = set()
    for root in source_roots:
        if not os.path.isdir(root):
            continue
        for name in os.listdir(root):
            if os.path.isdir(os.path.join(root, name)):
                class_names.add(name)
    return sorted(class_names, key=natural_sort_key)


def collect_sequences_for_class(source_roots: list[str], class_name: str) -> list[str]:
    sequence_paths: list[str] = []
    for root in source_roots:
        class_dir = os.path.join(root, class_name)
        if not os.path.isdir(class_dir):
            continue
        for name in os.listdir(class_dir):
            seq_path = os.path.join(class_dir, name)
            if os.path.isdir(seq_path):
                sequence_paths.append(seq_path)
    sequence_paths.sort(key=lambda p: natural_sort_key(os.path.basename(p)))
    return sequence_paths


def split_class_items(
    items: list[str],
    val_ratio: float,
    test_ratio: float,
    rng: random.Random,
) -> tuple[list[str], list[str], list[str]]:
    shuffled = items[:]
    rng.shuffle(shuffled)

    total = len(shuffled)
    if total == 0:
        return [], [], []

    test_count = int(round(total * test_ratio))
    val_count = int(round(total * val_ratio))

    if total >= 3:
        test_count = max(1, min(test_count, total - 2))
        val_count = max(1, min(val_count, total - test_count - 1))
    elif total == 2:
        test_count = 1
        val_count = 0
    else:
        test_count = 0
        val_count = 0

    train_count = total - val_count - test_count

    train_items = shuffled[:train_count]
    val_items = shuffled[train_count : train_count + val_count]
    test_items = shuffled[train_count + val_count :]

    train_items.sort(key=lambda p: natural_sort_key(os.path.basename(p)))
    val_items.sort(key=lambda p: natural_sort_key(os.path.basename(p)))
    test_items.sort(key=lambda p: natural_sort_key(os.path.basename(p)))

    return train_items, val_items, test_items


def move_sequence_dirs(seq_paths: list[str], target_class_dir: str, mode: str) -> int:
    ensure_dir(target_class_dir)
    moved = 0
    next_idx = 1

    existing = [
        name
        for name in os.listdir(target_class_dir)
        if os.path.isdir(os.path.join(target_class_dir, name)) and re.fullmatch(r"seq_(\d+)", name)
    ]
    if existing:
        next_idx = max(int(name.split("_")[1]) for name in existing) + 1

    for src in seq_paths:
        dst = os.path.join(target_class_dir, f"seq_{next_idx}")
        next_idx += 1
        if mode == "move":
            shutil.move(src, dst)
        else:
            shutil.copytree(src, dst)
        moved += 1

    return moved


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build clean train/val/test splits class-wise")
    parser.add_argument(
        "--source-roots",
        nargs="+",
        default=[os.path.join("data_sentence", "train"), os.path.join("data_sentence", "val")],
        help="Input split roots to combine before re-splitting",
    )
    parser.add_argument("--output-root", default=os.path.join("data_sentence_clean"))
    parser.add_argument("--val-ratio", type=float, default=0.15)
    parser.add_argument("--test-ratio", type=float, default=0.15)
    parser.add_argument("--mode", choices=["move", "copy"], default="move")
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.val_ratio <= 0 or args.test_ratio <= 0:
        raise ValueError("val-ratio and test-ratio must be > 0")
    if (args.val_ratio + args.test_ratio) >= 1.0:
        raise ValueError("val-ratio + test-ratio must be < 1")

    source_roots = [os.path.abspath(path) for path in args.source_roots]
    output_root = os.path.abspath(args.output_root)

    train_out = os.path.join(output_root, "train")
    val_out = os.path.join(output_root, "val")
    test_out = os.path.join(output_root, "test")

    ensure_dir(train_out)
    ensure_dir(val_out)
    ensure_dir(test_out)

    class_names = list_class_names(source_roots)
    if not class_names:
        raise RuntimeError("No classes found in source roots")

    rng = random.Random(args.seed)

    summary: dict[str, dict[str, int]] = defaultdict(dict)
    total_train = 0
    total_val = 0
    total_test = 0

    for class_name in class_names:
        seq_paths = collect_sequences_for_class(source_roots, class_name)
        train_items, val_items, test_items = split_class_items(
            seq_paths,
            val_ratio=args.val_ratio,
            test_ratio=args.test_ratio,
            rng=rng,
        )

        moved_train = move_sequence_dirs(train_items, os.path.join(train_out, class_name), args.mode)
        moved_val = move_sequence_dirs(val_items, os.path.join(val_out, class_name), args.mode)
        moved_test = move_sequence_dirs(test_items, os.path.join(test_out, class_name), args.mode)

        summary[class_name] = {
            "total": len(seq_paths),
            "train": moved_train,
            "val": moved_val,
            "test": moved_test,
        }

        total_train += moved_train
        total_val += moved_val
        total_test += moved_test

    print("Class-wise split summary:")
    for class_name in class_names:
        row = summary[class_name]
        print(
            f"[CLASS] {class_name}: total={row['total']}, "
            f"train={row['train']}, val={row['val']}, test={row['test']}"
        )

    print("\nTotal summary:")
    print(f"Train sequences: {total_train}")
    print(f"Val sequences: {total_val}")
    print(f"Test sequences: {total_test}")
    print(f"All sequences: {total_train + total_val + total_test}")


if __name__ == "__main__":
    main()
