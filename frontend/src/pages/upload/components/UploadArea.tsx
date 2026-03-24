import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadAreaProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  uploadedFile: File | null;
  previewUrl: string | null;
  onClear: () => void;
}

export default function UploadArea({ onFileSelect, uploadedFile, previewUrl, onClear }: UploadAreaProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
    onFileSelect(file, URL.createObjectURL(file));
  }, [onFileSelect]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (uploadedFile && previewUrl) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-fuchsia-400"><i className="ri-file-check-line" /></div>
            <span className="text-sm font-semibold text-white">Uploaded File</span>
          </div>
          <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-close-line" /> Remove
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-[#0d0020] border border-white/[0.06]" style={{ aspectRatio: '16/9' }}>
          {uploadedFile.type.startsWith('image/')
            ? <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            : <video src={previewUrl} controls className="w-full h-full object-contain" />
          }
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 flex items-center justify-center">
            <i className={uploadedFile.type.startsWith('image/') ? 'ri-image-line' : 'ri-video-line'} />
          </div>
          <span className="truncate">{uploadedFile.name}</span>
          <span className="ml-auto shrink-0">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="glass-card rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-16 px-8 text-center"
      style={{
        borderColor: dragOver ? 'rgba(217,70,239,0.6)' : 'rgba(255,255,255,0.10)',
        background: dragOver ? 'rgba(217,70,239,0.04)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleChange} />
      <AnimatePresence mode="wait">
        {dragOver ? (
          <motion.div key="drag" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-fuchsia-400 text-3xl" style={{ background: 'rgba(217,70,239,0.15)' }}>
              <i className="ri-upload-cloud-2-line" />
            </div>
            <p className="text-fuchsia-400 font-semibold text-sm">Drop to upload</p>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl glass border border-white/10 text-slate-500 text-3xl">
              <i className="ri-upload-cloud-line" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Drag &amp; drop your file here</p>
              <p className="text-slate-500 text-xs">or click to browse — images and videos supported</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {['JPG', 'PNG', 'MP4', 'MOV'].map(ext => (
                <span key={ext} className="text-[10px] font-semibold text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">{ext}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
