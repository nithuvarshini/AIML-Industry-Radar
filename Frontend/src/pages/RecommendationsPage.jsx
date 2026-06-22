import { Target, CheckCircle2, AlertOctagon, Layers } from 'lucide-react';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import CircularProgress from '../components/CircularProgress';
import { Badge, ProgressBar, MiniStat } from '../components/ui';
import { useEndpointData } from '../services/useEndpointData';

function StatPill({ label, value, tone = 'neutral' }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function PriorityGroup({ title, items, tone, icon: Icon, emptyHint }) {
  return (
    <Card className="p-5 h-full">
      <div className="mb-3 flex items-center gap-2">
        <Badge tone={tone} icon={Icon}>{title}</Badge>
        <span className="text-xs text-slate-500">frequency {title.toLowerCase().includes('high') ? '>= 3' : title.toLowerCase().includes('medium') ? '= 2' : '= 1'}</span>
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((s, i) => (
            <li
              key={s.skill + i}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
            >
              <span className="text-slate-300">{s.skill}</span>
              <Badge tone={tone}>×{s.frequency}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500">
          {emptyHint || "None — you're covered here."}
        </p>
      )}
    </Card>
  );
}

function RecommendationCard({ rec }) {
  const grouped = rec.groupedMissing || { high: [], medium: [], low: [] };
  const high = grouped.high || [];
  const medium = grouped.medium || [];
  const low = grouped.low || [];

  return (
    <Card className="p-6 sm:p-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <span className="pill">
            <Target className="h-3.5 w-3.5 text-brand-300" />
            Career Target
          </span>
          <h3 className="mt-3 text-2xl font-bold text-white">{rec.targetRole}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Based on your current skill set, here is your readiness against the
            industry requirements for this role.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatPill label="Skills You Have" value={rec.skillsHave.length} />
            <StatPill label="Skills Matched" value={rec.skillsMatched} />
            <StatPill label="Total Role Skills" value={rec.totalRoleSkills} />
          </div>

          {rec.skillsHave.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Your skills</p>
              <div className="flex flex-wrap gap-2">
                {rec.skillsHave.map((s, i) => (
                  <Badge key={s + i} tone="neutral" icon={CheckCircle2}>{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Circular readiness */}
        <div className="flex flex-col items-center justify-center">
          <CircularProgress value={rec.readiness} label="Role Readiness" />
          <div className="mt-4 w-full max-w-[220px]">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Match progress</span>
              <span>{rec.skillsMatched}/{rec.totalRoleSkills}</span>
            </div>
            <ProgressBar value={rec.readiness} />
          </div>
        </div>
      </div>

      {/* Missing skills by priority */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-slate-200">Missing Skills by Priority</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PriorityGroup title="High Priority" items={high} tone="high" icon={AlertOctagon} emptyHint="No high-priority gaps — strong match." />
          <PriorityGroup title="Medium Priority" items={medium} tone="medium" icon={Layers} emptyHint="No medium-priority gaps." />
          <PriorityGroup title="Low Priority" items={low} tone="low" icon={Layers} emptyHint="No low-priority gaps." />
        </div>
      </div>
    </Card>
  );
}

export default function RecommendationsPage() {
  const { status, data, isFallback, error, reload } = useEndpointData('recommendations');
  const recs = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Recommendations"
        subtitle="Your readiness for target roles and prioritized skill gaps"
        icon={Target}
      />

      {(status === 'loading' || status === 'idle') && <Spinner label="Computing recommendations..." />}

      {status === 'success' && isFallback && !recs.length && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}

      {status === 'success' && recs.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {recs.map((rec, i) => (
            <RecommendationCard key={rec.targetRole + i} rec={rec} />
          ))}
          {recs.length > 1 && (
            <MiniStat
              label="Target roles analyzed"
              value={recs.length}
              icon={Target}
            />
          )}
        </div>
      )}
    </div>
  );
}
