import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';
import { SpatialViewMode } from '../../../types/scenario';

interface SpatialToolbarProps {
  onResetView?: () => void;
}

export const SpatialToolbar: React.FC<SpatialToolbarProps> = ({ onResetView }) => {
  const spatialViewMode = useAppStore((s) => s.spatialViewMode);
  const setSpatialViewMode = useAppStore((s) => s.setSpatialViewMode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const setIsPlaying = useAppStore((s) => s.setIsPlaying);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const setPlaybackIndex = useAppStore((s) => s.setPlaybackIndex);
  const trajectory = useAppStore((s) => s.trajectory);
  const resetPlayback = useAppStore((s) => s.resetPlayback);
  const stepPlayback = useAppStore((s) => s.stepPlayback);

  // Toggles
  const showGroundTruth = useAppStore((s) => s.showGroundTruth);
  const toggleGroundTruth = useAppStore((s) => s.toggleGroundTruth);
  const showEstimated = useAppStore((s) => s.showEstimated);
  const toggleEstimated = useAppStore((s) => s.toggleEstimated);
  const showAnchorLabels = useAppStore((s) => s.showAnchorLabels);
  const toggleAnchorLabels = useAppStore((s) => s.toggleAnchorLabels);
  const showRangeRays = useAppStore((s) => s.showRangeRays);
  const toggleRangeRays = useAppStore((s) => s.toggleRangeRays);

  const speedOptions = [0.5, 1.0, 2.0];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-[#091114]/90 border border-emerald-950/80 backdrop-blur-md">
      {/* Left: View Mode Segmented Switch & Layer Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tabs<SpatialViewMode>
          size="sm"
          options={[
            { id: '2d', label: '2D Floor Plan' },
            { id: '3d', label: '3D Spatial Mesh' },
          ]}
          activeId={spatialViewMode}
          onChange={setSpatialViewMode}
        />

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Visibility Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={toggleGroundTruth}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-all cursor-pointer ${
              showGroundTruth
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Ground Truth Path (Cyan)"
          >
            GT Path
          </button>

          <button
            onClick={toggleEstimated}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-all cursor-pointer ${
              showEstimated
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Estimated Path (Mint)"
          >
            Est Path
          </button>

          <button
            onClick={toggleRangeRays}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-all cursor-pointer ${
              showRangeRays
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Range Measurement Rays"
          >
            Rays
          </button>

          <button
            onClick={toggleAnchorLabels}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-all cursor-pointer ${
              showAnchorLabels
                ? 'bg-slate-800/80 text-slate-200 border-slate-600/50'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Anchor Labels"
          >
            Labels
          </button>
        </div>
      </div>

      {/* Right: Playback Controls & Scrubber */}
      <div className="flex items-center gap-3">
        {/* Play/Pause/Step/Reset */}
        <div className="flex items-center gap-1.5">
          <Button
            size="xs"
            variant="secondary"
            onClick={resetPlayback}
            title="Reset to origin"
            aria-label="Reset trajectory playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="xs"
            variant={isPlaying ? 'secondary' : 'primary'}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause trajectory playback' : 'Play trajectory playback'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </Button>

          <Button
            size="xs"
            variant="ghost"
            onClick={stepPlayback}
            disabled={isPlaying}
            title="Step forward 1 frame"
            aria-label="Step forward 1 frame"
          >
            <FastForward className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800/80 font-mono text-[10px]">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Progress Timeline Scrubber */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={trajectory.length - 1}
            value={playbackIndex}
            onChange={(e) => setPlaybackIndex(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 accent-emerald-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            title={`Frame ${playbackIndex + 1} / ${trajectory.length}`}
          />
          <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap min-w-[45px]">
            {playbackIndex + 1}/{trajectory.length}
          </span>
        </div>

        {/* Reset Camera / Fit view */}
        {onResetView && (
          <Button
            size="xs"
            variant="outline"
            onClick={onResetView}
            title="Reset View / Camera"
            aria-label="Reset View or Camera"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
