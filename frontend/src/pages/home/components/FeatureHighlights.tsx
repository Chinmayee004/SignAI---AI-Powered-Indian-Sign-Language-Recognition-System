import { motion } from 'framer-motion';

const features = [
  { icon: 'ri-live-line',          title: 'Real-time Processing',   desc: 'Processes 30 frames per second with under 80ms end-to-end latency for seamless live communication.',   tag: '30 FPS',    color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
  { icon: 'ri-brain-line',         title: 'VideoMAE Transformer',   desc: 'Vision Transformer with masked autoencoder pre-training for robust temporal gesture recognition across 100+ ISL signs.',    tag: '74% Acc', color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  { icon: 'ri-speak-line',         title: 'Voice Synthesis',        desc: 'Converts recognized sign language directly into natural speech using browser-native TTS engine.',          tag: 'TTS',       color: 'text-teal-400',    bg: 'bg-teal-400/10' },
  { icon: 'ri-file-text-line',     title: 'Live Transcription',     desc: 'Generates readable text in real-time, building a running transcript of your entire sign session.',         tag: 'Text',      color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  { icon: 'ri-upload-cloud-line',  title: 'File Upload & Test',     desc: 'Upload videos or images to run batch inference — perfect for testing or reviewing gesture accuracy.',      tag: 'Upload',    color: 'text-pink-400',    bg: 'bg-pink-400/10' },
  { icon: 'ri-history-line',       title: 'Session History',        desc: 'Every recognized gesture is logged with timestamp and confidence score for post-session review.',          tag: 'History',   color: 'text-amber-400',   bg: 'bg-amber-400/10' },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function FeatureHighlights() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need for{' '}
            <span className="gradient-text">sign language AI</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            A complete pipeline from gesture capture to voice output, built for research and real-world deployment.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass-card rounded-2xl p-6 group hover:border-fuchsia-400/20 transition-all duration-300"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${f.bg} ${f.color} text-lg`}>
                  <i className={f.icon} />
                </div>
                <span className={`text-[10px] font-semibold ${f.color} bg-white/5 px-2 py-0.5 rounded-full border border-white/10`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
