import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import { GESTURE_LIST } from '../../mocks/gestures';

interface Token {
  id: string;
  text: string;
  isPunct: boolean;
  color?: string;
}

const WORD_COLORS = [
  '#d946ef','#ec4899','#f97316','#fb923c','#fbbf24','#2dd4bf',
  '#a78bfa','#34d399','#f43f5e','#38bdf8','#e879f9','#fb7185',
];

const PUNCT_ITEMS = [
  { char: ',',   label: 'Comma',        key: 'comma' },
  { char: '.',   label: 'Period',       key: 'period' },
  { char: '!',   label: 'Exclamation', key: 'excl' },
  { char: '?',   label: 'Question',    key: 'quest' },
  { char: '...',  label: 'Ellipsis',   key: 'ellip' },
  { char: ';',   label: 'Semicolon',   key: 'semi' },
  { char: ':',   label: 'Colon',       key: 'colon' },
  { char: '—',   label: 'Em Dash',     key: 'emdash' },
  { char: '(',   label: 'Open Paren',  key: 'lparen' },
  { char: ')',   label: 'Close Paren', key: 'rparen' },
];

function buildText(tokens: Token[]): string {
  // Punctuation attaches directly to previous word (no space before)
  return tokens.reduce((acc, tok) =>
    tok.isPunct ? acc + tok.text : acc + (acc ? ' ' : '') + tok.text
  , '');
}

export default function SentenceBuilder() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1;
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  }, []);

  const wordCount = tokens.filter(t => !t.isPunct).length;

  const addWord = (word: string) => {
    const colorIdx = tokens.filter(t => !t.isPunct).length % WORD_COLORS.length;
    setTokens(prev => [...prev, { id: `w-${word}-${Date.now()}`, text: word, isPunct: false, color: WORD_COLORS[colorIdx] }]);
  };

  const addPunct = (char: string) => {
    setTokens(prev => [...prev, { id: `p-${char}-${Date.now()}`, text: char, isPunct: true }]);
  };

  const clearLast = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setTokens(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    window.speechSynthesis.cancel();
    setTokens([]);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    const text = buildText(tokens);
    speak(text);
  };

  const handleCopy = async () => {
    const text = buildText(tokens);
    if (!text) return;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentence = buildText(tokens);
  const charCount = sentence.length;

  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center text-fuchsia-400"><i className="ri-chat-3-line" /></div>
              <span className="section-label">Sentence Builder</span>
            </div>
            <h1 className="text-xl font-bold text-white">Build a Complete Sentence</h1>
            <p className="text-slate-500 text-sm mt-0.5">Select gesture words and punctuation to construct a sentence, then play it as voice output.</p>
          </div>
        </div>

        <div className="px-6 py-6 max-w-screen-xl mx-auto flex flex-col gap-5">

          {/* Sentence Display */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl p-6"
            style={{ border: '1px solid rgba(217,70,239,0.15)', minHeight: '120px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center text-fuchsia-400"><i className="ri-text" /></div>
                <span className="text-sm font-semibold text-white">Constructed Sentence</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600">{wordCount} word{wordCount !== 1 ? 's' : ''} · {charCount} chars</span>
                {tokens.length > 0 && (
                  <button
                    onClick={clearLast}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400 transition-colors cursor-pointer glass border border-white/10 px-2.5 py-1 rounded-lg whitespace-nowrap"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-arrow-go-back-line" /></div>
                    Undo
                  </button>
                )}
              </div>
            </div>

            {/* Token display */}
            <div className="min-h-[56px] flex flex-wrap gap-1.5 items-center">
              {tokens.length === 0 ? (
                <p className="text-slate-600 italic text-sm">Tap words and punctuation below to build your sentence...</p>
              ) : (
                <AnimatePresence>
                  {tokens.map((tok, i) => (
                    <motion.span
                      key={tok.id}
                      initial={{ opacity: 0, scale: 0.7, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {tok.isPunct ? (
                        /* Punctuation token — compact, monospace, subtle */
                        <span
                          className="inline-flex items-center justify-center text-sm font-bold font-mono select-none rounded-lg px-2 py-1.5 transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#94a3b8',
                            minWidth: 28,
                          }}
                          title={`Punctuation: ${tok.text}`}
                        >
                          {tok.text}
                        </span>
                      ) : (
                        /* Word token — colorful pill */
                        <span
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white cursor-default select-none"
                          style={{
                            background: `${tok.color}22`,
                            border: `1px solid ${tok.color}44`,
                            color: tok.color,
                          }}
                        >
                          {tok.text}
                          <span className="text-[9px] opacity-35">#{i + 1}</span>
                        </span>
                      )}
                    </motion.span>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Formatted preview */}
            {tokens.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 pt-3 border-t border-white/[0.06]"
              >
                <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-widest">Formatted preview</p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">&ldquo;{sentence}&rdquo;</p>
              </motion.div>
            )}
          </motion.div>

          {/* Action Controls */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={handlePlay}
              disabled={tokens.length === 0}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap ${tokens.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={tokens.length > 0
                ? { background: 'linear-gradient(135deg,#d946ef,#ec4899)', boxShadow: isPlaying ? '0 0 24px rgba(217,70,239,0.5)' : '0 0 20px rgba(217,70,239,0.35)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={isPlaying ? 'ri-stop-circle-line' : 'ri-play-circle-fill'} />
              </div>
              {isPlaying ? 'Playing...' : 'Play Full Sentence'}
            </button>

            <button
              onClick={handleCopy}
              disabled={tokens.length === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium glass border border-white/10 transition-all duration-200 cursor-pointer whitespace-nowrap ${tokens.length === 0 ? 'opacity-40 cursor-not-allowed text-slate-600' : copied ? 'text-teal-400 border-teal-400/30' : 'text-slate-300 hover:text-white'}`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'} />
              </div>
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              onClick={clearAll}
              disabled={tokens.length === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium glass border border-white/10 transition-all duration-200 cursor-pointer whitespace-nowrap ${tokens.length === 0 ? 'opacity-40 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-red-400 hover:border-red-400/30'}`}
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line" /></div>
              Clear All
            </button>
          </motion.div>

          {/* Punctuation Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-4 h-4 flex items-center justify-center text-slate-500"><i className="ri-font-size" /></div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase whitespace-nowrap">Punctuation</span>
              </div>
              <div className="w-px h-4 bg-white/[0.08] shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {PUNCT_ITEMS.map(p => (
                  <motion.button
                    key={p.key}
                    onClick={() => addPunct(p.char)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={p.label}
                    className="group relative flex items-center justify-center rounded-xl font-mono font-bold text-sm cursor-pointer transition-all duration-150 text-slate-300 hover:text-white"
                    style={{
                      width: 38,
                      height: 38,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(217,70,239,0.12)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(217,70,239,0.35)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    {p.char}
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-sans font-semibold text-slate-400 bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {p.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="ml-auto text-[10px] text-slate-600 whitespace-nowrap hidden sm:block">
                Punctuation attaches to previous word
              </div>
            </div>
          </motion.div>

          {/* Word Palette */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 flex items-center justify-center text-orange-400"><i className="ri-apps-line" /></div>
              <span className="text-sm font-semibold text-white">Gesture Word Palette</span>
              <span className="ml-auto text-xs text-slate-600">Tap to add to sentence</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {GESTURE_LIST.map((g, i) => {
                const color = WORD_COLORS[i % WORD_COLORS.length];
                return (
                  <motion.button
                    key={g.name}
                    onClick={() => addWord(g.name)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
                    style={{ background: `${color}12`, border: `1px solid ${color}22`, color }}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <span>{g.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Live sentence tip */}
          <AnimatePresence>
            {wordCount >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 glass-card rounded-xl px-5 py-3"
                style={{ border: '1px solid rgba(251,146,60,0.2)' }}
              >
                <div className="w-5 h-5 flex items-center justify-center text-orange-400 shrink-0"><i className="ri-lightbulb-line" /></div>
                <p className="text-xs text-slate-400">
                  <span className="text-white font-semibold">{wordCount}-word sentence built</span>
                  {' · '}&ldquo;<span className="text-slate-300">{sentence}</span>&rdquo;
                  {' '}— press Play to hear it spoken, or add punctuation to make it more natural!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
