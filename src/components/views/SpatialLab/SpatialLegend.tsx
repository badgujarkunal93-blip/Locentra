import React from 'react';
import { Badge } from '../../ui/Badge';
import { useAppStore } from '../../../store/useAppStore';

export const SpatialLegend: React.FC<{ className?: string }> = ({ className }) => {
  const simulationState = useAppStore((s) => s.simulationState);
  const isLiveBackend = simulationState.dataSource === 'backend';

  return (
    <div className={`p-3.5 px-4 rounded-[18px] bg-white border border-[#EAEAEA] text-xs shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777] font-bold whitespace-nowrap">
            Spatial Symbology Legend
          </span>
          <Badge variant={isLiveBackend ? 'lime' : 'illustrative'} size="sm">
            {isLiveBackend ? 'Live Engine' : 'Demo Baseline'}
          </Badge>
        </div>

        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[11px] font-mono">
          {/* Ground Truth */}
          <div className="flex items-center gap-1.5" title="Ground truth reference coordinates (Cyan radar)">
            <div className="w-3.5 h-3.5 rounded-full bg-[#E0F2FE] border border-[#0284C7] flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
            </div>
            <span className="text-[#0369A1] font-bold">Ground Truth</span>
          </div>

          {/* Position Estimate */}
          <div className="flex items-center gap-1.5" title="Solver estimated positioning coordinate (Lime diamond)">
            <div className="w-2.5 h-2.5 rotate-45 bg-[#D9F56F] border border-[#171717] shrink-0" />
            <span className="text-[#171717] font-bold">Position Estimate</span>
          </div>

          {/* Position Error */}
          <div className="flex items-center gap-1.5" title="Euclidean displacement vector between GT and estimate">
            <div className="w-3.5 h-0 border-b-2 border-[#F43F5E] border-dashed shrink-0" />
            <span className="text-[#E11D48] font-bold">Position Error</span>
          </div>

          {/* Active Anchor */}
          <div className="flex items-center gap-1.5" title="Active UWB anchor beacon in trilateration matrix">
            <div className="w-3 h-3 rounded-full bg-[#D9F56F] border border-[#171717] flex items-center justify-center shrink-0">
              <div className="w-1 h-1 rounded-full bg-[#171717]" />
            </div>
            <span className="text-[#171717] font-bold">Active Anchor</span>
          </div>

          {/* Inactive Anchor */}
          <div className="flex items-center gap-1.5" title="Muted or excluded anchor beacon">
            <div className="w-3 h-3 rounded-full bg-[#F1F5F9] border border-[#94A3B8] shrink-0 relative flex items-center justify-center">
              <div className="w-2 h-0.5 bg-[#94A3B8] rotate-45" />
            </div>
            <span className="text-[#64748B]">Inactive Anchor</span>
          </div>

          {/* Range Measurement */}
          <div className="flex items-center gap-1.5" title="Simulated time-of-flight distance ray from anchor to target">
            <div className="w-3.5 h-0 border-b-2 border-[#F59E0B] border-dashed shrink-0" />
            <span className="text-[#B45309] font-bold">Range Measurement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
