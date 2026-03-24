export const INSIGHTS_EPOCHS = [
  { epoch: 1,  trainAcc: 4.0,  valAcc: 9.8,  trainLoss: 4.60, valLoss: 4.30 },
  { epoch: 2,  trainAcc: 16.0, valAcc: 19.0, trainLoss: 4.00, valLoss: 3.60 },
  { epoch: 3,  trainAcc: 34.0, valAcc: 31.8, trainLoss: 2.90, valLoss: 2.80 },
  { epoch: 4,  trainAcc: 63.0, valAcc: 52.0, trainLoss: 1.60, valLoss: 1.95 },
  { epoch: 5,  trainAcc: 84.5, valAcc: 59.5, trainLoss: 0.65, valLoss: 1.60 },
  { epoch: 6,  trainAcc: 93.0, valAcc: 67.5, trainLoss: 0.30, valLoss: 1.25 },
  { epoch: 7,  trainAcc: 96.5, valAcc: 72.0, trainLoss: 0.15, valLoss: 1.20 },
  { epoch: 8,  trainAcc: 97.5, valAcc: 71.8, trainLoss: 0.10, valLoss: 1.25 },
  { epoch: 9,  trainAcc: 98.0, valAcc: 73.5, trainLoss: 0.08, valLoss: 1.20 },
  { epoch: 10, trainAcc: 98.5, valAcc: 74.0, trainLoss: 0.06, valLoss: 1.22 },
];

export const COMPARISON_DATA = [
  { gesture: 'do not hurt me',        frame: 82.2, sequence: 96.0 },
  { gesture: 'can you repeat that',   frame: 72.4, sequence: 92.0 },
  { gesture: 'are you free today',    frame: 58.0, sequence: 76.0 },
  { gesture: 'do not make me angry',  frame: 46.6, sequence: 70.0 },
  { gesture: 'bring water for me',    frame: 42.3, sequence: 58.0 },
];

export const METRICS = [
  { label: 'Accuracy',  value: 74.0, icon: 'ri-focus-3-line',     color: '#d946ef', bg: 'from-fuchsia-500/15 to-pink-500/5',   border: 'border-fuchsia-500/25' },
  { label: 'Precision', value: 77.0, icon: 'ri-crosshair-line',   color: '#fb923c', bg: 'from-orange-500/15 to-amber-500/5',   border: 'border-orange-500/25' },
  { label: 'Recall',    value: 74.0, icon: 'ri-radar-line',       color: '#2dd4bf', bg: 'from-teal-400/15 to-cyan-400/5',       border: 'border-teal-400/25' },
  { label: 'F1 Score',  value: 74.0, icon: 'ri-bar-chart-line',   color: '#a78bfa', bg: 'from-violet-400/15 to-purple-400/5',  border: 'border-violet-400/25' },
];

export const GESTURE_FREQUENCY = [
  { name: 'Hello',     emoji: '👋', count: 47 },
  { name: 'Thank You', emoji: '🙏', count: 38 },
  { name: 'Yes',       emoji: '✅', count: 35 },
  { name: 'Good',      emoji: '👍', count: 31 },
  { name: 'No',        emoji: '❌', count: 28 },
  { name: 'Please',    emoji: '🤲', count: 24 },
  { name: 'Sorry',     emoji: '😔', count: 19 },
  { name: 'Water',     emoji: '💧', count: 17 },
  { name: 'Help',      emoji: '🆘', count: 14 },
  { name: 'Stop',      emoji: '✋', count: 12 },
  { name: 'More',      emoji: '➕', count: 9  },
  { name: 'Love',      emoji: '❤️', count: 7  },
];
