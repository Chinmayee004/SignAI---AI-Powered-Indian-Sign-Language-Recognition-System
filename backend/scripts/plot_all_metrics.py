import matplotlib.pyplot as plt
import os
import numpy as np

# Data extracted from training logs
epochs = list(range(1, 11))
train_acc = [3.94, 15.65, 33.89, 63.09, 84.85, 93.06, 96.55, 97.39, 98.23, 98.64]
val_acc = [9.73, 19.16, 31.76, 52.25, 59.25, 67.65, 72.00, 71.78, 73.47, 73.99]

train_loss = [4.6434, 3.9885, 2.9119, 1.6000, 0.6619, 0.2705, 0.1301, 0.0944, 0.0737, 0.0564]
val_loss = [4.2886, 3.6085, 2.8067, 1.9508, 1.5990, 1.2800, 1.1900, 1.2465, 1.1806, 1.2216]

# Derived Metrics
# 1. Generalization Gap (Train Acc - Val Acc) - measures overfitting
generalization_gap = [t - v for t, v in zip(train_acc, val_acc)]

# 2. Validation Accuracy Improvement Rate (Epoch-over-epoch)
val_improvement = [val_acc[0]] + [val_acc[i] - val_acc[i-1] for i in range(1, len(val_acc))]

output_dir = 'backend/checkpoints'
os.makedirs(output_dir, exist_ok=True)

# Set common style
plt.style.use('bmh') # using standard matplotlib style

# 1. Generalization Gap Plot (Overfitting Indicator)
plt.figure(figsize=(10, 6))
plt.plot(epochs, generalization_gap, label='Generalization Gap (Train - Val)', marker='D', color='purple', linewidth=2)
plt.axhline(0, color='black', linestyle='--')
plt.title('Generalization Gap over Epochs (Overfitting Indicator)', fontsize=14)
plt.xlabel('Epochs', fontsize=12)
plt.ylabel('Accuracy Gap (%)', fontsize=12)
plt.xticks(epochs)
plt.legend(fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
gap_path = os.path.join(output_dir, 'training_gap_plot.png')
plt.savefig(gap_path, dpi=300)
plt.close()

# 2. Improvement Rate Plot
plt.figure(figsize=(10, 6))
plt.bar(epochs, val_improvement, color='teal', alpha=0.7)
plt.axhline(0, color='red', linestyle='--')
plt.title('Validation Accuracy Improvement per Epoch', fontsize=14)
plt.xlabel('Epochs', fontsize=12)
plt.ylabel('Improvement in %', fontsize=12)
plt.xticks(epochs)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
improve_path = os.path.join(output_dir, 'val_improvement_plot.png')
plt.savefig(improve_path, dpi=300)
plt.close()

# 3. Log-Scale Loss Plot (Highlights convergence better)
plt.figure(figsize=(10, 6))
plt.plot(epochs, train_loss, label='Training Loss', marker='o', color='red', linewidth=2)
plt.plot(epochs, val_loss, label='Validation Loss', marker='s', color='green', linewidth=2)
plt.yscale('log')
plt.title('Loss Convergence (Logarithmic Scale)', fontsize=14)
plt.xlabel('Epochs', fontsize=12)
plt.ylabel('Log(Loss)', fontsize=12)
plt.xticks(epochs)
plt.legend(fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
log_loss_path = os.path.join(output_dir, 'training_loss_log_plot.png')
plt.savefig(log_loss_path, dpi=300)
plt.close()

# 4. Comprehensive Dashboard Plot
fig, axs = plt.subplots(2, 2, figsize=(16, 10))
fig.suptitle('VideoMAE Comprehensive Training Dashboard', fontsize=18, fontweight='bold')

# Top-Left: Accuracy
axs[0, 0].plot(epochs, train_acc, 'b.-', label='Train Acc')
axs[0, 0].plot(epochs, val_acc, 'orange', marker='s', label='Val Acc')
axs[0, 0].set_title('Accuracy')
axs[0, 0].set_ylabel('%')
axs[0, 0].legend()
axs[0, 0].grid(True)

# Top-Right: Loss
axs[0, 1].plot(epochs, train_loss, 'r.-', label='Train Loss')
axs[0, 1].plot(epochs, val_loss, 'g.-', label='Val Loss')
axs[0, 1].set_title('Loss')
axs[0, 1].legend()
axs[0, 1].grid(True)

# Bottom-Left: Generalization Gap
axs[1, 0].plot(epochs, generalization_gap, 'purple', marker='D', label='Train Acc - Val Acc')
axs[1, 0].set_title('Generalization Gap')
axs[1, 0].set_xlabel('Epochs')
axs[1, 0].set_ylabel('Gap (%)')
axs[1, 0].legend()
axs[1, 0].grid(True)

# Bottom-Right: Improvement
axs[1, 1].bar(epochs, val_improvement, color='teal', label='Val Acc Change')
axs[1, 1].set_title('Validation Improvement per Epoch')
axs[1, 1].set_xlabel('Epochs')
axs[1, 1].set_ylabel('+ / - %')
axs[1, 1].axhline(0, color='k', linestyle='-')
axs[1, 1].legend()
axs[1, 1].grid(True)

plt.tight_layout()
dashboard_path = os.path.join(output_dir, 'training_dashboard.png')
plt.savefig(dashboard_path, dpi=300)
plt.close()

print(f"Additional metrics plots successfully generated in '{output_dir}':")
print(f" - {gap_path}")
print(f" - {improve_path}")
print(f" - {log_loss_path}")
print(f" - {dashboard_path}")
