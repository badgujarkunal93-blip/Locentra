import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  categoryTag?: string;
  phaseBadge?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  categoryTag,
  phaseBadge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60 mb-6',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {categoryTag && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              {categoryTag}
            </span>
          )}
          {categoryTag && phaseBadge && <span className="text-slate-600 font-mono">/</span>}
          {phaseBadge && (
            <Badge variant="cyan" size="sm">
              {phaseBadge}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};
