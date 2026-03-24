import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import Navbar from '../../components/feature/Navbar';
import { INSIGHTS_EPOCHS, COMPARISON_DATA, METRICS } from '../../mocks/insights';
import GestureHeatmap from './components/GestureHeatmap';

const CustomTooltipArea = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3" style={{ border: '1px solid rgba(217,70,239,0.25)', background: 'rgba(15,0,30,0.95)' }}>
      <p className="text-xs text-slate-400 mb-2">Epoch {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipBar = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3" style={{ border: '1px solid rgba(217,70,239,0.25)', background: 'rgba(15,0,30,0.95)' }}>
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

type ChartTab = 'accuracy' | 'loss';

export default function Insights() {
  const [chartTab, setChartTab] = useState<ChartTab>('accuracy');

  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center text-fuchsia-400"><i className="ri-bar-chart-2-line" /></div>
              <span className="section-label">Model Insights</span>
            </div>
            <h1 className="text-xl font-bold text-white">Performance Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">VideoMAE model evaluation metrics and training analysis.</p>
          </div>
        </div>

        <div className="px-6 py-6 max-w-screen-xl mx-auto flex flex-col gap-6">

          {/* Metric cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`rounded-2xl p-5 bg-gradient-to-br ${m.bg} border ${m.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.07] text-base" style={{ color: m.color }}>
                    <i className={m.icon} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                </div>
                <motion.p
                  className="text-4xl font-bold"
                  style={{ color: m.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  {m.value}<span className="text-xl">%</span>
                </motion.p>
                <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Training chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">Training Progress</h3>
                  <p className="text-xs text-slate-500">10-epoch training curve</p>
                </div>
                <div className="flex items-center gap-1 glass rounded-xl p-1 border border-white/[0.07]">
                  {(['accuracy', 'loss'] as ChartTab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setChartTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${chartTab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      style={chartTab === t ? { background: 'linear-gradient(135deg,#d946ef,#ec4899)' } : {}}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={INSIGHTS_EPOCHS} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={chartTab === 'accuracy' ? [30, 100] : [0, 2.2]} />
                  <Tooltip content={<CustomTooltipArea />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
                  {chartTab === 'accuracy' ? (
                    <>
                      <Area type="monotone" dataKey="trainAcc" name="Train Acc" stroke="#d946ef" strokeWidth={2} fill="url(#trainGrad)" dot={false} />
                      <Area type="monotone" dataKey="valAcc"   name="Val Acc"   stroke="#fb923c" strokeWidth={2} fill="url(#valGrad)"   dot={false} />
                    </>
                  ) : (
                    <>
                      <Area type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#d946ef" strokeWidth={2} fill="url(#trainGrad)" dot={false} />
                      <Area type="monotone" dataKey="valLoss"   name="Val Loss"   stroke="#fb923c" strokeWidth={2} fill="url(#valGrad)"   dot={false} />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Comparison chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white mb-0.5">Frame vs Sequence Accuracy</h3>
                <p className="text-xs text-slate-500">Per-gesture comparison between model types</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={COMPARISON_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={4} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="gesture" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[70, 100]} />
                  <Tooltip content={<CustomTooltipBar />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
                  <Bar dataKey="frame"    name="Frame-based" fill="rgba(251,146,60,0.7)"  radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sequence" name="Sequence"     fill="rgba(217,70,239,0.8)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Model info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { icon: 'ri-cpu-line', title: 'Architecture', color: '#d946ef', items: ['VideoMAE (Transformer)', 'Distilled joint space', 'Self-attention layers', 'Patch-based embedding'] },
              { icon: 'ri-database-line', title: 'Training Data', color: '#fb923c', items: ['12,500 labeled frames', '100 gesture classes', '80/10/10 train/val/test', 'Real-time augmentation'] },
              { icon: 'ri-settings-line', title: 'Hyperparameters', color: '#2dd4bf', items: ['Batch size: 8', 'Seq Length: 16', 'Optimizer: AdamW', 'Epochs: 10'] },
            ].map((card, i) => (
              <div key={i} className="glass-card rounded-2xl p-5" style={{ border: `1px solid ${card.color}22` }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl text-sm" style={{ background: `${card.color}18`, color: card.color }}>
                    <i className={card.icon} />
                  </div>
                  <span className="text-sm font-semibold text-white">{card.title}</span>
                </div>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: card.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          {/* Gesture Frequency Heatmap */}
          {/* <GestureHeatmap /> */}
        </div>
      </div>
    </div>
  );
}
