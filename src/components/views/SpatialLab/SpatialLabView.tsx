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
import { Info, ArrowRight } from 'lucide-react';

export const SpatialLabView: React.FC = () => {
  const spatialViewMode = useAppStore((s) => s.spatialViewMode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const stepPlayback = useAppStore((s) => s.stepPlayback);
  const resetPlayback = useAppStore((s) => s.resetPlayback);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

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

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Illustrative Notice Banner */}
      <div className="rounded-xl p-3 bg-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong className="text-emerald-300">Phase 2 Interactive Spatial Lab:</strong> Rendering coordinate-accurate 2D & 3D dual viewports from shared Zustand state. Estimated trajectory shown is an explicitly deterministic demonstration baseline.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="illustrative" size="sm">
            Deterministic Demo
          </Badge>
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
        phaseBadge="Phase 2 Live"
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
