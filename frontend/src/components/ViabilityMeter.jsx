import React from 'react';

export default function ViabilityMeter({ score, size = 'md', showLabel = true }) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score || 0)));

  // Determine grade and color
  let strokeColor = '#EF4444'; // Red
  let grade = 'High Risk';
  let badgeClasses = 'text-red-400 bg-red-950/40 border-red-900/60';

  if (normalizedScore >= 80) {
    strokeColor = '#0D9488'; // Muted emerald
    grade = 'High Viability';
    badgeClasses = 'text-teal-300 bg-teal-950/40 border-teal-800/60';
  } else if (normalizedScore >= 65) {
    strokeColor = '#2563EB'; // Blue
    grade = 'Strong Potential';
    badgeClasses = 'text-blue-300 bg-blue-950/40 border-blue-900/60';
  } else if (normalizedScore >= 45) {
    strokeColor = '#D97706'; // Amber
    grade = 'Moderate';
    badgeClasses = 'text-amber-300 bg-amber-950/40 border-amber-900/60';
  }

  // Dimensions
  const dim = size === 'sm' ? 44 : size === 'lg' ? 84 : 56;
  const strokeWidth = size === 'sm' ? 3.5 : size === 'lg' ? 6 : 4.5;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg className="transform -rotate-90" width={dim} height={dim}>
          {/* Subtle track circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="#1C273D"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active stroke */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span
          className={`absolute font-semibold tracking-tight ${
            size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-xl' : 'text-xs'
          } text-white`}
        >
          {normalizedScore}
        </span>
      </div>

      {showLabel && (
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${badgeClasses}`}>
            {grade}
          </span>
          <span className="block text-[9px] text-slate-400 mt-0.5 tracking-wide uppercase">
            Viability Score
          </span>
        </div>
      )}
    </div>
  );
}
