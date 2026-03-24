import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface WebcamViewHandle {
  captureFrame: () => string | null;
  stopRecording: () => Promise<Blob | null>;
}

interface WebcamViewProps {
  isActive: boolean;
  backendConnected?: boolean;
  recordedVideoUrl?: string | null;
}

const WebcamView = forwardRef<WebcamViewHandle, WebcamViewProps>(
  function WebcamView({ isActive, backendConnected, recordedVideoUrl }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<BlobPart[]>([]);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return null;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
        } catch {
          return null;
        }
      },
      stopRecording: () => {
        return new Promise((resolve) => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
            resolve(null);
            return;
          }
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            recordedChunksRef.current = [];
            resolve(blob);
          };
          try {
            mediaRecorderRef.current.stop();
          } catch {
            resolve(null);
          }
        });
      }
    }));

    useEffect(() => {
      if (isActive) {
        navigator.mediaDevices
          .getUserMedia({ video: { width: 1280, height: 720 } })
          .then(stream => {
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;

            // Start recording automatically as soon as camera is ready!
            recordedChunksRef.current = [];
            try {
              const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
              recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                  recordedChunksRef.current.push(event.data);
                }
              };
              recorder.start();
              mediaRecorderRef.current = recorder;
            } catch (e) {
              console.error("MediaRecorder start error:", e);
            }
          })
          .catch(() => {});
      } else {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, [isActive]);

    const borderStyle = isActive
      ? backendConnected
        ? '1px solid rgba(34,211,238,0.55)'
        : '1px solid rgba(217,70,239,0.5)'
      : '1px solid rgba(255,255,255,0.07)';

    const shadowStyle = isActive
      ? backendConnected
        ? '0 0 0 2px rgba(34,211,238,0.4), 0 0 40px rgba(34,211,238,0.15), 0 0 80px rgba(168,85,247,0.08)'
        : '0 0 0 2px rgba(217,70,239,0.6), 0 0 40px rgba(236,72,153,0.25), 0 0 80px rgba(168,85,247,0.1)'
      : 'none';

    const cornerColor = backendConnected ? 'border-cyan-400/70' : 'border-fuchsia-400/70';
    const badgeColor = backendConnected ? 'rgba(34,211,238,0.3)' : 'rgba(217,70,239,0.3)';
    const dotColor = backendConnected ? 'bg-cyan-400' : 'bg-fuchsia-400';
    const textColor = backendConnected ? 'text-cyan-400' : 'text-fuchsia-400';
    const badgeLabel = backendConnected ? 'LIVE · API' : 'LIVE';
    const scanColor = backendConnected
      ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(217,70,239,0.6), transparent)';

    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-500 bg-[#0d0020]"
        style={{ aspectRatio: '16/9', border: borderStyle, boxShadow: shadowStyle }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 ${isActive && !recordedVideoUrl ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Playback recorded video */}
        {!isActive && recordedVideoUrl && (
          <video
            src={recordedVideoUrl}
            autoPlay
            loop
            controls
            className="absolute inset-0 w-full h-full object-cover z-20 bg-black"
          />
        )}

        {/* Idle */}
        {!isActive && !recordedVideoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full glass border border-white/10 text-slate-600 text-3xl">
              <i className="ri-camera-off-line" />
            </div>
            <p className="text-slate-600 text-sm">Camera is off — press Start to begin</p>
          </div>
        )}

        {/* Active overlays */}
        {isActive && (
          <>
            <div className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 ${cornerColor} rounded-tl`} />
            <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${cornerColor} rounded-tr`} />
            <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${cornerColor} rounded-bl`} />
            <div className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 ${cornerColor} rounded-br`} />
            <div className="absolute left-0 right-0 h-px scan-line" style={{ background: scanColor }} />
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass px-3 py-1 rounded-full"
              style={{ border: `1px solid ${badgeColor}` }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} pulse-dot inline-block`} />
              <span className={`text-[10px] font-semibold ${textColor} tracking-wide`}>{badgeLabel}</span>
            </div>
          </>
        )}
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      </div>
    );
  }
);

export default WebcamView;
