# SignAI - AI-Powered Indian Sign Language Recognition System

![SignAI Banner](./project%20details/signai-banner.png)

**SignAI** is a comprehensive, full-stack real-time gesture recognition system that automatically detects and translates **Indian Sign Language (ISL)** into readable text and natural speech. Built with cutting-edge Vision Transformer technology (VideoMAE), SignAI bridges the communication gap for the deaf and hard-of-hearing community.

---

## 🌟 Key Features

- **Real-Time Gesture Recognition**: Process video frames at 30 FPS with <80ms latency
- **Extensive Gesture Library**: Recognize 100+ ISL sentence-level gestures and phrases
- **High Accuracy**: 74% validation accuracy on complex ISL gestures trained via VideoMAE
- **Live Webcam Support**: Stream directly from your webcam with instant predictions
- **File Upload & Testing**: Batch test videos and images for offline analysis
- **Text Transcription**: Auto-generated real-time text transcript of sign language
- **Voice Synthesis**: Convert recognized gestures to natural speech via Web Speech API
- **Session History**: Complete audit trail with confidence scores and timestamps
- **Responsive UI**: Modern, dark-themed interface built with React and Tailwind CSS

---

## 📋 Quick Navigation

- **New Laptop?** → See [SETUP.md](./SETUP.md) for complete installation guide
- **Model Details?** → See [MODEL_PIPELINE.md](./MODEL_PIPELINE.md) for architecture & algorithms
- **API Docs?** → Run backend and visit http://localhost:8000/docs

---

## 🚀 Quick Start

### Prerequisites: Python 3.11+, Node.js 18+, Git

**Backend (Terminal 1):**
\\\ash
cd backend
python -m venv .venv
.\\venv\\Scripts\\Activate.ps1        # Windows PowerShell
source ../.venv/bin/activate  # macOS/Linux
pip install -r ../backend/requirements.txt
.\\run-backend.ps1  # or: uvicorn app.main:app --reload --port 8000
\\\

**Frontend (Terminal 2):**
\\\ash
cd frontend
npm install
npm run dev
\\\

Visit: http://localhost:5173 ✅

**For complete setup guide:** See [SETUP.md](./SETUP.md)

---