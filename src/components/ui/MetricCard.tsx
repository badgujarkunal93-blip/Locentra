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
  const iconBgColors = {
    mint: 'bg-[#D9F56F]/30 text-[#171717]',
    cyan: 'bg-[#EBF5FF] text-[#1D4ED8]',
    violet: 'bg-[#DDD6F8] text-[#5B47B8]',
    amber: 'bg-[#FEF3C7] text-[#B45309]',
  };

  const sparklineStroke = {
    mint: '#232124',
    cyan: '#55A6FF',
    violet: '#B6A9EF',
    amber: '#F59E0B',
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
        'bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px]',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', iconBgColors[accent])}>
              {icon}
            </div>
          )}
          <span className="text-xs font-semibold text-[#777777] tracking-tight">
            {title}
          </span>
        </div>
        {isIllustrative && (
          <Badge variant="illustrative" size="sm" title="Illustrative sample pending live Python engine calibration">
            Illustrative
          </Badge>
        )}
      </div>

      {/* Main value display */}
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-[#171717]">
            {value}
          </span>
          {unit && <span className="text-xs font-mono text-[#777777] font-semibold">{unit}</span>}
        </div>

        {/* Mini SVG Sparkline */}
        <div className="shrink-0 w-16 h-6 flex items-center justify-end">
          <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
            <polyline
              fill="none"
              stroke={sparklineStroke[accent]}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Delta / Confidence context row */}
      <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-[11px]">
        {delta ? (
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={cn(
                'font-bold px-2 py-0.5 rounded-full text-[10px]',
                delta.isImprovement
                  ? 'bg-[#D9F56F] text-[#171717]'
                  : 'bg-rose-100 text-rose-800'
              )}
            >
              {delta.value}
            </span>
            <span className="text-[#777777]">{delta.label || 'vs baseline'}</span>
          </div>
        ) : confidenceInterval ? (
          <span className="text-[#777777] font-mono">
            95% CI: <span className="text-[#171717] font-semibold">{confidenceInterval}</span>
          </span>
        ) : (
          <span className="text-[#777777] truncate">{caption}</span>
        )}

        {confidenceInterval && delta && (
          <span className="text-[#999999] font-mono hidden sm:inline text-[10px]">
            {confidenceInterval}
          </span>
        )}
      </div>
    </div>
  );
};
