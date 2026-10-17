import React, { useState } from 'react';
import { 
  Compass, 
  WifiOff, 
  ArrowRight, 
  ShieldAlert, 
  Radio, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface StepData {
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  visualDetails: {
    label: string;
    value: string;
  }[];
  callout: string;
}

const STEPS: StepData[] = [
  {
    number: '01',
    title: 'Configure a Virtual Room',
    subtitle: 'Geometric Setup & Trajectory',
    tagline: 'Place reference anchors and define the ground-truth path of a moving object.',
    description: 'Define the testbed boundaries (e.g. 12m × 8m room), position fixed anchors at surveyed coordinates around the space, and select a deterministic ground-truth trajectory (figure-8 loop, warehouse grid, or linear transit).',
    visualDetails: [
      { label: 'Room Dimensions', value: '12.0m × 8.0m (2.8m ceiling)' },
      { label: 'Anchor Constellation', value: '6 fixed coordinates (A1–A6)' },
      { label: 'Target Trajectory', value: 'Kinematic continuous path' },
      { label: 'Coordinate Frame', value: 'Cartesian (x, y) with z fixed' }
    ],
    callout: 'Known ground-truth positions serve as the absolute reference for all accuracy benchmarks.'
  },
  {
    number: '02',
    title: 'Simulate Signal Problems',
    subtitle: 'Controlled RF Degradation',
    tagline: 'Introduce distance measurement noise, packet dropouts, and obstacle wall bias.',
    description: 'Indoor signals bounce off steel beams (multipath), penetrate drywall with velocity delays (positive NLOS bias), and drop packets due to RF fading. Locentra lets you inject parametric noise to stress-test positioning mathematics before real hardware deployment.',
    visualDetails: [
      { label: 'Gaussian Noise (σ)', value: '0.05m to 0.80m standard dev' },
      { label: 'Dropout Rate (p)', value: '0% to 30% packet loss' },
      { label: 'NLOS Bias Delay', value: '+0.5m to +2.5m positive shift' },
      { label: 'Outlier Probability', value: 'Simulated reflection anomalies' }
    ],
    callout: 'Controlled random seeds ensure every stress test is deterministic and fully reproducible.'
  },
  {
    number: '03',
    title: 'Run Positioning Algorithms',
    subtitle: 'Numerical Solvers & Motion Filtering',
    tagline: 'Calculate estimated coordinates using standard and robust numerical methods.',
    description: 'The positioning backend ingests the corrupted distance measurements. You can select Ordinary Nonlinear Least Squares (NLS), Robust Huber-loss NLS (which downweights large residual outliers), or add a Kinematic Kalman Filter to maintain trajectory continuity when anchors drop out.',
    visualDetails: [
      { label: 'Ordinary NLS', value: 'Standard Levenberg-Marquardt' },
      { label: 'Robust Huber NLS', value: 'Piecewise M-estimation loss' },
      { label: 'Motion Tracking', value: 'Constant-velocity Kalman filter' },
      { label: 'Condition Check', value: 'Jacobian DOP health validation' }
    ],
    callout: 'All calculations execute in real time on the Python/SciPy optimization backend.'
  },
  {
    number: '04',
    title: 'Evaluate the Results',
    subtitle: 'Transparent Benchmark Metrics',
    tagline: 'Compare the estimated trajectory against the known trajectory with empirical statistics.',
    description: 'Locentra measures performance by comparing estimated points against ground truth across the entire trajectory. View Root Mean Squared Error (RMSE), median error, 95th percentile error (P95), and crucially, the valid-estimate rate—so algorithms cannot hide failures behind selective fixes.',
    visualDetails: [
      { label: 'Primary Accuracy', value: 'RMSE & Mean Positioning Error' },
      { label: 'Tail Distribution', value: '95th Percentile (P95) Error' },
      { label: 'Reliability Rate', value: 'Valid Fixes / Total Timesteps' },
      { label: 'Failure Analysis', value: 'Identifies sparse-anchor breakdowns' }
    ],
    callout: 'Both successes and edge-case limitations are transparently exposed for research rigor.'
  }
];

export const HowItWorksSection: React.FC<{ onLaunchSimulator?: () => void }> = ({ onLaunchSimulator }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-t border-[#EAEAEA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PART 1: The Indoor Positioning Problem Banner */}
        <div className="mb-20 rounded-2xl bg-[#F8F9FA] border border-[#EAEAEA] p-8 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-[11px] font-mono text-[#232124] font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>THE CORE PROBLEM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] tracking-tight">
                Why GPS Fails and Indoor Wireless Signals Lie
              </h2>
              <p className="text-sm sm:text-base text-[#52525B] leading-relaxed">
                GPS satellite signals cannot penetrate concrete and steel. Wireless alternatives like Ultra-Wideband (UWB) and Bluetooth (BLE) measure distances to fixed anchors, but their accuracy degrades rapidly in real facilities:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA]">
                  <div className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>NLOS Delay Bias</span>
                  </div>
                  <p className="text-[11px] text-[#52525B] leading-snug">
                    Signals passing through drywall slow down, systematically over-estimating measured distances.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA]">
                  <div className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1.5 mb-1">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Multipath Spikes</span>
                  </div>
                  <p className="text-[11px] text-[#52525B] leading-snug">
                    Reflections off metal machinery cause rogue outlier spikes that pull ordinary solvers off course.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA]">
                  <div className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1.5 mb-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Packet Dropouts</span>
                  </div>
                  <p className="text-[11px] text-[#52525B] leading-snug">
                    Moving obstacles block line-of-sight entirely, leaving fewer than the minimum 3 anchors needed to triangulate.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Locentra's Mission Card */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-xl border border-[#EAEAEA] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#D9F56F] text-[#232124]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">Locentra’s Approach</h3>
                  <p className="text-[11px] font-mono text-[#71717A]">Synthetic Laboratory &amp; Benchmark</p>
                </div>
              </div>

              <p className="text-xs text-[#52525B] leading-relaxed">
                Rather than deploying expensive hardware into untested environments, Locentra creates an interactive digital simulation where you can introduce noise, drop anchors, and evaluate robust mathematical estimators under controlled, reproducible conditions.
              </p>

              <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-xs font-mono">
                <span className="text-[#71717A]">Evaluation Basis:</span>
                <span className="font-bold text-[#171717] bg-[#F8FDE8] px-2 py-0.5 rounded border border-[#D9F56F]">
                  Ground Truth vs. Estimates
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PART 2: Locentra in 60 Seconds Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-xs font-mono text-[#232124] font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LOCENTRA IN 60 SECONDS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
            How the Simulation Platform Works
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            From virtual geometry to positioning accuracy benchmarks in four straightforward steps.
          </p>
        </div>

        {/* Step Navigation Pill Selector (Mobile & Desktop) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {STEPS.map((step, idx) => (
            <button
              key={step.number}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeStep === idx
                  ? 'bg-[#232124] text-white shadow-sm'
                  : 'bg-[#F8F9FA] text-[#52525B] hover:text-[#171717] border border-[#EAEAEA]'
              }`}
            >
              <span className={activeStep === idx ? 'text-[#D9F56F]' : 'text-[#71717A]'}>{step.number}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Card Display */}
        <div className="rounded-2xl border border-[#EAEAEA] bg-[#F8F9FA] p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Step Left: Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#D9F56F] bg-[#232124] w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                  {STEPS[activeStep].number}
                </span>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-bold">
                    {STEPS[activeStep].subtitle}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                    {STEPS[activeStep].title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-[#171717] font-semibold leading-relaxed">
                {STEPS[activeStep].tagline}
              </p>

              <p className="text-sm text-[#52525B] leading-relaxed">
                {STEPS[activeStep].description}
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] flex items-start gap-2.5 text-xs text-[#232124]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{STEPS[activeStep].callout}</span>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold border border-[#EAEAEA] bg-white text-[#171717] hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous Step
                </button>
                {activeStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#232124] text-white hover:bg-black transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: {STEPS[activeStep + 1].title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onLaunchSimulator}
                    className="px-5 py-2 rounded-xl text-xs font-mono font-bold btn-lime inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    <span>Try the Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Step Right: Parameter / Technical Summary Card */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#EAEAEA] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <span className="text-xs font-mono font-bold text-[#171717] uppercase tracking-wider">
                  Simulation Parameters
                </span>
                <span className="text-[10px] font-mono text-[#71717A] bg-[#F4F5F7] px-2 py-0.5 rounded">
                  STAGE {STEPS[activeStep].number} / 04
                </span>
              </div>

              <div className="space-y-3">
                {STEPS[activeStep].visualDetails.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEA] flex items-center justify-between text-xs">
                    <span className="text-[#52525B] font-mono">{item.label}</span>
                    <span className="font-mono font-bold text-[#171717]">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EAEAEA] text-[11px] font-mono text-[#71717A] text-center">
                Synthetic Measurement Pipeline · Python Positioning Engine
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
