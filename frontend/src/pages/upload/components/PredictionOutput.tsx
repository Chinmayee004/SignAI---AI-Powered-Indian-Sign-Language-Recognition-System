import { motion } from 'framer-motion';

interface PredictionResult { gesture: string; confidence: number; text: string; }
interface PredictionOutputProps { result: PredictionResult | null; isProcessing: boolean; onPlayVoice: (text: string) => void; }

export default function PredictionOutput({ result, isProcessing, onPlayVoice }: PredictionOutputProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center text-fuchsia-400"><i className="ri-ai-generate" /></div>
        <span className="text-sm font-semibold text-white">Prediction Output</span>
      </div>

      {isProcessing && (
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <motion.div className="absolute inset-0 rounded-full border-2 border-fuchsia-400/20" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-1 rounded-full border-2 border-t-transparent" style={{ borderColor: '#d946ef' }} animate={{ rotate: -360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium mb-1">Analyzing gesture...</p>
            <p className="text-slate-500 text-xs">Running VideoMAE Transformer inference</p>
          </div>
          <div className="w-full space-y-2 max-w-xs">
            {['Preprocessing frame','Extracting spatial features','Sequence inference','Post-processing'].map((step, i) => (
              <motion.div key={step} className="flex items-center gap-2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}>
                <motion.div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.3 }} />
                <span className="text-xs text-slate-500">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!isProcessing && !result && (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl glass border border-white/10 text-slate-600 text-2xl"><i className="ri-scan-line" /></div>
          <p className="text-slate-500 text-sm">Upload a file and run prediction to see results here.</p>
        </div>
      )}

      {!isProcessing && result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card rounded-2xl p-6 flex flex-col gap-5" style={{ border: '1px solid rgba(217,70,239,0.15)' }}>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Detected Gesture</p>
            <p className="text-5xl font-bold gradient-text">{result.gesture}</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">Confidence Score</span>
              <span className="text-fuchsia-400 font-bold">{Math.round(result.confidence * 1000) / 10}%</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#d946ef,#ec4899,#f97316)' }}
                initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 0.6, delay: 0.2 }} />
            </div>
          </div>
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-500 mb-1">Text Output</p>
            <p className="text-white font-medium">{result.text}</p>
          </div>
          <button
            onClick={() => onPlayVoice(result.text)}
            className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#d946ef,#ec4899)', boxShadow: '0 0 20px rgba(217,70,239,0.35)' }}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-play-circle-line" /></div>
            Play Voice Output
          </button>
        </motion.div>
      )}
    </div>
  );
}
