import React, { useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FloorPlan2D } from './FloorPlan2D';
import { SpatialScene3D } from './SpatialScene3D';
import { SpatialToolbar } from './SpatialToolbar';
import { AnchorInspector } from './AnchorInspector';
import { SpatialLegend } from './SpatialLegend';
import { Info, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export const SpatialLabView: React.FC = () => {
  const spatialViewMode = useAppStore((s) => s.spatialViewMode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const stepPlayback = useAppStore((s) => s.stepPlayback);
  const resetPlayback = useAppStore((s) => s.resetPlayback);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const simulationState = useAppStore((s) => s.simulationState);
  const resetToDemoTrajectory = useAppStore((s) => s.resetToDemoTrajectory);

  // Trajectory Playback Timer Hook with Proper Cleanup
  useEffect(() => {
    if (!isPlaying) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Interval based on playback speed (default: 120ms per step)
    const intervalMs = Math.max(30, Math.round(120 / playbackSpeed));
    const timer = setInterval(() => {
      stepPlayback();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, stepPlayback]);

  const isLiveBackend = simulationState.dataSource === 'backend';

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Notice & Origin Banner */}
      <div className={`rounded-xl p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isLiveBackend 
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-slate-900/80 border-amber-500/30'
      }`}>
        <div className="flex items-center gap-2.5">
          {isLiveBackend ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-300">
            {isLiveBackend && simulationState.lastRunResponse ? (
              <>
                <strong className="text-emerald-300">Live Positioning Trajectory:</strong> Computed by FastAPI backend solver <span className="font-mono font-bold text-emerald-200">{simulationState.lastRunResponse.algorithm_name}</span> ({simulationState.lastRunResponse.estimates.length} points | RMSE: {(simulationState.lastRunResponse.metrics.rmse_m ?? 0).toFixed(3)}m | Valid: {(simulationState.lastRunResponse.metrics.valid_estimate_rate * 100).toFixed(0)}%).
              </>
            ) : (
              <>
                <strong className="text-amber-300">Phase 2 Interactive Spatial Lab:</strong> Rendering coordinate-accurate 2D & 3D dual viewports. Estimated trajectory shown is an explicitly deterministic demonstration baseline.
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isLiveBackend ? 'mint' : 'illustrative'} size="sm">
            {isLiveBackend ? `Live Engine: ${simulationState.selectedBackendSolver.toUpperCase()}` : 'Deterministic Demo'}
          </Badge>
          {isLiveBackend && (
            <Button
              size="xs"
              variant="outline"
              onClick={resetToDemoTrajectory}
              leftIcon={<RotateCcw className="w-3 h-3" />}
            >
              Reset to Demo
            </Button>
          )}
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setActiveSection('scenario-studio')}
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Scenario Studio
          </Button>
        </div>
      </div>

      {/* Main Section Header */}
      <SectionHeader
        categoryTag="Spatial Intelligence"
        phaseBadge={isLiveBackend ? "Phase 5 Backend" : "Phase 2 Live"}
        title="Spatial Lab & Localisation Visualiser"
        subtitle="Coordinate-accurate 2D floor plan and lightweight 3D spatial room simulation synchronized through shared scenario state."
        className="pb-3 mb-3"
      />

      {/* Interactive Controls Toolbar */}
      <SpatialToolbar onResetView={resetPlayback} />

      {/* Main Spatial Canvas (Hero of the section) */}
      <div className="h-[480px] lg:h-[540px] w-full rounded-xl overflow-hidden shadow-2xl">
        {spatialViewMode === '2d' ? (
          <FloorPlan2D />
        ) : (
          <SpatialScene3D />
        )}
      </div>

      {/* Lower Grid: Anchor Inspector and Symbology Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpatialLegend />
        </div>
        <div>
          <AnchorInspector />
        </div>
      </div>
    </div>
  );
};
