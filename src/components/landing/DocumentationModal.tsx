import React, { useState } from 'react';
import { X, Copy, CheckCheck, BookOpen, Terminal, Network, Cpu } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'websocket' | 'solver'>('quickstart');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F8FDE8] text-[#171717] border border-[#D9F56F]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717] font-mono tracking-tight">
                LOCENTRA ENGINE SDK & API DOCUMENTATION
              </h3>
              <p className="text-xs text-[#52525B]">
                Integration Reference for High-Performance Indoor RTLS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#71717A] hover:text-[#171717] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#EAEAEA] bg-white font-mono text-xs">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'quickstart' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Python / C++ SDK</span>
          </button>
          <button
            onClick={() => setActiveTab('websocket')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'websocket' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#52525B]" />
            <span>WebSocket Telemetry Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('solver')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'solver' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Solver Architecture & Config</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-[#232124] bg-[#FAFAFA]">
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                Install the high-speed Python bindings with native SciPy/NumPy JIT optimizations:
              </p>
              
              {/* Install Command */}
              <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between shadow-xs">
                <span className="text-[#171717] font-bold">pip install locentra-engine</span>
                <button
                  onClick={() => copyCode('pip install locentra-engine')}
                  className="p-1.5 rounded-md hover:bg-[#F8F9FA] text-[#71717A] hover:text-[#171717] transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#A1A1AA]">
                  <span className="font-sans font-medium">Python Integration Example</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#D9F56F]">main.py</span>
                </div>
                <pre className="text-[#E4E4E7] overflow-x-auto leading-relaxed pt-1 font-mono text-[11.5px]">
{`from locentra import LocentraSolver, RoomEnvironment

# Initialize 14m x 10m warehouse coordinate bounds
env = RoomEnvironment(width=14.0, length=10.0, height=4.0)
env.add_anchors([
    {"id": "A1", "x": -6.0, "y": 3.2, "z": -4.0},
    {"id": "A2", "x": 6.0,  "y": 3.2, "z": -4.0},
    {"id": "A3", "x": 6.0,  "y": 3.2, "z": 4.0},
    {"id": "A4", "x": -6.0, "y": 3.2, "z": 4.0},
])

# Configure Huber robust loss (delta=0.8m) + Kalman kinematics
solver = LocentraSolver(
    loss="huber", 
    f_scale=0.8, 
    enable_ekf=True, 
    max_dop_threshold=6.0
)

# Stream raw UWB time-of-flight ranges in real-time
position = solver.solve_ranges({
    "A1": 5.42, "A2": 8.19, "A3": 9.04, "A4": 4.31
})

print(f"X: {position.x:.2f}m, Y: {position.y:.2f}m, DOP: {position.dop:.2f}")`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'websocket' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                Connect your AMR fleet to the high-frequency 700Hz WebSocket positioning telemetry broadcast:
              </p>
              
              <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between shadow-xs">
                <span className="text-[#171717] font-bold">wss://locentra.app/api/v1/stream/telemetry</span>
                <button
                  onClick={() => copyCode('wss://locentra.app/api/v1/stream/telemetry')}
                  className="p-1.5 rounded-md hover:bg-[#F8F9FA] text-[#71717A] hover:text-[#171717] transition-colors cursor-pointer"
                  title="Copy endpoint"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#A1A1AA]">
                  <span className="font-sans font-medium">JSON Frame Output Contract</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#D9F56F]">telemetry.json</span>
                </div>
                <pre className="text-[#E4E4E7] overflow-x-auto leading-relaxed pt-1 font-mono text-[11.5px]">
{`{
  "timestamp_ns": 1728775200000000,
  "sequence_id": 89402,
  "tag_id": "AMR-ROVER-04",
  "coordinates": { "x": 12.42, "y": 8.19, "z": 1.05 },
  "velocity": { "vx": 0.85, "vy": 0.12, "vz": 0.00 },
  "confidence": {
    "dop": 1.12,
    "rmse_estimate_meters": 0.24,
    "huber_weights": { "A1": 0.98, "A2": 0.95, "A3": 0.12, "A4": 0.99 }
  },
  "flags": {
    "nlos_detected": true,
    "occluded_anchor": "A3",
    "kinematic_bridging": false
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'solver' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                Locentra supports 4 interchangeable positioning engines depending on real-time hardware constraints:
              </p>
              <div className="space-y-3 font-sans">
                <div className="p-4 rounded-xl bg-white border border-[#D9F56F] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717] text-sm">1. Robust Huber NLS</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F8FDE8] text-[#232124] text-[10px] font-bold border border-[#D9F56F]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    Ideal for dense warehouse multipath. Downweights positive distance outliers caused by reflections off metal racks without destabilizing state continuity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs">
                  <span className="font-bold text-[#171717] text-sm">2. Extended Kalman Filter (EKF)</span>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    Provides continuous kinematics for fast AMRs (up to 3 m/s) with 30%+ anchor packet dropouts through 9-state velocity extrapolation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs">
                  <span className="font-bold text-[#171717] text-sm">3. Levenberg-Marquardt Classical NLLS</span>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    Standard non-linear least squares optimization with numerical damping for clean line-of-sight environments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAEAEA] bg-white flex items-center justify-between">
          <span className="text-[11px] text-[#71717A] font-mono">
            Locentra Core Engine API v2.4
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#D9F56F] text-[#171717] font-bold font-mono text-xs hover:bg-[#ceee58] border border-[#ceee58] transition-all cursor-pointer shadow-xs"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
