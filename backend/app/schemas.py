from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    frame: str = Field(..., description="Base64-encoded frame string")


class PredictSentenceRequest(BaseModel):
    frames: list[str] = Field(..., min_length=1, description="List of base64-encoded frame strings")


class PredictResponse(BaseModel):
    gesture: str
    confidence: float
    fps: float | None = None
    latency_ms: int | None = None


class PredictSentenceResponse(BaseModel):
    sentence: str
    confidence: float
    frame_count: int
    latency_ms: int | None = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
