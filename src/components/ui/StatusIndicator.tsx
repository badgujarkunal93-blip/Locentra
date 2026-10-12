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
      color: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      text: 'Engine Ready',
    },
    busy: {
      color: 'bg-[#55A6FF]',
      pingColor: 'bg-[#55A6FF]',
      text: 'Solving Batch',
    },
    calibrating: {
      color: 'bg-[#F59E0B]',
      pingColor: 'bg-[#F59E0B]',
      text: 'Calibrating ML',
    },
    offline: {
      color: 'bg-rose-500',
      pingColor: 'bg-rose-400',
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
            'relative inline-flex rounded-full h-2.5 w-2.5 shadow-xs',
            current.color
          )}
        />
      </span>
      {label !== undefined ? (
        <span className="font-semibold">{label}</span>
      ) : (
        <span className="font-semibold">{current.text}</span>
      )}
    </div>
  );
};
