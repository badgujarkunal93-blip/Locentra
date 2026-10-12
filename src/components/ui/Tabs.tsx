import React from 'react';
import { cn } from '../../lib/utils';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string = string>({
  options,
  activeId,
  onChange,
  className,
  size = 'md',
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 rounded-full bg-[#E5E5E5] border border-[#DADADA]',
        className
      )}
    >
      {options.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 rounded-full font-semibold transition-all duration-150 select-none cursor-pointer',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#666666] hover:text-[#171717] hover:bg-black/5'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold',
                  isActive ? 'bg-[#D9F56F] text-[#171717]' : 'bg-[#D0D0D0] text-[#555555]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
