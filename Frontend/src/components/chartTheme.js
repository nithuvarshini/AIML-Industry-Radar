// Shared Recharts theme constants for consistent dark-mode styling.

export const CHART_COLORS = {
  primary: '#3b66ff',
  accent: '#8b5cf6',
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  pink: '#f472b6',
  teal: '#2dd4bf',
  indigo: '#6366f1',
  sky: '#38bdf8',
};

export const CHART_PALETTE = [
  '#3b66ff',
  '#8b5cf6',
  '#22d3ee',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#f472b6',
  '#2dd4bf',
  '#6366f1',
  '#38bdf8',
];

export const chartTooltipStyle = {
  contentStyle: {
    background: 'rgba(11, 17, 32, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '13px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 600, marginBottom: '4px' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export const axisProps = {
  stroke: 'rgba(255,255,255,0.25)',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export const gridProps = {
  stroke: 'rgba(255,255,255,0.06)',
  vertical: false,
};
