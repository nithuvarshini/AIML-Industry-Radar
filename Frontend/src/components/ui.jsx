export function ProgressBar({ value, max = 100, gradient = true, className = '' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full ${gradient ? 'bg-brand-gradient' : 'bg-brand-400'} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MiniStat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="text-base font-semibold text-slate-100">{value}</span>
    </div>
  );
}

const BADGE_STYLES = {
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  neutral: 'border-white/10 bg-white/5 text-slate-300',
};

export function Badge({ children, tone = 'neutral', icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${BADGE_STYLES[tone] || BADGE_STYLES.neutral}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
