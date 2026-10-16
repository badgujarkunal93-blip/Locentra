import React from 'react';
import { 
  Radio, 
  Power, 
  Compass, 
  Signal, 
  Target, 
  Activity, 
  Cpu, 
  MapPin, 
  Layers 
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { calculateDistance } from './trajectoryUtils';

export const AnchorInspector: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const setSelectedAnchorId = useAppStore((s) => s.setSelectedAnchorId);
  const toggleAnchorActive = useAppStore((s) => s.toggleAnchorActive);
  const trajectory = useAppStore((s) => s.trajectory);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const simulationState = useAppStore((s) => s.simulationState);

  const currentPoint = trajectory[playbackIndex] || trajectory[0] || { x: 0, y: 0, z: 1.1, estimatedX: 0, estimatedY: 0, estimatedZ: 1.1, errorMeters: 0, isDegraded: false };
  const selectedAnchor = activeScenario.anchors.find((a) => a.id === selectedAnchorId) || activeScenario.anchors[0];

  const distanceToTarget = selectedAnchor && currentPoint
    ? calculateDistance(selectedAnchor, { x: currentPoint.x, y: currentPoint.y, z: currentPoint.z })
    : 0;

  const activeCount = activeScenario.anchors.filter((a) => a.isActive).length;
  const totalCount = activeScenario.anchors.length;

  const activeAlgorithmName = simulationState.lastRunResponse?.algorithm_name || simulationState.activeAlgorithmName || 'Robust NLS (Huber)';

  return (
    <div className="space-y-4">
      {/* 1. Anchor Inspector Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5E9] shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F1F4]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#171719]" />
            <h3 className="text-xs font-bold text-[#171719] tracking-tight uppercase font-mono">
              Anchor Inspector
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#74747B] font-semibold bg-[#F1F1F4] px-2.5 py-0.5 rounded-full border border-[#E5E5E9]">
            Anchor Nodes ({activeCount}/{totalCount} Active)
          </span>
        </div>

        {/* Anchor Selector Row (A1 - A6) */}
        <div className="pt-3">
          <div className="grid grid-cols-6 gap-1.5">
            {activeScenario.anchors.map((anchor) => {
              const isSelected = anchor.id === selectedAnchor?.id;
              return (
                <button
                  key={anchor.id}
                  onClick={() => setSelectedAnchorId(anchor.id)}
                  className={`py-2 px-1 rounded-xl text-center font-mono text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#D9F56F] text-[#171719] border-[#D9F56F] shadow-2xs ring-1 ring-[#171719]/15'
                      : anchor.isActive
                      ? 'bg-[#F8F9FA] text-[#171719] border-[#E5E5E9] hover:border-[#CCCCCC] hover:bg-[#F2F2F2]'
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

        {/* Selected Anchor Details */}
        {selectedAnchor && (
          <div className="mt-4 pt-3.5 border-t border-[#F1F1F4] space-y-3">
            {/* Title & Active Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedAnchor.isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`} />
                  <span className="font-bold text-[#171719] text-sm tracking-tight">
                    {selectedAnchor.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#74747B] mt-0.5">
                  {selectedAnchor.id === 'A1' ? 'North-West corner anchor' :
                   selectedAnchor.id === 'A2' ? 'North-East corner anchor' :
                   selectedAnchor.id === 'A3' ? 'South-East corner anchor' :
                   selectedAnchor.id === 'A4' ? 'South-West corner anchor' :
                   selectedAnchor.id === 'A5' ? 'Mid-North wall ceiling anchor' :
                   'Mid-South floor anchor'}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  selectedAnchor.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedAnchor.isActive ? 'Active' : 'Muted'}
                </span>
                <button
                  onClick={() => toggleAnchorActive(selectedAnchor.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedAnchor.isActive 
                      ? 'border-rose-200 text-rose-700 hover:bg-rose-50' 
                      : 'border-[#D9F56F] bg-[#D9F56F] text-[#171719] hover:bg-[#CEEA62]'
                  }`}
                  title={selectedAnchor.isActive ? 'Deactivate node' : 'Activate node'}
                >
                  <Power className="w-2.5 h-2.5" />
                  <span>{selectedAnchor.isActive ? 'Deactivate' : 'Activate Node'}</span>
                </button>
              </div>
            </div>

            {/* Structured Technical Key-Values matching Reference Mockup */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between text-[#334155]">
                <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Position (X, Y, Z)
                </span>
                <span className="font-bold text-[#171719] text-[11px]">
                  {selectedAnchor.x.toFixed(2)} m, {selectedAnchor.y.toFixed(2)} m, {(selectedAnchor.z ?? 2.8).toFixed(2)} m
                </span>
              </div>

              <div className="flex items-center justify-between text-[#334155]">
                <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
                  <Signal className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Signal context
                </span>
                <span className="font-medium text-[#171719] text-[11px]">
                  {selectedAnchor.nlosProb > 0.25 ? 'Non-line-of-sight (NLOS)' : 'Line of sight (simulated)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#334155]">
                <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Measurement count
                </span>
                <span className="font-bold text-[#171719] text-[11px]">
                  {trajectory.length} / {trajectory.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#334155]">
                <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-[#94A3B8]" />
                  NLOS indication
                </span>
                <span className="font-medium text-[#171719] text-[11px]">
                  {(selectedAnchor.nlosProb * 100).toFixed(0)}% (simulated)
                </span>
              </div>

              <div className="flex items-center justify-between text-[#334155] pt-1.5 border-t border-[#F1F1F4]">
                <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
                  <Target className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Distance to target
                </span>
                <span className="font-bold text-[#171719] text-[11px] bg-[#F1F1F4] px-2 py-0.5 rounded-md">
                  {distanceToTarget.toFixed(2)} m
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Current Position Estimate Card matching Reference Mockup */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E5E9] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F1F4]">
          <h4 className="text-xs font-bold text-[#171719] tracking-tight uppercase font-mono">
            Current Position Estimate
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
            Frame {playbackIndex + 1} / {trajectory.length}
          </span>
        </div>

        <div className="space-y-2.5 pt-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
              Ground Truth (X, Y)
            </span>
            <span className="font-bold text-[#0F172A] text-[11px]">
              {currentPoint.x.toFixed(2)} m, {currentPoint.y.toFixed(2)} m
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
              <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
              Estimated (X, Y)
            </span>
            <span className="font-bold text-[#0F172A] text-[11px]">
              {currentPoint.estimatedX.toFixed(2)} m, {currentPoint.estimatedY.toFixed(2)} m
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#F1F1F4]">
            <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-[#E11D48]" />
              Displacement Error
            </span>
            <span className="font-bold text-[#E11D48] text-xs">
              {currentPoint.errorMeters.toFixed(2)} m
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#74747B] font-sans flex items-center gap-1.5 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-[#64748B]" />
              Active Solver
            </span>
            <span className="font-semibold text-[#171719] text-[11px]">
              {activeAlgorithmName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
