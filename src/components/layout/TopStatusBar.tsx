import React, { useState } from 'react';
import { 
  Play, 
  Search,
  Bell
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { LocentraLogo } from '../ui/LocentraLogo';

export const TopStatusBar: React.FC = () => {
  const activeSection = useAppStore((s) => s.activeSection);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);
  const activeScenario = useAppStore((s) => s.activeScenario);
  const [searchQuery, setSearchQuery] = useState('');

  const sectionTitles: Record<string, string> = {
    'command-center': 'Command Center',
    'spatial-lab': 'Spatial Simulation Environment',
    'scenario-studio': 'Degradation & Obstacle Configurator',
    'benchmark-arena': 'Multi-Algorithm Evaluation Bench',
    'dataset-explorer': 'Synthetic Trajectory & Range Vault',
  };

  const simulationState = useAppStore((s) => s.simulationState);
  const engineStatus = useAppStore((s) => s.engineStatus);
  const isEngineLive = simulationState.dataSource === 'backend' || engineStatus === 'online';

  return (
    <header className="h-20 bg-transparent px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Brand / Module Breadcrumb - Clickable to Landing Page */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => useAppStore.getState().setViewMode('landing')}
            className="text-xs font-mono uppercase tracking-wider font-bold text-[#171717] flex items-center gap-1.5 shrink-0 hover:text-black transition-opacity cursor-pointer group focus:outline-none p-1 -m-1 rounded-lg hover:bg-black/5"
            title="Return to Landing Page"
            aria-label="Return to Locentra Landing Page"
          >
            <LocentraLogo size={16} variant="icon" className="text-[#171717] group-hover:scale-110 transition-transform" />
            <span>Locentra</span>
          </button>
          <span className="text-[#A0A0A0] font-mono text-xs">/</span>
          <span className="text-sm font-bold text-[#171717] truncate">
            {sectionTitles[activeSection] || 'Platform'}
          </span>
        </div>

        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DDD6F8] text-[#4C3B9E]">
          v0.1.0-alpha
        </span>
      </div>

      {/* Middle: Rounded Pill Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search telemetry, anchors, solvers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-[#EAEAEA] text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#D9F56F] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
          />
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Testbed / Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white border border-[#EAEAEA] text-xs font-medium shadow-xs">
          <div className="flex items-center gap-1.5 text-[#555555]">
            <span className="text-[#888888]">Testbed:</span>
            <span className="font-bold text-[#171717] truncate max-w-[130px]">
              {activeScenario.room.width}m × {activeScenario.room.length}m
            </span>
          </div>
          <div className="h-3 w-px bg-[#EAEAEA]" />
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isEngineLive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-amber-400'
              }`}
            />
            <span className={isEngineLive ? 'text-emerald-700' : 'text-amber-700'}>
              {isEngineLive ? 'FastAPI Live' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Notification Icon */}
        <button
          className="w-10 h-10 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center text-[#555555] hover:text-[#171717] hover:bg-[#F9F9F9] transition-colors relative shadow-xs"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#D9F56F] absolute top-2 right-2 border border-white" />
        </button>

        {/* Primary Diagnostic Action Button */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          onClick={() => setQuickRunModalOpen(true)}
        >
          Run Diagnostic
        </Button>
      </div>
    </header>
  );
};
