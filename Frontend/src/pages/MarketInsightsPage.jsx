import { Award, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import RoleSkillsCard from '../components/RoleSkillsCard';
import { ProgressBar } from '../components/ui';
import { CHART_PALETTE, chartTooltipStyle, axisProps, gridProps } from '../components/chartTheme';
import { useEndpointData } from '../services/useEndpointData';

function OverallTop10({ skills }) {
  const chartData = skills.map((s, i) => ({ name: s.skill, value: skills.length - i }));
  const max = chartData.length;
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
          <Award className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Overall Top 10 Skills</h3>
          <p className="text-xs text-slate-400">Across all tracked AI/ML job postings</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid {...gridProps} horizontal={false} />
              <XAxis type="number" {...axisProps} hide />
              <YAxis type="category" dataKey="name" {...axisProps} width={130} />
              <Tooltip {...chartTooltipStyle} formatter={(v, n, p) => [`Rank #${chartData.length - p.payload.value + 1}`, 'Position']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Rank">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2">
          <ul className="space-y-2.5">
            {skills.map((s, i) => (
              <li key={s.skill} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-slate-300">{s.skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function MiniSkillBars({ skills, title, accent }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      </div>
      <ul className="space-y-2.5">
        {skills.slice(0, 5).map((s, i) => (
          <li key={s.skill + i} className="flex items-center gap-3">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
              style={{ background: accent }}
            >
              {i + 1}
            </span>
            <span className="text-sm text-slate-300">{s.skill}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function MarketInsightsPage() {
  const { status, data, isFallback, error, reload } = useEndpointData('skill-insights');

  const overall = data?.overall || [];
  const byRole = data?.byRole || {};

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Market Insights"
        subtitle="Skill demand broken down by AI/ML specialization"
        icon={BarChart3}
      />

      {(status === 'loading' || status === 'idle') && <Spinner label="Loading market insights..." />}

      {status === 'success' && isFallback && !overall.length && !Object.values(byRole).some((a) => a.length) && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}

      {status === 'success' && (overall.length > 0 || Object.values(byRole).some((a) => a.length)) && (
        <div className="space-y-8 animate-fade-in">
          {overall.length > 0 && <OverallTop10 skills={overall} />}

          {/* Compact role overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.roles.map((role, i) => (
              <MiniSkillBars
                key={role}
                skills={byRole[role] || []}
                title={role}
                accent={CHART_PALETTE[i % CHART_PALETTE.length]}
              />
            ))}
          </div>

          {/* Detailed per-role cards */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-300">Detailed Skill Breakdown</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.roles.map((role, i) => (
                <RoleSkillsCard
                  key={role}
                  role={role}
                  skills={(byRole[role] || []).slice(0, 8)}
                  accent={CHART_PALETTE[i % CHART_PALETTE.length]}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
