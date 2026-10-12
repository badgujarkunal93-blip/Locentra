import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'mint' | 'cyan' | 'violet' | 'amber' | 'rose' | 'neutral' | 'illustrative' | 'dark' | 'lime';
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
    sm: 'text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-semibold font-mono',
    md: 'text-xs px-3 py-1 tracking-normal font-semibold',
  };

  const variantStyles = {
    mint: 'bg-[#D9F56F]/30 text-[#171717] border border-[#D9F56F]',
    lime: 'bg-[#D9F56F] text-[#171717] font-bold shadow-xs',
    cyan: 'bg-[#EBF5FF] text-[#1D4ED8] border border-[#BFDBFE]',
    violet: 'bg-[#DDD6F8] text-[#4C3B9E] border border-[#B6A9EF]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    rose: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    neutral: 'bg-[#F2F2F2] text-[#555555] border border-[#E5E5E5]',
    illustrative: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-mono text-[10px] uppercase tracking-wider',
    dark: 'bg-[#232124] text-white border border-[#3A383B]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full select-none',
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
