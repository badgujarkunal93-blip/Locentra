import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Grid3X3, 
  Target, 
  Check, 
  Sliders, 
  Code2, 
  Copy, 
  CheckCheck 
} from 'lucide-react';

type TabKey = 'huber' | 'kalman' | 'jacobian' | 'leakage';

interface ArchitectureSectionProps {
  initialTab?: TabKey;
}

export const ArchitectureSection: React.FC<ArchitectureSectionProps> = ({
  initialTab = 'huber',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab 1 state: Huber Delta Threshold
  const [huberDelta, setHuberDelta] = useState<number>(0.8);

  // Tab 2 state: Dropout rate
  const [dropoutRate, setDropoutRate] = useState<number>(35);

  // Tab 3 state: Anchor collinearity slider
  const [collinearity, setCollinearity] = useState<number>(15);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="architecture" className="py-16 lg:py-24 bg-white relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-xs font-mono text-[#232124] font-bold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>ALGORITHMIC PLATFORM DEEP DIVE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            Built for High-Interference Indoor Environments
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#52525B]">
            Compare classical trilateration failures against Locentra's robust Huber solver, kinematic state propagation, and matrix condition monitoring.
          </p>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center p-1.5 rounded-2xl bg-[#F4F5F7] border border-[#EAEAEA]">
            <button
              onClick={() => setActiveTab('huber')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'huber'
                  ? 'bg-[#232124] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#171717]'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#D9F56F]" />
              <span>1. Outlier Suppression (Huber Loss)</span>
            </button>

            <button
              onClick={() => setActiveTab('kalman')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'kalman'
                  ? 'bg-[#232124] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#171717]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#D9F56F]" />
              <span>2. Blackout Survival (Kalman)</span>
            </button>

            <button
              onClick={() => setActiveTab('jacobian')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'jacobian'
                  ? 'bg-[#232124] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#171717]'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-[#D9F56F]" />
              <span>3. Matrix Health (Jacobian DOP)</span>
            </button>

            <button
              onClick={() => setActiveTab('leakage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'leakage'
                  ? 'bg-[#232124] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#171717]'
              }`}
            >
              <Target className="w-4 h-4 text-[#D9F56F]" />
              <span>4. Zero-Leakage Benchmarks</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Panel Content */}
        <div className="bg-[#F8F9FA] rounded-2xl border border-[#EAEAEA] shadow-sm p-6 sm:p-8 lg:p-10">
          
          {/* TAB 1: HUBER LOSS */}
          {activeTab === 'huber' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-mono text-[#171717] font-bold uppercase tracking-wider mb-1.5">
                    Non-Linear Least Squares Outlier Rejection
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                    Huber Loss vs. Classical Ordinary Least Squares
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    When radio signals bounce off concrete walls (multipath NLOS), range measurements contain massive positive bias (+2m to +8m). Classical OLS penalizes outliers quadratically (r²), corrupting the entire position. Locentra applies piecewise Huber penalties, switching to linear growth (|r|) for outlier suppression.
                  </p>
                </div>

                {/* Mathematical Formulation Box */}
                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] font-mono text-xs text-[#171717] space-y-2">
                  <div className="text-[11px] text-[#71717A] uppercase tracking-wider font-bold">
                    Mathematical Formulation:
                  </div>
                  <div className="text-sm font-bold py-1.5 px-3 rounded bg-[#F8FDE8] border border-[#D9F56F] text-[#232124]">
                    ρ(r) = ½ r² &nbsp;for |r| ≤ δ &nbsp;|&nbsp; δ(|r| - ½δ) &nbsp;for |r| &gt; δ
                  </div>
                  <div className="text-[11px] text-[#71717A]">
                    Weighting Function: w(r) = 1.0 (inlier) → δ / |r| (multipath outlier suppressed)
                  </div>
                </div>

                {/* Delta Slider */}
                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#171717] flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      Huber Threshold (δ scale):
                    </span>
                    <span className="text-[#171717] font-bold bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#EAEAEA]">{huberDelta}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={huberDelta}
                    onChange={(e) => setHuberDelta(parseFloat(e.target.value))}
                    className="w-full accent-[#232124] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                    <span>Tight Filter (0.2m)</span>
                    <span>Industrial Default (0.8m)</span>
                    <span>Permissive (2.0m)</span>
                  </div>
                </div>

                {/* Code Snippet */}
                <div className="relative rounded-xl bg-[#232124] text-white border border-[#232124] overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#171717] border-b border-white/10 text-[11px] text-slate-300">
                    <span className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[#D9F56F]" />
                      locentra_huber_solver.py
                    </span>
                    <button
                      onClick={() => copyToClipboard(`def huber_cost(residuals, delta=${huberDelta}):
    abs_r = np.abs(residuals)
    linear_mask = abs_r > delta
    costs = 0.5 * (residuals ** 2)
    costs[linear_mask] = delta * (abs_r[linear_mask] - 0.5 * delta)
    return np.sum(costs)`)}
                      className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCode ? <CheckCheck className="w-3.5 h-3.5 text-[#D9F56F]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
{`def huber_cost(residuals, delta=${huberDelta}):
    abs_r = np.abs(residuals)
    linear_mask = abs_r > delta
    costs = 0.5 * (residuals ** 2)
    costs[linear_mask] = delta * (abs_r[linear_mask] - 0.5 * delta)
    return np.sum(costs) # Outlier clamped linearly`}
                  </pre>
                </div>
              </div>

              {/* Right Column: Clean Light Visualizer */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#EAEAEA] relative shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#171717] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Penalty Curve vs Residual Magnitude
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <span className="w-2.5 h-0.5 bg-rose-600" /> OLS (r²)
                    </span>
                    <span className="flex items-center gap-1 text-[#232124] font-semibold">
                      <span className="w-2.5 h-0.5 bg-[#232124]" /> Locentra Huber
                    </span>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 400 240">
                    <line x1="40" y1="20" x2="40" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                    <line x1="40" y1="200" x2="380" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                    <line x1="40" y1="140" x2="380" y2="140" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="40" y1="80" x2="380" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />

                    <text x="30" y="25" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="end">Cost</text>
                    <text x="370" y="215" fill="#64748B" fontSize="10" fontFamily="monospace">Residual (m)</text>

                    {/* Quadratic OLS curve */}
                    <path
                      d="M 40 200 Q 150 190, 220 140 T 360 20"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                    />

                    {/* Locentra Huber curve */}
                    <path
                      d={`M 40 200 Q 110 195, ${100 + huberDelta * 50} 175 L 360 ${175 - (360 - (100 + huberDelta * 50)) * 0.35}`}
                      fill="none"
                      stroke="#232124"
                      strokeWidth="3"
                    />

                    <circle cx="280" cy="72" r="5" fill="#EF4444" />
                    <text x="290" y="70" fill="#EF4444" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      OLS Blowup (17.6)
                    </text>

                    <circle cx="280" cy="130" r="5" fill="#232124" />
                    <text x="290" y="134" fill="#232124" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      Locentra Capped (3.2)
                    </text>

                    <line x1="280" y1="20" x2="280" y2="200" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth="1.5" />
                    <text x="280" y="225" fill="#B45309" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      +4.2m Wall Reflection Spike
                    </text>
                  </svg>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#52525B]">Position Divergence with OLS:</span>
                    <span className="text-rose-600 font-bold">+3.84m (Penetrates Wall)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#52525B]">Position Accuracy with Locentra:</span>
                    <span className="text-emerald-700 font-bold">0.24m (Inlier Trajectory Preserved)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KALMAN KINEMATICS */}
          {activeTab === 'kalman' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-mono text-[#171717] font-bold uppercase tracking-wider mb-1.5">
                    Dead-Reckoning & Anchor Outage Resilience
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                    Continuous State Propagation Across Packet Dropouts
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    In industrial corridors with moving machinery, up to 40% of RF ranging packets suffer packet dropouts or antenna occlusions. Without range measurements, single-frame multilateration completely halts. Locentra uses a 9-state Extended Kalman Filter (EKF) with constant-acceleration kinematics to propagate state vectors through blackout periods.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] font-mono text-xs text-[#171717] space-y-2">
                  <div className="text-[11px] text-[#71717A] uppercase tracking-wider font-bold">
                    State Propagation Equation:
                  </div>
                  <div className="text-sm font-bold py-1.5 px-3 rounded bg-[#F8FDE8] border border-[#D9F56F] text-[#232124]">
                    xₖ = F xₖ₋₁ + wₖ₋₁ &nbsp;|&nbsp; Pₖ = F Pₖ₋₁ Fᵀ + Q
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#171717] flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      Simulated Packet Dropout Rate:
                    </span>
                    <span className="font-bold text-[#171717] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#EAEAEA]">{dropoutRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="65"
                    step="5"
                    value={dropoutRate}
                    onChange={(e) => setDropoutRate(parseInt(e.target.value))}
                    className="w-full accent-[#232124] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                    <span>Clean (5%)</span>
                    <span>Industrial Heavy (35%)</span>
                    <span>Severe Blackout (65%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#171717] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Kinematic Blackout Survival Radar
                  </span>
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Kalman Track Active
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full relative flex items-center justify-center bg-[#F8F9FA] rounded-xl overflow-hidden border border-[#EAEAEA]">
                  <div className="absolute w-48 h-48 rounded-full border border-slate-300" />
                  <div className="absolute w-32 h-32 rounded-full border border-slate-300" />
                  <div className="absolute w-16 h-16 rounded-full border border-slate-300" />

                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                    <line x1="30" y1="100" x2="110" y2="100" stroke="#232124" strokeWidth="2.5" />
                    
                    <rect x="110" y="30" width="80" height="140" fill="#FEF3C7" fillOpacity="0.4" stroke="#F59E0B" strokeDasharray="3 3" />
                    <text x="150" y="50" fill="#B45309" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      {dropoutRate}% DROPOUT ZONE
                    </text>

                    <line x1="110" y1="100" x2="190" y2="100" stroke="#10B981" strokeWidth="2.5" strokeDasharray="4 4" />
                    <line x1="190" y1="100" x2="270" y2="100" stroke="#232124" strokeWidth="2.5" />

                    <circle cx="150" cy="100" r="5" fill="#10B981" />
                    <ellipse cx="150" cy="100" rx={8 + dropoutRate * 0.15} ry={5 + dropoutRate * 0.08} fill="#D9F56F" fillOpacity="0.4" stroke="#10B981" strokeDasharray="2 2" />
                  </svg>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-xs font-mono flex items-center justify-between">
                  <span className="text-[#52525B]">Position Continuity across Blind Gaps:</span>
                  <span className="text-emerald-700 font-bold">100% Zero-Frame Drops</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JACOBIAN DOP */}
          {activeTab === 'jacobian' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-mono text-[#171717] font-bold uppercase tracking-wider mb-1.5">
                    Geometric Dilution of Precision
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                    Jacobian Condition Number Monitoring
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    When radio anchors are mounted along a single straight wall or narrow hallway, the measurement Jacobian matrix H becomes ill-conditioned. Inverting (Hᵀ H) leads to numerical explosion. Locentra computes the matrix condition number in real time and automatically regulates geometry weights.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] font-mono text-xs text-[#171717] space-y-2">
                  <div className="text-[11px] text-[#71717A] uppercase tracking-wider font-bold">
                    Condition Number Formulation:
                  </div>
                  <div className="text-sm font-bold py-1.5 px-3 rounded bg-[#F8FDE8] border border-[#D9F56F] text-[#232124]">
                    κ(Hᵀ H) = σ_max / σ_min &nbsp;|&nbsp; GDOP = √( Tr( (Hᵀ H)⁻¹ ) )
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#171717] flex items-center gap-1.5 font-bold">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      Anchor Collinearity Alignment:
                    </span>
                    <span className="font-bold text-[#171717] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#EAEAEA]">{collinearity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={collinearity}
                    onChange={(e) => setCollinearity(parseInt(e.target.value))}
                    className="w-full accent-[#232124] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                    <span>Distributed (0%)</span>
                    <span>Corridor (45%)</span>
                    <span>Collinear Singularity (90%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#171717] flex items-center gap-1.5">
                    <Grid3X3 className="w-4 h-4 text-emerald-600" />
                    Dilution of Precision Ellipse
                  </span>
                  <span className="text-xs font-mono text-[#71717A]">
                    κ: {(1.1 + (collinearity / 10) ** 2 * 0.8).toFixed(2)}
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full relative flex items-center justify-center bg-[#F8F9FA] rounded-xl overflow-hidden border border-[#EAEAEA]">
                  <svg className="w-full h-full" viewBox="0 0 320 220">
                    <line x1="20" y1="110" x2="300" y2="110" stroke="#CBD5E1" strokeWidth="1" />
                    <line x1="160" y1="20" x2="160" y2="200" stroke="#CBD5E1" strokeWidth="1" />

                    <circle cx="50" cy={110 - (1 - collinearity / 100) * 60} r="6" fill="#10B981" />
                    <circle cx="270" cy={110 - (1 - collinearity / 100) * 60} r="6" fill="#10B981" />
                    <circle cx="270" cy={110 + (1 - collinearity / 100) * 60} r="6" fill="#10B981" />
                    <circle cx="50" cy={110 + (1 - collinearity / 100) * 60} r="6" fill="#10B981" />

                    <circle cx="160" cy="110" r="5" fill="#171717" />

                    <ellipse
                      cx="160"
                      cy="110"
                      rx="16"
                      ry={16 + (collinearity / 100) * 65}
                      fill={collinearity > 60 ? '#FEE2E2' : collinearity > 30 ? '#FEF3C7' : '#D9F56F'}
                      fillOpacity="0.6"
                      stroke={collinearity > 60 ? '#EF4444' : collinearity > 30 ? '#F59E0B' : '#10B981'}
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-xs font-mono space-y-1">
                  <div className="flex justify-between text-[#52525B]">
                    <span>Geometry Status:</span>
                    <span className="font-bold text-[#171717]">
                      {collinearity > 60 ? 'Severe Transverse Drift (Singularity)' : 'Optimal Configuration'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ZERO-LEAKAGE BENCHMARKS */}
          {activeTab === 'leakage' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="text-xs font-mono text-[#171717] font-bold uppercase tracking-wider mb-1.5">
                    Evaluation Rigor & Verification
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                    Zero-Leakage Trajectory Benchmarking
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                    Many academic localization models report deceptively high accuracy by training and evaluating on the same spatial hall with leaking anchor coordinates. Locentra enforces strict cross-room isolation: trajectory models are benchmarked across physically distinct halls with zero overlap, verified via sub-millimeter laser total station ground truth.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-[#EAEAEA] flex items-start gap-3">
                    <div className="p-1.5 rounded bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[#171717] font-bold block">1. Spatial Room Isolation</span>
                      <span className="text-[#71717A] text-[11px]">Training parameters in Hall A are never contaminated with Hall B geometries.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#EAEAEA] flex items-start gap-3">
                    <div className="p-1.5 rounded bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[#171717] font-bold block">2. Causal Time-Split Validation</span>
                      <span className="text-[#71717A] text-[11px]">No forward-looking future packet interpolation; strictly online filtering.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#171717] flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Empirical CDF Error Evaluation (P95)
                  </span>
                  <span className="text-[#171717] font-bold text-xs font-mono bg-[#F8FDE8] px-2 py-0.5 rounded border border-[#D9F56F]">
                    Locentra P95: 0.42m
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 380 220">
                    <line x1="40" y1="20" x2="40" y2="190" stroke="#CBD5E1" strokeWidth="1" />
                    <line x1="40" y1="190" x2="360" y2="190" stroke="#CBD5E1" strokeWidth="1" />
                    
                    <text x="35" y="40" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">1.0</text>
                    <text x="35" y="115" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">0.5</text>
                    <text x="35" y="193" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">0.0</text>
                    <text x="350" y="205" fill="#64748B" fontSize="9" fontFamily="monospace">Error (m)</text>

                    {/* Locentra CDF Curve */}
                    <path
                      d="M 40 190 Q 70 170, 90 90 T 130 35 L 360 35"
                      fill="none"
                      stroke="#232124"
                      strokeWidth="3.5"
                    />

                    {/* Academic Baseline */}
                    <path
                      d="M 40 190 Q 110 180, 180 130 T 260 50 L 360 40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />

                    <line x1="40" y1="45" x2="360" y2="45" stroke="#10B981" strokeDasharray="2 2" strokeWidth="1" />
                    <circle cx="120" cy="45" r="4" fill="#232124" />
                    <text x="125" y="60" fill="#171717" fontSize="10" fontFamily="monospace" fontWeight="bold">0.42m</text>
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#F8FDE8] border border-[#D9F56F]">
                    <span className="text-[10px] text-[#71717A] block">Locentra (P95)</span>
                    <span className="font-bold text-[#171717]">0.42 m</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F4F5F7] border border-[#EAEAEA]">
                    <span className="text-[10px] text-[#71717A] block">Baseline (P95)</span>
                    <span className="font-bold text-[#71717A]">2.84 m</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
