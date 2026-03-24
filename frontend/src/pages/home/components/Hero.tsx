import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const chips = [
  { icon: 'ri-pulse-line',   label: 'Real-time Detection' },
  { icon: 'ri-brain-line',   label: 'AI-Powered VideoMAE' },
  { icon: 'ri-speak-line',   label: 'Voice + Text Output' },
];

export default function Hero() {
  return (
    <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <div className="absolute inset-0 dot-grid opacity-60" />
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(249,115,22,0.09)' }} />
      <div className="absolute top-1/3 right-1/6 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(168,85,247,0.09)' }} />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(236,72,153,0.07)' }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border mb-8"
          style={{ borderColor: 'rgba(217,70,239,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 pulse-dot inline-block" />
          <span className="text-xs font-semibold text-fuchsia-300 tracking-wide">Deep Learning · VideoMAE · Real-time AI</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6"
        >
          Real-Time{' '}
          <span className="gradient-text">Sign Language</span>
          <br className="hidden md:block" />
          {' '}Recognition System
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Advanced deep learning model that interprets hand gestures in real-time,
          converting sign language into both readable text and natural voice output —
          making communication seamless and inclusive.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link
            to="/live"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap glow-primary"
            style={{ background: 'linear-gradient(135deg,#d946ef,#ec4899)' }}
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-camera-line" /></div>
            Start Recognition
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold glass border border-white/10 text-white hover:border-fuchsia-400/30 hover:text-fuchsia-300 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-line" /></div>
            Upload & Test
          </Link>
        </motion.div>

        {/* Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          {chips.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-4 h-4 flex items-center justify-center text-fuchsia-400">
                <i className={c.icon} />
              </div>
              <span>{c.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Preview card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className="relative z-10 mt-16 w-full max-w-3xl mx-auto"
      >
        <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(217,70,239,0.15)' }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800" />
              <span className="w-3 h-3 rounded-full bg-slate-800" />
              <span className="w-3 h-3 rounded-full bg-slate-800" />
            </div>
            <span className="ml-2 text-xs text-slate-500 font-mono">signai — live session</span>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-fuchsia-400">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 pulse-dot inline-block" />
              Live Processing
            </div>
          </div>
          <div className="relative">
            <img
              src="https://readdy.ai/api/search-image?query=human%20hands%20making%20american%20sign%20language%20gesture%20close%20up%20vibrant%20colorful%20studio%20lighting%20pink%20orange%20purple%20gradient%20bokeh%20background%20photorealistic%20cinematic%20quality%20professional%20photography&width=900&height=380&seq=vibrant_hero_1&orientation=landscape"
              alt="Sign language recognition demo"
              className="w-full h-48 object-cover object-top opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08000f]/70 via-transparent to-[#08000f]/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#08000f]/80" />
            <div className="absolute bottom-4 left-5 flex items-end gap-5">
              <div>
                <p className="text-xs text-slate-400 mb-1">Detected Gesture</p>
                <p className="text-3xl font-bold gradient-text">Hello</p>
              </div>
              <div className="mb-1">
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="text-xl font-semibold text-orange-400">97.4%</p>
              </div>
              <div className="mb-1 ml-4">
                <p className="text-xs text-slate-400 mb-1">Voice</p>
                <div className="flex items-center gap-1 text-fuchsia-400 text-sm font-medium">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-volume-up-line" /></div>
                  Speaking
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#08000f] to-transparent pointer-events-none" />
    </section>
  );
}
