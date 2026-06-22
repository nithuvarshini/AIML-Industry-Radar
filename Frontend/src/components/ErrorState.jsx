import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry, fallbackNotice }) {
  return (
    <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      {fallbackNotice ? (
        <>
          <h3 className="text-base font-semibold text-slate-100">Using sample data</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Couldn't reach the backend at the configured address. Showing demo data so the
            dashboard stays usable. {message ? `(${message})` : ''}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-slate-100">Something went wrong</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            {message || 'Failed to load data from the backend.'}
          </p>
        </>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}
