import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mint' | 'cyan' | 'violet' | 'amber' | 'rose' | 'neutral' | 'illustrative';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'mint',
  size = 'md',
  pulse = false,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-semibold font-mono',
    md: 'text-xs px-2.5 py-1 tracking-normal font-medium',
  };

  const variantStyles = {
    mint: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    cyan: 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
    violet: 'bg-violet-950/70 text-violet-300 border border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
    amber: 'bg-amber-950/70 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    rose: 'bg-rose-950/70 text-rose-300 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    neutral: 'bg-slate-900/80 text-slate-300 border border-slate-700/40',
    illustrative: 'bg-slate-900/90 text-amber-300 border border-amber-500/40 font-mono text-[10px] uppercase tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full backdrop-blur-sm select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
