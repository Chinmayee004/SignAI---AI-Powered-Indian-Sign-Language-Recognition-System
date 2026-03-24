import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'schema' | 'python' | 'curl' | 'notes';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'schema', label: 'JSON Schema',    icon: 'ri-braces-line'      },
  { id: 'python', label: 'Python FastAPI', icon: 'ri-code-s-slash-line' },
  { id: 'curl',   label: 'cURL Example',   icon: 'ri-terminal-box-line' },
  { id: 'notes',  label: 'CORS & Notes',   icon: 'ri-information-line'  },
];

const REQUEST_SCHEMA = `{
  "frame": "<base64-encoded JPEG string>"
}`;

const RESPONSE_SCHEMA = `{
  "gesture":    "Hello",   // string — predicted gesture label
  "confidence": 0.947,     // float  — probability score [0.0–1.0]
  "fps":        29,         // int?   — optional current FPS
  "latency_ms": 42          // int?   — optional inference latency in ms
}`;

const PYTHON_CODE = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64, cv2, numpy as np, torch

app = FastAPI(title="SignAI Gesture API")

# Allow requests from the frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    frame: str  # base64-encoded JPEG

class PredictResponse(BaseModel):
    gesture: str
    confidence: float
    fps: int | None = None
    latency_ms: int | None = None

# Load your trained CNN+LSTM model once at startup
model = torch.load("model.pt", map_location="cpu")
model.eval()
LABELS = ["Hello", "Thank You", "Yes", "No", "Please", ...]

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    import time
    t0 = time.monotonic()

    # Decode base64 → OpenCV frame
    raw = base64.b64decode(req.frame)
    arr = np.frombuffer(raw, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    # Pre-process & run model inference
    tensor = preprocess(frame)            # your preprocessing fn
    with torch.no_grad():
        logits = model(tensor.unsqueeze(0))
    probs = torch.softmax(logits, dim=-1)[0]
    idx   = probs.argmax().item()

    latency = int((time.monotonic() - t0) * 1000)
    return PredictResponse(
        gesture    = LABELS[idx],
        confidence = round(float(probs[idx]), 4),
        latency_ms = latency,
    )`;

const CURL_CODE = `# Single frame prediction
curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{
    "frame": "<YOUR_BASE64_JPEG_HERE>"
  }'

# Expected response
# {
#   "gesture": "Hello",
#   "confidence": 0.947,
#   "latency_ms": 42
# }

# Tip: generate a base64 frame with Python for testing:
# python3 -c "
# import base64
# with open(\\'test_frame.jpg\\', \\'rb\\') as f:
#   print(base64.b64encode(f.read()).decode())
# "`;

const NOTES_CONTENT = [
  {
    title: 'CORS Must Be Enabled',
    icon: 'ri-shield-cross-line',
    color: '#f87171',
    body: 'Your FastAPI server must allow cross-origin requests from the browser. Add CORSMiddleware with allow_origins=["*"] (or your specific frontend URL) to avoid blocked requests.',
  },
  {
    title: 'Base64 Frame Format',
    icon: 'ri-image-2-line',
    color: '#fbbf24',
    body: 'Frames are sent as raw base64 strings (no "data:image/jpeg;base64," prefix). The frontend encodes at 75% JPEG quality, 640×480 resolution. Decode with Python: base64.b64decode(req.frame).',
  },
  {
    title: 'Request Interval',
    icon: 'ri-time-line',
    color: '#34d399',
    body: 'The frontend sends a frame about every 350ms in API mode (roughly 2-3 requests/sec) with non-overlapping calls. A standard synchronous POST endpoint is sufficient.',
  },
  {
    title: 'Confidence Threshold',
    icon: 'ri-percent-line',
    color: '#a78bfa',
    body: 'Return a confidence float in [0.0–1.0]. The UI color-codes scores: ≥90% = fuchsia (high), ≥75% = orange (medium), <75% = red (low). A threshold of 0.6 is recommended before showing output.',
  },
  {
    title: 'Optional Fields',
    icon: 'ri-brackets-line',
    color: '#22d3ee',
    body: 'The fps and latency_ms fields are optional. If omitted, the UI falls back to default display values. Include them if you want the Recognition Panel to reflect real server metrics.',
  },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] text-slate-500 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-[10px] font-medium cursor-pointer transition-all duration-200 px-2 py-1 rounded ${copied ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className="w-3 h-3 flex items-center justify-center">
            <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'} />
          </div>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-300 whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiGuidePanel() {
  const [activeTab, setActiveTab] = useState<TabId>('schema');

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.18)' }}>
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center text-cyan-400">
          <i className="ri-server-line" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-200">FastAPI Backend Integration Guide</p>
          <p className="text-[10px] text-slate-500">Wire your Python inference server to the SignAI frontend in minutes</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          <span className="text-[10px] font-semibold text-cyan-400">POST /predict</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={tab.icon} />
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'schema' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 flex items-center justify-center text-orange-400"><i className="ri-upload-2-line" /></div>
                      <p className="text-xs font-bold text-slate-300">Request Body</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>POST /predict</span>
                    </div>
                    <CodeBlock code={REQUEST_SCHEMA} language="application/json" />
                    <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                      The <code className="text-cyan-400 bg-white/[0.05] px-1 rounded">frame</code> field is a raw base64-encoded JPEG string with <strong className="text-slate-400">no</strong> data URL prefix.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 flex items-center justify-center text-teal-400"><i className="ri-download-2-line" /></div>
                      <p className="text-xs font-bold text-slate-300">Response Body</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>200 OK</span>
                    </div>
                    <CodeBlock code={RESPONSE_SCHEMA} language="application/json" />
                    <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                      <code className="text-cyan-400 bg-white/[0.05] px-1 rounded">fps</code> and <code className="text-cyan-400 bg-white/[0.05] px-1 rounded">latency_ms</code> are optional — include them to populate real metrics in the Recognition Panel.
                    </p>
                  </div>
                </div>
                {/* Field table */}
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {['Field', 'Type', 'Required', 'Description'].map(h => (
                          <th key={h} className="text-left text-[10px] text-slate-500 font-semibold px-4 py-2 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {[
                        { field: 'frame',      type: 'string',  req: true,  desc: 'Base64-encoded JPEG image of the current webcam frame' },
                        { field: 'gesture',    type: 'string',  req: true,  desc: 'Predicted gesture label from your model (e.g. "Hello")' },
                        { field: 'confidence', type: 'float',   req: true,  desc: 'Softmax probability score for the top prediction [0.0–1.0]' },
                        { field: 'fps',        type: 'integer', req: false, desc: 'Current inference throughput in frames per second (optional)' },
                        { field: 'latency_ms', type: 'integer', req: false, desc: 'End-to-end inference latency in milliseconds (optional)' },
                      ].map(row => (
                        <tr key={row.field}>
                          <td className="px-4 py-2.5 font-mono text-cyan-400 font-medium">{row.field}</td>
                          <td className="px-4 py-2.5 text-violet-300 font-mono">{row.type}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${row.req ? 'text-orange-400' : 'text-slate-600'}`}
                              style={{ background: row.req ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.04)' }}>
                              {row.req ? 'Required' : 'Optional'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'python' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>Python 3.10+</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>FastAPI 0.110+</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.1)', color: '#a78bfa', border: '1px solid rgba(168,85,247,0.25)' }}>PyTorch 2.x</span>
                </div>
                <CodeBlock code={PYTHON_CODE} language="python" />
                <div className="rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <div className="w-4 h-4 flex items-center justify-center text-yellow-400 shrink-0 mt-0.5"><i className="ri-terminal-line" /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-1">Install dependencies</p>
                    <code className="text-[11px] font-mono text-yellow-300">pip install fastapi uvicorn python-multipart torch torchvision opencv-python-headless</code>
                    <p className="text-[10px] text-slate-500 mt-1.5">Run the server: <code className="text-cyan-400">uvicorn main:app --reload --host 0.0.0.0 --port 8000</code></p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curl' && (
              <div className="flex flex-col gap-3">
                <CodeBlock code={CURL_CODE} language="bash" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <p className="text-[10px] text-teal-400 font-semibold mb-1">Success Response</p>
                    <p className="text-[10px] font-mono text-slate-400">HTTP 200 OK</p>
                    <p className="text-[10px] font-mono text-slate-500">gesture + confidence required</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)' }}>
                    <p className="text-[10px] text-red-400 font-semibold mb-1">Error Handling</p>
                    <p className="text-[10px] font-mono text-slate-400">HTTP 4xx / 5xx</p>
                    <p className="text-[10px] font-mono text-slate-500">UI falls back to mock data</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="flex flex-col gap-3">
                {NOTES_CONTENT.map(note => (
                  <div
                    key={note.title}
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{ background: `${note.color}08`, border: `1px solid ${note.color}25` }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-sm mt-0.5" style={{ background: `${note.color}15`, color: note.color }}>
                      <i className={note.icon} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 mb-1">{note.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{note.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
