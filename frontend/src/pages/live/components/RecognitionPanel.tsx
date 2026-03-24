import { motion, AnimatePresence } from 'framer-motion';

interface RecognitionPanelProps {
  gesture: string;
  confidence: number;
  isActive: boolean;
  fps?: number;
  latency?: number;
}

export default function RecognitionPanel({ gesture, confidence, isActive, fps, latency }: RecognitionPanelProps) {
  const pct = Math.round(confidence * 1000) / 10;
  const hasPrediction = gesture && gesture !== '—';
  const barGradient = confidence >= 0.9
    ? 'linear-gradient(90deg,#d946ef,#ec4899)'
    : confidence >= 0.75
    ? 'linear-gradient(90deg,#fb923c,#fbbf24)'
    : 'linear-gradient(90deg,#ef4444,#f97316)';
  const confColor = confidence >= 0.9 ? 'text-fuchsia-400' : confidence >= 0.75 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Status */}
      <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full inline-block ${isActive ? 'bg-fuchsia-400 pulse-dot' : 'bg-slate-700'}`} />
        <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-fuchsia-400' : 'text-slate-600'}`}>
          {isActive ? 'Live Processing' : 'Standby'}
        </span>
        {isActive && (
          <div className="ml-auto flex gap-0.5 items-end h-4">
            {[...Array(4)].map((_, i) => (
              <motion.div key={i} className="w-0.5 rounded-full" style={{ background: 'rgba(217,70,239,0.6)' }}
                animate={{ height: [4, 14, 4] }}
                transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Predicted Sentence */}
      <div className="glass-card rounded-xl p-5 flex-1 flex flex-col justify-between min-h-[160px]">
        <div>
          <p className="text-[10px] text-slate-600 font-medium mb-3 tracking-widest uppercase">Predicted Sentence</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={gesture}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className={`font-bold leading-none ${hasPrediction ? 'gradient-text' : 'text-slate-800'}`}
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
            >
              {hasPrediction ? gesture : '—'}
            </motion.p>
          </AnimatePresence>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-600 tracking-widest uppercase">Confidence</p>
            <span className={`text-sm font-bold ${hasPrediction ? confColor : 'text-slate-700'}`}>
              {hasPrediction ? `${pct}%` : '—'}
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: hasPrediction ? barGradient : '#1e293b' }}
              animate={{ width: hasPrediction ? `${pct}%` : '0%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Frame info */}
      <div className="glass-card rounded-xl px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Frame Rate</p>
          <p className="text-sm font-semibold text-slate-300">{isActive ? `${fps ?? 28} FPS` : '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Latency</p>
          <p className="text-sm font-semibold text-slate-300">{latency !== undefined ? `${latency}ms` : '—'}</p>
        </div>
      </div>
    </div>
  );
}
