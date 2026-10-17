import React from 'react';
import { SimulationCompareResponse, SimulationRunResponse } from '../../../types/api';
import { HistoricalRun } from './useLiveMonitoring';

interface EmpiricalCDFChartProps {
  compareResponse: SimulationCompareResponse | null;
  lastRunResponse: SimulationRunResponse | null;
  runHistory: HistoricalRun[];
}

export const EmpiricalCDFChart: React.FC<EmpiricalCDFChartProps> = ({
  compareResponse,
  lastRunResponse,
  runHistory,
}) => {
  // 1. Calculate Empirical CDF Curves from real simulation data
  const solverCurves = React.useMemo(() => {
    // If compareResponse has multi-solver data
    if (compareResponse && compareResponse.solvers) {
      const gt = compareResponse.ground_truth;
      return Object.entries(compareResponse.solvers).map(([key, solver]) => {
        const errors: number[] = [];
        solver.estimates.forEach((est, idx) => {
          const truth = gt[idx];
          if (est && est.status === 'valid' && est.x !== null && est.y !== null && truth) {
            const err = Math.hypot(est.x - truth.x, est.y - truth.y);
            errors.push(err);
          }
        });

        errors.sort((a, b) => a - b);
        const n = errors.length;
        const cdfPoints = errors.map((err, idx) => ({
          error: Number(err.toFixed(3)),
          cdf: Number(((idx + 1) / n).toFixed(3)),
        }));

        const isKalman = key.includes('kalman');
        const isRobust = key.includes('robust');
        const color = isRobust ? '#20D6B5' : isKalman ? '#55A6FF' : '#A78BFA';

        return {
          id: key,
          name: solver.name,
          color,
          points: cdfPoints,
          rmse: solver.metrics.rmse_m ?? 0.3,
          p95: solver.metrics.p95_error_m ?? 0.6,
        };
      });
    }

    // Otherwise use single latest simulation run if available
    if (lastRunResponse && lastRunResponse.estimates.length > 0) {
      const gt = lastRunResponse.ground_truth;
      const errors: number[] = [];
      lastRunResponse.estimates.forEach((est, idx) => {
        const truth = gt[idx];
        if (est && est.status === 'valid' && est.x !== null && est.y !== null && truth) {
          errors.push(Math.hypot(est.x - truth.x, est.y - truth.y));
        }
      });
      errors.sort((a, b) => a - b);
      const n = errors.length;
      return [
        {
          id: 'active-run',
          name: lastRunResponse.algorithm_name,
          color: '#20D6B5',
          points: errors.map((err, idx) => ({
            error: Number(err.toFixed(3)),
            cdf: Number(((idx + 1) / n).toFixed(3)),
          })),
          rmse: lastRunResponse.metrics.rmse_m ?? 0.28,
          p95: lastRunResponse.metrics.p95_error_m ?? 0.58,
        },
      ];
    }

    // Default baseline deterministic curves for clean visualization before first compare run
    const defaultPoints = (scale: number) => {
      const pts: { error: number; cdf: number }[] = [];
      for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * 2.0;
        // Standard Rayleigh-like CDF: 1 - exp(-(x / scale)^2)
        const cdf = Math.min(1.0, 1 - Math.exp(-Math.pow(x / scale, 2)));
        pts.push({ error: Number(x.toFixed(2)), cdf: Number(cdf.toFixed(2)) });
      }
      return pts;
    };

    return [
      { id: 'robust', name: 'Robust NLS', color: '#20D6B5', points: defaultPoints(0.4), rmse: 0.28, p95: 0.58 },
      { id: 'kalman', name: 'Extended Kalman', color: '#55A6FF', points: defaultPoints(0.55), rmse: 0.34, p95: 0.72 },
      { id: 'nls', name: 'NLS (Ordinary)', color: '#A78BFA', points: defaultPoints(0.7), rmse: 0.41, p95: 0.93 },
    ];
  }, [compareResponse, lastRunResponse]);

  // SVG Chart Setup for Empirical CDF
  const cdfWidth = 280;
  const cdfHeight = 130;
  const cdfMargin = { top: 15, right: 15, bottom: 25, left: 32 };
  const cdfPlotW = cdfWidth - cdfMargin.left - cdfMargin.right;
  const cdfPlotH = cdfHeight - cdfMargin.top - cdfMargin.bottom;

  const maxErrorAxis = 2.0;
  const toCdfX = (err: number) => cdfMargin.left + (Math.min(err, maxErrorAxis) / maxErrorAxis) * cdfPlotW;
  const toCdfY = (cdf: number) => cdfMargin.top + cdfPlotH - cdf * cdfPlotH;

  // 2. Setup History Error-over-Time Chart
  const histWidth = 280;
  const histHeight = 130;
  const histMargin = { top: 15, right: 15, bottom: 25, left: 32 };
  const histPlotW = histWidth - histMargin.left - histMargin.right;
  const histPlotH = histHeight - histMargin.top - histMargin.bottom;

  // Take up to last 15 runs in chronological order
  const chronologicalRuns = React.useMemo(() => {
    const list = [...runHistory].reverse();
    if (list.length === 1) {
      // Repeat single point across a 2-point span for graceful visualization
      return [
        { ...list[0], id: 'run-0' },
        { ...list[0], id: 'run-1' },
      ];
    }
    return list;
  }, [runHistory]);

  const maxHistY = 1.2;
  const toHistX = (idx: number, total: number) =>
    histMargin.left + (total <= 1 ? 0 : (idx / (total - 1)) * histPlotW);
  const toHistY = (val: number) =>
    histMargin.top + histPlotH - (Math.min(val, maxHistY) / maxHistY) * histPlotH;

  const rmsePolyline = chronologicalRuns
    .map((r, i) => `${toHistX(i, chronologicalRuns.length)},${toHistY(r.rmse)}`)
    .join(' ');

  const p95Polyline = chronologicalRuns
    .map((r, i) => `${toHistX(i, chronologicalRuns.length)},${toHistY(r.p95)}`)
    .join(' ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E2E8F0]">
      {/* Chart 1: Empirical CDF */}
      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
            <span className="truncate">Cumulative Error Curve</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] shrink-0">
            {compareResponse ? 'Multi-Solver' : 'Active Run'}
          </span>
        </div>

        <svg viewBox={`0 0 ${cdfWidth} ${cdfHeight}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.5, 1.0].map((yVal) => (
            <g key={`y-${yVal}`}>
              <line
                x1={cdfMargin.left}
                y1={toCdfY(yVal)}
                x2={cdfMargin.left + cdfPlotW}
                y2={toCdfY(yVal)}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={cdfMargin.left - 4}
                y={toCdfY(yVal) + 3}
                fill="#64748B"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
              >
                {yVal.toFixed(1)}
              </text>
            </g>
          ))}

          {[0.0, 0.5, 1.0, 1.5, 2.0].map((xVal) => (
            <g key={`x-${xVal}`}>
              <line
                x1={toCdfX(xVal)}
                y1={cdfMargin.top}
                x2={toCdfX(xVal)}
                y2={cdfMargin.top + cdfPlotH}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={toCdfX(xVal)}
                y={cdfMargin.top + cdfPlotH + 12}
                fill="#64748B"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {xVal}
              </text>
            </g>
          ))}

          {/* CDF Curves */}
          {solverCurves.map((solver) => {
            if (solver.points.length === 0) return null;
            const pts = solver.points
              .map((p) => `${toCdfX(p.error).toFixed(1)},${toCdfY(p.cdf).toFixed(1)}`)
              .join(' ');
            return (
              <g key={solver.id}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={solver.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={cdfMargin.left + cdfPlotW / 2}
            y={cdfMargin.top + cdfPlotH + 22}
            fill="#475569"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            textAnchor="middle"
          >
            Positioning Error (m)
          </text>
          <text
            x={cdfMargin.left - 20}
            y={cdfMargin.top + cdfPlotH / 2}
            fill="#475569"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            transform={`rotate(-90 ${cdfMargin.left - 20} ${cdfMargin.top + cdfPlotH / 2})`}
          >
            CDF
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[#E2E8F0] text-[9px] text-[#475569] flex-wrap">
          {solverCurves.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[#0F172A] font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Positioning Error Over Time */}
      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0" />
            <span className="truncate">Error History</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] shrink-0">
            Last {chronologicalRuns.length} Runs
          </span>
        </div>

        <svg viewBox={`0 0 ${histWidth} ${histHeight}`} className="w-full h-auto">
          {/* Y Axis Grid lines */}
          {[0, 0.5, 1.0].map((yVal) => (
            <g key={`hist-y-${yVal}`}>
              <line
                x1={histMargin.left}
                y1={toHistY(yVal)}
                x2={histMargin.left + histPlotW}
                y2={toHistY(yVal)}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={histMargin.left - 4}
                y={toHistY(yVal) + 3}
                fill="#64748B"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
              >
                {yVal.toFixed(1)}
              </text>
            </g>
          ))}

          {/* RMSE Line */}
          {chronologicalRuns.length > 0 && (
            <polyline
              points={rmsePolyline}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* P95 Line */}
          {chronologicalRuns.length > 0 && (
            <polyline
              points={p95Polyline}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Nodes */}
          {chronologicalRuns.map((r, i) => (
            <g key={r.id + i}>
              <circle
                cx={toHistX(i, chronologicalRuns.length)}
                cy={toHistY(r.rmse)}
                r="2.5"
                fill="#3B82F6"
              />
              <circle
                cx={toHistX(i, chronologicalRuns.length)}
                cy={toHistY(r.p95)}
                r="2.5"
                fill="#8B5CF6"
              />
            </g>
          ))}

          {/* Axis Labels */}
          <text
            x={histMargin.left + histPlotW / 2}
            y={histMargin.top + histPlotH + 22}
            fill="#475569"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            textAnchor="middle"
          >
            Recent Runs (Last {chronologicalRuns.length})
          </text>
          <text
            x={histMargin.left - 20}
            y={histMargin.top + histPlotH / 2}
            fill="#475569"
            fontSize="8"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            transform={`rotate(-90 ${histMargin.left - 20} ${histMargin.top + histPlotH / 2})`}
          >
            Error (m)
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-1.5 pt-1.5 border-t border-[#E2E8F0] text-[9px] text-[#475569]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#3B82F6]" />
            <span className="text-[#0F172A] font-medium">RMSE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#8B5CF6]" />
            <span className="text-[#0F172A] font-medium">P95 Error</span>
          </div>
        </div>
      </div>
    </div>
  );
};
