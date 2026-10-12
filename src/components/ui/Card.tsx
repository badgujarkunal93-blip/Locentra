import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'forest' | 'ai' | 'ghost';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  variant = 'default',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    default: 'tech-card',
    forest: 'bg-gradient-to-br from-[#0c1815] to-[#08120f] border border-emerald-900/40 shadow-xl',
    ai: 'tech-card-ai',
    ghost: 'bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-5 transition-all duration-200',
        variantStyles[variant],
        interactive && 'tech-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-950/60', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 leading-relaxed', className)} {...props}>
    {children}
  </p>
);
