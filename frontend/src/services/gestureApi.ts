export interface GesturePrediction {
  gesture: string;
  confidence: number;
  fps?: number;
  latency_ms?: number;
}

export interface SentencePrediction {
  sentence: string;
  confidence: number;
  frame_count?: number;
  latency_ms?: number;
}

interface PredictOptions {
  signal?: AbortSignal;
}

export async function predictGestureFromFrame(
  base64Frame: string,
  apiUrl: string,
  options?: PredictOptions
): Promise<GesturePrediction> {
  const endpoint = apiUrl.replace(/\/+$/, '') + '/predict';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frame: base64Frame }),
    signal: options?.signal,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return {
    gesture: data.gesture ?? data.label ?? data.prediction ?? 'Unknown',
    confidence: data.confidence ?? data.score ?? 0,
    fps: data.fps,
    latency_ms: data.latency_ms ?? data.latency,
  };
}

export async function predictSentenceFromFrames(
  base64Frames: string[],
  apiUrl: string,
  options?: PredictOptions
): Promise<SentencePrediction> {
  const endpoint = apiUrl.replace(/\/+$/, '') + '/predict-sentence';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frames: base64Frames }),
    signal: options?.signal,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return {
    sentence: data.sentence ?? data.prediction ?? data.label ?? 'Unknown',
    confidence: data.confidence ?? data.score ?? 0,
    frame_count: data.frame_count,
    latency_ms: data.latency_ms ?? data.latency,
  };
}

export function captureFrameFromVideo(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Use PNG (lossless) instead of JPEG to preserve training data quality
    return canvas.toDataURL('image/png').split(',')[1];
  } catch {
    return null;
  }
}

export const DEFAULT_API_URL = 'http://localhost:8000';
