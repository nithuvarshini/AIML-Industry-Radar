// Mock fallback data — only used when the backend API is unreachable,
// so the dashboard is always demonstrable. The UI surfaces a clear notice
// when this fallback is active.

const mkSkills = (pairs) => pairs.map(([skill, count, percentage]) => ({
  skill,
  count,
  percentage: percentage ?? undefined,
}));

const topSkills = mkSkills([
  ['Python', 1245, 92],
  ['Machine Learning', 1020, 78],
  ['TensorFlow', 870, 64],
  ['PyTorch', 815, 61],
  ['NLP', 760, 57],
  ['Deep Learning', 720, 54],
  ['Data Analysis', 690, 52],
  ['SQL', 660, 50],
  ['Computer Vision', 610, 46],
  ['AWS', 580, 44],
]);

const dashboard = {
  skills: topSkills,
  totalJobs: 3284,
  trends: mkSkills([
    ['LLM Fine-tuning', 340, 28],
    ['RAG Pipelines', 310, 25],
    ['MLOps', 285, 23],
    ['Vector Databases', 260, 21],
    ['Prompt Engineering', 240, 19],
    ['Model Quantization', 210, 17],
    ['Distributed Training', 185, 15],
    ['AI Safety', 160, 13],
  ]),
  rankings: topSkills,
};

const insights = {
  overall: topSkills.slice(0, 10),
  byRole: {
    'AI Engineer': mkSkills([
      ['Deep Learning', 410],
      ['NLP', 380],
      ['Transformers', 355],
      ['TensorFlow', 330],
      ['LLMs', 300],
      ['PyTorch', 285],
      ['Computer Vision', 260],
      ['RAG', 230],
      ['LangChain', 205],
      ['Model Deployment', 180],
    ]),
    'ML Engineer': mkSkills([
      ['Python', 440],
      ['Scikit-learn', 390],
      ['MLOps', 360],
      ['Model Deployment', 335],
      ['Docker', 310],
      ['Kubernetes', 285],
      ['Feature Engineering', 270],
      ['AWS SageMaker', 250],
      ['PyTorch', 235],
      ['CI/CD', 210],
    ]),
    'Data Scientist': mkSkills([
      ['Python', 420],
      ['Statistics', 390],
      ['SQL', 360],
      ['Data Visualization', 330],
      ['Pandas', 305],
      ['Machine Learning', 280],
      ['A/B Testing', 255],
      ['Tableau', 230],
      ['Excel', 210],
      ['R', 185],
    ]),
    'Data Engineer': mkSkills([
      ['SQL', 430],
      ['Spark', 380],
      ['Airflow', 350],
      ['Python', 325],
      ['ETL', 300],
      ['AWS', 275],
      ['Snowflake', 250],
      ['Kafka', 225],
      ['dbt', 200],
      ['BigQuery', 180],
    ]),
    'Software Engineer': mkSkills([
      ['JavaScript', 450],
      ['React', 410],
      ['TypeScript', 380],
      ['Node.js', 350],
      ['Python', 320],
      ['Git', 295],
      ['Docker', 270],
      ['REST APIs', 245],
      ['AWS', 220],
      ['PostgreSQL', 195],
    ]),
  },
};

const roleAnalysis = { byRole: insights.byRole };

const recommendations = [
  {
    target_role: 'AI Engineer',
    skills_you_have: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'SQL'],
    total_role_skills: 10,
    missing_skills: [
      { skill: 'Deep Learning', frequency: 4 },
      { skill: 'Transformers', frequency: 4 },
      { skill: 'LLMs', frequency: 3 },
      { skill: 'RAG', frequency: 2 },
      { skill: 'Computer Vision', frequency: 1 },
    ],
  },
];

export const MOCK = {
  'top-skills': topSkills,
  dashboard,
  'skill-insights': insights,
  'role-analysis': roleAnalysis,
  recommendations,
};
