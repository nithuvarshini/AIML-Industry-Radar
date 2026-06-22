import { Radar, LayoutDashboard, BarChart3, Users, Target, Map, X } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Market Insights', icon: BarChart3 },
  { id: 'roles', label: 'Role Analysis', icon: Users },
  { id: 'recommendations', label: 'Recommendations', icon: Target },
  { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-ink-900/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <Radar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">AIML Radar</h1>
              <p className="text-xs text-slate-400">Industry Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-gradient-soft text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-brand-gradient" style={{ width: 3 }} />
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl border border-white/10 bg-brand-gradient-soft p-4">
          <p className="text-sm font-semibold text-white">AI Job Market Analysis</p>
          <p className="mt-1 text-xs text-slate-400">
            Track in-demand AI/ML skills and measure your readiness against industry needs.
          </p>
        </div>
      </aside>
    </>
  );
}
