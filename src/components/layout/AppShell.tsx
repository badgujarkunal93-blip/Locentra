import React from 'react';
import { SidebarRail } from './SidebarRail';
import { TopStatusBar } from './TopStatusBar';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { X, Play, ShieldCheck } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const showTechnicalGrid = useAppStore((s) => s.showTechnicalGrid);
  const isCompactMode = useAppStore((s) => s.isCompactMode);
  const isQuickRunModalOpen = useAppStore((s) => s.isQuickRunModalOpen);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);
  const engineStatus = useAppStore((s) => s.engineStatus);
  const setEngineStatus = useAppStore((s) => s.setEngineStatus);

  const handleSimulateRun = () => {
    setEngineStatus('busy');
    setTimeout(() => {
      setEngineStatus('online');
      setQuickRunModalOpen(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070c0e] text-slate-100">
      {/* Left Navigation Rail */}
      <SidebarRail />

      {/* Main Viewport */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden relative">
        {/* Top Status Bar */}
        <TopStatusBar />

        {/* Scrollable View Area with optional Technical Grid */}
        <main
          className={`flex-1 overflow-y-auto relative ${
            showTechnicalGrid ? 'bg-tech-grid' : ''
          } ${isCompactMode ? 'p-3 lg:p-4' : 'p-4 lg:p-8'}`}
        >
          {/* Subtle radial glow background behind content */}
          <div className="absolute inset-0 bg-tech-radial-glow pointer-events-none" />

          {/* View Container */}
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Diagnostic / Scenario Modal */}
      {isQuickRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="tech-card rounded-2xl w-full max-w-lg border border-emerald-500/40 p-6 shadow-2xl relative">
            <button
              onClick={() => setQuickRunModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">Execute Engine Diagnostic Run</h3>
                <p className="text-xs text-slate-400 font-mono">Environment: lab-warehouse-alpha</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Solver Pipeline:</span>
                  <span className="font-mono text-emerald-300 font-medium">EKF + NLLS Refinement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Transceivers:</span>
                  <span className="font-mono text-slate-200">6 Anchors (UWB / 4.49 GHz)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degradation Profile:</span>
                  <span className="font-mono text-amber-300">σ = 0.15m (15% NLOS bias)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Phase 1 Preview Mode: Initiating this diagnostic will exercise frontend status state transitions. The real numerical solver pipeline will execute via Python in Phase 3.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setQuickRunModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={engineStatus === 'busy'}
                onClick={handleSimulateRun}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                {engineStatus === 'busy' ? 'Executing Solvers...' : 'Run Diagnostic'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
