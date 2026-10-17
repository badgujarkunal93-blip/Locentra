import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';

interface LiveSpatialCanvas2DProps {
  className?: string;
  isLiveUpdating?: boolean;
}

export const LiveSpatialCanvas2D: React.FC<LiveSpatialCanvas2DProps> = ({
  className,
  isLiveUpdating = false,
}) => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const trajectory = useAppStore((s) => s.trajectory);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const setSelectedAnchorId = useAppStore((s) => s.setSelectedAnchorId);

  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas dimensions (aspect ratio ~1.5 for 12m x 8m room)
  const svgWidth = 560;
  const svgHeight = 380;
  const margin = { top: 28, right: 32, bottom: 36, left: 42 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const room = activeScenario.room;
  // Current point is the latest fix (or playback index)
  const currentPoint =
    trajectory.length > 0
      ? trajectory[playbackIndex] || trajectory[trajectory.length - 1]
      : { x: 9.34, y: 4.21, z: 1.1, estimatedX: 9.28, estimatedY: 4.18, timestamp: 0 };

  // Coordinate transforms (Meters -> SVG Pixels)
  const toSvgX = (xMeters: number) => margin.left + (xMeters / room.width) * plotWidth;
  const toSvgY = (yMeters: number) =>
    margin.top + ((room.length - yMeters) / room.length) * plotHeight; // Cartesian Y-up

  // Grid lines
  const xGridLines: number[] = [];
  for (let x = 0; x <= room.width; x += 2.0) {
    xGridLines.push(x);
  }

  const yGridLines: number[] = [];
  for (let y = 0; y <= room.length; y += 2.0) {
    yGridLines.push(y);
  }

  // Trajectory paths
  const gtPathPoints = trajectory
    .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
    .join(' ');

  const estPathPoints = trajectory
    .map((p) => `${toSvgX(p.estimatedX)},${toSvgY(p.estimatedY)}`)
    .join(' ');

  const currentSvgX = toSvgX(currentPoint.estimatedX);
  const currentSvgY = toSvgY(currentPoint.estimatedY);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-[#F8FAFC] rounded-2xl overflow-hidden select-none border border-[#E2E8F0] flex flex-col md:flex-row items-stretch p-3 gap-3 ${
        className || ''
      }`}
    >
      {/* Left / Center: Clean 2D Coordinate Grid Canvas without any overlays */}
      <div className="flex-1 min-w-0 h-full relative flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[380px]"
        >
          <defs>
            <style>{`
              @keyframes rayStream {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              .ray-stream {
                stroke-dasharray: 4, 4;
                animation: rayStream 1s linear infinite;
              }
              @keyframes pulseRing {
                0% { r: 8px; opacity: 0.9; }
                50% { r: 18px; opacity: 0.35; }
                100% { r: 28px; opacity: 0; }
              }
              .beacon-ring-1 {
                animation: pulseRing 1.8s ease-out infinite;
              }
              .beacon-ring-2 {
                animation: pulseRing 1.8s ease-out infinite 0.6s;
              }
            `}</style>
            <radialGradient id="beacon-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D9F56F" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#84CC16" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
            </radialGradient>
            <filter id="fix-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Room Floor Plane */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            rx="6"
          />

          {/* Vertical Grid Lines & X Labels */}
          {xGridLines.map((x) => {
            const svgX = toSvgX(x);
            return (
              <g key={`x-${x}`}>
                <line
                  x1={svgX}
                  y1={margin.top}
                  x2={svgX}
                  y2={margin.top + plotHeight}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text
                  x={svgX}
                  y={margin.top + plotHeight + 16}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {x}
                </text>
              </g>
            );
          })}

          {/* Horizontal Grid Lines & Y Labels */}
          {yGridLines.map((y) => {
            const svgY = toSvgY(y);
            return (
              <g key={`y-${y}`}>
                <line
                  x1={margin.left}
                  y1={svgY}
                  x2={margin.left + plotWidth}
                  y2={svgY}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text
                  x={margin.left - 8}
                  y={svgY + 3.5}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="end"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {/* Axis Units */}
          <text
            x={margin.left + plotWidth / 2}
            y={margin.top + plotHeight + 28}
            fill="#475569"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            textAnchor="middle"
          >
            X (m)
          </text>
          <text
            x={margin.left - 24}
            y={margin.top + plotHeight / 2}
            fill="#475569"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            textAnchor="middle"
            transform={`rotate(-90 ${margin.left - 24} ${margin.top + plotHeight / 2})`}
          >
            Y (m)
          </text>

          {/* Ground Truth Trajectory (Dashed Green) */}
          {trajectory.length > 1 && (
            <polyline
              points={gtPathPoints}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="5,4"
              strokeOpacity="0.9"
            />
          )}

          {/* Estimated Trajectory (Solid Purple/Indigo) */}
          {trajectory.length > 1 && (
            <polyline
              points={estPathPoints}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeOpacity="0.95"
            />
          )}

          {/* Dynamic Traveling Range Rays from Active Anchors to Fix Node */}
          {activeScenario.anchors
            .filter((a) => a.isActive)
            .map((a) => {
              const anchorSvgX = toSvgX(a.x);
              const anchorSvgY = toSvgY(a.y);
              return (
                <line
                  key={`ray-${a.id}`}
                  x1={anchorSvgX}
                  y1={anchorSvgY}
                  x2={currentSvgX}
                  y2={currentSvgY}
                  stroke="#3B82F6"
                  className={isLiveUpdating ? 'ray-stream' : ''}
                  strokeDasharray="4,4"
                  strokeOpacity={isLiveUpdating ? 0.6 : 0.3}
                />
              );
            })}

          {/* Anchors A1..A6 */}
          {activeScenario.anchors.map((a) => {
            const anchorSvgX = toSvgX(a.x);
            const anchorSvgY = toSvgY(a.y);
            const isSelected = selectedAnchorId === a.id;
            const isTop = a.y > room.length / 2;
            const isRight = a.x > room.width / 2;

            return (
              <g
                key={a.id}
                className="cursor-pointer group"
                onClick={() => setSelectedAnchorId(isSelected ? null : a.id)}
              >
                {/* Anchor Active Halo */}
                {a.isActive && (
                  <circle
                    cx={anchorSvgX}
                    cy={anchorSvgY}
                    r={isSelected ? 14 : 9}
                    fill="#3B82F6"
                    fillOpacity="0.12"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Anchor Node Ring */}
                <circle
                  cx={anchorSvgX}
                  cy={anchorSvgY}
                  r="6"
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                />

                {/* Anchor Inner Dot */}
                <circle cx={anchorSvgX} cy={anchorSvgY} r="2.5" fill="#3B82F6" />

                {/* Anchor Label */}
                <text
                  x={anchorSvgX + (isRight ? -10 : 10)}
                  y={anchorSvgY + (isTop ? 14 : -8)}
                  fill="#1E3A8A"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                  textAnchor={isRight ? 'end' : 'start'}
                >
                  {a.id}
                </text>
                <text
                  x={anchorSvgX + (isRight ? -10 : 10)}
                  y={anchorSvgY + (isTop ? 24 : 3)}
                  fill="#64748B"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor={isRight ? 'end' : 'start'}
                >
                  ({a.x}, {a.y}, {a.z ?? 2.8})
                </text>
              </g>
            );
          })}

          {/* Current Position Fix Beacon with Animated Pulses */}
          <g transform={`translate(${currentSvgX}, ${currentSvgY})`}>
            {/* Animated Concentric Expansion Rings */}
            <circle
              className="beacon-ring-1"
              fill="none"
              stroke="#84CC16"
              strokeWidth="1.5"
            />
            <circle
              className="beacon-ring-2"
              fill="none"
              stroke="#84CC16"
              strokeWidth="1.2"
            />
            {/* Static Radial Glow */}
            <circle r="18" fill="url(#beacon-glow)" />
            {/* Target Fix Node */}
            <circle r="7" fill="#84CC16" filter="url(#fix-shadow)" />
            <circle r="3" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Right Column: Dedicated Legend & Real-Time Coordinate HUD (Zero Overlap) */}
      <div className="w-full md:w-48 shrink-0 flex flex-col justify-between p-2.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
        {/* Legend Section */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold block mb-2">
            Legend
          </span>
          <div className="flex flex-col gap-2 text-[11px] text-[#475569]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-[#10B981] shrink-0" />
              <span>Ground Truth</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#6366F1] shrink-0" />
              <span>Estimated Path</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] shrink-0" />
              <span>Current Position</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#3B82F6] bg-white shrink-0" />
              <span>Anchor Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 border border-[#CBD5E1] bg-white rounded-xs shrink-0" />
              <span>Room Boundary</span>
            </div>
          </div>
        </div>

        {/* Current Position Telemetry Box */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono">
          <div className="flex items-center justify-between text-[11px] font-bold mb-2">
            <div className="flex items-center gap-1.5 text-[#0F172A]">
              <span className={`w-2 h-2 rounded-full ${isLiveUpdating ? 'bg-[#16A34A] animate-pulse' : 'bg-[#94A3B8]'}`} />
              <span>Current Position</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
              isLiveUpdating ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F1F5F9] text-[#64748B]'
            }`}>
              {isLiveUpdating ? 'LIVE' : 'DEMO'}
            </span>
          </div>

          <div className="space-y-1.5 text-[#475569]">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">X:</span>
              <span className="text-[#0F172A] font-bold">
                {currentPoint.estimatedX.toFixed(2)} m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Y:</span>
              <span className="text-[#0F172A] font-bold">
                {currentPoint.estimatedY.toFixed(2)} m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Z:</span>
              <span className="text-[#0F172A] font-bold">1.52 m</span>
            </div>
            <div className="pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
              <span>Fix Status:</span>
              <span className="text-[#10B981] font-semibold">Valid 3D Fix</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
