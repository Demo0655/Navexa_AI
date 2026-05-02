import React from 'react';

// Theme-adaptive futuristic N logo
// In dark mode: bright neon glow effect
// In light mode: dark, rich deep blue/purple 
const NavexaLogo = ({ size = 24, className = "", isDark = true }) => {
  const id = `nl-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Left stroke gradient: top bright → bottom faded */}
        <linearGradient id={`lG-${id}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor={isDark ? "#7dd3fc" : "#1e3a5f"} stopOpacity="1" />
          <stop offset="100%" stopColor={isDark ? "#3b82f6" : "#0ea5e9"} stopOpacity="0.5" />
        </linearGradient>
        {/* Right stroke gradient: bottom bright → top faded */}
        <linearGradient id={`rG-${id}`} x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor={isDark ? "#c084fc" : "#4a148c"} stopOpacity="1" />
          <stop offset="100%" stopColor={isDark ? "#9333ea" : "#7b1fa2"} stopOpacity="0.5" />
        </linearGradient>
        {/* Diagonal slash gradient */}
        <linearGradient id={`dG-${id}`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor={isDark ? "#e879f9" : "#6a0dad"} stopOpacity="0.95" />
          <stop offset="100%" stopColor={isDark ? "#60a5fa" : "#1e40af"} stopOpacity="0.7" />
        </linearGradient>
        {/* Glow filter for dark mode */}
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={isDark ? "2.5" : "0"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#glow-${id})`}>
        {/* Left vertical bar */}
        <rect x="14" y="18" width="14" height="64" rx="4" fill={`url(#lG-${id})`} />

        {/* Right vertical bar */}
        <rect x="72" y="18" width="14" height="64" rx="4" fill={`url(#rG-${id})`} />

        {/* Diagonal connector - top-left to bottom-right */}
        <path
          d="M28 22 L72 78"
          stroke={`url(#dG-${id})`}
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* Accent corner nodes */}
        <circle cx="21" cy="18" r="5" fill={isDark ? "#7dd3fc" : "#1e3a8a"} />
        <circle cx="79" cy="82" r="5" fill={isDark ? "#c084fc" : "#4a148c"} />

        {/* Micro tick lines for "futuristic" feel */}
        <line x1="5" y1="26" x2="12" y2="26" stroke={isDark ? "#7dd3fc" : "#1e3a8a"} strokeWidth="3" strokeLinecap="round" />
        <line x1="88" y1="74" x2="95" y2="74" stroke={isDark ? "#c084fc" : "#4a148c"} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default NavexaLogo;
