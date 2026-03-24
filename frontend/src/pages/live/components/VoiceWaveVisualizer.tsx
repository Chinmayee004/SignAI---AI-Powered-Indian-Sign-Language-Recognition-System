import { useRef, useEffect } from 'react';

interface Props {
  isSpeaking: boolean;
  text?: string;
}

const NUM_BARS = 52;
const BAR_W = 3;
const BAR_GAP = 2;
const MAX_H = 56;
const MIN_H = 3;

export default function VoiceWaveVisualizer({ isSpeaking, text }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const ampRef = useRef(0);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const W = canvas.offsetWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = 72 * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const draw = (ts: number) => {
      const W = canvas.offsetWidth;
      const H = 72;
      ctx.clearRect(0, 0, W, H);

      const target = isSpeakingRef.current ? 1 : 0;
      ampRef.current += (target - ampRef.current) * 0.06;
      const amp = ampRef.current;

      const t = ts / 1000;
      const totalBarsW = NUM_BARS * BAR_W + (NUM_BARS - 1) * BAR_GAP;
      const startX = (W - totalBarsW) / 2;

      for (let i = 0; i < NUM_BARS; i++) {
        const norm = i / (NUM_BARS - 1); // 0..1
        const phase = norm * Math.PI * 6;
        const centerBoost = 1 - Math.abs(norm - 0.5) * 2 * 0.35;

        // Layered sine waves for organic feel
        const wave =
          Math.sin(t * 6.8 + phase) * 0.38 +
          Math.sin(t * 3.1 + phase * 0.55) * 0.30 +
          Math.sin(t * 11.5 + phase * 2.1) * 0.16 +
          Math.sin(t * 1.8 + phase * 0.25) * 0.14 +
          Math.sin(t * 18 + phase * 3.4) * 0.08; // subtle HF shimmer

        const barH = Math.max(
          MIN_H,
          Math.abs(wave) * MAX_H * amp * centerBoost + MIN_H
        );

        const x = startX + i * (BAR_W + BAR_GAP);
        const y = H - barH;

        if (amp < 0.015) {
          // Idle: flat dots
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.beginPath();
          ctx.roundRect(x, H - MIN_H, BAR_W, MIN_H, [1.5, 1.5, 0, 0]);
          ctx.fill();
        } else {
          // Active: gradient bars
          const grad = ctx.createLinearGradient(x, y, x, H);
          const alpha = Math.min(0.95, 0.4 + amp * 0.55);
          grad.addColorStop(0, `rgba(236,72,153,${alpha * 0.5})`);
          grad.addColorStop(0.4, `rgba(217,70,239,${alpha * 0.75})`);
          grad.addColorStop(1, `rgba(217,70,239,${alpha})`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, BAR_W, barH, [2, 2, 1, 1]);
          ctx.fill();

          // Glow on tallest bars (top 20%)
          if (barH > MAX_H * 0.65 * amp) {
            ctx.fillStyle = `rgba(232,121,249,${amp * 0.18})`;
            ctx.fillRect(x - 1, y - 2, BAR_W + 2, 6);
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-500"
      style={{
        background: isSpeaking ? 'rgba(217,70,239,0.05)' : 'rgba(255,255,255,0.02)',
        border: isSpeaking ? '1px solid rgba(217,70,239,0.2)' : '1px solid rgba(255,255,255,0.05)',
        padding: '10px 16px 6px',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 flex items-center justify-center transition-colors duration-300 ${isSpeaking ? 'text-fuchsia-400' : 'text-slate-600'}`}>
            <i className="ri-volume-up-line text-xs" />
          </div>
          <span className={`text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300 ${isSpeaking ? 'text-fuchsia-400' : 'text-slate-600'}`}>
            {isSpeaking ? 'Speaking' : 'Voice Output'}
          </span>
        </div>
        {isSpeaking && text && (
          <span className="text-[10px] text-slate-500 italic truncate max-w-[180px]">&ldquo;{text}&rdquo;</span>
        )}
        {!isSpeaking && (
          <span className="text-[10px] text-slate-700">Idle</span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: 72 }}
      />
    </div>
  );
}
