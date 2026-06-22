import { Briefcase, TrendingUp } from 'lucide-react';
import Card from './Card';
import { ProgressBar } from './ui';
import { CHART_PALETTE } from './chartTheme';

const ROLE_ACCENT = {
  'AI Engineer': '#3b66ff',
  'ML Engineer': '#8b5cf6',
  'Data Scientist': '#22d3ee',
  'Data Engineer': '#34d399',
  'Software Engineer': '#fbbf24',
};

export default function RoleSkillsCard({ role, skills, accent }) {
  const color = accent || ROLE_ACCENT[role] || CHART_PALETTE[0];
  const max = skills.length ? Math.max(...skills.map((s) => s.count)) : 1;

  return (
    <Card className="p-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-glow"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}
        >
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">{role}</h3>
          <p className="text-xs text-slate-400">{skills.length} top skills</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {skills.map((s, i) => (
          <li key={`${s.skill}-${i}`} className="group">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{s.skill}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                <TrendingUp className="h-3 w-3" style={{ color }} />
                {s.count.toLocaleString()}
              </span>
            </div>
            <ProgressBar
              value={s.count}
              max={max}
              className="mt-1.5"
              gradient={false}
            />
          </li>
        ))}
        {!skills.length && (
          <li className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-500">
            No skill data for this role.
          </li>
        )}
      </ul>
    </Card>
  );
}
