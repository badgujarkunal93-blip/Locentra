import React from 'react';
import { Network, Activity, Cpu, Target, MoreVertical } from 'lucide-react';
import { SolverDisplayMeta } from './types';

interface SolverKpiCardProps {
  meta: SolverDisplayMeta;
  rmseMeters: number | null;
  p95Meters: number | null;
  validRate: number | null;
  durationOrPointsText: string;
  isBest?: boolean;
  sparklinePoints?: number[];
  isDemo?: boolean;
}

export const SolverKpiCard: React.FC<SolverKpiCardProps> = ({
  meta,
  rmseMeters,
  p95Meters,
  validRate,
  durationOrPointsText,
  isBest = false,
  sparklinePoints = [],
  isDemo = false,
}) => {
  // Render icon depending on solver category/id
  const renderIcon = () => {
    switch (meta.category) {
      case 'Optimization':
        return <Network className="w-4 h-4" style={{ color: meta.color }} />;
      case 'Filtering':
        return <Activity className="w-4 h-4" style={{ color: meta.color }} />;
      case 'Geometric':
        return <Target className="w-4 h-4" style={{ color: meta.color }} />;
      default:
        return <Cpu className="w-4 h-4" style={{ color: meta.color }} />;
    }
  };

  // Build SVG path from real sparkline points
  const renderSparkline = () => {
    if (!sparklinePoints || sparklinePoints.length < 2) {
      return (
        <div className="h-8 flex items-center justify-end text-[10px] text-[#A0A0A8] font-mono">
          {isDemo ? 'Baseline profile' : '—'}
        </div>
      );
    }

    const min = Math.min(...sparklinePoints);
    const max = Math.max(...sparklinePoints);
    const range = max - min || 0.01;
    const width = 110;
    const height = 30;

    const pointsStr = sparklinePoints
      .map((val, idx) => {
        const x = (idx / (sparklinePoints.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg className="w-28 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={meta.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsStr}
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-[22px] border border-[#E5E5E9] p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#D5D5DC] transition-all flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: meta.bgColor }}
            >
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#171719] tracking-tight">{meta.name}</h3>
                {isBest && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D9F56F] text-[#171719]">
                    BEST
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#74747B] truncate max-w-[170px]">{meta.shortDesc}</p>
            </div>
          </div>
          <button
            type="button"
            className="text-[#A0A0A8] hover:text-[#171719] p-1 rounded-lg transition-colors cursor-pointer"
            aria-label={`Options for ${meta.name}`}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Metric & Sparkline */}
        <div className="flex items-baseline justify-between mt-4 mb-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#171719] tracking-tight">
                {rmseMeters !== null ? rmseMeters.toFixed(2) : '—'}
              </span>
              <span className="text-sm font-bold text-[#74747B]">m</span>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#888890]">
              RMSE
            </span>
          </div>

          <div className="flex flex-col items-end">
            {renderSparkline()}
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-[#F0F0F3] grid grid-cols-3 gap-2 text-left">
        <div>
          <div className="text-xs font-bold text-[#171719]">
            {p95Meters !== null ? `${p95Meters.toFixed(2)} m` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#74747B]">P95 error</div>
        </div>

        <div>
          <div
            className={`text-xs font-bold ${
              validRate !== null && validRate >= 0.95 ? 'text-[#159B71]' : 'text-[#171719]'
            }`}
          >
            {validRate !== null ? `${(validRate * 100).toFixed(1)}%` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#74747B]">Valid est.</div>
        </div>

        <div>
          <div className="text-xs font-bold text-[#171719] truncate">{durationOrPointsText}</div>
          <div className="text-[10px] text-[#74747B]">Samples</div>
        </div>
      </div>
    </div>
  );
};
