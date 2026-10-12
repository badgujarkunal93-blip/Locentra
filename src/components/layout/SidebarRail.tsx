import React, { useState } from 'react';
import { 
  Radar, 
  Layers3, 
  SlidersHorizontal, 
  BarChart3, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  Radio,
  Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { NavigationItem } from '../../types/navigation';
import { StatusIndicator } from '../ui/StatusIndicator';

const NAV_ITEMS: NavigationItem[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    iconName: 'Radar',
    badge: 'LIVE',
    description: 'System overview, solver health & real-time telemetry',
    phaseIntroduced: 1,
  },
  {
    id: 'spatial-lab',
    label: 'Spatial Lab',
    iconName: 'Layers3',
    badge: 'PHASE 2',
    description: 'Interactive 2D & 3D room, anchors & target trajectories',
    phaseIntroduced: 2,
  },
  {
    id: 'scenario-studio',
    label: 'Scenario Studio',
    iconName: 'SlidersHorizontal',
    badge: 'PHASE 3',
    description: 'Measurement noise, NLOS bias & obstacle occlusion controls',
    phaseIntroduced: 3,
  },
  {
    id: 'benchmark-arena',
    label: 'Benchmark Arena',
    iconName: 'BarChart3',
    badge: 'PHASE 4',
    description: 'Algorithm comparisons, error CDFs & ML residuals',
    phaseIntroduced: 4,
  },
  {
    id: 'dataset-explorer',
    label: 'Dataset Explorer',
    iconName: 'Database',
    badge: 'PHASE 4',
    description: 'Synthetic trajectories, raw ranges & evaluation splits',
    phaseIntroduced: 4,
  },
];

export const SidebarRail: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const engineStatus = useAppStore((s) => s.engineStatus);
  const activeScenario = useAppStore((s) => s.activeScenario);

  const getIcon = (name: string, active: boolean) => {
    const props = { className: cn('w-5 h-5 shrink-0 transition-colors', active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400') };
    switch (name) {
      case 'Radar': return <Radar {...props} />;
      case 'Layers3': return <Layers3 {...props} />;
      case 'SlidersHorizontal': return <SlidersHorizontal {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Database': return <Database {...props} />;
      default: return <Activity {...props} />;
    }
  };

  return (
    <aside
      className={cn(
        'relative z-30 flex flex-col h-screen border-r border-emerald-950/60 bg-[#091113]/95 backdrop-blur-xl transition-all duration-300 ease-in-out select-none',
        isCollapsed ? 'w-18' : 'w-64 lg:w-72'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-emerald-950/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0">
            <Radio className="w-5 h-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                AnchorSense <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">AI</span>
              </span>
              <p className="text-[11px] font-mono text-emerald-400/70 truncate">
                Spatial Intelligence
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Platform Modules
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer',
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/80 to-emerald-900/30 text-slate-100 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active side indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}

              {getIcon(item.iconName, isActive)}

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn('text-xs font-semibold truncate', isActive ? 'text-slate-100' : 'text-slate-300')}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold',
                          item.badge === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine & Environment Telemetry Pod */}
      <div className="p-3 border-t border-emerald-950/60 bg-[#060c0e]">
        {!isCollapsed ? (
          <div className="rounded-xl p-3 bg-slate-950/60 border border-emerald-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Engine Link
              </span>
              <StatusIndicator status={engineStatus} />
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate">
              {activeScenario.name}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/80">
              <span>{activeScenario.anchors.length} Anchors active</span>
              <span className="text-emerald-400">20.0 Hz</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Engine Status">
            <StatusIndicator status={engineStatus} showPing={true} />
          </div>
        )}
      </div>
    </aside>
  );
};
