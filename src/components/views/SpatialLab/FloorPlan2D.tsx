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

  // SVG Drawing canvas dimensions - optimized for wide technical inspection
  const svgWidth = 980;
  const svgHeight = 560;
  const margin = { top: 40, right: 30, bottom: 55, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const room = activeScenario.room;
  const currentPoint = trajectory[playbackIndex] || trajectory[0] || { x: 0, y: 0, z: 1.1, estimatedX: 0, estimatedY: 0, estimatedZ: 1.1, errorMeters: 0, isDegraded: false };

  // Mathematical Coordinate Transformation: Meters -> SVG Pixels
  const toSvgX = (xMeters: number) => margin.left + (xMeters / room.width) * plotWidth;
  const toSvgY = (yMeters: number) => margin.top + (1 - yMeters / room.length) * plotHeight; // Invert Y so 0 is at bottom

  // Grid line generation (every 2 meters for major, 1 meter for minor)
  const xGridLines: number[] = [];
  for (let x = 0; x <= room.width + 0.01; x += 1.0) {
    xGridLines.push(Number(x.toFixed(1)));
  }

  const yGridLines: number[] = [];
  for (let y = 0; y <= room.length + 0.01; y += 1.0) {
    yGridLines.push(Number(y.toFixed(1)));
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

  const traveledEstPoints = trajectory
    .slice(0, playbackIndex + 1)
    .map((p) => `${toSvgX(p.estimatedX)},${toSvgY(p.estimatedY)}`)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#080D11] rounded-2xl overflow-hidden select-none ${className || ''}`}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full"
        style={{ minHeight: '380px' }}
      >
        <defs>
          {/* Subtle Glow Filter */}
          <filter id="anchor-glow-2d" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="target-glow-2d" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
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
          fill="#080D11"
          stroke="#1E3242"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          rx="6"
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
                stroke={isMajor ? '#142533' : '#0E1B26'}
                strokeWidth={isMajor ? 1 : 0.5}
                strokeOpacity={isMajor ? 0.75 : 0.4}
                strokeDasharray={isMajor ? undefined : '2,3'}
              />
              {/* X Axis Label */}
              {isMajor && (
                <text
                  x={svgX}
                  y={margin.top + plotHeight + 20}
                  fill="#748899"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {x.toFixed(0)}
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
                stroke={isMajor ? '#142533' : '#0E1B26'}
                strokeWidth={isMajor ? 1 : 0.5}
                strokeOpacity={isMajor ? 0.75 : 0.4}
                strokeDasharray={isMajor ? undefined : '2,3'}
              />
              {/* Y Axis Label */}
              {isMajor && (
                <text
                  x={margin.left - 12}
                  y={svgY + 4}
                  fill="#748899"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="end"
                  fontWeight="500"
                >
                  {y.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis Titles */}
        <text
          x={margin.left + plotWidth / 2}
          y={margin.top + plotHeight + 42}
          fill="#8A9CA8"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          fontWeight="500"
        >
          X (meters)
        </text>

        <text
          x={18}
          y={margin.top + plotHeight / 2}
          fill="#8A9CA8"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          transform={`rotate(-90, 18, ${margin.top + plotHeight / 2})`}
          fontWeight="500"
        >
          Y (meters)
        </text>

        {/* Full Ground Truth Trajectory Line (Cyan, Subtle) */}
        {showGroundTruth && (
          <polyline
            points={gtPathPoints}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        )}

        {/* Full Estimated Trajectory Line (Violet, Subtle) */}
        {showEstimated && (
          <polyline
            points={estPathPoints}
            fill="none"
            stroke="#A855F7"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        )}

        {/* Traveled Ground Truth Path (Bright Cyan with Nodes) */}
        {showGroundTruth && traveledGtPoints && (
          <>
            <polyline
              points={traveledGtPoints}
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
            {/* Discrete points along traveled GT path (every 4th point) */}
            {trajectory.slice(0, playbackIndex + 1).map((p, idx) => {
              if (idx % 3 !== 0) return null;
              return (
                <circle
                  key={`gt-pt-${idx}`}
                  cx={toSvgX(p.x)}
                  cy={toSvgY(p.y)}
                  r="2"
                  fill="#22D3EE"
                />
              );
            })}
          </>
        )}

        {/* Traveled Estimated Path (Vibrant Purple/Violet with Nodes) */}
        {showEstimated && traveledEstPoints && (
          <>
            <polyline
              points={traveledEstPoints}
              fill="none"
              stroke="#C084FC"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
            {/* Discrete points along traveled Est path (every 4th point) */}
            {trajectory.slice(0, playbackIndex + 1).map((p, idx) => {
              if (idx % 3 !== 0) return null;
              return (
                <circle
                  key={`est-pt-${idx}`}
                  cx={toSvgX(p.estimatedX)}
                  cy={toSvgY(p.estimatedY)}
                  r="2"
                  fill="#C084FC"
                />
              );
            })}
          </>
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
                    strokeWidth="1.2"
                    strokeDasharray="4,3"
                    strokeOpacity="0.5"
                  />
                  <rect
                    x={midX - 16}
                    y={midY - 8}
                    width="32"
                    height="16"
                    fill="#080D11"
                    rx="4"
                    stroke="#F59E0B"
                    strokeWidth="0.75"
                    strokeOpacity="0.6"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    fill="#FDE68A"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {dist.toFixed(1)}m
                  </text>
                </g>
              );
            })}

        {/* Error Vector line between Ground Truth and Estimated */}
        {currentPoint && (
          <line
            x1={toSvgX(currentPoint.x)}
            y1={toSvgY(currentPoint.y)}
            x2={toSvgX(currentPoint.estimatedX)}
            y2={toSvgY(currentPoint.estimatedY)}
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            opacity="0.9"
          />
        )}

        {/* Current Position Marker (Vibrant Lime Beacon with Pulsing Rings) */}
        {currentPoint && (
          <g transform={`translate(${toSvgX(currentPoint.estimatedX)}, ${toSvgY(currentPoint.estimatedY)})`}>
            {/* Outer pulsating radar ring */}
            <circle
              r="16"
              fill="none"
              stroke="#D9F56F"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              className="animate-ping"
              style={{ transformOrigin: '0 0', animationDuration: '2.5s' }}
            />
            {/* Middle halo circle */}
            <circle
              r="11"
              fill="#D9F56F"
              fillOpacity="0.25"
              stroke="#D9F56F"
              strokeWidth="2"
              strokeOpacity="0.8"
            />
            {/* Core beacon dot */}
            <circle
              r="5.5"
              fill="#D9F56F"
              stroke="#171717"
              strokeWidth="2"
              filter="url(#target-glow-2d)"
            />
          </g>
        )}

        {/* Ground Truth Reference Crosshair */}
        {showGroundTruth && currentPoint && (
          <g transform={`translate(${toSvgX(currentPoint.x)}, ${toSvgY(currentPoint.y)})`}>
            <circle
              r="7"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <circle
              r="3"
              fill="#22D3EE"
              stroke="#083344"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Anchors A1 through A6 with Distinct Visual Beacons and Coordinates */}
        {activeScenario.anchors.map((anchor) => {
          const ax = toSvgX(anchor.x);
          const ay = toSvgY(anchor.y);
          const isSelected = anchor.id === selectedAnchorId;
          const isActive = anchor.isActive;

          // Determine anchor label alignment based on position to avoid edge clipping
          const isLeft = anchor.x < room.width / 2;

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
                  r="22"
                  fill="none"
                  stroke="#D9F56F"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  opacity="0.9"
                  className="animate-spin"
                  style={{ transformOrigin: `${ax}px ${ay}px`, animationDuration: '6s' }}
                />
              )}

              {/* Anchor Beacon Rings */}
              {isActive ? (
                <>
                  <circle
                    cx={ax}
                    cy={ay}
                    r="12"
                    fill="#D9F56F"
                    fillOpacity="0.14"
                    stroke="#D9F56F"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                  <circle
                    cx={ax}
                    cy={ay}
                    r="6.5"
                    fill="#D9F56F"
                    stroke="#171717"
                    strokeWidth="2"
                    filter="url(#anchor-glow-2d)"
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

              {/* Anchor Node Identifier & Coordinate Label */}
              {showAnchorLabels && (
                <g>
                  {/* Anchor ID */}
                  <text
                    x={ax + (isLeft ? 14 : -14)}
                    y={ay - 3}
                    fill={isSelected ? '#D9F56F' : isActive ? '#F1F5F9' : '#94A3B8'}
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor={isLeft ? 'start' : 'end'}
                  >
                    {anchor.id}
                  </text>
                  {/* Anchor Coordinate (X.X, Y.Y) */}
                  <text
                    x={ax + (isLeft ? 14 : -14)}
                    y={ay + 9}
                    fill="#94A3B8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor={isLeft ? 'start' : 'end'}
                  >
                    ({anchor.x.toFixed(1)}, {anchor.y.toFixed(1)})
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* In-Canvas Floating Technical Legend (Matching Reference Mockup) */}
        <g transform={`translate(${margin.left + plotWidth - 145}, ${margin.top + 16})`}>
          <rect
            x="0"
            y="0"
            width="135"
            height="132"
            rx="8"
            fill="#091218"
            fillOpacity="0.88"
            stroke="#193242"
            strokeWidth="1"
          />
          {/* Item 1: Ground Truth */}
          <g transform="translate(14, 24)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#06B6D4" strokeWidth="2.5" />
            <circle cx="8" cy="0" r="3" fill="#22D3EE" />
            <text x="24" y="3.5" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
              Ground Truth
            </text>
          </g>

          {/* Item 2: Estimated Path */}
          <g transform="translate(14, 48)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#A855F7" strokeWidth="2.5" />
            <circle cx="8" cy="0" r="3" fill="#C084FC" />
            <text x="24" y="3.5" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
              Estimated Path
            </text>
          </g>

          {/* Item 3: Current Position */}
          <g transform="translate(14, 72)">
            <circle cx="8" cy="0" r="5.5" fill="none" stroke="#D9F56F" strokeWidth="2" />
            <circle cx="8" cy="0" r="2.5" fill="#D9F56F" />
            <text x="24" y="3.5" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
              Current Position
            </text>
          </g>

          {/* Item 4: Anchor */}
          <g transform="translate(14, 96)">
            <circle cx="8" cy="0" r="5" fill="#143A26" stroke="#10B981" strokeWidth="1.5" />
            <text x="24" y="3.5" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
              Anchor
            </text>
          </g>

          {/* Item 5: Room Boundary */}
          <g transform="translate(14, 118)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="24" y="3.5" fill="#E2E8F0" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">
              Room Boundary
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
