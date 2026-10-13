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
    title: 'Adaptive Huber Outlier Clamping',
    category: 'Signal Robustness',
    icon: ShieldCheck,
    metric: '100%',
    metricLabel: 'NLOS Outlier Clamping',
    tagline: 'Piecewise L1 robust downweighting stops multipath wall reflections from corrupting coordinates.',
    description: 'Conventional quadratic least-squares estimators explode when signals bounce off concrete or metallic barriers. Locentra dynamically identifies high-residual rays and transitions them to an L1 linear penalty, preserving valuable geometry without dropping anchor packets.',
    technicalDetails: [
      'Piecewise loss function with adaptive Huber threshold δ calculated per-cluster',
      'Zero packet dropping: preserves inlier range data while mitigating multipath delays',
      'Tested against dense reinforced concrete partitions and metallic racking'
    ],
    equation: 'L_δ(r) = (r²)/2 for |r| ≤ δ, else δ(|r| - δ/2)'
  },
  {
    id: 'kinematic-ekf',
    title: 'Kinematic Blackout Bridging',
    category: 'Continuity & Kinematics',
    icon: Activity,
    metric: '30%+',
    metricLabel: 'Anchor Dropout Tolerance',
    tagline: '9-state kinematic covariance propagation preserves smooth trajectories through RF blind spots.',
    description: 'When physical warehouse columns block line-of-sight to anchors, standard positioning engines freeze or return "NaN". Locentra’s 9-state Extended Kalman Filter maintains velocity and acceleration state matrices, bridging blind spans without jitter or cumulative drift.',
    technicalDetails: [
      'Constant-velocity & constant-acceleration state propagation models',
      'Adaptive error covariance matrices auto-expand during measurement outages',
      'Zero trajectory stutter: seamless handoffs between anchor coverage cells'
    ],
    equation: 'x̂_k|k-1 = F_k x̂_k-1|k-1 + B_k u_k'
  },
  {
    id: 'jacobian-dop',
    title: 'Jacobian GDOP & Matrix Health Diagnostics',
    category: 'Mathematical Rigor',
    icon: Grid3X3,
    metric: '< 15',
    metricLabel: 'Singularity Guard Condition κ',
    tagline: 'Continuous condition number monitoring detects collinear anchor geometry before inversion fails.',
    description: 'Narrow corridors frequently force anchors into collinear arrangements, producing singular matrices that crash blind matrix inversions. Locentra continuously evaluates the condition number κ of the Jacobian and dynamically injects ridge regularization when GDOP deteriorates.',
    technicalDetails: [
      'Real-time condition number κ(J) = σ_max / σ_min calculated per solve cycle',
      'Automatic Tikhonov ridge regularization engaged when κ exceeds warning thresholds',
      'Geometric Dilution of Precision (GDOP) confidence ellipsoids output with every coordinate'
    ],
    equation: 'κ(J) = ||J|| · ||J⁺||, J_reg = (J^T J + λI)⁻¹ J^T'
  },
  {
    id: 'zero-leakage',
    title: 'Zero-Leakage Benchmark Pipeline',
    category: 'Empirical Rigor',
    icon: Target,
    metric: '< 0.28m',
    metricLabel: 'Multipath RMSE on Unseen Sites',
    tagline: 'Laser-ground-truth spatial isolation guarantees models generalize to unseen industrial sites.',
    description: 'Too many positioning engines overfit by training and evaluating on the same floor layout. Locentra isolates facilities completely: algorithms calibrated in Hall A are evaluated strictly on Hall B against sub-millimeter Leica laser trackers, proving genuine sub-meter precision in novel geometry.',
    technicalDetails: [
      'Rigorous spatial isolation between training calibration facilities and test spaces',
      'Ground-truth validated with sub-millimeter industrial Leica laser trackers',
      'Verifiable CDF percentile plots: P50 < 0.16m, P95 < 0.42m across complex multipath'
    ],
    equation: 'CDF(e) = P(Error ≤ e), Spatial Split: D_train ∩ D_test = ∅'
  },
  {
    id: 'protocol-agnostic',
    title: 'Universal Protocol Agnosticism',
    category: 'Deployment Architecture',
    icon: Layers,
    metric: '100%',
    metricLabel: 'Hardware Vendor Neutral',
    tagline: 'Drop-in algorithmic intelligence for UWB, ToF, BLE RSSI, and Chirp Spread Spectrum.',
    description: 'Avoid costly vendor lock-in. Locentra’s positioning solver operates at the algorithmic layer, ingesting raw distance and timestamp tuples from any standard beacon or transceiver hardware. Upgrade positioning accuracy without replacing physical infrastructure.',
    technicalDetails: [
      'Supports Decawave / Qorvo DW1000/DW3000 UWB, BLE Channel Sounding, and Semtech CSS',
      'Zero proprietary hardware requirements: run on commercial off-the-shelf anchors',
      'Integrate via high-speed WebSockets, gRPC, REST, or lightweight embedded C++ library'
    ]
  },
  {
    id: 'realtime-throughput',
    title: 'Sub-1.5ms Real-Time Engine',
    category: 'High Performance',
    icon: Zap,
    metric: '714 Hz',
    metricLabel: 'Solver Processing Frequency',
    tagline: 'Microsecond-scale matrix inversion optimized for high-velocity robotic fleets and AMRs.',
    description: 'High-speed autonomous mobile robots (AMRs) navigating at 3+ m/s cannot tolerate 100ms positioning lags. Locentra’s SIMD-vectorized solver delivers up to 714 Hz real-time coordinate updates, providing the instantaneous feedback required for active safety interlocks.',
    technicalDetails: [
      '1.4ms deterministic solve latency under maximum multi-tag concurrency',
      'SIMD vectorization and cache-aligned memory structures for edge CPU execution',
      'Supports simultaneous tracking of 500+ dynamic assets per single edge node'
    ],
    equation: 'Latency_p99 < 1.8ms @ 700+ solves/sec'
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
            <span>ALGORITHMIC SUPERPOWERS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight leading-[1.15]">
            Engineered for Extremes Where Standard Positioning Fails.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            Rather than generic wireless estimations, Locentra is built on deep mathematical resilience: robust loss formulations, continuous kinematic covariance propagation, and strict matrix health guards.
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
