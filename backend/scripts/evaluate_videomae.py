import os
import json
import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from torch.utils.data import DataLoader
from transformers import VideoMAEForVideoClassification
from sklearn.metrics import (
    confusion_matrix, 
    classification_report, 
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score
)
from sklearn.preprocessing import label_binarize

# Assuming these are accessible from your project structure
from training.sequence_dataset import SequenceSignDataset, default_frame_transform

def load_classes(json_path):
    with open(json_path, 'r') as f:
        class_to_idx = json.load(f)
    idx_to_class = {v: k for k, v in class_to_idx.items()}
    return class_to_idx, idx_to_class

def evaluate_model():
    print("[Eval] Setting up Evaluation...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[Eval] Using device: {device}")

    val_dir = os.path.join('data_sentence_clean', 'val')
    checkpoint_path = os.path.join('checkpoints', 'best_videomae_model.pt')
    classes_path = os.path.join('checkpoints', 'videomae_classes.json')
    output_dir = os.path.join('checkpoints', 'evaluation_metrics')
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(val_dir):
        print(f"[Error] Val data dir {val_dir} not found. Running from backend directory?")
        return
    
    class_to_idx, idx_to_class = load_classes(classes_path)
    num_classes = len(class_to_idx)
    classes_list = [idx_to_class[i] for i in range(num_classes)]

    print("[Eval] Loading validation dataset...")
    transform = default_frame_transform(image_size=224)
    val_dataset = SequenceSignDataset(
        root_dir=val_dir,
        sequence_length=16,
        transform=transform,
        strict_sequence_length=False
    )
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)

    print("[Eval] Loading model architecture & weights...")
    model = VideoMAEForVideoClassification.from_pretrained(
        "Shawon16/VideoMAE_WLASL_250_epochs",
        num_labels=num_classes,
        ignore_mismatched_sizes=True
    )
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()

    all_preds = []
    all_labels = []
    all_probs = []

    print("[Eval] Running inference on validation dataset. This may take a few minutes...")
    with torch.no_grad():
        for batch_idx, (frames, labels) in enumerate(val_loader):
            frames = frames.to(device)
            labels = labels.to(device)
            # Forward pass
            outputs = model(frames)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            preds = torch.argmax(probs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

            if batch_idx % 1 == 0:
                print(f"       Progress: Batch {batch_idx}/{len(val_loader)}")

    print("[Eval] Inference complete. Calculating metrics...")
    
    y_true = np.array(all_labels)
    y_pred = np.array(all_preds)
    y_probs = np.array(all_probs)

    # 1. Standard Metrics
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average='macro', zero_division=0)
    rec = recall_score(y_true, y_pred, average='macro', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)

    print(f"\n[Summary] Accuracy: {acc:.4f} | Precision (Macro): {prec:.4f} | Recall (Macro): {rec:.4f} | F1-Score (Macro): {f1:.4f}")

    # Save detailed classification report
    report = classification_report(y_true, y_pred, target_names=classes_list, zero_division=0)
    with open(os.path.join(output_dir, 'classification_report.txt'), 'w') as f:
        f.write(report)
    print("[Saved] classification_report.txt")

    # 2. Confusion Matrix
    print("[Eval] Plotting Confusion Matrix...")
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(24, 20)) # Very large because 101 classes
    sns.heatmap(cm, fmt='d', cmap='Blues',
                xticklabels=[c[:10] for c in classes_list], 
                yticklabels=[c[:10] for c in classes_list]) # Truncate names if too long
    plt.title('Confusion Matrix (101 Classes)', fontsize=20)
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.xticks(rotation=90, fontsize=6)
    plt.yticks(rotation=0, fontsize=6)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'confusion_matrix.png'), dpi=200)
    plt.close()
    print("[Saved] confusion_matrix.png")

    # Binarize labels for ROC / PR curves
    y_true_bin = label_binarize(y_true, classes=range(num_classes))

    # 3. Macro ROC Curve
    print("[Eval] Plotting ROC Curve...")
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    for i in range(num_classes):
        fpr[i], tpr[i], _ = roc_curve(y_true_bin[:, i], y_probs[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])
    
    # Calculate macro-average ROC
    all_fpr = np.unique(np.concatenate([fpr[i] for i in range(num_classes)]))
    mean_tpr = np.zeros_like(all_fpr)
    for i in range(num_classes):
        mean_tpr += np.interp(all_fpr, fpr[i], tpr[i])
    mean_tpr /= num_classes
    macro_roc_auc = auc(all_fpr, mean_tpr)

    plt.figure(figsize=(10, 8))
    plt.plot(all_fpr, mean_tpr, color='indigo', linestyle='-', linewidth=2, 
             label=f'Macro-average ROC curve (AUC = {macro_roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlabel('False Positive Rate (FPR)', fontsize=12)
    plt.ylabel('True Positive Rate (TPR)', fontsize=12)
    plt.title('Receiver Operating Characteristic (ROC) - Macro Average', fontsize=14)
    plt.legend(loc='lower right', fontsize=12)
    plt.grid(True, alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'roc_curve_macro.png'), dpi=300)
    plt.close()
    print("[Saved] roc_curve_macro.png")

    # 4. Precision-Recall Curve (Macro)
    print("[Eval] Plotting Precision-Recall Curve...")
    precision = dict()
    recall = dict()
    average_precision = dict()
    for i in range(num_classes):
        precision[i], recall[i], _ = precision_recall_curve(y_true_bin[:, i], y_probs[:, i])
        average_precision[i] = average_precision_score(y_true_bin[:, i], y_probs[:, i])

    # Macro-average PR is complex due to varied supports, we calculate using Micro-averaging for general PR visual
    # Or just a simple average of APS
    macro_ap = sum(average_precision.values()) / num_classes

    # Plot Micro-averaged PR curve for global system capability
    precision_micro, recall_micro, _ = precision_recall_curve(y_true_bin.ravel(), y_probs.ravel())
    ap_micro = average_precision_score(y_true_bin, y_probs, average="micro")

    plt.figure(figsize=(10, 8))
    plt.plot(recall_micro, precision_micro, color='darkorange', lw=2, 
             label=f'Micro-average PR curve (AP = {ap_micro:.3f})')
    plt.xlabel('Recall', fontsize=12)
    plt.ylabel('Precision', fontsize=12)
    plt.title(f'Precision-Recall Curve (Macro AP={macro_ap:.3f}, Micro AP={ap_micro:.3f})', fontsize=14)
    plt.legend(loc='lower left', fontsize=12)
    plt.grid(True, alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'pr_curve_micro.png'), dpi=300)
    plt.close()
    print("[Saved] pr_curve_micro.png")

    print(f"\n[Success] All evaluation metrics successfully generated in {output_dir}")

if __name__ == '__main__':
    evaluate_model()
