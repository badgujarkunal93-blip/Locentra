import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';

interface FloorPlan2DProps {
  className?: string;
}

export const FloorPlan2D: React.FC<FloorPlan2DProps> = ({ className }) => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const setSelectedAnchorId = useAppStore((s) => s.setSelectedAnchorId);
  const trajectory = useAppStore((s) => s.trajectory);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const showGroundTruth = useAppStore((s) => s.showGroundTruth);
  const showEstimated = useAppStore((s) => s.showEstimated);
  const showAnchorLabels = useAppStore((s) => s.showAnchorLabels);
  const showRangeRays = useAppStore((s) => s.showRangeRays);

  const containerRef = useRef<HTMLDivElement>(null);

  // SVG Drawing canvas dimensions
  const svgWidth = 920;
  const svgHeight = 600;
  const margin = { top: 40, right: 35, bottom: 45, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const room = activeScenario.room;
  const currentPoint = trajectory[playbackIndex] || trajectory[0];

  // Mathematical Coordinate Transformation: Meters -> SVG Pixels
  const toSvgX = (xMeters: number) => margin.left + (xMeters / room.width) * plotWidth;
  const toSvgY = (yMeters: number) => margin.top + (yMeters / room.length) * plotHeight;

  // Grid line generation
  const xGridLines: number[] = [];
  for (let x = 0; x <= room.width; x += 1.0) {
    xGridLines.push(x);
  }

  const yGridLines: number[] = [];
  for (let y = 0; y <= room.length; y += 1.0) {
    yGridLines.push(y);
  }

  // Trajectory SVG Polyline Points
  const gtPathPoints = trajectory
    .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
    .join(' ');

  const estPathPoints = trajectory
    .map((p) => `${toSvgX(p.estimatedX)},${toSvgY(p.estimatedY)}`)
    .join(' ');

  const traveledGtPoints = trajectory
    .slice(0, playbackIndex + 1)
    .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#070D10] rounded-2xl overflow-hidden select-none ${className || ''}`}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full"
        style={{ minHeight: '320px' }}
      >
        <defs>
          {/* Subtle Glow Filter */}
          <filter id="anchor-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="target-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Room Floor Plane Background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="#070D10"
          stroke="#16393E"
          strokeWidth="1.5"
          rx="8"
        />

        {/* Metre Grid Lines: Vertical */}
        {xGridLines.map((x) => {
          const svgX = toSvgX(x);
          const isMajor = x % 2 === 0;
          return (
            <g key={`x-grid-${x}`}>
              <line
                x1={svgX}
                y1={margin.top}
                x2={svgX}
                y2={margin.top + plotHeight}
                stroke={isMajor ? '#193C45' : '#10272E'}
                strokeWidth={isMajor ? 1 : 0.5}
                strokeOpacity={isMajor ? 0.75 : 0.45}
                strokeDasharray={isMajor ? undefined : '2,3'}
              />
              {/* X Axis Label */}
              {isMajor && (
                <text
                  x={svgX}
                  y={margin.top + plotHeight + 18}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {x.toFixed(0)}m
                </text>
              )}
            </g>
          );
        })}

        {/* Metre Grid Lines: Horizontal */}
        {yGridLines.map((y) => {
          const svgY = toSvgY(y);
          const isMajor = y % 2 === 0;
          return (
            <g key={`y-grid-${y}`}>
              <line
                x1={margin.left}
                y1={svgY}
                x2={margin.left + plotWidth}
                y2={svgY}
                stroke={isMajor ? '#193C45' : '#10272E'}
                strokeWidth={isMajor ? 1 : 0.5}
                strokeOpacity={isMajor ? 0.75 : 0.45}
                strokeDasharray={isMajor ? undefined : '2,3'}
              />
              {/* Y Axis Label */}
              {isMajor && (
                <text
                  x={margin.left - 12}
                  y={svgY + 3.5}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {y.toFixed(0)}m
                </text>
              )}
            </g>
          );
        })}

        {/* Axis Titles */}
        <text
          x={margin.left + plotWidth / 2}
          y={margin.top + plotHeight + 36}
          fill="#94a3b8"
          fontSize="11"
          fontFamily="Inter"
          textAnchor="middle"
          fontWeight="500"
        >
          Room Width (X Axis — Metres)
        </text>

        <text
          x={16}
          y={margin.top + plotHeight / 2}
          fill="#94a3b8"
          fontSize="11"
          fontFamily="Inter"
          textAnchor="middle"
          transform={`rotate(-90, 16, ${margin.top + plotHeight / 2})`}
          fontWeight="500"
        >
          Room Length (Y Axis — Metres)
        </text>

        {/* Trajectory Background Full Trace (Faded) */}
        {showGroundTruth && (
          <polyline
            points={gtPathPoints}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
        )}

        {showEstimated && (
          <polyline
            points={estPathPoints}
            fill="none"
            stroke="#D9F56F"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            strokeDasharray="4,3"
          />
        )}

        {/* Traveled Ground Truth Segment (Bright Cyan) */}
        {showGroundTruth && traveledGtPoints && (
          <polyline
            points={traveledGtPoints}
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        )}

        {/* Range Measurement Rays from Active Anchors to Current Target */}
        {showRangeRays &&
          activeScenario.anchors
            .filter((a) => a.isActive)
            .map((anchor) => {
              const ax = toSvgX(anchor.x);
              const ay = toSvgY(anchor.y);
              const tx = toSvgX(currentPoint.x);
              const ty = toSvgY(currentPoint.y);
              const midX = (ax + tx) / 2;
              const midY = (ay + ty) / 2;
              const dist = Math.hypot(anchor.x - currentPoint.x, anchor.y - currentPoint.y);

              return (
                <g key={`ray-${anchor.id}`}>
                  <line
                    x1={ax}
                    y1={ay}
                    x2={tx}
                    y2={ty}
                    stroke="#F59E0B"
                    strokeWidth="1.25"
                    strokeDasharray="4,3"
                    strokeOpacity="0.55"
                  />
                  {/* Distance badge on ray */}
                  <rect
                    x={midX - 18}
                    y={midY - 9}
                    width="36"
                    height="18"
                    fill="#070D10"
                    rx="4"
                    stroke="#F59E0B"
                    strokeWidth="0.75"
                    strokeOpacity="0.7"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {dist.toFixed(1)}m
                  </text>
                </g>
              );
            })}

        {/* Error Displacement Vector Line Between GT and Estimated */}
        {currentPoint && (
          <line
            x1={toSvgX(currentPoint.x)}
            y1={toSvgY(currentPoint.y)}
            x2={toSvgX(currentPoint.estimatedX)}
            y2={toSvgY(currentPoint.estimatedY)}
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            opacity="0.95"
          />
        )}

        {/* Estimated Target Position Marker (Lime Diamond or Amber if degraded) */}
        {showEstimated && currentPoint && (
          <g transform={`translate(${toSvgX(currentPoint.estimatedX)}, ${toSvgY(currentPoint.estimatedY)})`}>
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              fill={currentPoint.isDegraded ? "#F59E0B" : "#D9F56F"}
              stroke={currentPoint.isDegraded ? "#FDE68A" : "#171717"}
              strokeWidth="1.5"
              strokeDasharray={currentPoint.isDegraded ? "2,2" : undefined}
              transform="rotate(45)"
              filter="url(#target-glow)"
            />
            <rect
              x="-2"
              y="-2"
              width="4"
              height="4"
              fill={currentPoint.isDegraded ? "#78350F" : "#171717"}
              transform="rotate(45)"
            />
          </g>
        )}

        {/* Ground Truth Target Marker (Cyan Radar Ring + Center Dot) */}
        {showGroundTruth && currentPoint && (
          <g transform={`translate(${toSvgX(currentPoint.x)}, ${toSvgY(currentPoint.y)})`}>
            <circle
              r="10"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.5"
              strokeOpacity="0.65"
              className="animate-pulse"
            />
            <circle
              r="4.5"
              fill="#22D3EE"
              stroke="#042F2E"
              strokeWidth="1.5"
              filter="url(#target-glow)"
            />
            {/* Crosshair lines */}
            <line x1="-14" y1="0" x2="-6" y2="0" stroke="#22D3EE" strokeWidth="1.5" />
            <line x1="6" y1="0" x2="14" y2="0" stroke="#22D3EE" strokeWidth="1.5" />
            <line x1="0" y1="-14" x2="0" y2="-6" stroke="#22D3EE" strokeWidth="1.5" />
            <line x1="0" y1="6" x2="0" y2="14" stroke="#22D3EE" strokeWidth="1.5" />

            {/* Error label beside target */}
            <text
              x="16"
              y="-6"
              fill="#F8FAFC"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
            >
              GT ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)})
            </text>
            <text
              x="16"
              y="7"
              fill={currentPoint.isDegraded ? "#FBBF24" : "#F43F5E"}
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
            >
              Δe: {currentPoint.errorMeters.toFixed(2)}m {currentPoint.isDegraded ? `[${currentPoint.status || 'DEGRADED'}]` : ''}
            </text>
          </g>
        )}

        {/* Anchor Nodes */}
        {activeScenario.anchors.map((anchor) => {
          const ax = toSvgX(anchor.x);
          const ay = toSvgY(anchor.y);
          const isSelected = anchor.id === selectedAnchorId;
          const isActive = anchor.isActive;

          return (
            <g
              key={anchor.id}
              onClick={() => setSelectedAnchorId(anchor.id)}
              className="cursor-pointer group"
            >
              {/* Selected Highlight Ring */}
              {isSelected && (
                <circle
                  cx={ax}
                  cy={ay}
                  r="20"
                  fill="none"
                  stroke="#D9F56F"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  opacity="0.9"
                  className="animate-spin"
                  style={{ transformOrigin: `${ax}px ${ay}px`, animationDuration: '6s' }}
                />
              )}

              {/* Anchor Beacon Halo */}
              {isActive ? (
                <>
                  <circle
                    cx={ax}
                    cy={ay}
                    r="12"
                    fill="#D9F56F"
                    fillOpacity="0.16"
                    stroke="#D9F56F"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                  />
                  <circle
                    cx={ax}
                    cy={ay}
                    r="6"
                    fill="#D9F56F"
                    stroke="#171717"
                    strokeWidth="2"
                    filter="url(#anchor-glow)"
                  />
                </>
              ) : (
                <>
                  <circle
                    cx={ax}
                    cy={ay}
                    r="9"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                  />
                  <line
                    x1={ax - 5}
                    y1={ay - 5}
                    x2={ax + 5}
                    y2={ay + 5}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Anchor Label */}
              {showAnchorLabels && (
                <g>
                  <rect
                    x={ax - 14}
                    y={ay + 10}
                    width="28"
                    height="16"
                    fill={isSelected ? '#D9F56F' : '#070D10'}
                    rx="4"
                    stroke={isSelected ? '#D9F56F' : isActive ? '#D9F56F' : '#475569'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    strokeOpacity={isActive ? '0.8' : '0.5'}
                  />
                  <text
                    x={ax}
                    y={ay + 21.5}
                    fill={isSelected ? '#171717' : isActive ? '#D9F56F' : '#94A3B8'}
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {anchor.id}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
