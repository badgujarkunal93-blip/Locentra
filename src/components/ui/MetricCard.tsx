import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isPositiveGood?: boolean;
    isImprovement?: boolean;
    label?: string;
  };
  confidenceInterval?: string;
  caption?: string;
  icon?: React.ReactNode;
  accent?: 'mint' | 'cyan' | 'violet' | 'amber';
  isIllustrative?: boolean;
  className?: string;
  trend?: number[]; // Simple array of 6-8 values for SVG sparkline
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  delta,
  confidenceInterval,
  caption,
  icon,
  accent = 'mint',
  isIllustrative = true,
  className,
  trend = [3.2, 2.9, 2.8, 2.4, 2.1, 1.8, 1.74],
}) => {
  const accentBorderColors = {
    mint: 'hover:border-emerald-500/40 border-emerald-900/30',
    cyan: 'hover:border-cyan-500/40 border-cyan-900/30',
    violet: 'hover:border-violet-500/40 border-violet-900/30',
    amber: 'hover:border-amber-500/40 border-amber-900/30',
  };

  const accentTextColors = {
    mint: 'text-emerald-400',
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  };

  // Generate lightweight SVG sparkline
  const minVal = Math.min(...trend);
  const maxVal = Math.max(...trend);
  const range = maxVal - minVal || 1;
  const points = trend
    .map((val, idx) => {
      const x = (idx / (trend.length - 1)) * 60;
      const y = 20 - ((val - minVal) / range) * 16;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className={cn(
        'tech-card rounded-xl p-4.5 relative overflow-hidden transition-all duration-200 group',
        accentBorderColors[accent],
        className
      )}
    >
      {/* Background illumination sheen */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-emerald-500/5 to-transparent pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-medium text-slate-400 tracking-wide flex items-center gap-1.5">
          {icon && <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">{icon}</span>}
          {title}
        </span>
        {isIllustrative && (
          <Badge variant="illustrative" size="sm" title="Illustrative sample pending live Python engine calibration">
            Illustrative
          </Badge>
        )}
      </div>

      {/* Main value display */}
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-2xl lg:text-3xl font-bold font-mono tracking-tight', accentTextColors[accent])}>
            {value}
          </span>
          {unit && <span className="text-xs font-mono text-slate-400 font-semibold">{unit}</span>}
        </div>

        {/* Mini SVG Sparkline */}
        <div className="shrink-0 w-16 h-6 flex items-center justify-end">
          <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
            <polyline
              fill="none"
              stroke={
                accent === 'violet' ? '#a78bfa' : accent === 'cyan' ? '#22d3ee' : accent === 'amber' ? '#f59e0b' : '#34d399'
              }
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Delta / Confidence context row */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
        {delta ? (
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={cn(
                'font-medium px-1.5 py-0.5 rounded',
                delta.isImprovement
                  ? 'bg-emerald-950/80 text-emerald-300'
                  : 'bg-rose-950/80 text-rose-300'
              )}
            >
              {delta.value}
            </span>
            <span className="text-slate-400">{delta.label || 'vs baseline'}</span>
          </div>
        ) : confidenceInterval ? (
          <span className="text-slate-400 font-mono">
            95% CI: <span className="text-slate-200">{confidenceInterval}</span>
          </span>
        ) : (
          <span className="text-slate-400 truncate">{caption}</span>
        )}

        {confidenceInterval && delta && (
          <span className="text-slate-500 font-mono hidden sm:inline text-[10px]">
            {confidenceInterval}
          </span>
        )}
      </div>
    </div>
  );
};
