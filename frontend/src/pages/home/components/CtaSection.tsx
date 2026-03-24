import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const techs = [
  { icon: 'ri-python-line',     name: 'Python',        color: 'text-yellow-400' },
  { icon: 'ri-fire-line',       name: 'PyTorch',       color: 'text-orange-400' },
  { icon: 'ri-eye-line',        name: 'OpenCV',        color: 'text-green-400'  },
  { icon: 'ri-server-line',     name: 'FastAPI',       color: 'text-teal-400'   },
  { icon: 'ri-cpu-line',        name: 'VideoMAE',      color: 'text-fuchsia-400'},
  { icon: 'ri-speak-line',      name: 'Web Speech',    color: 'text-pink-400'   },
];

export default function CtaSection() {
  return (
    <>
      {/* Tech stack */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label mb-8">
            Built with
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {techs.map((t, i) => (
              <div key={i} className="flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className={`w-4 h-4 flex items-center justify-center ${t.color}`}><i className={t.icon} /></div>
                <span className="text-sm text-slate-300 font-medium">{t.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(217,70,239,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-6">Get started</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start communicating with{' '}
              <span className="gradient-text">AI-powered</span>
              <br />sign language today
            </h2>
            <p className="text-slate-400 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Open your camera, sign naturally, and watch as the system translates your gestures into readable text and natural voice in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/live"
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap glow-primary"
                style={{ background: 'linear-gradient(135deg,#d946ef,#ec4899)' }}
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-camera-line" /></div>
                Open Live Recognition
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold glass border border-white/10 text-white hover:border-fuchsia-400/30 hover:text-fuchsia-300 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-line" /></div>
                Upload a Test File
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="https://public.readdy.ai/ai/img_res/4b4939bd-4d5f-4300-8443-da446ea38097.png" alt="SignAI" className="w-6 h-6 object-contain" />
            <span className="text-sm font-bold text-white">Sign<span className="text-fuchsia-400">AI</span></span>
          </div>
          <p className="text-xs text-slate-700">Real-Time Sign Language Recognition · VideoMAE Transformer · Voice Output</p>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            {[['/', 'Home'], ['/live', 'Live'], ['/upload', 'Upload'], ['/history', 'History'], ['/insights', 'Insights']].map(([path, label]) => (
              <Link key={path} to={path} className="hover:text-slate-400 transition-colors cursor-pointer">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
