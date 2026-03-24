import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';
import { getHistory, clearHistory, HistoryItem } from '../../services/historyStorage';

const ACCENT_COLORS: Record<string, string> = {
  Hello: '#d946ef', 'Thank You': '#fb923c', Yes: '#2dd4bf', No: '#f43f5e',
  Please: '#a78bfa', Sorry: '#fbbf24', Good: '#34d399', Help: '#f97316',
  Water: '#38bdf8', More: '#ec4899', Stop: '#ef4444', Love: '#f43f5e',
};

type Filter = 'All' | 'Today' | 'Week';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>(() => getHistory());
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportedType, setExportedType] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => setItems(getHistory());
    window.addEventListener('signai_history_updated', handleUpdate);
    return () => window.removeEventListener('signai_history_updated', handleUpdate);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  const filtered = items.filter(item => {
    const matchSearch = item.gesture.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'All') return true;
    const d = new Date(item.timestamp);
    const now = new Date();
    if (filter === 'Today') return d.toDateString() === now.toDateString();
    if (filter === 'Week') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    return true;
  });

  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = 'ID,Gesture,Text,Timestamp,Confidence (%)\n';
    const rows = filtered.map(item =>
      `${item.id},"${item.gesture}","${item.text}","${item.timestamp}",${Math.round(item.confidence * 1000) / 10}`
    ).join('\n');
    triggerDownload(header + rows, 'gesture_history.csv', 'text/csv;charset=utf-8;');
    setExportedType('CSV');
    setShowExportMenu(false);
    setTimeout(() => setExportedType(null), 3000);
  };

  const exportTXT = () => {
    const header = `SignAI — Gesture Recognition History\nExported: ${new Date().toLocaleString()}\nTotal records: ${filtered.length}\n${'─'.repeat(48)}\n\n`;
    const rows = filtered.map((item, i) => {
      const d = new Date(item.timestamp);
      const ts = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${String(i + 1).padStart(3, '0')}  ${item.gesture.padEnd(18)} ${Math.round(item.confidence * 1000) / 10}%  ${ts}`;
    }).join('\n');
    triggerDownload(header + rows, 'gesture_history.txt', 'text/plain;charset=utf-8;');
    setExportedType('TXT');
    setShowExportMenu(false);
    setTimeout(() => setExportedType(null), 3000);
  };

  const handleClearAll = () => {
    clearHistory();
    setItems([]);
  };

  const confColor = (c: number) => c >= 0.9 ? 'text-fuchsia-400' : c >= 0.75 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center text-fuchsia-400"><i className="ri-history-line" /></div>
                <span className="section-label">History</span>
              </div>
              <h1 className="text-xl font-bold text-white">Recognition History</h1>
              <p className="text-slate-500 text-sm mt-0.5">{items.length} gestures logged</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">


              {/* Export dropdown */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setShowExportMenu(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    exportedType
                      ? 'text-teal-400 border-teal-400/40'
                      : 'text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    background: exportedType ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                    border: exportedType ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <i className={exportedType ? 'ri-check-line' : 'ri-download-line'} />
                  </div>
                  {exportedType ? `${exportedType} Downloaded!` : 'Export'}
                  {!exportedType && (
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className={`ri-arrow-${showExportMenu ? 'up' : 'down'}-s-line`} />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-30 min-w-[200px]"
                      style={{ background: '#0f0520', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06]">
                        <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Export {filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={exportCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg text-teal-400 shrink-0" style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <i className="ri-file-excel-line" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Download CSV</p>
                          <p className="text-[10px] text-slate-500">Spreadsheet format — ID, gesture, confidence, timestamp</p>
                        </div>
                      </button>
                      <button
                        onClick={exportTXT}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg text-violet-400 shrink-0" style={{ background: 'rgba(167,139,250,0.1)' }}>
                          <i className="ri-file-text-line" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Download TXT</p>
                          <p className="text-[10px] text-slate-500">Formatted plain text with aligned columns</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium glass border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 cursor-pointer whitespace-nowrap transition-all duration-200"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-delete-bin-line" /></div>
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 max-w-screen-xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-500">
                <i className="ri-search-line text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search gestures..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl glass border border-white/10 text-sm text-white placeholder-slate-600 bg-transparent focus:outline-none focus:border-fuchsia-400/40 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 glass rounded-xl p-1 border border-white/[0.07]">
              {(['All', 'Today', 'Week'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={filter === f ? { background: 'linear-gradient(135deg,#d946ef,#ec4899)' } : {}}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total', value: items.length,   color: 'text-fuchsia-400', icon: 'ri-stack-line' },
              { label: 'Avg Conf', value: items.length ? `${Math.round(items.reduce((a, b) => a + b.confidence, 0) / items.length * 1000) / 10}%` : '—', color: 'text-orange-400', icon: 'ri-percent-line' },
              { label: 'Unique', value: new Set(items.map(i => i.gesture)).size, color: 'text-teal-400', icon: 'ri-fingerprint-line' },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${s.color}`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <i className={s.icon} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl glass border border-white/10 text-slate-600 text-2xl"><i className="ri-inbox-line" /></div>
              <p className="text-slate-500 text-sm">No history found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {filtered.map((item, idx) => {
                  const accentColor = ACCENT_COLORS[item.gesture] || '#d946ef';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: idx < 8 ? idx * 0.04 : 0 }}
                      className="glass-card rounded-xl px-5 py-4 flex items-center gap-4 hover:border-white/[0.12] transition-all duration-200"
                    >
                      <div className="w-2 h-10 rounded-full shrink-0" style={{ background: accentColor, opacity: 0.8 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white">{item.gesture}</p>
                        <p className="text-xs text-slate-500 truncate">{formatTime(item.timestamp)}</p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-sm font-bold ${confColor(item.confidence)}`}>
                          {Math.round(item.confidence * 1000) / 10}%
                        </span>
                        <div className="w-20 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.confidence * 100}%`, background: accentColor, opacity: 0.8 }} />
                        </div>
                      </div>
                      <button
                        onClick={() => speak(item.text)}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg glass border border-white/10 text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-400/30 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-play-line text-sm" /></div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
