import React, { useState } from 'react';
import { Target, ChevronDown } from 'lucide-react';
import { SolverDisplayMeta, SolverQuantiles } from './types';

interface ErrorQuantilesPanelProps {
  quantilesList: SolverQuantiles[];
  solvers?: SolverDisplayMeta[];
  selectedSolverIds: string[];
}

export const ErrorQuantilesPanel: React.FC<ErrorQuantilesPanelProps> = ({
  quantilesList,
  selectedSolverIds,
}) => {
  const [activeRunSelection, setActiveRunSelection] = useState<'latest' | 'session'>('latest');

  // Filter quantiles by selected solvers
  const activeQuantiles = quantilesList.filter((q) => {
    if (selectedSolverIds.length > 0 && !selectedSolverIds.includes(q.solverId)) {
      return false;
    }
    return true;
  });

  // Calculate dynamic axis maximum (e.g. 1.2m or 1.4m based on max P99)
  let maxMeter = 1.4;
  activeQuantiles.forEach((q) => {
    if (q.p99 !== null && q.p99 > maxMeter - 0.2) {
      maxMeter = Math.ceil((q.p99 + 0.2) * 5) / 5;
    }
  });

  // Ticks for horizontal ruler (e.g. 0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4)
  const tickStep = maxMeter <= 1.5 ? 0.2 : 0.4;
  const ticks: number[] = [];
  for (let t = 0; t <= maxMeter + 0.01; t += tickStep) {
    ticks.push(Number(t.toFixed(1)));
  }

  const percentilesConfig = [
    { key: 'p50' as const, label: 'P50', sublabel: '(median)' },
    { key: 'p90' as const, label: 'P90', sublabel: '' },
    { key: 'p95' as const, label: 'P95', sublabel: '' },
    { key: 'p99' as const, label: 'P99', sublabel: '' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#159B71] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">Error Quantiles</h2>
              <p className="text-xs text-[#74747B]">Positioning error at key percentiles (m).</p>
            </div>
          </div>

          <div className="relative">
            <select
              value={activeRunSelection}
              onChange={(e) => setActiveRunSelection(e.target.value as any)}
              aria-label="Quantile run selection"
              className="appearance-none bg-[#F4F4F6] text-xs font-semibold text-[#171719] pl-3 pr-7 py-1.5 rounded-lg border border-[#E5E5E9] cursor-pointer focus:outline-none"
            >
              <option value="latest">Latest run</option>
              <option value="session">Session aggregate</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#74747B] absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap pt-3 pb-2 text-xs">
          {activeQuantiles.map((q) => (
            <div key={q.solverId} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
              <span className="text-[#171719] font-medium text-[11px]">{q.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quantiles Dot Plot */}
      <div className="my-4 space-y-6">
        {percentilesConfig.map(({ key, label, sublabel }) => (
          <div key={key} className="flex items-center gap-3">
            {/* Label Column */}
            <div className="w-20 shrink-0 text-right">
              <span className="text-xs font-extrabold text-[#171719]">{label}</span>
              {sublabel && (
                <div className="text-[10px] text-[#74747B] -mt-1 font-medium">{sublabel}</div>
              )}
            </div>

            {/* Track & Dots Column */}
            <div className="relative flex-1 h-8 flex items-center">
              {/* Horizontal connecting track line */}
              <div className="absolute inset-x-0 h-[2px] bg-[#E8E8EE] rounded-full" />

              {/* Render dots for each solver */}
              {activeQuantiles.map((q) => {
                const val = q[key];
                if (val === null) return null;
                const posPercent = Math.min(Math.max((val / maxMeter) * 100, 2), 98);

                return (
                  <div
                    key={q.solverId}
                    className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                    style={{ left: `${posPercent}%` }}
                    title={`${q.name}: ${label} = ${val.toFixed(2)} m`}
                  >
                    {/* Value Badge above dot */}
                    <span
                      className="text-[10px] font-mono font-bold leading-none mb-1 px-1 rounded-sm transition-transform group-hover:scale-110"
                      style={{ color: q.color }}
                    >
                      {val.toFixed(2)}
                    </span>
                    {/* Dot */}
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125"
                      style={{ backgroundColor: q.color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Horizontal Axis Ruler at Bottom */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-20 shrink-0" />
          <div className="relative flex-1 h-5">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#D5D5DC]" />
            {ticks.map((tick) => {
              const posPercent = (tick / maxMeter) * 100;
              return (
                <div
                  key={tick}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${posPercent}%` }}
                >
                  <div className="w-[1px] h-1.5 bg-[#A0A0A8]" />
                  <span className="text-[10px] text-[#74747B] font-mono mt-0.5">
                    {tick.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#F0F0F3] flex items-center justify-between text-[11px] text-[#74747B]">
        <span>Units: meters (lower is tighter precision)</span>
        <span className="font-mono text-[#171719] font-bold">P95 ISO Baseline Target: &le; 0.50m</span>
      </div>
    </div>
  );
};
