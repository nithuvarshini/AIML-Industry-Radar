import { Menu, TrendingUp, Activity } from 'lucide-react';

const TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Market overview and top in-demand skills' },
  market: { title: 'Market Insights', subtitle: 'Skill demand across AI/ML roles' },
  roles: { title: 'Role Analysis', subtitle: 'Compare required skills per role' },
  recommendations: { title: 'Recommendations', subtitle: 'Your readiness and skill gaps' },
};

export default function Topbar({ active, onMenu }) {
  const meta = TITLES[active] || TITLES.dashboard;
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{meta.title}</h2>
            <p className="hidden text-sm text-slate-400 sm:block">{meta.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 sm:inline-flex">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Live Market Data
          </span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
            <Activity className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">System</span> Online
          </span>
        </div>
      </div>
    </header>
  );
}
