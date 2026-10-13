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
  Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { NavigationItem } from '../../types/navigation';
import { StatusIndicator } from '../ui/StatusIndicator';
import { LocentraLogo } from '../ui/LocentraLogo';

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
    description: 'Interactive 2D & 3D room, anchors & target trajectories',
    phaseIntroduced: 2,
  },
  {
    id: 'scenario-studio',
    label: 'Scenario Studio',
    iconName: 'SlidersHorizontal',
    description: 'Measurement noise, NLOS bias & obstacle occlusion controls',
    phaseIntroduced: 3,
  },
  {
    id: 'benchmark-arena',
    label: 'Benchmark Arena',
    iconName: 'BarChart3',
    description: 'Algorithm comparisons, error CDFs & ML residuals',
    phaseIntroduced: 4,
  },
  {
    id: 'dataset-explorer',
    label: 'Dataset Explorer',
    iconName: 'Database',
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
    const props = { 
      className: cn(
        'w-5 h-5 shrink-0 transition-colors', 
        active ? 'text-[#171717]' : 'text-[#888888] group-hover:text-white'
      ) 
    };
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
        'relative z-30 flex flex-col h-full bg-[#232124] text-white transition-all duration-300 ease-in-out select-none',
        'rounded-[28px] m-3 shadow-[0_4px_24px_rgba(0,0,0,0.14)] border border-[#333134]',
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      )}
    >
      {/* Brand Header: Click to return to Landing Page */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-white/10">
        <button
          onClick={() => useAppStore.getState().setViewMode('landing')}
          className="flex items-center gap-3.5 overflow-hidden text-left cursor-pointer group focus:outline-none rounded-xl py-1 px-1 -ml-1 transition-all hover:opacity-90"
          title="Return to Locentra Landing Page"
          aria-label="Return to Locentra Landing Page"
        >
          <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
            <LocentraLogo size={40} variant="badge" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 group-hover:text-[#D9F56F] transition-colors">
                Locentra
              </span>
              <p className="text-[11px] font-medium text-[#888888] truncate mt-0.5 group-hover:text-slate-300 transition-colors">
                Spatial Intelligence
              </p>
            </div>
          )}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-full text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-5 space-y-2 overflow-y-auto" aria-label="Main Navigation">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#777777] font-bold">
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
                'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-full text-left transition-all duration-150 group relative cursor-pointer',
                isActive
                  ? 'bg-white text-[#171717] font-bold shadow-md'
                  : 'text-[#999999] hover:text-white hover:bg-white/10'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {getIcon(item.iconName, isActive)}

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn('text-xs truncate', isActive ? 'text-[#171717] font-bold' : 'text-[#CCCCCC] font-medium')}>
                      {item.label}
                    </span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-[#D9F56F] shrink-0" />
                    ) : item.badge && !item.badge.toLowerCase().includes('phase') ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#D9F56F]/20 text-[#D9F56F] border border-[#D9F56F]/40">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine & Environment Telemetry Pod */}
      <div className="p-3.5 border-t border-white/10">
        {!isCollapsed ? (
          <div className="rounded-[20px] p-4 bg-[#2D2A2E] border border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#999999] flex items-center gap-1.5 font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#D9F56F]" /> Engine Link
              </span>
              <StatusIndicator status={engineStatus} />
            </div>
            <div className="text-xs text-white font-semibold truncate">
              {activeScenario.name}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] mt-2 pt-2 border-t border-white/10">
              <span>{activeScenario.anchors.length} Anchors</span>
              <span className="text-[#D9F56F] font-bold">20.0 Hz</span>
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
