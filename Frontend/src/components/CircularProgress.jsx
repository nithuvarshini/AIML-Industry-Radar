export default function CircularProgress({
  value,
  size = 196,
  stroke = 16,
  label,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circumference - (clamped / 100) * circumference;
  const angle = (clamped / 100) * 360;
  const tone =
    clamped >= 75 ? '#34d399' : clamped >= 50 ? '#a78bfa' : clamped >= 25 ? '#fbbf24' : '#fb7185';

  const gradientId = `cp-gradient-${Math.round(angle)}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b66ff" />
            <stop offset="100%" stopColor={tone} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold gradient-text">{Math.round(clamped)}%</span>
        {label && <span className="mt-1 text-sm text-slate-400">{label}</span>}
      </div>
    </div>
  );
}
