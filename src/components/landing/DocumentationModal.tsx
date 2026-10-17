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
  const [activeTab, setActiveTab] = useState<'endpoints' | 'python' | 'solvers'>('endpoints');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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
                LOCENTRA BACKEND API &amp; SIMULATION DOCUMENTATION
              </h3>
              <p className="text-xs text-[#52525B]">
                FastAPI Numerical Positioning Engine Reference (v0.1.0)
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
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'endpoints' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#52525B]" />
            <span>FastAPI Endpoints</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'python' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Python Client &amp; Local Setup</span>
          </button>
          <button
            onClick={() => setActiveTab('solvers')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'solvers' 
                ? 'border-[#232124] text-[#171717] bg-[#F8F9FA]/50 rounded-t-lg' 
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#52525B]" />
            <span>Numerical Solvers</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-[#232124] bg-[#FAFAFA]">
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                The Locentra backend is a RESTful FastAPI service executing SciPy non-linear optimization and Kalman tracking:
              </p>
              
              <div className="space-y-3">
                {/* Endpoint 1: Health */}
                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">GET</span>
                      <span className="font-bold text-[#171717]">/health</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">Health &amp; Engine Status</span>
                  </div>
                  <p className="text-[11px] font-sans text-[#52525B]">
                    Returns service status, version (<code className="bg-slate-100 px-1 py-0.5 rounded">0.1.0</code>), and backend engine identity.
                  </p>
                </div>

                {/* Endpoint 2: Default Config */}
                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">GET</span>
                      <span className="font-bold text-[#171717]">/api/v1/config/default</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">Canonical Testbed Geometry</span>
                  </div>
                  <p className="text-[11px] font-sans text-[#52525B]">
                    Returns canonical 12m × 8m room geometry, 6 default ceiling anchors, and standard simulation parameters.
                  </p>
                </div>

                {/* Endpoint 3: Run Simulation */}
                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">POST</span>
                      <span className="font-bold text-[#171717]">/api/v1/simulations/run</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">Single Solver Run</span>
                  </div>
                  <p className="text-[11px] font-sans text-[#52525B]">
                    Simulates corrupted distance observations and estimates positions using <code className="bg-slate-100 px-1 py-0.5 rounded">robust_nls</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">nls</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">robust_nls_kalman</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded">nls_kalman</code>.
                  </p>
                </div>

                {/* Endpoint 4: Compare Solvers */}
                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">POST</span>
                      <span className="font-bold text-[#171717]">/api/v1/simulations/compare</span>
                    </div>
                    <span className="text-[11px] text-[#71717A]">Multi-Solver Benchmark</span>
                  </div>
                  <p className="text-[11px] font-sans text-[#52525B]">
                    Runs Ordinary NLS, Robust NLS, and Kalman tracking side-by-side on identical synthetic range observations to compare RMSE, P95 error, and valid-estimate rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                To run the numerical positioning backend locally or interact via Python:
              </p>
              
              {/* Local Backend Command */}
              <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between shadow-xs">
                <span className="text-[#171717] font-bold">cd backend && uvicorn main:app --reload --port 8000</span>
                <button
                  onClick={() => copyCode('cd backend && uvicorn main:app --reload --port 8000', 'run-backend')}
                  className="p-1.5 rounded-md hover:bg-[#F8F9FA] text-[#71717A] hover:text-[#171717] transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copied === 'run-backend' ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#A1A1AA]">
                  <span className="font-sans font-medium">Python API Request Example (requests)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#D9F56F]">simulate.py</span>
                </div>
                <pre className="text-[#E4E4E7] overflow-x-auto leading-relaxed pt-1 font-mono text-[11.5px]">
{`import requests

# Execute positioning simulation on local FastAPI engine
response = requests.post(
    "http://127.0.0.1:8000/api/v1/simulations/run",
    json={
        "solver": "robust_nls_kalman",
        "trajectory_type": "closed_loop",
        "num_points": 80,
        "noise_std_dev": 0.15,
        "dropout_rate": 0.05,
        "nlos_rate": 0.10,
        "nlos_bias_mean": 0.50,
        "seed": 42
    }
)

data = response.json()
metrics = data["metrics"]
print(f"Algorithm: {data['algorithm_name']}")
print(f"RMSE: {metrics['rmse_m']:.3f} m")
print(f"P95 Error: {metrics['p95_error_m']:.3f} m")
print(f"Valid Rate: {metrics['valid_estimate_rate'] * 100:.1f}%")`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'solvers' && (
            <div className="space-y-4">
              <p className="text-[#52525B] font-sans text-xs">
                Mathematical formulation of the 4 numerical methods implemented in the backend:
              </p>
              <div className="space-y-3 font-sans">
                <div className="p-4 rounded-xl bg-white border border-[#D9F56F] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717] text-sm">1. Robust Huber NLS (solve_robust_nls)</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F8FDE8] text-[#232124] text-[10px] font-bold border border-[#D9F56F]">
                      Primary Outlier Damping
                    </span>
                  </div>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    Uses Huber piecewise loss in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">scipy.optimize.least_squares</code>. For small residuals (|r| ≤ δ), loss is quadratic; for large residuals, it scales linearly, preventing severe multipath bounces from destabilizing the coordinate solve.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs">
                  <span className="font-bold text-[#171717] text-sm">2. Ordinary Non-Linear Least Squares (solve_nls)</span>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    Standard unweighted least-squares optimization using the Levenberg-Marquardt or trust-region algorithm. Minimizes the sum of squared range residuals Σ (||p - a_i|| - d_i)². Accurate under Gaussian line-of-sight noise, but sensitive to obstacle outliers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs">
                  <span className="font-bold text-[#171717] text-sm">3. Kinematic Kalman Filtering (KalmanTracker)</span>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    A constant-velocity linear Kalman filter that tracks 2D state [x, y, vx, vy]. Propagates motion state across missing observations when anchor dropouts leave fewer than 3 active range measurements.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs">
                  <span className="font-bold text-[#171717] text-sm">4. Known Research Limitation: Sparse Collinear Geometry</span>
                  <p className="text-[#52525B] text-xs mt-1.5 leading-relaxed">
                    In degenerate arrangements (such as anchors placed along a single line or narrow corridor with sparse coverage), robust estimators can occasionally downweight critical geometric constraints, leading to higher error than OLS. Locentra openly evaluates this failure case in its benchmark suite.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAEAEA] bg-white flex items-center justify-between">
          <span className="text-[11px] text-[#71717A] font-mono">
            FastAPI Backend Specification · Python 3.11+ · SciPy Solvers
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

