import { Radar, Sparkles, TrendingUp, BarChart3, Flame } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import { ProgressBar } from '../components/ui';
import { useEndpointData } from '../services/useEndpointData';
import { CHART_PALETTE, chartTooltipStyle, axisProps, gridProps } from '../components/chartTheme';

function OverviewCard() {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-8" hover={false}>
      <div className="absolute inset-0 bg-brand-gradient-soft opacity-60" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -bottom-12 left-10 h-44 w-44 rounded-full bg-accent-600/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
              <Radar className="h-6 w-6 text-white" />
            </div>
            <span className="pill">
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              AI Job Market Intelligence
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            AIML <span className="gradient-text">Industry Radar</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Analyze AI/ML job market trends, track the most in-demand skills, and compare
            your skill set against live industry requirements in real time.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="pill"><Flame className="h-3.5 w-3.5 text-rose-400" /> Trending skills</span>
            <span className="pill"><BarChart3 className="h-3.5 w-3.5 text-brand-300" /> Frequency analytics</span>
            <span className="pill"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Role readiness</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TopSkillCard({ skill, count, rank }) {
  const color = CHART_PALETTE[(rank - 1) % CHART_PALETTE.length];
  const max = 100;
  const pct = count ? Math.min(100, Math.round((count / 1300) * 100)) : 0;
  return (
    <Card className="p-5 animate-slide-up" delay={rank * 50}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{skill}</h3>
            <p className="text-xs text-slate-400">{count.toLocaleString()} mentions</p>
          </div>
        </div>
        <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} max={max} className="mt-4" />
    </Card>
  );
}

function TopSkillsSection() {
  const { status, data, isFallback, error, reload } = useEndpointData('top-skills');

  return (
    <section>
      <SectionHeader
        title="Top Skills in Demand"
        subtitle="The 10 most frequently requested skills across AI/ML job postings"
        icon={Flame}
      />
      {(status === 'loading' || status === 'idle') && <Spinner label="Fetching top skills..." />}
      {status === 'success' && isFallback && !data?.skills?.length && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}
      {status === 'success' && data?.skills?.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.skills.map((s, i) => (
            <TopSkillCard key={`${s.skill}-${i}`} skill={s.skill} count={s.count} rank={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function MarketOverviewSection() {
  const { status, data, isFallback, error, reload } = useEndpointData('dashboard');

  const skills = data?.skills || [];
  const trends = data?.trends || [];
  const totalJobs = data?.totalJobs || 0;

  const topBar = skills.slice(0, 8).map((s) => ({ name: s.skill, value: s.count }));
  const pieData = skills.slice(0, 6).map((s) => ({ name: s.skill, value: s.count }));
  const trendData = trends.slice(0, 8).map((s) => ({ name: s.skill, value: s.count }));

  return (
    <section>
      <SectionHeader
        title="Market Overview"
        subtitle="Skill frequency rankings and emerging industry trends"
        icon={BarChart3}
      />
      {(status === 'loading' || status === 'idle') && <Spinner label="Analyzing market data..." />}
      {status === 'success' && isFallback && !skills.length && (
        <ErrorState message={error} onRetry={reload} fallbackNotice />
      )}
      {status === 'success' && skills.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Stat row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Postings Analyzed</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalJobs.toLocaleString()}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">Unique Skills Tracked</p>
              <p className="mt-1 text-2xl font-bold text-white">{skills.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">Emerging Trends</p>
              <p className="mt-1 text-2xl font-bold text-white">{trends.length}</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">Skill Frequency Rankings</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topBar} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="name" {...axisProps} angle={-35} textAnchor="end" interval={0} height={60} />
                  <YAxis {...axisProps} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3b66ff" name="Frequency">
                    {topBar.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">Skill Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {trendData.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">Emerging Industry Trends</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid {...gridProps} horizontal={false} />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="name" {...axisProps} width={120} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#8b5cf6" name="Trend Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <OverviewCard />
      <TopSkillsSection />
      <MarketOverviewSection />
    </div>
  );
}
