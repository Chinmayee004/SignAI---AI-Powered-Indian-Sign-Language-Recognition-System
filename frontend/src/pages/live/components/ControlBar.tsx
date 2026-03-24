interface ControlBarProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export default function ControlBar({ isActive, onStart, onStop, onClear }: ControlBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {!isActive ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg,#d946ef,#ec4899)', boxShadow: '0 0 24px rgba(217,70,239,0.4)' }}
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-play-circle-fill" /></div>
          Detect (Start Recording)
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-stop-circle-fill" /></div>
          Stop & Detect
        </button>
      )}
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line" /></div>
        Clear
      </button>
    </div>
  );
}
