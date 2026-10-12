import React from 'react';
import { Badge } from '../../ui/Badge';

export const SpatialLegend: React.FC = () => {
  return (
    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-950/70 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Spatial Symbology Legend
        </span>
        <Badge variant="illustrative" size="sm">
          Demo Baseline
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
        {/* Ground Truth */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-400" />
          </div>
          <span className="text-cyan-300">Ground Truth</span>
        </div>

        {/* Demo Estimate */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rotate-45 bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-emerald-300">Demo Estimate</span>
        </div>

        {/* Error Vector */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0 border-b border-rose-400 border-dashed" />
          <span className="text-rose-300">Error Vector</span>
        </div>

        {/* Active Anchor */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-slate-200">Active Anchor</span>
        </div>

        {/* Inactive Anchor */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
          <span className="text-slate-400">Deactivated</span>
        </div>

        {/* Range Measurement */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0 border-b border-amber-400 border-dashed" />
          <span className="text-amber-300">Range Ray</span>
        </div>
      </div>
    </div>
  );
};
