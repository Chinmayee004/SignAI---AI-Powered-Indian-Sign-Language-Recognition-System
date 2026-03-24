import { motion } from 'framer-motion';

const stats = [
  { value: '74%', label: 'Model Accuracy',  color: 'text-fuchsia-400' },
  { value: '30 FPS', label: 'Frame Rate',      color: 'text-orange-400' },
  { value: '100+',    label: 'Gestures',        color: 'text-teal-400' },
  { value: '<80ms', label: 'Latency',         color: 'text-violet-400' },
];

export default function StatsBar() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/[0.05]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(217,70,239,0.12)' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4">
              <span className={`text-2xl md:text-3xl font-bold ${s.color} mb-1`}>{s.value}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
