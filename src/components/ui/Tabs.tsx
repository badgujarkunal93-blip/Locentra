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
        'inline-flex items-center p-1 rounded-lg bg-slate-950/80 border border-slate-800/80 backdrop-blur-md',
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
              'relative flex items-center gap-2 rounded-md font-medium transition-all duration-150 select-none cursor-pointer',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold',
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
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
