import React from 'react';
import { X, Building2, Bot, HeartPulse, ShieldAlert, CheckCircle2, ArrowRight, type LucideIcon } from 'lucide-react';

interface UseCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUseCase: string | null;
  onLaunchEngine?: () => void;
}

interface UseCaseDetail {
  id: string;
  title: string;
  icon: LucideIcon;
  tag: string;
  summary: string;
  challenges: string[];
  locentraAdvantage: string[];
  metrics: { label: string; value: string }[];
}

const USE_CASES: Record<string, UseCaseDetail> = {
  warehouse: {
    id: 'warehouse',
    title: 'Industrial Warehouses & Logistics Hubs',
    icon: Building2,
    tag: 'Dense Multipath Clutter',
    summary:
      'High-bay automated warehouses are plagued by severe RF multipath reflections from metal pallet racking, steel forklifts, and concrete walls. Classical trilateration regularly projects pallets through steel uprights.',
    challenges: [
      'Heavy metal multipath wall reflections creating +4m to +8m ranging spikes',
      'Forklift and mast occlusions causing 35% packet loss on line-of-sight anchors',
      'Floor space spanning 500,000+ sq ft requiring seamless anchor-cluster handoffs',
    ],
    locentraAdvantage: [
      'Huber L1 robust loss suppression prevents coordinates jumping outside aisles',
      'Multi-cluster spatial smoothing eliminates coordinate stutter at cell boundaries',
      'Automated geometric DOP health monitoring alerts technicians to dead zones',
    ],
    metrics: [
      { label: 'Aisle Accuracy', value: '< 0.25m' },
      { label: 'Outlier Rejection', value: '100%' },
      { label: 'Rack Safety Margin', value: 'Zero Breach' },
    ],
  },
  amr: {
    id: 'amr',
    title: 'Autonomous Mobile Robots (AMR & AGV Fleets)',
    icon: Bot,
    tag: 'Ultra-Low Latency Kinematics',
    summary:
      'High-speed logistics rovers and heavy automated tuggers moving up to 3 m/s require sub-second pose feedback. If the positioning engine lags or drops a frame, the robot executes an emergency e-stop.',
    challenges: [
      'Latency exceeding 10ms causes path tracking instability and safety disengagements',
      'Packet dropouts when traversing narrow metal door vestibules',
      'IMU wheel odometry drift accumulation over multi-kilometer shifts',
    ],
    locentraAdvantage: [
      '1.4ms solver latency supporting continuous 700+ Hz telemetry updates',
      '9-state EKF velocity extrapolation prevents blind stops during packet dropouts',
      'Seamless ROS2 / Micro-ROS bridge with native coordinate transforms',
    ],
    metrics: [
      { label: 'Update Frequency', value: '714 Hz' },
      { label: 'Solver Latency', value: '1.4 ms' },
      { label: 'Emergency E-Stops', value: '-94%' },
    ],
  },
  healthcare: {
    id: 'healthcare',
    title: 'Healthcare Facilities & Clinical Assets',
    icon: HeartPulse,
    tag: 'Critical Asset Tracking',
    summary:
      'Hospitals demand sub-room precision to track mobile imaging machines, infusion pumps, ventilators, and surgical trays across radiology suites, ICUs, and lead-lined procedure rooms.',
    challenges: [
      'Thick lead-shielded radiology walls causing catastrophic signal attenuation',
      'Dense pedestrian and bed movement creating transient dynamic occlusions',
      'Zero tolerance for false room attribution in emergency crash-cart dispatch',
    ],
    locentraAdvantage: [
      'Room-boundary constrained kinematics prevents impossible wall bleedthrough',
      'Sub-meter horizontal precision reliably distinguishes Room 402 from 403',
      'Protocol-neutral operation over existing hospital BLE and UWB beacons',
    ],
    metrics: [
      { label: 'Room Accuracy', value: '99.8%' },
      { label: 'Search Time', value: '< 30 sec' },
      { label: 'Hardware Reuse', value: '100%' },
    ],
  },
  geofencing: {
    id: 'geofencing',
    title: 'Hazardous Geofencing & Worker Safety',
    icon: ShieldAlert,
    tag: 'Zero-Latency Safety Perimeters',
    summary:
      'In heavy petrochemical refineries, manufacturing stamping cells, and underground mining, workers entering automated machinery zones must trigger immediate millimeter safety shutoffs.',
    challenges: [
      'False negatives in safety boundary breaches can lead to severe injury',
      'Dynamic machinery movements alter local RF multipath environments in real time',
      'Collinear tunnel geometry creates extreme geometric dilution of precision',
    ],
    locentraAdvantage: [
      'Real-time Jacobian matrix health monitoring detects compromised geometry',
      'Conservative 99th-percentile (P99) confidence bounds prevent perimeter overreach',
      'Direct relay output triggers hardware interlocks in under 5 milliseconds',
    ],
    metrics: [
      { label: 'Interlock Latency', value: '< 5 ms' },
      { label: 'False Alarms', value: '< 0.01%' },
      { label: 'Safety Integrity', value: 'SIL-2 Compatible' },
    ],
  },
};

export const UseCasesModal: React.FC<UseCasesModalProps> = ({
  isOpen,
  onClose,
  selectedUseCase,
  onLaunchEngine,
}) => {
  if (!isOpen || !selectedUseCase) return null;
  const current = USE_CASES[selectedUseCase] || USE_CASES.warehouse;
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F8FDE8] text-[#171717] border border-[#D9F56F]">
              <IconComponent className="w-5 h-5 text-[#232124]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] font-bold">
                {current.tag}
              </span>
              <h3 className="text-lg font-bold text-[#171717] mt-1 font-sans">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#71717A] hover:text-[#171717] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#52525B] bg-[#FAFAFA]">
          <p className="leading-relaxed text-[#232124] bg-white p-4 rounded-xl border border-[#EAEAEA] shadow-xs">
            {current.summary}
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {current.metrics.map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white border border-[#EAEAEA] text-center font-mono shadow-xs">
                <div className="text-xl font-extrabold text-[#171717]">{m.value}</div>
                <div className="text-[10px] text-[#71717A] mt-1 font-sans font-medium">{m.label}</div>
              </div>
            ))}
          </div>

          {/* The Challenges */}
          <div className="space-y-2.5 p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <h4 className="text-xs font-mono uppercase tracking-wider text-rose-700 font-bold">
              Inherent Operational Challenges
            </h4>
            <div className="space-y-1.5 text-xs text-rose-900/80">
              {current.challenges.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Locentra Advantage */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#F8FDE8]/60 border border-[#D9F56F]/60">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#232124] font-bold">
              The Locentra Algorithmic Advantage
            </h4>
            <div className="space-y-2 text-xs text-[#232124]">
              {current.locentraAdvantage.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#EAEAEA]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-[#171717]">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAEAEA] bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-[#52525B] text-xs font-mono font-medium hover:text-[#171717] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (onLaunchEngine) onLaunchEngine();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#D9F56F] text-[#171717] font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#ceee58] border border-[#ceee58] transition-all cursor-pointer shadow-xs"
          >
            <span>Launch Engine Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
