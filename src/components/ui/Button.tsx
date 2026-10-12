import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ai-accent' | 'danger' | 'ghost' | 'dark';
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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F56F] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    xs: 'text-xs px-3 py-1 rounded-full gap-1.5',
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-2 font-medium',
    md: 'text-sm px-5 py-2.5 rounded-full gap-2 font-semibold',
    lg: 'text-base px-6 py-3 rounded-full gap-2.5 font-bold',
  };

  const variantStyles = {
    primary: 'bg-[#D9F56F] hover:bg-[#cbe85f] text-[#171717] font-semibold shadow-sm active:scale-[0.98]',
    secondary: 'bg-white hover:bg-[#F7F7F7] text-[#171717] border border-[#EAEAEA] font-semibold shadow-sm active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-black/5 text-[#171717] border border-[#D5D5D5] font-medium active:scale-[0.98]',
    'ai-accent': 'bg-[#DDD6F8] hover:bg-[#cec4f4] text-[#4C3B9E] font-semibold border border-[#B6A9EF] active:scale-[0.98]',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-black/5 text-[#555555] hover:text-[#171717]',
    dark: 'bg-[#232124] hover:bg-[#343135] text-white font-semibold shadow-sm active:scale-[0.98]',
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
