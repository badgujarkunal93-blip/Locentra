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
    <div className="flex h-screen w-screen overflow-hidden bg-[#E6E6E6] text-[#171717]">
      {/* Left Navigation Rail */}
      <SidebarRail />

      {/* Main Viewport */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden relative">
        {/* Top Status Bar */}
        <TopStatusBar />

        {/* Scrollable View Area */}
        <main
          className={`flex-1 overflow-y-auto relative ${
            isCompactMode ? 'p-3 lg:p-4' : 'p-4 lg:p-8'
          }`}
        >
          {/* View Container */}
          <div className="relative z-10 max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Diagnostic / Scenario Modal */}
      {isQuickRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[26px] w-full max-w-lg border border-[#EAEAEA] p-7 shadow-2xl relative">
            <button
              onClick={() => setQuickRunModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#D9F56F] flex items-center justify-center text-[#171717]">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Execute Engine Diagnostic Run</h3>
                <p className="text-xs text-[#777777] font-mono">Environment: lab-warehouse-alpha</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-[#555555]">
              <div className="p-4 rounded-[18px] bg-[#F7F7F7] border border-[#EAEAEA] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#777777]">Solver Pipeline:</span>
                  <span className="font-mono text-[#171717] font-bold">EKF + NLLS Refinement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Active Transceivers:</span>
                  <span className="font-mono text-[#171717]">6 Anchors (UWB / 4.49 GHz)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Degradation Profile:</span>
                  <span className="font-mono text-amber-700 font-semibold">σ = 0.15m (15% NLOS bias)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-[18px] bg-[#F5F2FE] border border-[#DDD6F8] text-[#4C3B9E]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#B6A9EF] mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Diagnostic Preview Mode: Initiating this diagnostic will exercise frontend status state transitions with the active positioning solver pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setQuickRunModalOpen(false)}>
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
