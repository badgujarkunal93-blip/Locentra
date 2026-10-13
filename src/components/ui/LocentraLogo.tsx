import React from 'react';

interface LocentraLogoProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'icon' | 'neon';
}

/**
 * Locentra Brand Logo Mark
 * Represents spatial intelligence, RF anchor trilateration, and precision coordinate fixing.
 */
export const LocentraLogo: React.FC<LocentraLogoProps> = ({
  size = 40,
  className = '',
  variant = 'badge',
}) => {
  if (variant === 'neon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
        aria-label="Locentra Logo"
      >
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0070F3" />
          </linearGradient>
          <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="#0F141C" stroke="url(#neonGradient)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="14" fill="url(#neonGlow)" />
        <circle
          cx="20"
          cy="20"
          r="14"
          stroke="#00F0FF"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          strokeOpacity="0.4"
        />
        <circle
          cx="20"
          cy="20"
          r="8.5"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />
        <path
          d="M 20 6 L 20 12"
          stroke="#00F0FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 32 27 L 26.5 24"
          stroke="#00F0FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 8 27 L 13.5 24"
          stroke="#00F0FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="6" r="2" fill="#00F0FF" />
        <circle cx="32" cy="27" r="2" fill="#00F0FF" />
        <circle cx="8" cy="27" r="2" fill="#00F0FF" />
        <circle cx="20" cy="20" r="3.75" fill="#00F0FF" />
        <circle cx="20" cy="20" r="1.5" fill="#07090E" />
      </svg>
    );
  }
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        aria-label="Locentra Logo"
      >
        {/* Outer Ranging Pulse Ring */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.5 2"
          strokeOpacity="0.4"
        />
        {/* Inner Radar Range Wave */}
        <circle
          cx="12"
          cy="12"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.75"
        />
        {/* 3 Coordinate Anchor Vectors */}
        <path
          d="M 12 3.5 L 12 7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 19.5 16.5 L 16 14.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 4.5 16.5 L 8 14.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Peripheral Anchor Nodes */}
        <circle cx="12" cy="3.5" r="1.5" fill="currentColor" />
        <circle cx="19.5" cy="16.5" r="1.5" fill="currentColor" />
        <circle cx="4.5" cy="16.5" r="1.5" fill="currentColor" />
        {/* Central Core Fix */}
        <circle cx="12" cy="12" r="2.75" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Locentra Logo"
    >
      {/* Neo-minimalist Lime-Green Squircle Badge */}
      <rect width="40" height="40" rx="14" fill="#D9F56F" />

      {/* Triangulation Range Waves */}
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="#171717"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        strokeOpacity="0.25"
      />
      <circle
        cx="20"
        cy="20"
        r="8.5"
        stroke="#171717"
        strokeWidth="1.75"
        strokeOpacity="0.6"
      />

      {/* 3 Convergent Anchor Rays */}
      <path
        d="M 20 6 L 20 12"
        stroke="#171717"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M 32 27 L 26.5 24"
        stroke="#171717"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M 8 27 L 13.5 24"
        stroke="#171717"
        strokeWidth="2.25"
        strokeLinecap="round"
      />

      {/* Precision Anchor Points */}
      <circle cx="20" cy="6" r="2" fill="#171717" />
      <circle cx="32" cy="27" r="2" fill="#171717" />
      <circle cx="8" cy="27" r="2" fill="#171717" />

      {/* Central Fixed Target Node */}
      <circle cx="20" cy="20" r="3.75" fill="#171717" />
      <circle cx="20" cy="20" r="1.5" fill="#D9F56F" />
    </svg>
  );
};
