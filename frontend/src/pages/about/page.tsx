import { motion } from 'framer-motion';
import Navbar from '../../components/feature/Navbar';

const techStack = [
  { name: 'Python 3.11', desc: 'Core language', icon: 'ri-code-s-slash-line', color: '#fbbf24' },
  { name: 'PyTorch', desc: 'Deep learning framework', icon: 'ri-fire-line', color: '#f97316' },
  { name: 'OpenCV', desc: 'Computer vision', icon: 'ri-camera-lens-line', color: '#34d399' },
  { name: 'FastAPI', desc: 'Backend REST API', icon: 'ri-server-line', color: '#22d3ee' },
  { name: 'MediaPipe', desc: 'Hand landmark detection', icon: 'ri-hand-line', color: '#a78bfa' },
  { name: 'NumPy', desc: 'Numerical computing', icon: 'ri-function-line', color: '#f472b6' },
  { name: 'React 19', desc: 'Frontend UI framework', icon: 'ri-reactjs-line', color: '#38bdf8' },
  { name: 'Web Speech API', desc: 'Text-to-speech output', icon: 'ri-volume-up-line', color: '#fb923c' },
];

const team = [
  {
    name: 'Chinmayee B',
    role: 'Lead ML Engineer',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20asian%20woman%20AI%20researcher%20clean%20studio%20background%20soft%20lighting%20confident%20smile%20modern%20tech%20professional&width=200&height=200&seq=about-team-1&orientation=squarish',
    bio: 'Specializes in temporal CNN-LSTM architectures for gesture sequence modeling.',
    skills: ['PyTorch', 'CNN+LSTM', 'Computer Vision'],
  },
  {
    name: 'Dhanush Patel M',
    role: 'Backend Engineer',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20black%20man%20software%20engineer%20clean%20studio%20background%20soft%20lighting%20confident%20smile%20modern%20tech%20professional&width=200&height=200&seq=about-team-2&orientation=squarish',
    bio: 'Designed the FastAPI real-time inference pipeline and WebSocket streaming layer.',
    skills: ['FastAPI', 'Python', 'WebSockets'],
  },
  {
    name: 'Meghana G K',
    role: 'Frontend Developer',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20indian%20woman%20frontend%20developer%20clean%20studio%20background%20soft%20lighting%20confident%20smile%20modern%20tech%20professional&width=200&height=200&seq=about-team-3&orientation=squarish',
    bio: 'Built the SaaS interface with real-time webcam integration and voice output.',
    skills: ['React', 'TypeScript', 'Web APIs'],
  },
  {
    name: 'Suman Kumar Matho',
    role: 'Data & Research',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20korean%20man%20data%20scientist%20clean%20studio%20background%20soft%20lighting%20confident%20smile%20modern%20tech%20professional&width=200&height=200&seq=about-team-4&orientation=squarish',
    bio: 'Curated the ASL dataset, designed augmentation strategies, and ran model benchmarks.',
    skills: ['Dataset Curation', 'Benchmarking', 'OpenCV'],
  },
];

const timeline = [
  { step: '01', title: 'Video Sequence Input', desc: 'Webcam captures 16-frame sequences at 30 FPS for temporal modeling', color: '#f472b6' },
  { step: '02', title: 'Frame Preprocessing', desc: 'Frames resized to 224×224 and normalized with ImageNet statistics', color: '#fb923c' },
  { step: '03', title: 'VideoMAE Encoding', desc: 'Vision Transformer processes patches with masked autoencoder pre-training', color: '#fbbf24' },
  { step: '04', title: 'Temporal Feature Fusion', desc: 'Transformer self-attention aggregates temporal dependencies across 16 frames', color: '#34d399' },
  { step: '05', title: 'Gesture Classification', desc: 'Classification head outputs probabilities over 100+ ISL gesture classes', color: '#22d3ee' },
  { step: '06', title: 'Voice + Text Output', desc: 'Predicted sentence rendered as text and spoken via the Web Speech API', color: '#a78bfa' },
];

const metrics = [
  { label: 'Test Accuracy', value: '74%', sub: 'VideoMAE on ISL validation set', color: '#34d399' },
  { label: 'Inference Latency', value: '<80ms', sub: 'End-to-end on CPU', color: '#22d3ee' },
  { label: 'Gesture Classes', value: '100+', sub: 'Full ISL sentence vocabulary', color: '#a78bfa' },
  { label: 'Training Frames', value: '12.5K', sub: 'VideoMAE fine-tuned sequences', color: '#fb923c' },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />

      <div className="pt-16">
        {/* Hero Banner */}
        <section className="relative px-6 pt-16 pb-14 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(168,85,247,0.12) 0%,transparent 70%)' }} />
          <div className="max-w-screen-xl mx-auto text-center">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-widest uppercase" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a78bfa' }}>
              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-information-line" /></div>
              About This Project
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5"
            >
              <span style={{ background: 'linear-gradient(135deg,#f472b6,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Breaking the Silence
              </span>
              <br />
              <span className="text-white text-3xl sm:text-4xl font-bold">with AI Sign Language Recognition</span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed"
            >
              A real-time, AI-powered system that translates American Sign Language (ASL) gestures into both text and natural speech — bridging communication barriers with deep learning.
            </motion.p>
          </div>
        </section>

        {/* Metrics strip */}
        <section className="px-6 pb-10">
          <div className="max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-3xl font-extrabold mb-1" style={{ color: m.color }}>{m.value}</p>
                <p className="text-sm font-semibold text-slate-300">{m.label}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Project Overview */}
        <section className="px-6 py-10 border-t border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div {...fadeUp}>
              <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase block mb-3">Project Overview</span>
              <h2 className="text-2xl font-bold text-white mb-4">What is SignAI?</h2>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>
                  SignAI is an open-source research project that uses the <strong className="text-violet-300">VideoMAE</strong> (Vision Transformer with Masked Autoencoder) architecture to recognize dynamic hand gestures from live webcam video sequences and translate them into readable text and natural voice output.
                </p>
                <p>
                  The system was fine-tuned on 12,500 annotated video frames covering 100+ Indian Sign Language (ISL) sentence-level gestures. The model achieves <strong className="text-violet-300">74% accuracy</strong> on the validation test set, with robust performance across complex multi-hand sequences.
                </p>
                <p>
                  The frontend communicates with a <strong className="text-violet-300">FastAPI</strong> backend over REST, sending frames captured from the webcam and receiving gesture predictions in under 80ms — enabling real-time, latency-sensitive interaction.
                </p>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
                <img
                  src="https://readdy.ai/api/search-image?query=abstract%20AI%20neural%20network%20visualization%20deep%20learning%20glowing%20purple%20teal%20nodes%20connections%20dark%20background%20high%20tech%20research%20illustration%20beautiful%20artistic&width=680&height=400&seq=about-overview-1&orientation=landscape"
                  alt="SignAI Neural Network Visualization"
                  className="w-full h-56 object-cover object-top"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CNN+LSTM Methodology */}
        <section className="px-6 py-12 border-t border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase block mb-3">Methodology</span>
              <h2 className="text-2xl font-bold text-white">VideoMAE Transformer Architecture</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">A vision transformer with masked autoencoder pre-training that captures both spatial hand features and temporal gesture dynamics</p>
            </motion.div>

            {/* Architecture diagram as cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.step}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="relative rounded-2xl p-5"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold" style={{ background: `${item.color}18`, color: item.color }}>
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 mb-1">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-700 z-10">
                      <i className="ri-arrow-right-s-line text-xl" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Architecture detail boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div {...fadeUp} className="rounded-2xl p-6" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center text-yellow-400"><i className="ri-eye-line" /></div>
                  <h3 className="text-sm font-bold text-slate-200">Patch Embedding & Pre-training</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  {['Video frames split into 16×16 patches', 'Each patch projected to 768-dim embeddings', '75% patches randomly masked during pre-training', 'Reconstruction objective learns robust features', 'Fine-tuned on ISL gesture classification task'].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 w-3 h-3 flex items-center justify-center text-yellow-500 shrink-0"><i className="ri-arrow-right-s-line" /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl p-6" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center text-emerald-400"><i className="ri-time-line" /></div>
                  <h3 className="text-sm font-bold text-slate-200">Temporal Modeling — VideoMAE</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  {['Vision Transformer with 12 attention layers', 'Input: 16-frame sequences of 224×224 patches', 'Masked Autoencoder pre-training strategy', 'Classification head → softmax over 100+ classes', 'Bidirectional temporal attention over sequences'].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 w-3 h-3 flex items-center justify-center text-emerald-400 shrink-0"><i className="ri-arrow-right-s-line" /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="px-6 py-12 border-t border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <span className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase block mb-3">Tech Stack</span>
              <h2 className="text-2xl font-bold text-white">Built With</h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl px-4 py-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 text-lg" style={{ background: `${tech.color}18`, color: tech.color }}>
                    <i className={tech.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{tech.name}</p>
                    <p className="text-[11px] text-slate-600">{tech.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        {/* <section className="px-6 py-12 border-t border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <span className="text-[10px] text-pink-400 font-semibold tracking-widest uppercase block mb-3">The Team</span>
              <h2 className="text-2xl font-bold text-white">Meet the Builders</h2>
              <p className="text-sm text-slate-500 mt-2">A multidisciplinary team bridging ML research and accessible technology</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl p-5 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-sm font-bold text-white mb-0.5">{member.name}</p>
                  <p className="text-[11px] font-semibold mb-2" style={{ color: '#a78bfa' }}>{member.role}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{member.bio}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {member.skills.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', color: '#c4b5fd', border: '1px solid rgba(168,85,247,0.2)' }}>{s}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Footer note */}
        <section className="px-6 py-8 border-t border-white/[0.05]">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">SignAI — Major Project · MIT License</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1.5">
                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-github-line" /></div>
                GitHub
              </a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1.5">
                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-file-text-line" /></div>
                Research Paper
              </a>
              <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1.5">
                <div className="w-3 h-3 flex items-center justify-center"><i className="ri-article-line" /></div>
                Documentation
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
