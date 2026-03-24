"""Training utilities for SignAI."""

try:
	from training.cnn_lstm_model import SignCNNLSTM
except Exception:
	# Allow lightweight utilities (for example dataset checks) to import even if
	# optional deep learning dependencies are not available yet.
	SignCNNLSTM = None

__all__ = ["SignCNNLSTM"]
