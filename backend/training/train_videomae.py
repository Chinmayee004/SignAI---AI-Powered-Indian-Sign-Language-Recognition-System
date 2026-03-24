from __future__ import annotations

import argparse
import json
import os
import random
import time
from collections import Counter

import numpy as np
import torch
from torch import nn
from torch.amp import GradScaler, autocast
from torch.optim import AdamW
from torch.optim.lr_scheduler import OneCycleLR
from torch.utils.data import DataLoader, Dataset
from transformers import VideoMAEForVideoClassification, VideoMAEConfig

from training.sequence_dataset import SequenceSignDataset, default_frame_transform


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def calculate_class_weights(dataset: Dataset, device: torch.device) -> torch.Tensor:
    print("\n[VideoMAE] Calculating class weights for balanced loss...")
    
    # Get all labels
    all_labels = []
    for i in range(len(dataset)):
        # Getting the raw labels depending on dataset type
        if hasattr(dataset, 'samples'):
            all_labels.append(dataset.samples[i].label_idx)
        else:
            _, label = dataset[i]
            all_labels.append(label)
            
    counts = Counter(all_labels)
    num_classes = len(counts)
    total_samples = len(all_labels)
    
    weights = torch.zeros(num_classes, dtype=torch.float)
    for class_idx, count in counts.items():
        # Inverse frequency weighting
        weights[class_idx] = total_samples / (num_classes * count)
        
    print(f"[VideoMAE] Class Weights: Min={weights.min().item():.4f}, Max={weights.max().item():.4f}, Mean={weights.mean().item():.4f}")
    return weights.to(device)


def parse_args():
    parser = argparse.ArgumentParser(description="Train VideoMAE for ISL Sentence Recognition")
    parser.add_argument("--train-dir", default=os.path.join("data_sentence_clean", "train"), help="Train data root")
    parser.add_argument("--val-dir", default=os.path.join("data_sentence_clean", "val"), help="Validation data root")
    parser.add_argument("--sequence-length", type=int, default=16, help="Frames per sequence expected by VideoMAE")
    parser.add_argument("--image-size", type=int, default=224, help="Input size for VideoMAE")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument("--epochs", type=int, default=30, help="Training epochs")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for classifier")
    parser.add_argument("--backbone-lr", type=float, default=2e-5, help="Learning rate for backbone")
    parser.add_argument("--weight-decay", type=float, default=0.05, help="AdamW weight decay")
    parser.add_argument("--num-workers", type=int, default=4, help="DataLoader workers")
    parser.add_argument("--checkpoint-dir", default="checkpoints", help="Checkpoint directory")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--model-name", default="Shawon16/VideoMAE_WLASL_250_epochs", help="HF VideoMAE Checkpoint")
    parser.add_argument("--early-stop-patience", type=int, default=6)
    return parser.parse_args()


def main():
    args = parse_args()
    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n[VideoMAE] Using device: {device}")

    # Dataset loading
    print("[VideoMAE] Loading datasets...")
    transform = default_frame_transform(image_size=args.image_size)

    # In VideoMAE standard training, missing frames can ruin learning. 
    # Enable validating frames and strict length or padding (assumed SequenceSignDataset handles it based on its implementation).
    train_dataset = SequenceSignDataset(
        root_dir=args.train_dir,
        sequence_length=args.sequence_length,
        transform=transform,
        strict_sequence_length=False  # Allow smaller padded if needed, usually better to strictly enforce 16
    )

    val_dataset = SequenceSignDataset(
        root_dir=args.val_dir,
        sequence_length=args.sequence_length,
        transform=transform,
        strict_sequence_length=False
    )

    num_classes = len(train_dataset.class_names)
    print(f"[VideoMAE] Validated Classes: {num_classes}")

    # Save classes.json for frontend mappings
    os.makedirs(args.checkpoint_dir, exist_ok=True)
    with open(os.path.join(args.checkpoint_dir, "videomae_classes.json"), "w") as f:
        json.dump(train_dataset.class_to_idx, f, indent=2)

    # DataLoaders
    train_loader = DataLoader(
        train_dataset, batch_size=args.batch_size, shuffle=True, 
        num_workers=args.num_workers, pin_memory=True, drop_last=True
    )
    val_loader = DataLoader(
        val_dataset, batch_size=args.batch_size, shuffle=False, 
        num_workers=args.num_workers, pin_memory=True
    )

    # Class Weights
    class_weights = calculate_class_weights(train_dataset, device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    # Model definition
    print(f"[VideoMAE] Loading pre-trained {args.model_name} ...")
    
    # We load with ignore_mismatched_sizes to override the classifier head for `num_classes`
    model = VideoMAEForVideoClassification.from_pretrained(
        args.model_name, 
        num_labels=num_classes,
        ignore_mismatched_sizes=True
    ).to(device)

    # Differential Learning Rates (Lower for backbone, higher for new classifier)
    # The backbone layers are in `videomae` and the classifier is in `classifier`
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [
        {
            "params": [p for n, p in model.named_parameters() if 'classifier' not in n and not any(nd in n for nd in no_decay)],
            "weight_decay": args.weight_decay,
            "lr": args.backbone_lr,
        },
        {
            "params": [p for n, p in model.named_parameters() if 'classifier' not in n and any(nd in n for nd in no_decay)],
            "weight_decay": 0.0,
            "lr": args.backbone_lr,
        },
        {
            "params": [p for n, p in model.named_parameters() if 'classifier' in n and not any(nd in n for nd in no_decay)],
            "weight_decay": args.weight_decay,
            "lr": args.lr,
        },
        {
            "params": [p for n, p in model.named_parameters() if 'classifier' in n and any(nd in n for nd in no_decay)],
            "weight_decay": 0.0,
            "lr": args.lr,
        },
    ]

    optimizer = AdamW(optimizer_grouped_parameters)
    
    # Cosine Annealing / OneCycleLR
    scheduler = OneCycleLR(
        optimizer,
        max_lr=[args.backbone_lr, args.backbone_lr, args.lr, args.lr],
        steps_per_epoch=len(train_loader),
        epochs=args.epochs,
        pct_start=0.1
    )
    
    scaler = GradScaler('cuda' if torch.cuda.is_available() else 'cpu')

    # Training Loop
    best_val_acc = 0.0
    patience_counter = 0

    print("[VideoMAE] Starting Training...")
    for epoch in range(1, args.epochs + 1):
        model.train()
        train_loss = 0.0
        correct_train = 0
        total_train = 0
        start_time = time.time()

        for batch_idx, (sequences, labels) in enumerate(train_loader):
            sequences = sequences.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            # VideoMAE forwards with `pixel_values`
            with autocast('cuda' if torch.cuda.is_available() else 'cpu'):
                outputs = model(pixel_values=sequences)
                logits = outputs.logits
                loss = criterion(logits, labels)

            scaler.scale(loss).backward()
            
            # Gradient clipping is standard for VideoMAE
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()

            train_loss += loss.item() * sequences.size(0)
            preds = logits.argmax(dim=1)
            correct_train += (preds == labels).sum().item()
            total_train += labels.size(0)
            
            if batch_idx % 20 == 0:
                print(f"Epoch [{epoch}/{args.epochs}] Batch [{batch_idx}/{len(train_loader)}] Loss: {loss.item():.4f}")

        train_acc = correct_train / total_train
        train_loss_avg = train_loss / total_train

        # Validation
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for sequences, labels in val_loader:
                sequences = sequences.to(device)
                labels = labels.to(device)

                with autocast('cuda' if torch.cuda.is_available() else 'cpu'):
                    outputs = model(pixel_values=sequences)
                    logits = outputs.logits
                    loss = criterion(logits, labels)

                val_loss += loss.item() * sequences.size(0)
                preds = logits.argmax(dim=1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.size(0)

        val_acc = correct_val / total_val if total_val > 0 else 0
        val_loss_avg = val_loss / total_val if total_val > 0 else 0
        
        epoch_time = time.time() - start_time
        print(f"\n[Epoch {epoch}/{args.epochs}] Time: {epoch_time:.1f}s")
        print(f"Train Loss: {train_loss_avg:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f" Val  Loss: {val_loss_avg:.4f} |  Val Acc: {val_acc*100:.2f}%\n")

        # Early Stopping & Checkpointing
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            best_model_path = os.path.join(args.checkpoint_dir, "best_videomae_model.pt")
            
            save_dict = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "config": args.model_name
            }
            torch.save(save_dict, best_model_path)
            print(f"[*] Saved new best model to {best_model_path} with Acc: {val_acc*100:.2f}%")
        else:
            patience_counter += 1
            print(f"No improvement in validation accuracy. Patience: {patience_counter}/{args.early_stop_patience}")
            if patience_counter >= args.early_stop_patience:
                print(f"[VideoMAE] Early stopping triggered at epoch {epoch}")
                break

    print(f"\n[VideoMAE] Training Complete! Best Validation Acc: {best_val_acc*100:.2f}%")

if __name__ == "__main__":
    main()
