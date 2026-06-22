// Normalizers matched exactly to the backend response shapes.

export const ROLE_ORDER = [
  'AI Engineer',
  'ML Engineer',
  'Data Scientist',
  'Data Engineer',
  'Software Engineer',
];

// Convert { "Python": 19, "SQL": 7, ... } -> [{ skill, count }, ...]
const dictToSkillArray = (dict) => {
  if (!dict || typeof dict !== 'object' || Array.isArray(dict)) return [];
  return Object.entries(dict).map(([skill, count]) => ({ skill, count }));
};

/* ---------- top-skills ---------- */
// Backend: { "Python": 19, "Machine Learning": 18, ... }
export function normalizeTopSkills(data) {
  const skills = dictToSkillArray(data).slice(0, 10);
  return { skills };
}

/* ---------- dashboard ---------- */
// Backend: { market_overview: { top_skills: {...} }, role_analysis: {...}, ... }
export function normalizeDashboard(data) {
  const src = data || {};
  const topSkillsDict = src.market_overview?.top_skills || {};
  const skills = dictToSkillArray(topSkillsDict);
  const totalJobs = Object.keys(topSkillsDict).length;
  const trends = skills.filter((s) => s.count <= 2);
  return { skills, totalJobs, trends, raw: src };
}

/* ---------- skill-insights ---------- */
// Backend: { overall_top_10_skills: [...], top_ai_engineer_skills: [...], ... }
export function normalizeSkillInsights(data) {
  const src = data || {};
  const overall = (src.overall_top_10_skills || []).map((s) => ({ skill: s, count: 0 }));
  const byRole = {
    'AI Engineer':       (src.top_ai_engineer_skills || []).map((s) => ({ skill: s, count: 0 })),
    'ML Engineer':       (src.top_ml_engineer_skills || []).map((s) => ({ skill: s, count: 0 })),
    'Data Scientist':    (src.top_data_scientist_skills || []).map((s) => ({ skill: s, count: 0 })),
    'Data Engineer':     (src.top_data_engineer_skills || []).map((s) => ({ skill: s, count: 0 })),
    'Software Engineer': (src.top_software_engineer_skills || []).map((s) => ({ skill: s, count: 0 })),
  };
  return { overall, byRole, roles: ROLE_ORDER };
}

/* ---------- role-analysis ---------- */
// Backend: { "AI Engineer": { "Python": 4, ... }, "ML Engineer": { ... }, ... }
export function normalizeRoleAnalysis(data) {
  const src = data || {};
  const byRole = {};
  for (const role of ROLE_ORDER) {
    byRole[role] = dictToSkillArray(src[role] || {});
  }
  return { byRole, roles: ROLE_ORDER };
}

/* ---------- roadmap ---------- */
// Backend: { target_role, total_weeks, summary, weeks: [{ week, theme, skills, goal }] }
export function normalizeRoadmap(data) {
  if (!data) return null;
  return {
    targetRole: data.target_role || 'Target Role',
    totalWeeks: data.total_weeks || 0,
    summary: data.summary || '',
    weeks: (data.weeks || []).map((w) => ({
      week: w.week,
      theme: w.theme || '',
      skills: w.skills || [],
      goal: w.goal || '',
    })),
  };
}
// Backend: { target_role, skills_you_have, skills_you_match, total_role_skills,
//            role_readiness_percentage, high_priority_missing_skills: { "AI": 4, ... } }
export function normalizeRecommendations(data) {
  if (!data) return [];
  const src = data;
  const targetRole = src.target_role || 'Target Role';
  const skillsHave = src.skills_you_have || [];
  const skillsMatched = src.skills_you_match || 0;
  const totalRoleSkills = src.total_role_skills || 0;
  const readiness = src.role_readiness_percentage || 0;

  const missingDict = src.high_priority_missing_skills || {};
  const missingSkills = Object.entries(missingDict).map(([skill, frequency]) => ({
    skill,
    frequency,
    priority: frequency >= 3 ? 'high' : frequency === 2 ? 'medium' : 'low',
  }));

  const groupedMissing = {
    high:   missingSkills.filter((s) => s.priority === 'high'),
    medium: missingSkills.filter((s) => s.priority === 'medium'),
    low:    missingSkills.filter((s) => s.priority === 'low'),
  };

  return [{
    targetRole,
    skillsHave,
    skillsMatched,
    totalRoleSkills,
    readiness: Math.round(readiness),
    missingSkills,
    groupedMissing,
  }];
}
