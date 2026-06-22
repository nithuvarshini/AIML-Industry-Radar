export default function Spinner({ size = 'md', label }) {
  const dim = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`${dim} rounded-full border-2 border-white/10 border-t-brand-400 animate-spin-slow`}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}
