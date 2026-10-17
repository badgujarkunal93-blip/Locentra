import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Grid3X3, 
  Target, 
  Layers, 
  Zap, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export interface UniquenessFeature {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  metric: string;
  metricLabel: string;
  tagline: string;
  description: string;
  technicalDetails: string[];
  equation?: string;
}

export const UNIQUENESS_FEATURES: UniquenessFeature[] = [
  {
    id: 'huber-nlos',
    title: 'Adaptive Huber Outlier Loss',
    category: 'Signal Robustness',
    icon: ShieldCheck,
    metric: 'Adaptive',
    metricLabel: 'Residual Downweighting',
    tagline: 'Piecewise M-estimation reduces the distorting influence of obstacle-delayed distance measurements.',
    description: 'Conventional quadratic least-squares estimators square large residuals, causing estimates to jump when signals bounce off walls. Locentra applies an adaptive Huber loss function that transitions from quadratic penalty for small residuals to linear penalty for large residuals. This dampens the influence of obstacle-delayed signals without dropping valid geometric data.',
    technicalDetails: [
      'Piecewise loss function with adaptive Huber threshold δ calculated per-residual',
      'Continuous downweighting: preserves inlier range geometry while attenuating multipath spikes',
      'Realistic assessment: reduces error under NLOS bias without claiming 100% outlier elimination'
    ],
    equation: 'L_δ(r) = (r²)/2 for |r| ≤ δ, else δ(|r| - δ/2)'
  },
  {
    id: 'kinematic-ekf',
    title: 'Kinematic Kalman Motion Tracking',
    category: 'Continuity & Kinematics',
    icon: Activity,
    metric: 'Constant-V',
    metricLabel: 'State Covariance Model',
    tagline: 'State prediction bridges timesteps when anchor signals drop out or become unavailable.',
    description: 'When obstacles block line-of-sight and reduce available measurements below the minimum required for a trilateration fix, a kinematic constant-velocity Kalman filter propagates state and error covariance to provide continuous, smooth trajectory estimates across dropouts.',
    technicalDetails: [
      'Constant-velocity state propagation model with recursive Kalman measurement updates',
      'Predictive state projection maintains trajectory continuity across signal dropouts',
      'Error covariance Q and measurement noise R tuned to simulation channel parameters'
    ],
    equation: 'x̂_k|k-1 = F_k x̂_k-1|k-1, P_k|k-1 = F_k P_k-1|k-1 F_k^T + Q_k'
  },
  {
    id: 'jacobian-dop',
    title: 'Jacobian Matrix Health & GDOP Analysis',
    category: 'Mathematical Rigor',
    icon: Grid3X3,
    metric: 'κ(J)',
    metricLabel: 'Condition Number Check',
    tagline: 'Continuous condition number monitoring detects collinear anchor geometry before inversion fails.',
    description: 'Narrow corridors frequently force anchors into collinear arrangements, producing singular matrices that crash blind matrix inversions. Locentra continuously evaluates the condition number κ of the Jacobian and investigates solver degradation in ill-conditioned geometries.',
    technicalDetails: [
      'Jacobian condition number κ(J) = σ_max / σ_min evaluated per solve cycle',
      'Identifies near-collinear and sparse anchor layouts that degrade solver accuracy',
      'Geometric Dilution of Precision (GDOP) diagnostics computed alongside coordinate fixes'
    ],
    equation: 'κ(J) = ||J|| · ||J⁺||, GDOP = sqrt(trace((H^T H)⁻¹))'
  },
  {
    id: 'zero-leakage',
    title: 'Controlled Synthetic Benchmark Testbed',
    category: 'Empirical Rigor',
    icon: Target,
    metric: 'Parametric',
    metricLabel: 'Reproducible Testbed',
    tagline: 'Controlled random seeds and parametric scenarios evaluate algorithms under identical conditions.',
    description: 'Locentra tests solvers under controlled, reproducible conditions. Every synthetic scenario documents exact room boundaries, anchor coordinates, noise standard deviation, dropout probability, and random seeds to ensure benchmark transparency.',
    technicalDetails: [
      'Documented random seeds and deterministic trajectory generators for reproducibility',
      'Multi-algorithm comparison on identical synthetic observations (NLS vs Huber vs Kalman)',
      'Empirical error metrics: RMSE, mean error, median error, P95 error, and valid-estimate rate'
    ],
    equation: 'RMSE = sqrt(1/N Σ ||p_est - p_true||²), Seed = S'
  },
  {
    id: 'protocol-agnostic',
    title: 'Modular Range Tuple Architecture',
    category: 'System Architecture',
    icon: Layers,
    metric: 'Modular',
    metricLabel: 'Algorithmic Layer',
    tagline: 'Operates on standard distance-timestamp tuples, decoupling solver math from physical sensors.',
    description: 'Locentra’s positioning solvers operate at the algorithmic layer, ingesting (anchor_id, measured_range, timestamp) tuples. This modular structure allows identical numerical solvers to be tested on synthetic simulation data today and real physical hardware in future research phases.',
    technicalDetails: [
      'Standardized range measurement interface compatible with UWB, BLE, or ultrasound models',
      'Clean separation between synthetic measurement generation and numerical positioning engine',
      'Extensible schema ready for physical sensor stream integration in future releases'
    ]
  },
  {
    id: 'realtime-throughput',
    title: 'Python Numerical Optimization Engine',
    category: 'Computation Engine',
    icon: Zap,
    metric: 'FastAPI',
    metricLabel: 'Python / SciPy Backend',
    tagline: 'NumPy-vectorized non-linear least squares solvers designed for rapid research iteration.',
    description: 'Built with Python 3.11+, FastAPI, and SciPy optimization libraries. Solvers compute position fixes in milliseconds per epoch, enabling researchers to run extensive Monte Carlo parameter sweeps and test positioning resilience under hundreds of failure scenarios.',
    technicalDetails: [
      'SciPy least-squares optimization using Levenberg-Marquardt and trust-region reflective methods',
      'Fast REST API endpoints (/api/v1/simulations/run and /api/v1/simulations/compare)',
      'Batch evaluation and CDF generation across multi-point target trajectories'
    ],
    equation: 'p* = argmin_p Σ ρ( ||p - a_i|| - d_i )'
  }
];

export const UniquenessSection: React.FC<{ onLaunchEngine?: () => void }> = ({ onLaunchEngine }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(UNIQUENESS_FEATURES[0].id);

  const activeFeature = UNIQUENESS_FEATURES.find(f => f.id === selectedFeature) || UNIQUENESS_FEATURES[0];

  return (
    <section id="uniqueness" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Editorial Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-[11px] font-mono text-[#232124] font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALGORITHMIC PLATFORM ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight leading-[1.15]">
            Engineered for Extremes Where Standard Positioning Fails.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            Rather than black-box approximations, Locentra investigates transparent mathematical methods: robust Huber loss formulations, kinematic state propagation, and matrix health diagnostics under controlled degradation.
          </p>
        </div>

        {/* Feature Grid: 6 Distinct Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIQUENESS_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isSelected = feature.id === selectedFeature;

            return (
              <div
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`group rounded-2xl p-6 sm:p-7 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#F8FDE8]/40 border-[#D9F56F] shadow-sm ring-1 ring-[#D9F56F]' 
                    : 'bg-[#F8F9FA] hover:bg-white border-[#EAEAEA] hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Metric Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border transition-colors ${
                      isSelected 
                        ? 'bg-[#D9F56F] text-[#232124] border-[#D9F56F]' 
                        : 'bg-white text-[#232124] border-[#EAEAEA] group-hover:bg-[#F8FDE8]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold font-mono text-[#171717]">
                        {feature.metric}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-[#71717A]">
                        {feature.metricLabel}
                      </div>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    {feature.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-2 group-hover:text-black">
                    {feature.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed mb-4">
                    {feature.tagline}
                  </p>
                </div>

                {/* Technical Points List */}
                <div className="pt-4 border-t border-[#EAEAEA]/80 space-y-2">
                  {feature.technicalDetails.slice(0, 2).map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#3F3F46]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom link */}
                <div className="mt-5 pt-3 flex items-center justify-between text-xs font-mono font-bold text-[#171717] group-hover:text-emerald-700">
                  <span>Explore details</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Deep-Dive Interactive Drawer / Banner */}
        <div className="mt-12 rounded-2xl bg-white border border-[#EAEAEA] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] text-[11px] font-mono font-bold">
                  {activeFeature.category}
                </span>
                <span className="text-xs font-mono text-[#71717A]">
                  Active Algorithmic Specification
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
                {activeFeature.title}
              </h4>

              <p className="text-sm text-[#52525B] leading-relaxed">
                {activeFeature.description}
              </p>

              {activeFeature.equation && (
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] font-mono text-xs text-[#171717] overflow-x-auto">
                  <span className="text-[10px] text-[#71717A] uppercase block mb-1">Mathematical Formulation:</span>
                  <code className="font-bold text-[#171717]">{activeFeature.equation}</code>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end space-y-3">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] w-full text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#171717]">
                  {activeFeature.metric}
                </div>
                <div className="text-xs font-mono text-[#71717A] mt-0.5">
                  {activeFeature.metricLabel}
                </div>
              </div>

              <button
                onClick={onLaunchEngine || (() => window.open('https://locentra.app', '_blank'))}
                className="btn-lime w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Test in Live Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Clean Human-Designed Bottom Callout Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-[#F8FDE8] border border-[#D9F56F] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-lg sm:text-xl font-bold text-[#232124]">
              Ready to benchmark Locentra with your physical facility logs?
            </h4>
            <p className="text-xs sm:text-sm text-[#3F3F46]">
              Drop in our solver pipeline with zero hardware replacement. Ingest raw ToF/UWB ranges directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLaunchEngine || (() => window.open('https://locentra.app', '_blank'))}
              className="px-6 py-3 rounded-xl bg-[#232124] hover:bg-black text-white text-xs sm:text-sm font-bold font-mono transition-colors cursor-pointer shadow-xs"
            >
              Launch Engine Dashboard →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default UniquenessSection;
