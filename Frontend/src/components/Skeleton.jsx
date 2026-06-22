export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${className}`}>
      <div className="skeleton h-4 w-1/3" />
      <div className="mt-4 space-y-3">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 rounded-2xl">
          <div className="skeleton h-12 w-12 rounded-xl" />
          <div className="mt-4 skeleton h-4 w-3/4" />
          <div className="mt-3 skeleton h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
