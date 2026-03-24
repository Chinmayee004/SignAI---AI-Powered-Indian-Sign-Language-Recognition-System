import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import UploadArea from './components/UploadArea';
import PredictionOutput from './components/PredictionOutput';
import { predictSentenceFromFrames, DEFAULT_API_URL } from '../../services/gestureApi';
import { uploadVideoToCloudinary } from '../../services/uploadToCloudinary';
import { addHistoryEntry } from '../../services/historyStorage';

interface PredictionResult {
  gesture: string;
  confidence: number;
  text: string;
}

export default function UploadTest() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleFileSelect = (file: File, url: string) => {
    setUploadedFile(file);
    setPreviewUrl(url);
    setResult(null);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    if (isProcessing) setIsProcessing(false);
  };

  const extractFramesFromVideo = (url: string, frameCount = 16): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = async () => {
        const duration = video.duration;
        if (!duration || isNaN(duration)) {
          return reject(new Error('Invalid video duration.'));
        }

        const frames: string[] = [];
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to create canvas context.'));

        for (let i = 0; i < frameCount; i++) {
          const time = (i / Math.max(1, frameCount - 1)) * duration;
          video.currentTime = Math.min(time, duration - 0.01);

          await new Promise<void>((r) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              r();
            };
            video.addEventListener('seeked', onSeeked);
            setTimeout(() => {
              video.removeEventListener('seeked', onSeeked);
              r();
            }, 1000);
          });

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          frames.push(dataUrl.split(',')[1]);
        }
        resolve(frames);
      };

      video.onerror = () => reject(new Error('Failed to load video file.'));
      video.load();
    });
  };

  const extractFrameFromImage = (url: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.drawImage(img, 0, 0);
        const b64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(Array(16).fill(b64));
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = url;
    });
  };

  const handleRunPrediction = async () => {
    if (!uploadedFile || !previewUrl) return;
    setIsProcessing(true);
    setResult(null);
    setErrorMsg(null);

    try {
      // 1. Upload to Cloudinary (fire and forget)
      uploadVideoToCloudinary(uploadedFile).catch(e => console.error('Cloudinary Background Upload Error:', e));

      // 2. Extract frames
      let frames: string[];
      if (uploadedFile.type.startsWith('image/')) {
        frames = await extractFrameFromImage(previewUrl);
      } else {
        frames = await extractFramesFromVideo(previewUrl, 16);
      }

      // 3. Send to API
      const apiUrl = localStorage.getItem('signai_api_url') || DEFAULT_API_URL;
      const apiResult = await predictSentenceFromFrames(frames, apiUrl);

      const computedConfidence = parseFloat((apiResult.confidence || 0).toFixed(3));

      setResult({
        gesture: apiResult.sentence,
        confidence: computedConfidence,
        text: apiResult.sentence,
      });

      // Log to history asynchronously
      if (apiResult.sentence && apiResult.sentence !== '—') {
        addHistoryEntry({
          gesture: apiResult.sentence,
          text: apiResult.sentence,
          confidence: computedConfidence,
          source: 'Upload'
        });
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during prediction.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />

      <div className="pt-16">
        {/* Page header */}
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center text-cyan-400">
                <i className="ri-upload-cloud-line" />
              </div>
              <span className="section-label">Upload &amp; Test</span>
            </div>
            <h1 className="text-xl font-bold text-white">Batch Gesture Prediction</h1>
            <p className="text-slate-500 text-sm mt-1">
              Upload an image or video clip to run inference and get the predicted sign language output.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-5"
            >
              <UploadArea
                onFileSelect={handleFileSelect}
                uploadedFile={uploadedFile}
                previewUrl={previewUrl}
                onClear={handleClear}
              />

              {/* Run Prediction button */}
              <button
                onClick={handleRunPrediction}
                disabled={!uploadedFile || isProcessing}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  uploadedFile && !isProcessing
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan'
                    : 'glass border border-white/[0.07] text-slate-600 cursor-not-allowed'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={isProcessing ? 'ri-loader-4-line animate-spin' : 'ri-flashlight-line'} />
                </div>
                {isProcessing ? 'Running Inference...' : 'Run Prediction'}
              </button>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <i className="ri-error-warning-line mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Tips */}
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 mb-3">Tips for best results</p>
                <div className="space-y-2">
                  {[
                    { icon: 'ri-sun-line', tip: 'Use well-lit environments for clearer hand detection' },
                    { icon: 'ri-hand-line', tip: 'Ensure the signing hand is fully visible in frame' },
                    { icon: 'ri-contrast-2-line', tip: 'Good contrast between hand and background helps' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <i className={`${t.icon} text-xs`} />
                      </div>
                      <span className="text-xs text-slate-500">{t.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Prediction output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PredictionOutput
                result={result}
                isProcessing={isProcessing}
                onPlayVoice={speak}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
