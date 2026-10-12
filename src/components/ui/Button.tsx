import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ai-accent' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
    sm: 'text-xs px-3 py-1.5 rounded-md gap-2 font-medium',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50 active:scale-[0.98]',
    secondary: 'bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 shadow-sm active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-slate-900/60 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-600/50',
    'ai-accent': 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium border border-violet-400/40 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-[0.98]',
    danger: 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 hover:border-rose-500 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
});

Button.displayName = 'Button';
