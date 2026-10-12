import React from 'react';
import { Power } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { calculateDistance } from './trajectoryUtils';

export const AnchorInspector: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const setSelectedAnchorId = useAppStore((s) => s.setSelectedAnchorId);
  const toggleAnchorActive = useAppStore((s) => s.toggleAnchorActive);
  const trajectory = useAppStore((s) => s.trajectory);
  const playbackIndex = useAppStore((s) => s.playbackIndex);

  const currentPoint = trajectory[playbackIndex] || trajectory[0];
  const selectedAnchor = activeScenario.anchors.find((a) => a.id === selectedAnchorId) || activeScenario.anchors[0];

  const distanceToTarget = selectedAnchor && currentPoint
    ? calculateDistance(selectedAnchor, { x: currentPoint.x, y: currentPoint.y, z: currentPoint.z })
    : 0;

  return (
    <Card className="border border-emerald-900/40 p-4 space-y-4">
      {/* Anchor Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Anchor Nodes ({activeScenario.anchors.filter((a) => a.isActive).length}/{activeScenario.anchors.length} Active)
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80">Click node to inspect</span>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {activeScenario.anchors.map((anchor) => {
            const isSelected = anchor.id === selectedAnchor?.id;
            return (
              <button
                key={anchor.id}
                onClick={() => setSelectedAnchorId(anchor.id)}
                className={`py-1.5 px-1 rounded text-center font-mono text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_#10b981]'
                    : anchor.isActive
                    ? 'bg-slate-900/90 text-emerald-300 border-emerald-800/40 hover:border-emerald-500/60'
                    : 'bg-slate-950 text-slate-600 border-slate-800/60 line-through'
                }`}
                title={`${anchor.name} - ${anchor.isActive ? 'Active' : 'Inactive'}`}
              >
                {anchor.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Anchor Inspector Details */}
      {selectedAnchor && (
        <div className="space-y-3 pt-2 border-t border-slate-800/70 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  selectedAnchor.isActive
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-slate-700'
                }`}
              />
              <span className="font-semibold text-slate-100">{selectedAnchor.name}</span>
            </div>

            <Button
              size="xs"
              variant={selectedAnchor.isActive ? 'outline' : 'primary'}
              leftIcon={<Power className="w-3 h-3" />}
              onClick={() => toggleAnchorActive(selectedAnchor.id)}
              className={selectedAnchor.isActive ? 'text-amber-300 hover:text-rose-400' : ''}
            >
              {selectedAnchor.isActive ? 'Deactivate' : 'Activate Node'}
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Coordinates (X, Y, Z):</span>
              <span className="text-emerald-300 font-bold">
                {selectedAnchor.x.toFixed(2)}m, {selectedAnchor.y.toFixed(2)}m, {selectedAnchor.z?.toFixed(2)}m
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Active Channel State:</span>
              <span className={selectedAnchor.isActive ? 'text-emerald-400' : 'text-slate-500'}>
                {selectedAnchor.isActive ? 'Broadcasting (ToF/UWB)' : 'Muted / Isolated'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Channel Condition:</span>
              <span className="text-slate-200 capitalize">
                {selectedAnchor.status} (NLOS: {(selectedAnchor.nlosProb * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="flex justify-between pt-1 border-t border-slate-900">
              <span className="text-slate-400 font-sans">Distance to Target:</span>
              <span className="text-cyan-400 font-bold">
                {distanceToTarget.toFixed(2)} m
              </span>
            </div>
          </div>

          {/* Real-time Target Coordinates Pill */}
          <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-[11px] font-mono flex items-center justify-between">
            <span className="text-slate-400 font-sans">Target Position:</span>
            <span className="text-cyan-300">
              GT ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)}) • Est ({currentPoint.estimatedX.toFixed(2)}, {currentPoint.estimatedY.toFixed(2)})
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
