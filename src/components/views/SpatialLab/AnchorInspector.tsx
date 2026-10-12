import React from 'react';
import { Power, Radio, Signal, Compass, Target } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
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

  const activeCount = activeScenario.anchors.filter((a) => a.isActive).length;
  const totalCount = activeScenario.anchors.length;

  return (
    <div className="bg-white rounded-[20px] p-5 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4 h-full">
      {/* Header and Anchor Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#171717]" />
            <h3 className="text-xs font-bold text-[#171717] tracking-tight uppercase font-mono">
              Anchor Inspector
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#555555] font-semibold">
            Anchor Nodes ({activeCount}/{totalCount} Active)
          </span>
        </div>

        {/* Anchor Selector Tabs: A1 to A6 */}
        <div>
          <div className="grid grid-cols-6 gap-1.5">
            {activeScenario.anchors.map((anchor) => {
              const isSelected = anchor.id === selectedAnchor?.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => setSelectedAnchorId(anchor.id)}
                  className={`py-2 px-1 rounded-xl text-center font-mono text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#D9F56F] text-[#171717] border-[#D9F56F] shadow-sm ring-1 ring-[#171717]/10'
                      : anchor.isActive
                      ? 'bg-[#F8F9FA] text-[#171717] border-[#EAEAEA] hover:border-[#CCCCCC] hover:bg-[#F2F2F2]'
                      : 'bg-[#F3F4F6] text-[#94A3B8] border-[#E5E7EB] line-through opacity-70'
                  }`}
                  title={`${anchor.name} - ${anchor.isActive ? 'Active' : 'Inactive'}`}
                >
                  {anchor.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Anchor Inspector Details */}
      {selectedAnchor && (
        <div className="space-y-3.5 pt-3 border-t border-[#F0F0F0] text-xs flex-1">
          {/* Selected Anchor Headline & Primary Action */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedAnchor.isActive ? 'bg-[#15803D]' : 'bg-[#94A3B8]'}`} />
                <span className="font-bold text-[#171717] text-sm tracking-tight">
                  {selectedAnchor.name}
                </span>
                <span className="text-[11px] font-mono text-[#777777] font-semibold">
                  ({selectedAnchor.id})
                </span>
              </div>
              <p className="text-[11px] text-[#777777] font-sans mt-0.5">
                {selectedAnchor.isActive ? 'Channel operational & broadcasting' : 'Node deactivated from trilateration'}
              </p>
            </div>

            <Button
              size="xs"
              variant={selectedAnchor.isActive ? 'outline' : 'primary'}
              leftIcon={<Power className="w-3 h-3" />}
              onClick={() => toggleAnchorActive(selectedAnchor.id)}
              className={selectedAnchor.isActive ? 'text-rose-700 hover:bg-rose-50 border-rose-200 shrink-0' : 'bg-[#D9F56F] text-[#171717] border-[#D9F56F] hover:bg-[#CEEA62] shrink-0 font-bold'}
            >
              {selectedAnchor.isActive ? 'Deactivate' : 'Activate Node'}
            </Button>
          </div>

          {/* Structured Telemetry Properties */}
          <div className="rounded-[16px] bg-[#F9FAFB] border border-[#EAEAEA] p-3.5 space-y-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-sans flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#64748B]" />
                Position (X, Y, Z):
              </span>
              <span className="text-[#171717] font-bold">
                X {selectedAnchor.x.toFixed(2)}m · Y {selectedAnchor.y.toFixed(2)}m · Z {selectedAnchor.z?.toFixed(2) ?? '2.80'}m
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-sans flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-[#64748B]" />
                Status:
              </span>
              <span className={selectedAnchor.isActive ? 'text-[#15803D] font-bold' : 'text-[#64748B]'}>
                {selectedAnchor.isActive ? 'Active (Broadcasting)' : 'Muted / Isolated'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-sans flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-[#64748B]" />
                Signal condition:
              </span>
              <span className="text-[#171717] capitalize font-medium">
                {selectedAnchor.status || 'Healthy'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-sans">Signal obstruction:</span>
              <span className="text-[#171717] font-bold">
                {(selectedAnchor.nlosProb * 100).toFixed(0)}% NLOS
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
              <span className="text-[#64748B] font-sans flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#64748B]" />
                Distance to Target:
              </span>
              <span className="text-[#171717] font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                {distanceToTarget.toFixed(2)} m
              </span>
            </div>
          </div>

          {/* Real-time Target Coordinates Telemetry Pill */}
          <div className="p-3 rounded-[16px] bg-[#F7F5FE] border border-[#DDD6F8] text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#555555] font-sans font-medium">Current Target Frame:</span>
              <span className="text-[#4C3B9E] font-bold">Step {playbackIndex + 1}/{trajectory.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-[#666666]">GT: ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)})</span>
              <span className="text-[#4C3B9E] font-semibold">Est: ({currentPoint.estimatedX.toFixed(2)}, {currentPoint.estimatedY.toFixed(2)})</span>
            </div>
            <div className="text-[10px] text-[#777777] pt-0.5 border-t border-[#EADDFB]/70 flex justify-between">
              <span>Error Displacement (Δe):</span>
              <span className="font-bold text-[#E11D48]">{currentPoint.errorMeters.toFixed(2)} m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
