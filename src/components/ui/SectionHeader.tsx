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
        'flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-6',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {categoryTag && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777] font-bold">
              {categoryTag}
            </span>
          )}
          {categoryTag && phaseBadge && !phaseBadge.toLowerCase().includes('phase') && (
            <span className="text-[#C4C4C4] font-mono">/</span>
          )}
          {phaseBadge && (
            phaseBadge.toLowerCase().includes('phase') ? (
              <span className="sr-only">{phaseBadge}</span>
            ) : (
              <Badge variant="lime" size="sm">
                {phaseBadge}
              </Badge>
            )
          )}
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171717]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[#777777] max-w-3xl leading-relaxed">
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
