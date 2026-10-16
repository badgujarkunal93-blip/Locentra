import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  gradientId: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#20D6B5',
  gradientId,
  width = 110,
  height = 36,
  className = '',
}) => {
  // If no data or single data point, show calm baseline with single pulse dot
  if (!data || data.length <= 1) {
    const midY = height / 2;
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <line
            x1="0"
            y1={midY}
            x2={width - 8}
            y2={midY}
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="2,3"
            strokeOpacity="0.4"
          />
          <circle cx={width - 8} cy={midY} r="3" fill={color} />
        </svg>
      </div>
    );
  }

  // Reverse so oldest is left, newest is right
  const points = [...data].reverse();
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 4;
  const availableHeight = height - padding * 2;
  const stepX = (width - padding * 2) / (points.length - 1);

  const coords = points.map((val, idx) => {
    const x = padding + idx * stepX;
    // higher value -> lower Y in SVG
    const y = padding + availableHeight - ((val - min) / range) * availableHeight;
    return { x, y };
  });

  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPoints = `${coords[0].x.toFixed(1)},${height} ${polylinePoints} ${coords[coords.length - 1].x.toFixed(1)},${height}`;
  const lastPoint = coords[coords.length - 1];

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient Area */}
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest Node */}
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={color}
            stroke="#080D18"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
};
