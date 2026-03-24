import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import WebcamView, { type WebcamViewHandle } from './components/WebcamView';
import RecognitionPanel from './components/RecognitionPanel';
import OutputSection from './components/OutputSection';
import ControlBar from './components/ControlBar';
import ApiGuidePanel from './components/ApiGuidePanel';
import { predictSentenceFromFrames, DEFAULT_API_URL } from '../../services/gestureApi';
import { uploadVideoToCloudinary } from '../../services/uploadToCloudinary';
import { addHistoryEntry } from '../../services/historyStorage';

interface GestureState {
  name: string;
  confidence: number;
  fps?: number;
  latency?: number;
}

const STORAGE_KEY = 'signai_api_url';
const CAPTURE_INTERVAL_MS = 100;
const API_TIMEOUT_MS = 35000;
const MAX_CAPTURE_FRAMES = 96;
const REQUEST_FRAME_COUNT = 16;
const REQUEST_SOURCE_TAIL_FRAMES = 64;
const MAX_REQUEST_WINDOWS = 3;
const QUALITY_SAMPLE_FRAMES = 8;
const QUALITY_WIDTH = 64;
const QUALITY_HEIGHT = 36;
const MIN_BRIGHTNESS = 20;
const MIN_MOTION = 4;

function selectFramesForRequest(frames: string[], targetCount: number): string[] {
  const source = frames.length > REQUEST_SOURCE_TAIL_FRAMES
    ? frames.slice(-REQUEST_SOURCE_TAIL_FRAMES)
    : frames;

  if (source.length <= targetCount) return source;

  const sampled: string[] = [];
  for (let i = 0; i < targetCount; i += 1) {
    const idx = Math.floor((i * (source.length - 1)) / Math.max(targetCount - 1, 1));
    sampled.push(source[idx]);
  }
  return sampled;
}

function buildRequestWindows(frames: string[]): string[][] {
  const source = frames.length > REQUEST_SOURCE_TAIL_FRAMES
    ? frames.slice(-REQUEST_SOURCE_TAIL_FRAMES)
    : frames;

  if (source.length <= REQUEST_FRAME_COUNT) {
    return [selectFramesForRequest(source, REQUEST_FRAME_COUNT)];
  }

  const maxStart = source.length - REQUEST_FRAME_COUNT;
  const starts = [maxStart, Math.floor(maxStart / 2), 0]
    .map(v => Math.max(0, v))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, MAX_REQUEST_WINDOWS);

  const windows = starts
    .map(start => source.slice(start, start + REQUEST_FRAME_COUNT))
    .filter(chunk => chunk.length === REQUEST_FRAME_COUNT);

  return windows.length > 0 ? windows : [selectFramesForRequest(source, REQUEST_FRAME_COUNT)];
}

function buildSampleIndices(total: number, count: number): number[] {
  if (total <= count) return Array.from({ length: total }, (_, i) => i);
  return Array.from({ length: count }, (_, i) => {
    const ratio = i / Math.max(count - 1, 1);
    return Math.floor(ratio * (total - 1));
  });
}

async function decodeFrameLuma(base64Frame: string, width: number, height: number): Promise<Uint8Array> {
  const img = new Image();
  img.src = `data:image/jpeg;base64,${base64Frame}`;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Unable to decode captured frame.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to analyze recording quality.');
  }

  ctx.drawImage(img, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const luma = new Uint8Array(width * height);
  for (let px = 0; px < luma.length; px += 1) {
    const idx = px * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    luma[px] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return luma;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

async function analyzeCaptureQuality(frames: string[]): Promise<{ brightness: number; motion: number }> {
  const sampleIndices = buildSampleIndices(frames.length, QUALITY_SAMPLE_FRAMES);
  const lumaFrames: Uint8Array[] = [];

  for (const index of sampleIndices) {
    lumaFrames.push(await decodeFrameLuma(frames[index], QUALITY_WIDTH, QUALITY_HEIGHT));
  }

  const brightnessScores: number[] = [];
  const motionScores: number[] = [];

  for (let i = 0; i < lumaFrames.length; i += 1) {
    const current = lumaFrames[i];
    let brightnessSum = 0;
    for (let px = 0; px < current.length; px += 1) {
      brightnessSum += current[px];
    }
    brightnessScores.push(brightnessSum / current.length);

    if (i > 0) {
      const prev = lumaFrames[i - 1];
      let diffSum = 0;
      for (let px = 0; px < current.length; px += 1) {
        diffSum += Math.abs(current[px] - prev[px]);
      }
      motionScores.push(diffSum / current.length);
    }
  }

  return {
    brightness: average(brightnessScores),
    motion: average(motionScores),
  };
}

export default function LiveRecognition() {
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureState>({ name: '—', confidence: 0 });
  const [recognizedSentence, setRecognizedSentence] = useState('');
  const [autoVoice, setAutoVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_API_URL);
  const [apiUrlInput, setApiUrlInput] = useState<string>(apiUrl);
  const [backendConnected, setBackendConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webcamRef = useRef<WebcamViewHandle>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const frameBufferRef = useRef<string[]>([]);
  const lastSpokenSentenceRef = useRef('');
  const consecutiveErrorsRef = useRef(0);
  const isPredictingRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const applyGesture = useCallback((name: string, confidence: number, fps?: number, latency?: number) => {
    setCurrentGesture({ name, confidence: parseFloat(confidence.toFixed(3)), fps, latency });
    setRecognizedSentence(name);
    if (autoVoice && name && name !== lastSpokenSentenceRef.current) {
      speak(name);
      lastSpokenSentenceRef.current = name;
    }
  }, [autoVoice, speak]);

  const captureOneFrame = useCallback(() => {
    const frame = webcamRef.current?.captureFrame();
    if (!frame) return;
    frameBufferRef.current = [...frameBufferRef.current, frame].slice(-MAX_CAPTURE_FRAMES);
  }, []);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const cancelInFlight = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPredictingRef.current = false;
    };

    if (isActive) {
      const runLoop = () => {
        if (!isActive) return;
        captureOneFrame();
        timerRef.current = setTimeout(runLoop, CAPTURE_INTERVAL_MS);
      };

      runLoop();
    } else {
      clearTimer();
      // If a stop-triggered prediction is in flight, do not abort it here.
      // handleStop manages request lifecycle explicitly.
      if (!isPredictingRef.current) {
        cancelInFlight();
        frameBufferRef.current = [];
      }
    }
    return () => {
      clearTimer();
      // Avoid aborting an intentional stop-triggered detect request.
      if (!isPredictingRef.current) {
        cancelInFlight();
      }
    };
  }, [isActive, captureOneFrame]);

  useEffect(() => {
    if (!apiError) return;
    if (isActive || isPredicting) return;

    const id = setTimeout(() => setApiError(null), 3500);
    return () => clearTimeout(id);
  }, [apiError, isActive, isPredicting]);

  const handleSaveApiUrl = () => {
    const trimmed = apiUrlInput.trim();
    setApiUrl(trimmed);
    localStorage.setItem(STORAGE_KEY, trimmed);
    setShowSettings(false);
  };

  const handleStart = () => {
    if (isPredictingRef.current || isPredicting) return;
    frameBufferRef.current = [];
    setApiError(null);
    setRecordedVideoUrl(null);
    setIsActive(true);
    setCurrentGesture({ name: 'Recording…', confidence: 0, fps: 30, latency: undefined });
  };

  const handleStop = useCallback(async () => {
    if (isPredictingRef.current || isPredicting) return;

    const capturedFrames = [...frameBufferRef.current];
    if (!capturedFrames.length) {
      setIsActive(false);
      setApiError('No frames captured. Click Detect and perform a sign before stopping.');
      setCurrentGesture({ name: '—', confidence: 0 });
      return;
    }

    try {
      const quality = await analyzeCaptureQuality(capturedFrames);
      if (quality.brightness < MIN_BRIGHTNESS || quality.motion < MIN_MOTION) {
        setIsActive(false);
        frameBufferRef.current = [];
        setCurrentGesture({ name: '—', confidence: 0 });
        setApiError('Empty video detected. Please upload a clear video with visible sign movement.');
        return;
      }
    } catch {
      // If quality analysis fails, continue with normal prediction flow.
    }

    isPredictingRef.current = true;
    setIsPredicting(true);
    setCurrentGesture({ name: 'Detecting…', confidence: 0, fps: undefined, latency: undefined });

    try {
      const blob = await webcamRef.current?.stopRecording();
      if (blob && blob.size > 0) {
        setRecordedVideoUrl(URL.createObjectURL(blob));
        uploadVideoToCloudinary(blob).catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }

    setIsActive(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();

    const requestWindows = buildRequestWindows(capturedFrames);

    const start = Date.now();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const responses = [] as Array<{ sentence: string; confidence: number; latency_ms?: number }>;
      // Sequential API calls for consensus voting - intentional use of await in loop
      for (const windowFrames of requestWindows) {
        const res = await predictSentenceFromFrames(windowFrames, apiUrl, { signal: controller.signal });
        responses.push(res);
      }

      let finalSentence = responses[0]?.sentence ?? '';
      let finalConfidence = responses[0]?.confidence ?? 0;
      let finalLatency = responses[0]?.latency_ms;

      const agg = new Map<string, { count: number; confidenceSum: number; bestLatency?: number }>();
      for (const res of responses) {
        const key = (res.sentence || '').trim();
        if (!key) continue;
        const prev = agg.get(key);
        if (!prev) {
          agg.set(key, { count: 1, confidenceSum: res.confidence, bestLatency: res.latency_ms });
        } else {
          prev.count += 1;
          prev.confidenceSum += res.confidence;
          if (prev.bestLatency === undefined && res.latency_ms !== undefined) {
            prev.bestLatency = res.latency_ms;
          }
        }
      }

      let bestScore = -1;
      for (const [sentence, value] of agg.entries()) {
        const avgConf = value.confidenceSum / Math.max(value.count, 1);
        const score = value.count + avgConf;
        if (score > bestScore) {
          bestScore = score;
          finalSentence = sentence;
          finalConfidence = avgConf;
          finalLatency = value.bestLatency;
        }
      }

      consecutiveErrorsRef.current = 0;
      setBackendConnected(true);
      setApiError(null);
      applyGesture(finalSentence, finalConfidence, undefined, finalLatency ?? (Date.now() - start));
      
      // Log to history asynchronously
      if (finalSentence && finalSentence !== '—') {
        addHistoryEntry({
          gesture: finalSentence,
          text: finalSentence,
          confidence: parseFloat(finalConfidence.toFixed(3))
        });
      }

      frameBufferRef.current = [];
    } catch (err: unknown) {
      consecutiveErrorsRef.current += 1;
      setBackendConnected(false);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setApiError('Prediction timeout — check backend speed or URL');
      } else {
        setApiError(err instanceof Error ? err.message : 'API unreachable');
      }
      setCurrentGesture({ name: '—', confidence: 0 });
    } finally {
      clearTimeout(timeoutId);
      isPredictingRef.current = false;
      setIsPredicting(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [apiUrl, applyGesture, isPredicting]);

  const handleClear = () => {
    setRecognizedSentence('');
    setRecordedVideoUrl(null);
    lastSpokenSentenceRef.current = '';
    setCurrentGesture({ name: '—', confidence: 0 });
    setApiError(null);
  };
  const handleToggleAutoVoice = () => setAutoVoice(v => !v);
  const handlePlayVoice = (text: string) => speak(text);

  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />

      <div className="pt-16 min-h-screen flex flex-col">
        {/* Page header */}
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center text-fuchsia-400">
                  <i className="ri-live-line" />
                </div>
                <span className="section-label">Live Recognition</span>
              </div>
              <h1 className="text-xl font-bold text-white">Real-Time Gesture Recognition</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-cyan-400/20" style={{ background: 'rgba(34,211,238,0.08)' }}>
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span className="text-xs font-semibold text-cyan-300">FastAPI Backend</span>
              </div>

              <button
                onClick={isActive ? handleStop : handleStart}
                disabled={isPredicting}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isPredicting
                    ? 'cursor-not-allowed bg-slate-700/50 text-slate-400 border border-slate-600/40'
                    : isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 cursor-pointer'
                    : 'text-white cursor-pointer'
                }`}
                style={
                  !isPredicting && !isActive
                    ? { background: 'linear-gradient(135deg,#d946ef,#ec4899)', boxShadow: '0 0 18px rgba(217,70,239,0.35)' }
                    : undefined
                }
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className={isActive ? 'ri-stop-circle-line' : 'ri-play-circle-line'} />
                </div>
                {isPredicting ? 'Detecting…' : isActive ? 'Stop & Detect' : 'Detect'}
              </button>
            </div>
          </div>

          {/* Settings drawer */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="max-w-screen-xl mx-auto mt-4 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)' }}>
                  <div className="w-5 h-5 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
                    <i className="ri-server-line" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 mb-0.5">FastAPI Backend URL</p>
                    <p className="text-[11px] text-slate-500">Your FastAPI server must expose POST /predict-sentence accepting JSON with a base64 frames array</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      value={apiUrlInput}
                      onChange={e => setApiUrlInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveApiUrl()}
                      placeholder="http://localhost:8000"
                      className="flex-1 sm:w-64 text-xs px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                    <button
                      onClick={handleSaveApiUrl}
                      className="text-xs px-4 py-2 rounded-lg font-semibold text-white cursor-pointer whitespace-nowrap transition-all"
                      style={{ background: 'linear-gradient(135deg,#0891b2,#22d3ee)' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Guide panel */}
          <AnimatePresence>
            {showApiGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="max-w-screen-xl mx-auto mt-4">
                  <ApiGuidePanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API error banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-screen-xl mx-auto mt-3 rounded-lg px-4 py-2.5 flex items-center gap-2.5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center text-red-400 shrink-0"><i className="ri-error-warning-line" /></div>
                <p className="text-xs text-red-400 flex-1">{apiError}</p>
                <span className="text-[10px] text-red-300 font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)' }}>API Retrying</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-6">
          <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
            {/* Top: Webcam + Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              <div className="lg:col-span-2">
                <WebcamView ref={webcamRef} isActive={isActive} backendConnected={backendConnected} recordedVideoUrl={recordedVideoUrl} />
              </div>
              <div className="lg:col-span-1">
                <RecognitionPanel
                  gesture={currentGesture.name}
                  confidence={currentGesture.confidence}
                  isActive={isActive}
                  fps={currentGesture.fps}
                  latency={currentGesture.latency}
                />
              </div>
            </motion.div>

            {/* Output section */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              {!isActive && !isPredicting && (
                <p className="text-xs text-slate-500 mb-2">
                  Tip: Click Detect, perform the sign immediately, then click Stop & Detect near the end of the gesture.
                </p>
              )}
              <OutputSection
                recognizedSentence={recognizedSentence}
                autoVoice={autoVoice}
                onToggleAutoVoice={handleToggleAutoVoice}
                onPlayVoice={handlePlayVoice}
                isActive={isActive}
                isSpeaking={isSpeaking}
              />
            </motion.div>

            {/* Control bar */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="pb-4">
              <ControlBar isActive={isActive} onStart={handleStart} onStop={handleStop} onClear={handleClear} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
