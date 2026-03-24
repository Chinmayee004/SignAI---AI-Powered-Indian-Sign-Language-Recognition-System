from __future__ import annotations

import os
import time
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.schemas import (
    HealthResponse,
    PredictRequest,
    PredictResponse,
    PredictSentenceRequest,
    PredictSentenceResponse,
)
from app.services.frame_decoder import decode_base64_frame
from app.services.model_service import SignPredictor
from app.services.sentence_service import SentencePredictor

load_dotenv()

# Use uvicorn logger so custom ML logs show in the same terminal stream.
logger = logging.getLogger("uvicorn.error")


def _cors_origins() -> list[str]:
    origins = os.getenv("CORS_ORIGINS", "*").strip()
    if not origins or origins == "*":
        return ["*"]
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


app = FastAPI(
    title="SignAI Gesture API",
    version="0.1.0",
    description="Real-time ISL gesture prediction API for webcam frame inference.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = SignPredictor()
sentence_predictor = SentencePredictor()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", model_loaded=predictor.model_loaded)


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    started = time.monotonic()
    try:
        frame = decode_base64_frame(payload.frame)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        result = predictor.predict(frame)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    latency_ms = int((time.monotonic() - started) * 1000)

    return PredictResponse(
        gesture=result.gesture,
        confidence=result.confidence,
        fps=result.fps,
        latency_ms=latency_ms,
    )


@app.post("/predict-sentence", response_model=PredictSentenceResponse)
def predict_sentence(payload: PredictSentenceRequest) -> PredictSentenceResponse:
    started = time.monotonic()

    decoded_frames = []
    for frame_b64 in payload.frames:
        try:
            decoded_frames.append(decode_base64_frame(frame_b64))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid frame in sequence: {exc}") from exc

    try:
        result = sentence_predictor.predict(decoded_frames)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sentence prediction failed: {exc}") from exc

    latency_ms = int((time.monotonic() - started) * 1000)
    ml_line = (
        f"[ML] sentence='{result.sentence}' confidence={result.confidence:.4f} "
        f"frames={len(decoded_frames)} latency_ms={latency_ms}"
    )
    logger.info(ml_line)
    print(ml_line, flush=True)
    return PredictSentenceResponse(
        sentence=result.sentence,
        confidence=result.confidence,
        frame_count=len(decoded_frames),
        latency_ms=latency_ms,
    )
