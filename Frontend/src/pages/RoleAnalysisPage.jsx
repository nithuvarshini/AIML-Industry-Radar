import { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
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
import { ProgressBar, Badge } from '../components/ui';
import { CHART_PALETTE, chartTooltipStyle, axisProps, gridProps } from '../components/chartTheme';
import { useEndpointData } from '../services/useEndpointData';

const ROLE_ICONS = {};

function RoleTabs({ roles, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role, i) => {
        const isActive = role === active;
        const color = CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'border-white/20 bg-white/10 text-white shadow-glow'
                : 'border-white/5 bg-white/[0.03] text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full transition"
              style={{ background: isActive ? color : 'rgba(255,255,255,0.2)' }}
            />
            {role}
          </button>
        );
      })}
    </div>
  );
}

function RoleDetail({ role, skills, color }) {
  const max = skills.length ? Math.max(...skills.map((s) => s.count)) : 1;
  const chartData = skills.map((s) => ({ name: s.skill, value: s.count }));

  return (
    <div className="grid gap-6 lg:grid-cols-5 animate-fade-in">
      {/* Frequency chart */}
      <Card className="p-6 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">{role} — Skill Frequency</h3>
          <Badge tone="neutral">{skills.length} skills</Badge>
        </div>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid {...gridProps} horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey="name" {...axisProps} width={140} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Frequency">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-60 items-center justify-center text-sm text-slate-500">
            No skill data for this role.
          </div>
        )}
      </Card>

      {/* Ranked list */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold text-slate-200">Skills Ranked</h3>
        <ul className="space-y-3">
          {skills.map((s, i) => (
            <li key={s.skill + i} className="group flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{s.skill}</span>
                  <span className="text-xs font-medium text-slate-400">{s.count.toLocaleString()}</span>
                </div>
                <ProgressBar value={s.count} max={max} className="mt-1.5" gradient={false} />
              </div>
            </li>
          ))}
          {!skills.length && (
            <li className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500">
              No skill data for this role.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

export default function RoleAnalysisPage() {
  const { status, data, isFallback, error, reload } = useEndpointData('role-analysis');
  const [active, setActive] = useState(null);

  const roles = data?.roles || [];
  const byRole = data?.byRole || {};

  // pick a default active role once data loads
  const effectiveActive = active || roles[0] || null;
  const activeSkills = effectiveActive ? byRole[effectiveActive] || [] : [];

  const roleIndex = roles.indexOf(effectiveActive);
  const activeColor = roleIndex >= 0 ? CHART_PALETTE[roleIndex % CHART_PALETTE.length] : CHART_PALETTE[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Role Analysis"
        subtitle="Switch roles to compare required skills and frequencies"
        icon={Users}
      />

      {(status === 'loading' || status === 'idle') && <Spinner label="Loading role analysis..." />}

      {status === 'success' && isFallback && !Object.values(byRole).some((a) => a.length) && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}

      {status === 'success' && roles.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <RoleTabs roles={roles} active={effectiveActive} onChange={setActive} />

          {/* Quick-role preview cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((role, i) => {
              const skills = byRole[role] || [];
              const isActive = role === effectiveActive;
              return (
                <button
                  key={role}
                  onClick={() => setActive(role)}
                  className={`glass-card rounded-xl p-4 text-left transition hover:-translate-y-1 hover:border-brand-500/40 ${
                    isActive ? 'border-brand-500/50 shadow-glow' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                    />
                    {isActive && <ChevronRight className="h-4 w-4 text-brand-300" />}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">{role}</p>
                  <p className="text-xs text-slate-500">{skills.length} skills tracked</p>
                </button>
              );
            })}
          </div>

          <RoleDetail role={effectiveActive} skills={activeSkills} color={activeColor} />
        </div>
      )}
    </div>
  );
}
