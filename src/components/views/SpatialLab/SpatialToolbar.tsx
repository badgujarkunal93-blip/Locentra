import React from 'react';
import { 
  Play, 
  Pause, 
  Square,
  FastForward, 
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

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

  // Layer Toggles
  const showGroundTruth = useAppStore((s) => s.showGroundTruth);
  const toggleGroundTruth = useAppStore((s) => s.toggleGroundTruth);
  const showEstimated = useAppStore((s) => s.showEstimated);
  const toggleEstimated = useAppStore((s) => s.toggleEstimated);
  const showAnchorLabels = useAppStore((s) => s.showAnchorLabels);
  const toggleAnchorLabels = useAppStore((s) => s.toggleAnchorLabels);
  const showRangeRays = useAppStore((s) => s.showRangeRays);
  const toggleRangeRays = useAppStore((s) => s.toggleRangeRays);

  const speedOptions = [0.5, 1.0, 2.0, 5.0];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2.5 px-3.5 bg-white border-b border-[#E5E5E9] select-none">
      {/* Left: View Mode Tabs & Layer Filter Pills */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* View Mode Tabs matching Reference Mockup */}
        <div className="flex items-center p-1 bg-[#F1F1F4] rounded-xl border border-[#E5E5E9]">
          <button
            role="tab"
            aria-selected={spatialViewMode === '2d'}
            onClick={() => setSpatialViewMode('2d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              spatialViewMode === '2d'
                ? 'bg-white text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719]'
            }`}
          >
            2D Floor Plan
          </button>
          <button
            role="tab"
            aria-selected={spatialViewMode === '3d'}
            onClick={() => setSpatialViewMode('3d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              spatialViewMode === '3d'
                ? 'bg-white text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719]'
            }`}
          >
            3D Spatial Mesh
          </button>
        </div>

        {/* Visibility Layer Toggles */}
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
                ? 'bg-[#D9F56F] text-[#171719] border-[#D9F56F]'
                : 'bg-[#F8F9FA] text-[#888888] border-[#EAEAEA]'
            }`}
            title="Toggle Estimated Path (Purple/Lime)"
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

      {/* Right: Playback Controls, Speeds, and Timeline Scrubber */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        {/* Play/Pause/Stop Buttons matching Reference Mockup */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying}
            title="Play"
            aria-label="Play trajectory playback"
            className="w-8 h-8 rounded-lg bg-[#D9F56F] hover:bg-[#cbe85f] text-[#171719] flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-bold"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
            title="Pause"
            aria-label="Pause trajectory playback"
            className="w-8 h-8 rounded-lg bg-[#F1F1F4] hover:bg-[#E5E5E9] text-[#171719] flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={resetPlayback}
            title="Stop & Reset"
            aria-label="Reset trajectory playback"
            className="w-8 h-8 rounded-lg bg-[#F1F1F4] hover:bg-[#E5E5E9] text-[#171719] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>

          <button
            onClick={stepPlayback}
            disabled={isPlaying}
            title="Step forward 1 frame"
            aria-label="Step forward 1 frame"
            className="w-8 h-8 rounded-lg bg-[#F1F1F4] hover:bg-[#E5E5E9] text-[#64748B] hover:text-[#171719] flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-40"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector Pills matching Reference Mockup */}
        <div className="flex items-center rounded-xl bg-[#F1F1F4] p-0.5 border border-[#E5E5E9] font-mono text-[11px]">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                playbackSpeed === speed
                  ? 'bg-[#D9F56F] text-[#171719] shadow-2xs'
                  : 'text-[#74747B] hover:text-[#171719]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Timeline Frame Scrubber */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#74747B] font-medium hidden md:inline">Frame</span>
          <input
            type="range"
            min="0"
            max={Math.max(0, trajectory.length - 1)}
            value={playbackIndex}
            onChange={(e) => setPlaybackIndex(parseInt(e.target.value, 10))}
            className="w-20 sm:w-28 accent-[#171719] bg-[#E5E7EB] h-1.5 rounded-full cursor-pointer"
            title={`Frame ${playbackIndex + 1} / ${trajectory.length}`}
          />
          <span className="font-mono text-[11px] text-[#171719] font-bold whitespace-nowrap min-w-[55px]">
            {playbackIndex + 1} / {trajectory.length}
          </span>
        </div>

        {/* Reset / Fit View Button */}
        {onResetView && (
          <button
            onClick={onResetView}
            title="Reset View / Camera"
            aria-label="Reset View or Camera"
            className="w-8 h-8 rounded-lg bg-[#F1F1F4] hover:bg-[#E5E5E9] text-[#64748B] hover:text-[#171719] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
