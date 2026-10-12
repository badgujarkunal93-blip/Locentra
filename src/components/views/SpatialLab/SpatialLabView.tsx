import React, { useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FloorPlan2D } from './FloorPlan2D';
import { SpatialScene3D } from './SpatialScene3D';
import { SpatialToolbar } from './SpatialToolbar';
import { AnchorInspector } from './AnchorInspector';
import { SpatialLegend } from './SpatialLegend';
import { 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Sliders, 
  Radio, 
  Maximize2, 
  Gauge, 
  Activity 
} from 'lucide-react';

export const SpatialLabView: React.FC = () => {
  const spatialViewMode = useAppStore((s) => s.spatialViewMode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const stepPlayback = useAppStore((s) => s.stepPlayback);
  const resetPlayback = useAppStore((s) => s.resetPlayback);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const activeScenario = useAppStore((s) => s.activeScenario);
  const trajectory = useAppStore((s) => s.trajectory);
  const simulationState = useAppStore((s) => s.simulationState);
  const resetToDemoTrajectory = useAppStore((s) => s.resetToDemoTrajectory);

  const room = activeScenario.room;
  const currentPoint = trajectory[playbackIndex] || trajectory[0] || { x: 0, y: 0, z: 0, errorMeters: 0, isDegraded: false };
  const activeAnchorsCount = activeScenario.anchors.filter((a) => a.isActive).length;
  const totalAnchorsCount = activeScenario.anchors.length;

  // Trajectory Playback Timer Hook with Proper Cleanup
  useEffect(() => {
    if (!isPlaying) return;

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
      {/* Notice & Origin Banner (State & Contextual Alert) */}
      <div className={`rounded-[18px] p-3 px-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] ${
        isLiveBackend 
          ? 'border-[#D9F56F]' 
          : 'border-[#EAEAEA]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isLiveBackend ? 'bg-[#D9F56F] text-[#171717]' : 'bg-[#DDD6F8] text-[#4C3B9E]'
          }`}>
            {isLiveBackend ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 shrink-0" />
            )}
          </div>
          <span className="text-[#555555]">
            {isLiveBackend && simulationState.lastRunResponse ? (
              <>
                <strong className="text-[#171717] font-bold">Live Positioning Trajectory:</strong> Computed by FastAPI backend solver <span className="font-mono font-bold text-[#171717]">{simulationState.lastRunResponse.algorithm_name}</span> ({simulationState.lastRunResponse.estimates.length} points | RMSE: {(simulationState.lastRunResponse.metrics.rmse_m ?? 0).toFixed(3)}m | Valid: {(simulationState.lastRunResponse.metrics.valid_estimate_rate * 100).toFixed(0)}%).
              </>
            ) : (
              <>
                <strong className="text-[#171717] font-bold">Interactive Spatial Lab:</strong> Rendering coordinate-accurate 2D & 3D dual viewports. Estimated trajectory shown is an explicitly deterministic demonstration baseline.
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isLiveBackend ? 'lime' : 'illustrative'} size="sm">
            {isLiveBackend ? `Live Engine: ${simulationState.selectedBackendSolver.toUpperCase()}` : 'Deterministic Demo'}
          </Badge>
          {isLiveBackend && (
            <Button
              size="xs"
              variant="secondary"
              onClick={resetToDemoTrajectory}
              leftIcon={<RotateCcw className="w-3 h-3" />}
            >
              Reset to Demo
            </Button>
          )}
          <Button
            size="xs"
            variant="primary"
            onClick={() => setActiveSection('scenario-studio')}
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Scenario Studio
          </Button>
        </div>
      </div>

      {/* A. Page Header: Title, Technical Subtitle, & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 rounded-[18px] bg-white border border-[#EAEAEA] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#777777]">
              Spatial Lab & Localisation Visualiser
            </span>
            <span className="sr-only">{isLiveBackend ? 'Phase 5 Backend' : 'Phase 2 Live'}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-mono text-[#555555]">
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveBackend ? 'bg-emerald-500 animate-pulse' : 'bg-[#171717]'}`} />
              {isLiveBackend ? 'Engine Connected' : 'Local Deterministic'}
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
            Spatial Simulation Lab
          </h1>
          <p className="text-xs text-[#666666] mt-0.5 max-w-2xl">
            Visualize room anchors and evaluate indoor positioning accuracy across synchronized 2D floor plans and 3D spatial meshes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setActiveSection('scenario-studio')}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="font-bold"
          >
            Run Simulation
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={resetPlayback}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset View
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection('scenario-studio')}
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
          >
            Scenario Settings
          </Button>
        </div>
      </div>

      {/* B. Compact Simulation Summary (Engineering Telemetry Bar) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Metric 1: Active Anchors */}
        <div className="rounded-[16px] bg-white border border-[#EAEAEA] p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#777777]">
              Active Anchors
            </p>
            <p className="text-xs sm:text-sm font-bold font-mono text-[#171717] mt-0.5">
              {activeAnchorsCount} / {totalAnchorsCount} Online
            </p>
            <p className="text-[10px] text-[#888888] font-sans truncate mt-0.5">
              {((activeAnchorsCount / totalAnchorsCount) * 100).toFixed(0)}% coverage operational
            </p>
          </div>
        </div>

        {/* Metric 2: Room Dimensions */}
        <div className="rounded-[16px] bg-white border border-[#EAEAEA] p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#777777]">
              Room Dimensions
            </p>
            <p className="text-xs sm:text-sm font-bold font-mono text-[#171717] mt-0.5">
              {room.width.toFixed(1)} m × {room.length.toFixed(1)} m × {room.height.toFixed(1)} m
            </p>
            <p className="text-[10px] text-[#888888] font-sans truncate mt-0.5">
              {(room.width * room.length).toFixed(0)} m² Floor · {(room.width * room.length * room.height).toFixed(0)} m³ Vol
            </p>
          </div>
        </div>

        {/* Metric 3: Position Error */}
        <div className="rounded-[16px] bg-white border border-[#EAEAEA] p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#777777]">
              {isLiveBackend ? 'Estimated RMSE' : 'Instant Error (Δe)'}
            </p>
            <p className="text-xs sm:text-sm font-bold font-mono text-[#171717] mt-0.5">
              {isLiveBackend && simulationState.lastRunResponse 
                ? `${(simulationState.lastRunResponse.metrics.rmse_m ?? 0).toFixed(3)} m`
                : `${currentPoint.errorMeters.toFixed(2)} m`}
            </p>
            <p className="text-[10px] text-[#888888] font-sans truncate mt-0.5">
              {isLiveBackend && simulationState.lastRunResponse
                ? `Valid rate ${(simulationState.lastRunResponse.metrics.valid_estimate_rate * 100).toFixed(0)}%`
                : `Frame ${playbackIndex + 1}/${trajectory.length} evaluated`}
            </p>
          </div>
        </div>

        {/* Metric 4: Simulation Status */}
        <div className="rounded-[16px] bg-white border border-[#EAEAEA] p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#777777]">
              Simulation Status
            </p>
            <p className="text-xs sm:text-sm font-bold font-mono text-[#171717] mt-0.5 truncate">
              {isLiveBackend ? 'FastAPI Live Engine' : 'Deterministic Demo'}
            </p>
            <p className="text-[10px] text-[#888888] font-sans truncate mt-0.5">
              {isLiveBackend ? (simulationState.lastRunResponse?.algorithm_name || 'Solver convergence verified') : 'Baseline test trajectory'}
            </p>
          </div>
        </div>
      </div>

      {/* C. Main Connected Workspace: 72:28 Width Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* LEFT REGION: Live Room Visualization & Integrated Controls (approx 72%) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-2.5">
          {/* Spatial Toolbar (Controls, visibility layers, scrubber) */}
          <SpatialToolbar onResetView={resetPlayback} />

          {/* Visualization Container (Hero Surface with Engineering Instrumentation) */}
          <div className="rounded-[20px] bg-[#070D10] border border-[#1E293B]/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
            {/* Plot Header Bar inside dark surface */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#13232C] bg-[#091318]/90">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9F56F] animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight font-mono">
                  Live Room Layout
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#13232C] text-[#88A6B3] border border-[#1E3845]">
                  {room.width.toFixed(1)}m × {room.length.toFixed(1)}m × {room.height.toFixed(1)}m
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#6A8896]">
                  {spatialViewMode === '2d' ? 'Top-Down Orthographic' : '3D Spatial Perspective'}
                </span>
              </div>
            </div>

            {/* Plotted Coordinate Canvas */}
            <div className="h-[340px] sm:h-[370px] lg:h-[390px] w-full overflow-hidden bg-[#070D10] relative">
              {spatialViewMode === '2d' ? (
                <FloorPlan2D />
              ) : (
                <SpatialScene3D />
              )}
            </div>
          </div>

          {/* Integrated Visualization Legend directly underneath the plot */}
          <SpatialLegend />
        </div>

        {/* RIGHT REGION: Anchor Inspector (approx 28%) */}
        <div className="lg:col-span-4 xl:col-span-4">
          <AnchorInspector />
        </div>
      </div>
    </div>
  );
};
