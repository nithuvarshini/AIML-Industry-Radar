import { Map, CheckCircle2, Target, Lightbulb } from 'lucide-react';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import { Badge } from '../components/ui';
import { CHART_PALETTE } from '../components/chartTheme';
import { useEndpointData } from '../services/useEndpointData';

function WeekCard({ week, theme, skills, goal, index }) {
  const color = CHART_PALETTE[index % CHART_PALETTE.length];
  return (
    <Card className="p-6 animate-slide-up">
      <div className="flex items-start gap-4">
        {/* Week number bubble */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-glow"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
        >
          W{week}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{theme}</h3>
          <div className="mt-1 flex items-start gap-1.5">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-400">{goal}</p>
          </div>

          {/* Skills for this week */}
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={skill + i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300"
              >
                <CheckCircle2 className="h-3 w-3" style={{ color }} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RoadmapPage() {
  const { status, data, isFallback, error, reload } = useEndpointData('roadmap');

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Learning Roadmap"
        subtitle="Your personalized week-by-week plan to reach your target role"
        icon={Map}
      />

      {(status === 'loading' || status === 'idle') && (
        <Spinner label="Loading your roadmap..." />
      )}

      {status === 'success' && isFallback && !data && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}

      {status === 'success' && data?.weeks?.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-white">{data.targetRole} Roadmap</h2>
                  <Badge tone="neutral">{data.totalWeeks} Weeks</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{data.summary}</p>
              </div>
            </div>
          </Card>

          {/* Week cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {data.weeks.map((w, i) => (
              <WeekCard
                key={w.week}
                week={w.week}
                theme={w.theme}
                skills={w.skills}
                goal={w.goal}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {status === 'success' && !data?.weeks?.length && !isFallback && (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-400">
            No roadmap found. Run <code className="text-brand-300">roadmap_generator.py</code> to generate one.
          </p>
        </Card>
      )}
    </div>
  );
}
