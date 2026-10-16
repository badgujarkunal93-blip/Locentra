import React, { useState } from 'react';
import { Box, Maximize2, Layers } from 'lucide-react';
import { TrajectoryDatasetItem } from './types';
import { CANONICAL_ANCHORS } from './trajectoryCorpus';

interface TrajectoryPreviewCardProps {
  dataset: TrajectoryDatasetItem;
}

export const TrajectoryPreviewCard: React.FC<TrajectoryPreviewCardProps> = ({ dataset }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const roomWidth = 12.0;
  const roomLength = 8.0;

  // ViewBox mapping (0..12 in X, 0..8 in Y)
  const padding = 1.0;
  const svgWidth = 600;
  const svgHeight = 400;

  const scaleX = (x: number) => padding * 30 + (x / roomWidth) * (svgWidth - padding * 60);
  const scaleY = (y: number) => svgHeight - padding * 30 - (y / roomLength) * (svgHeight - padding * 60);

  // Generate SVG path string from points
  const groundTruthPath = dataset.points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
    .join(' ');

  const estimatedPath = dataset.points
    .map(
      (p, idx) =>
        `${idx === 0 ? 'M' : 'L'} ${scaleX(p.estimatedX ?? p.x).toFixed(1)} ${scaleY(
          p.estimatedY ?? p.y
        ).toFixed(1)}`
    )
    .join(' ');

  const lastPoint = dataset.points[dataset.points.length - 1] || dataset.points[0];

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E9F3FF] text-[#268BFF] flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Trajectory Preview &amp; Room Layout
              </h2>
              <p className="text-xs text-[#74747B]">
                Spatial visualization of ground truth &amp; synthetic anchor coverage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-[#F4F4F6] p-0.5 rounded-lg border border-[#E5E5E9]">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  viewMode === '2d'
                    ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                    : 'text-[#74747B] hover:text-[#171719]'
                }`}
              >
                2D View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  viewMode === '3d'
                    ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                    : 'text-[#74747B] hover:text-[#171719]'
                }`}
              >
                3D View
              </button>
            </div>

            <button
              type="button"
              className="p-1.5 text-[#74747B] hover:text-[#171719] rounded-lg hover:bg-neutral-100 transition-colors"
              title="Expand preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative bg-[#FAFAFC] border border-[#E5E5E9] rounded-2xl overflow-hidden my-3">
          {viewMode === '2d' ? (
            <div className="w-full aspect-[3/2] flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full select-none"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern
                    id="room-grid"
                    width={svgWidth / 12}
                    height={svgHeight / 8}
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d={`M ${svgWidth / 12} 0 L 0 0 0 ${svgHeight / 8}`}
                      fill="none"
                      stroke="#EAEAEE"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width={svgWidth} height={svgHeight} fill="url(#room-grid)" />

                {/* Room Boundary */}
                <rect
                  x={scaleX(0)}
                  y={scaleY(roomLength)}
                  width={scaleX(roomWidth) - scaleX(0)}
                  height={scaleY(0) - scaleY(roomLength)}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Estimated Path (Purple Dashed) */}
                <path
                  d={estimatedPath}
                  fill="none"
                  stroke="#8B6CF6"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Ground Truth Path (Blue Solid) */}
                <path
                  d={groundTruthPath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Waypoint Dots */}
                {dataset.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={scaleX(p.x)}
                    cy={scaleY(p.y)}
                    r="2"
                    fill="#2563EB"
                  />
                ))}

                {/* Current Position Halo (Green) */}
                {lastPoint && (
                  <g transform={`translate(${scaleX(lastPoint.x)}, ${scaleY(lastPoint.y)})`}>
                    <circle r="12" fill="#D9F56F" fillOpacity="0.4" />
                    <circle r="7" fill="#159B71" />
                    <circle r="3" fill="#FFFFFF" />
                  </g>
                )}

                {/* Anchors A1 - A6 */}
                {CANONICAL_ANCHORS.map((a) => (
                  <g key={a.id} transform={`translate(${scaleX(a.x)}, ${scaleY(a.y)})`}>
                    <circle r="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
                    <circle r="3" fill="#0284C7" />
                    <text
                      x="11"
                      y="-4"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#0F172A"
                      className="font-mono"
                    >
                      {a.id}
                    </text>
                    <text
                      x="11"
                      y="7"
                      fontSize="8"
                      fill="#64748B"
                      className="font-mono"
                    >
                      ({a.x.toFixed(1)}, {a.y.toFixed(1)})
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="w-full aspect-[3/2] flex flex-col items-center justify-center text-center p-6 bg-radial from-[#F1F5F9] to-[#E2E8F0]">
              <Layers className="w-10 h-10 text-[#268BFF] mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-[#171719]">3D Volumetric Trajectory Mesh</h4>
              <p className="text-xs text-[#74747B] max-w-xs mt-1">
                Visualizing z-axis altitude variance (waist tag: 1.1m &plusmn; 0.15m) and ceiling transceivers (z = 2.8m).
              </p>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className="mt-3 px-3 py-1 bg-white border border-[#CBD5E1] text-xs font-bold text-[#171719] rounded-lg shadow-xs hover:bg-neutral-50 cursor-pointer"
              >
                Switch to 2D Plan
              </button>
            </div>
          )}

          {/* In-canvas Legend */}
          <div className="px-4 py-2 border-t border-[#E5E5E9] bg-white/90 backdrop-blur-xs flex items-center justify-between text-[11px] text-[#555555] flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#2563EB] rounded-full inline-block" />
              <span>Ground Truth Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#8B6CF6] border-b border-dashed border-[#8B6CF6] inline-block" />
              <span>Estimated Path (example)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#159B71] inline-block ring-2 ring-[#D9F56F]" />
              <span>Current Position</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border-2 border-[#0284C7] bg-white inline-block" />
              <span>Anchor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Metadata Card */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#171719] text-xs">{dataset.id}</span>
            <span className="text-[#A0A0A8]">&mdash;</span>
            <span className="font-bold text-[#171719] text-xs">{dataset.name}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
            {dataset.split} Set
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-[#74747B]">Waypoints</div>
            <div className="font-mono font-bold text-[#171719]">{dataset.waypointsCount}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Path Length</div>
            <div className="font-mono font-bold text-[#171719]">{dataset.lengthMeters.toFixed(1)} m</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Motion Model</div>
            <div className="font-bold text-[#171719] truncate">{dataset.motionModel}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Noise Profile</div>
            <div className="font-bold text-[#159B71]">{dataset.noiseLevelLabel}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Environment</div>
            <div className="font-bold text-[#171719]">{dataset.environmentName}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Room Size</div>
            <div className="font-mono font-bold text-[#171719]">{roomWidth}m &times; {roomLength}m</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Seed (deterministic)</div>
            <div className="font-mono font-bold text-[#171719]">{dataset.seed}</div>
          </div>

          <div>
            <div className="text-[10px] text-[#74747B]">Generated At</div>
            <div className="font-mono text-[11px] text-[#74747B] truncate">{dataset.createdAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
