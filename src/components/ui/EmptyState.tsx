import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'tech-card rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 border border-slate-800/80',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-100 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && (
            <Button size="sm" variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button size="sm" variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
