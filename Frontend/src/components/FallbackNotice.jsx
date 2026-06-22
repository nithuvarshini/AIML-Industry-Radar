import { Info, X } from 'lucide-react';
import { useState } from 'react';

export default function FallbackNotice({ message }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 animate-fade-in">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Showing sample data</p>
        <p className="text-amber-200/80">
          Couldn't reach the backend API — displaying demo data so you can explore the dashboard.
          {message ? ` Detail: ${message}` : ''}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-1 hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
