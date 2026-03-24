import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory } from '../../../services/historyStorage';

function getHeatColor(ratio: number): { bg: string; border: string; text: string; glow: string } {
  if (ratio >= 0.85) return { bg: 'rgba(217,70,239,0.22)', border: 'rgba(217,70,239,0.55)', text: '#f0abfc', glow: '0 0 18px rgba(217,70,239,0.25)' };
  if (ratio >= 0.65) return { bg: 'rgba(236,72,153,0.16)', border: 'rgba(236,72,153,0.40)', text: '#fbcfe8', glow: '0 0 12px rgba(236,72,153,0.15)' };
  if (ratio >= 0.45) return { bg: 'rgba(251,146,60,0.14)', border: 'rgba(251,146,60,0.35)', text: '#fed7aa', glow: 'none' };
  if (ratio >= 0.28) return { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)', text: '#fef08a', glow: 'none' };
  if (ratio >= 0.14) return { bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.18)', text: '#94a3b8', glow: 'none' };
  return { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: '#475569', glow: 'none' };
}

const RANK_BADGE = ['🥇', '🥈', '🥉'];

// A tiny helper to generate an emoji based on first letter or similar heuristic
// since we don't have hardcoded emojis for 100 classes
const getEmojiForGesture = (g: string) => {
  const char = g.toLowerCase().charCodeAt(0);
  const emojis = ['👋','🙏','✅','👍','❌','🤲','😔','💧','🆘','✋','✨','🗣️','🗣️','🤝','🧠'];
  return emojis[char % emojis.length] || '✨';
};

export default function GestureHeatmap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [frequencies, setFrequencies] = useState<{name: string; emoji: string; count: number}[]>([]);

  useEffect(() => {
    const loadFreqs = () => {
      const history = getHistory();
      const counts: Record<string, number> = {};
      history.forEach(item => {
        counts[item.gesture] = (counts[item.gesture] || 0) + 1;
      });
      const freqs = Object.entries(counts).map(([name, count]) => ({
        name,
        emoji: getEmojiForGesture(name),
        count
      }));
      setFrequencies(freqs.sort((a, b) => b.count - a.count));
    };

    loadFreqs();
    window.addEventListener('signai_history_updated', loadFreqs);
    return () => window.removeEventListener('signai_history_updated', loadFreqs);
  }, []);

  if (frequencies.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 flex items-center justify-center text-slate-500 bg-white/[0.05] rounded-xl mb-4">
          <i className="ri-inbox-line text-xl" />
        </div>
        <p className="text-slate-400 text-sm">No gestures recorded yet</p>
        <p className="text-slate-500 text-xs mt-1">Start predicting to see your heatmap</p>
      </div>
    );
  }

  const MAX_COUNT = Math.max(...frequencies.map(g => g.count), 1);
  const TOTAL = frequencies.reduce((s, g) => s + g.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 flex items-center justify-center text-fuchsia-400">
              <i className="ri-heatmap-line" />
            </div>
            <h3 className="text-sm font-bold text-white">Gesture Frequency Heatmap (Live)</h3>
          </div>
          <p className="text-xs text-slate-500 pl-7">{TOTAL} total recognitions · {frequencies.length} gesture classes</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-600 mr-0.5">Low</span>
          {['rgba(148,163,184,0.3)', 'rgba(251,191,36,0.5)', 'rgba(251,146,60,0.6)', 'rgba(236,72,153,0.7)', 'rgba(217,70,239,0.85)'].map((c, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-slate-600 ml-0.5">High</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <AnimatePresence>
          {frequencies.map((g, idx) => {
            const ratio = g.count / MAX_COUNT;
            const colors = getHeatColor(ratio);
            const pct = Math.round((g.count / TOTAL) * 100 * 10) / 10;
            const barW = Math.round(ratio * 100);
            const isHov = hovered === g.name;

            return (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onMouseEnter={() => setHovered(g.name)}
                onMouseLeave={() => setHovered(null)}
                className="relative rounded-2xl p-4 flex flex-col items-center gap-2 cursor-default transition-all duration-200"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  boxShadow: isHov ? colors.glow : 'none',
                  transform: isHov ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Rank badge for top 3 */}
                {idx < 3 && (
                  <div className="absolute -top-2 -right-2 text-sm leading-none">
                    {RANK_BADGE[idx]}
                  </div>
                )}

                {/* Count badge */}
                <div
                  className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  {g.count}
                </div>

                {/* Emoji */}
                <span className="text-2xl mt-2 leading-none select-none">{g.emoji}</span>

                {/* Name */}
                <span className="text-[11px] font-semibold text-center leading-tight truncate w-full" style={{ color: colors.text }} title={g.name}>
                  {g.name}
                </span>

                {/* Mini frequency bar */}
                <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${barW}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.04 }}
                    style={{ background: colors.border }}
                  />
                </div>

                {/* Percentage */}
                <span className="text-[9px] font-medium text-slate-600">{pct}%</span>

                {/* Hover tooltip */}
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 rounded-xl px-3 py-2 z-20 whitespace-nowrap pointer-events-none"
                    style={{ background: 'rgba(10,0,25,0.95)', border: `1px solid ${colors.border}` }}
                  >
                    <p className="text-xs font-bold text-white">{g.name}</p>
                    <p className="text-[10px] text-slate-400">{g.count} recognitions · {pct}% of total</p>
                    <p className="text-[10px]" style={{ color: colors.text }}>
                      Rank #{idx + 1} of {frequencies.length}
                    </p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${colors.border}` }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary bar */}
      <div className="mt-5 rounded-xl p-3 flex flex-wrap gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Most Used',    value: frequencies[0].name,   emoji: frequencies[0].emoji,   color: '#f0abfc' },
          { label: 'Least Used',   value: frequencies[frequencies.length-1].name, emoji: frequencies[frequencies.length-1].emoji, color: '#475569' },
          { label: 'Top 3 Share',  value: `${Math.round((frequencies.slice(0,3).reduce((s,g) => s+g.count,0)/TOTAL)*100)}%`, emoji: '📊', color: '#fb923c' },
          { label: 'Avg/Gesture',  value: `${Math.round(TOTAL/frequencies.length)}x`, emoji: '📈', color: '#34d399' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 min-w-0 max-w-[150px]">
            <span className="text-base shrink-0">{s.emoji}</span>
            <div className="w-full">
              <p className="text-[10px] text-slate-600">{s.label}</p>
              <p className="text-xs font-bold truncate" style={{ color: s.color }} title={s.value}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
