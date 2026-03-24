from __future__ import annotations

import argparse
import os

from training.sequence_dataset import SequenceSignDataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sanity check for sequence dataset loader")
    parser.add_argument("--data-dir", default=os.path.join("data", "train"), help="Sequence dataset root")
    parser.add_argument("--sequence-length", type=int, default=16, help="Expected sequence length")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    dataset = SequenceSignDataset(
        root_dir=args.data_dir,
        sequence_length=args.sequence_length,
        strict_sequence_length=True,
    )

    x, y = dataset[0]
    print(f"First sample shape: {tuple(x.shape)}")
    print(f"First sample label index: {y}")
    print(f"Class count: {len(dataset.class_names)}")
    print(f"Dataset size: {len(dataset)}")


if __name__ == "__main__":
    main()
