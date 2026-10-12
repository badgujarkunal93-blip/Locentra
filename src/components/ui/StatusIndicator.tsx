import React from 'react';
import { cn } from '../../lib/utils';
import { EngineStatus } from '../../types/telemetry';

export interface StatusIndicatorProps {
  status: EngineStatus;
  label?: string;
  showPing?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showPing = true,
  className,
}) => {
  const statusConfig: Record<EngineStatus, { color: string; pingColor: string; text: string }> = {
    online: {
      color: 'bg-emerald-400',
      pingColor: 'bg-emerald-500',
      text: 'Engine Ready',
    },
    busy: {
      color: 'bg-cyan-400',
      pingColor: 'bg-cyan-500',
      text: 'Solving Batch',
    },
    calibrating: {
      color: 'bg-amber-400',
      pingColor: 'bg-amber-500',
      text: 'Calibrating ML',
    },
    offline: {
      color: 'bg-rose-500',
      pingColor: 'bg-rose-600',
      text: 'Engine Offline',
    },
  };

  const current = statusConfig[status];

  return (
    <div className={cn('inline-flex items-center gap-2 font-mono text-xs', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {showPing && status !== 'offline' && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.pingColor
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm',
            current.color
          )}
        />
      </span>
      {label !== undefined ? (
        <span className="text-slate-300 font-medium">{label}</span>
      ) : (
        <span className="text-slate-300 font-medium">{current.text}</span>
      )}
    </div>
  );
};
