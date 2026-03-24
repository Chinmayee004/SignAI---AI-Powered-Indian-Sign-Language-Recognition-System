import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';

interface OutputSectionProps {
  recognizedSentence: string;
  autoVoice: boolean;
  onToggleAutoVoice: () => void;
  onPlayVoice: (text: string) => void;
  isActive: boolean;
  isSpeaking: boolean;
}

export default function OutputSection({
  recognizedSentence, autoVoice, onToggleAutoVoice, onPlayVoice, isActive, isSpeaking,
}: OutputSectionProps) {
  const fullText = recognizedSentence.trim();
  const handlePlay = useCallback(() => { if (fullText) onPlayVoice(fullText); }, [fullText, onPlayVoice]);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-fuchsia-400"><i className="ri-file-text-line" /></div>
          <span className="text-sm font-semibold text-white">Recognized Text</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
              autoVoice
                ? 'text-fuchsia-400 border border-fuchsia-400/30'
                : 'glass border border-white/10 text-slate-400 hover:text-slate-300'
            }`}
            style={autoVoice ? { background: 'rgba(217,70,239,0.12)' } : {}}
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={autoVoice ? 'ri-volume-up-line' : 'ri-volume-mute-line'} />
            </div>
            Auto Voice
          </button>
          <button
            onClick={handlePlay}
            disabled={!fullText.trim()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              fullText.trim() ? 'text-white' : 'glass border border-white/[0.06] text-slate-700 cursor-not-allowed'
            }`}
            style={fullText.trim() ? { background: 'linear-gradient(135deg,#d946ef,#ec4899)' } : {}}
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={isSpeaking ? 'ri-stop-circle-line' : 'ri-play-circle-line'} />
            </div>
            {isSpeaking ? 'Speaking…' : 'Play Voice'}
          </button>
        </div>
      </div>

          {/* Sentence text */}
      <div
        className="min-h-[96px] rounded-xl p-4 flex items-start"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        {!fullText ? (
          <p className="text-slate-600 text-sm italic">
            {isActive ? 'Waiting for full sentence prediction...' : 'Start recognition to see sentence output here.'}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={fullText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium leading-relaxed text-slate-100"
            >
              {fullText}
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      {fullText && (
        <p className="text-[10px] text-slate-600 -mt-2 text-right">
          {fullText.length} character{fullText.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Waveform visualizer — always shown */}
      <VoiceWaveVisualizer isSpeaking={isSpeaking} text={isSpeaking ? fullText : undefined} />
    </div>
  );
}
