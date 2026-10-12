import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Maximize2, 
  Play, 
  Clock, 
  Compass
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const TopStatusBar: React.FC = () => {
  const activeSection = useAppStore((s) => s.activeSection);
  const showTechnicalGrid = useAppStore((s) => s.showTechnicalGrid);
  const toggleTechnicalGrid = useAppStore((s) => s.toggleTechnicalGrid);
  const isCompactMode = useAppStore((s) => s.isCompactMode);
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);
  const activeScenario = useAppStore((s) => s.activeScenario);
  
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString() + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sectionTitles: Record<string, string> = {
    'command-center': 'Mission Control & System Diagnostics',
    'spatial-lab': 'Spatial Simulation Environment',
    'scenario-studio': 'Degradation & Obstacle Configurator',
    'benchmark-arena': 'Multi-Algorithm Evaluation Bench',
    'dataset-explorer': 'Synthetic Trajectory & Range Vault',
  };

  return (
    <header className="h-16 border-b border-emerald-950/60 bg-[#081013]/90 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Active Section & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            AnchorSense
          </span>
          <span className="text-slate-600 font-mono text-xs">/</span>
          <span className="text-xs font-semibold text-slate-200 truncate">
            {sectionTitles[activeSection] || 'Platform'}
          </span>
        </div>

        <Badge variant="mint" size="sm" className="hidden sm:inline-flex">
          v0.1.0-alpha
        </Badge>
      </div>

      {/* Middle: Live Telemetry Bar */}
      <div className="hidden xl:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-emerald-950/70 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Environment:</span>
          <span className="text-slate-200 font-medium truncate max-w-[160px]">{activeScenario.name}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Stream:</span>
          <span className="text-emerald-400 font-semibold">20.0 Hz</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{timeString}</span>
        </div>
      </div>

      {/* Right Actions & Tool toggles */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={toggleTechnicalGrid}
          className={`p-2 rounded-lg border transition-colors ${
            showTechnicalGrid 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Technical Background Grid"
          aria-label="Toggle Technical Grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleCompactMode}
          className={`p-2 rounded-lg border transition-colors ${
            isCompactMode 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Compact Data Density"
          aria-label="Toggle Compact Data Density"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

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
