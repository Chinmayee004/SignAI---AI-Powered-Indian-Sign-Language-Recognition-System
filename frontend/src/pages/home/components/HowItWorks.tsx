import { motion } from 'framer-motion';

const steps = [
  { number: '01', icon: 'ri-camera-line',       color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20', title: 'Open Your Camera',    desc: 'Allow webcam access with one click. The system initializes the live feed and prepares the inference pipeline.' },
  { number: '02', icon: 'ri-hand-line',          color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  title: 'Perform a Gesture',   desc: 'Position your hand in frame and sign naturally. The model processes every frame continuously in real-time.' },
  { number: '03', icon: 'ri-cpu-line',           color: 'text-teal-400',    bg: 'bg-teal-400/10',    border: 'border-teal-400/20',    title: 'AI Analyzes Motion',  desc: 'VideoMAE Transformer processes video frames with masked autoencoder attention to recognize temporal gesture patterns.' },
  { number: '04', icon: 'ri-sound-module-line',  color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  title: 'Text & Voice Output', desc: 'Predicted gesture is shown as text and optionally spoken aloud using the built-in Web Speech API.' },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(217,70,239,0.04)' }} />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From gesture to <span className="gradient-text">voice</span> in seconds
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Four simple steps power the entire recognition pipeline.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-fuchsia-400/20 to-transparent" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-full ${step.bg} border ${step.border} flex items-center justify-center ${step.color} text-2xl relative z-10`}>
                  <i className={step.icon} />
                </div>
                <span className="absolute -top-1 -right-1 text-[9px] font-bold text-slate-600 bg-[#0d001a] border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center">
                  {step.number.slice(1)}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-2">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[180px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
