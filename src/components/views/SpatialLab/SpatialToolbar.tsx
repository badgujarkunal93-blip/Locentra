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
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3 px-4 rounded-[18px] bg-white border border-[#EAEAEA] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)]">
      {/* Left: View Mode Segmented Switch & Layer Toggles */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Tabs<SpatialViewMode>
          size="sm"
          options={[
            { id: '2d', label: '2D Floor Plan' },
            { id: '3d', label: '3D Spatial Mesh' },
          ]}
          activeId={spatialViewMode}
          onChange={setSpatialViewMode}
        />

        <div className="h-4 w-px bg-[#EAEAEA] mx-0.5 hidden sm:block" />

        {/* Visibility Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={toggleGroundTruth}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer ${
              showGroundTruth
                ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                : 'bg-[#F8F9FA] text-[#888888] border-[#EAEAEA]'
            }`}
            title="Toggle Ground Truth Path (Cyan)"
          >
            GT Path
          </button>

          <button
            onClick={toggleEstimated}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer ${
              showEstimated
                ? 'bg-[#D9F56F] text-[#171717] border-[#D9F56F]'
                : 'bg-[#F8F9FA] text-[#888888] border-[#EAEAEA]'
            }`}
            title="Toggle Estimated Path (Lime)"
          >
            Est Path
          </button>

          <button
            onClick={toggleRangeRays}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer ${
              showRangeRays
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                : 'bg-[#F8F9FA] text-[#888888] border-[#EAEAEA]'
            }`}
            title="Toggle Range Measurement Rays"
          >
            Rays
          </button>

          <button
            onClick={toggleAnchorLabels}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer ${
              showAnchorLabels
                ? 'bg-[#232124] text-white border-[#232124]'
                : 'bg-[#F8F9FA] text-[#888888] border-[#EAEAEA]'
            }`}
            title="Toggle Anchor Labels"
          >
            Labels
          </button>
        </div>
      </div>

      {/* Right: Playback Controls & Scrubber */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        {/* Play/Pause/Step/Reset */}
        <div className="flex items-center gap-1.5">
          <Button
            size="xs"
            variant="secondary"
            onClick={resetPlayback}
            title="Reset to origin"
            aria-label="Reset trajectory playback"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>

          <Button
            size="xs"
            variant={isPlaying ? 'secondary' : 'primary'}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause trajectory playback' : 'Play trajectory playback'}
            className={!isPlaying ? 'bg-[#D9F56F] text-[#171717] border-[#D9F56F] hover:bg-[#CEEA62]' : ''}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </Button>

          <Button
            size="xs"
            variant="ghost"
            onClick={stepPlayback}
            disabled={isPlaying}
            title="Step forward 1 frame"
            aria-label="Step forward 1 frame"
          >
            <FastForward className="w-3 h-3" />
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center rounded-full bg-[#F3F4F6] p-0.5 border border-[#E5E7EB] font-mono text-[10px]">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer font-bold ${
                playbackSpeed === speed
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#64748B] hover:text-[#171717]'
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
            className="w-20 sm:w-28 accent-[#171717] bg-[#E5E7EB] h-1.5 rounded-full cursor-pointer"
            title={`Frame ${playbackIndex + 1} / ${trajectory.length}`}
          />
          <span className="font-mono text-[10px] text-[#64748B] font-bold whitespace-nowrap min-w-[42px]">
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
            <Maximize2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
