import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'forest' | 'ai' | 'ghost' | 'dark' | 'lavender' | 'lime';
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
    default: 'bg-white text-[#171717] border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)]',
    forest: 'bg-[#F4F1FD] text-[#171717] border border-[#DDD6F8] shadow-xs',
    ai: 'bg-[#F4F1FD] text-[#171717] border border-[#DDD6F8]',
    ghost: 'bg-transparent border border-[#EAEAEA]',
    dark: 'bg-[#232124] text-white border border-[#333134] shadow-[0_4px_24px_-2px_rgba(0,0,0,0.12)]',
    lavender: 'bg-[#F5F2FE] text-[#171717] border border-[#DDD6F8]',
    lime: 'bg-[#F8FDE8] text-[#171717] border border-[#D9F56F]',
  };

  return (
    <div
      className={cn(
        'rounded-[24px] p-6 transition-all duration-200',
        variantStyles[variant],
        interactive && 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] cursor-pointer',
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
  <div className={cn('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F0F0F0]', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-bold tracking-tight text-[#171717] flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-[#777777] leading-relaxed', className)} {...props}>
    {children}
  </p>
);
