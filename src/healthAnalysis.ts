// Health Analysis Engine
// Age-adjusted reference ranges and risk assessment for a 43-year-old male

export interface HealthStandard {
  metric: string;
  unit: string;
  optimal: [number, number];
  good: [number, number];
  normal: [number, number];
  concern: [number, number];
  warning: [number, number];
  source: string;
}

export interface MetricAssessment {
  metric: string;
  value: number;
  level: 'optimal' | 'good' | 'normal' | 'concern' | 'warning';
  percentile?: number;
  interpretation: string;
  recommendation?: string;
}

export interface HealthScore {
  overall: number;
  cardiovascular: number;
  fitness: number;
  sleep: number;
  activity: number;
  interpretation: string;
  topConcerns: string[];
  strengths: string[];
}

// Age: 43, Male, BMI: 27.7 (overweight)
const STANDARDS: Record<string, HealthStandard> = {
  RestingHeartRate: {
    metric: 'Resting Heart Rate',
    unit: 'bpm',
    optimal: [50, 60],
    good: [60, 70],
    normal: [70, 75],
    concern: [75, 85],
    warning: [85, 100],
    source: 'AHA 2024',
  },
  HeartRateVariabilitySDNN: {
    metric: 'HRV (SDNN)',
    unit: 'ms',
    optimal: [50, 100],
    good: [30, 50],
    normal: [20, 30],
    concern: [15, 20],
    warning: [0, 15],
    source: 'Age-adjusted (43y male)',
  },
  VO2Max: {
    metric: 'VO₂ Max',
    unit: 'mL/kg/min',
    optimal: [42, 56], // Superior for 40-49
    good: [35, 42],    // Excellent
    normal: [31, 35],  // Good
    concern: [26, 31], // Fair
    warning: [0, 26],  // Poor
    source: 'Cooper Clinic (age 40-49)',
  },
  OxygenSaturation: {
    metric: 'Blood Oxygen',
    unit: '%',
    optimal: [97, 100],
    good: [95, 97],
    normal: [92, 95],
    concern: [90, 92],
    warning: [0, 90],
    source: 'Clinical standard',
  },
  BodyMassIndex: {
    metric: 'BMI',
    unit: '',
    optimal: [18.5, 24.9],
    good: [25, 27],
    normal: [27, 30],
    concern: [30, 35],
    warning: [35, 50],
    source: 'WHO 2024',
  },
  BodyFatPercentage: {
    metric: 'Body Fat %',
    unit: '%',
    optimal: [10, 18],
    good: [18, 22],
    normal: [22, 25],
    concern: [25, 30],
    warning: [30, 40],
    source: 'ACE (male 40-49)',
  },
  StepCount: {
    metric: 'Daily Steps',
    unit: 'steps',
    optimal: [10000, 15000],
    good: [7500, 10000],
    normal: [5000, 7500],
    concern: [3000, 5000],
    warning: [0, 3000],
    source: 'CDC 2024',
  },
  SleepDuration: {
    metric: 'Sleep Duration',
    unit: 'hours',
    optimal: [7, 8],
    good: [6.5, 7],
    normal: [6, 6.5],
    concern: [5, 6],
    warning: [0, 5],
    source: 'NSF adult (40-49)',
  },
  WalkingSpeed: {
    metric: 'Walking Speed',
    unit: 'km/h',
    optimal: [5.5, 7],
    good: [4.8, 5.5],
    normal: [4.0, 4.8],
    concern: [3.2, 4.0],
    warning: [0, 3.2],
    source: 'Gait speed (40-49)',
  },
  AppleWalkingSteadiness: {
    metric: 'Walking Steadiness',
    unit: '%',
    optimal: [95, 100],
    good: [90, 95],
    normal: [85, 90],
    concern: [80, 85],
    warning: [0, 80],
    source: 'Apple Health (fall risk)',
  },
};

export function assessMetric(metricName: string, value: number, lang: 'en' | 'zh' = 'en'): MetricAssessment | null {
  const standard = STANDARDS[metricName];
  if (!standard) return null;

  let level: MetricAssessment['level'] = 'normal';
  let interpretation = '';
  let recommendation = '';

  if (value >= standard.optimal[0] && value <= standard.optimal[1]) {
    level = 'optimal';
    interpretation = lang === 'zh'
      ? `优秀。您的${standard.metric}处于 43 岁男性的最佳范围。`
      : `Excellent. Your ${standard.metric} is in the optimal range for a 43-year-old male.`;
  } else if (value >= standard.good[0] && value <= standard.good[1]) {
    level = 'good';
    interpretation = lang === 'zh'
      ? `良好。您的${standard.metric}高于平均水平。`
      : `Good. Your ${standard.metric} is above average.`;
  } else if (value >= standard.normal[0] && value <= standard.normal[1]) {
    level = 'normal';
    interpretation = lang === 'zh' ? '正常范围，但仍有提升空间。' : 'Normal range, but room for improvement.';
  } else if (value >= standard.concern[0] && value <= standard.concern[1]) {
    level = 'concern';
    interpretation = lang === 'zh' ? '需要关注，低于建议水平。' : 'Needs attention. Below recommended levels.';
    recommendation = generateRecommendation(metricName, value, standard);
  } else {
    level = 'warning';
    interpretation = lang === 'zh' ? '令人担忧，建议咨询医疗专业人员。' : 'Concerning. Consult a healthcare provider.';
    recommendation = generateRecommendation(metricName, value, standard);
  }

  return {
    metric: standard.metric,
    value,
    level,
    interpretation,
    recommendation: recommendation || undefined,
  };
}

function generateRecommendation(metric: string, value: number, std: HealthStandard): string {
  switch (metric) {
    case 'RestingHeartRate':
      if (value > 75) return 'Consider cardiovascular exercise 3-4x/week. Monitor stress levels.';
      break;
    case 'HeartRateVariabilitySDNN':
      if (value < 30) return 'Increase recovery time, reduce stress, improve sleep quality.';
      break;
    case 'VO2Max':
      if (value < 35) return 'Add high-intensity interval training (HIIT) 2x/week. Gradual progression recommended.';
      break;
    case 'BodyMassIndex':
      if (value > 27) return 'Gradual weight loss target: 0.5-1kg/week. Combine diet + exercise.';
      break;
    case 'BodyFatPercentage':
      if (value > 25) return 'Focus on strength training + calorie deficit. Target: 18-22% body fat.';
      break;
    case 'StepCount':
      if (value < 7500) return 'Gradually increase daily steps. Target: 10,000 steps/day.';
      break;
    case 'SleepDuration':
      if (value < 6.5) return 'Prioritize 7-8 hours sleep. Consistent sleep schedule critical for recovery.';
      break;
    case 'WalkingSpeed':
      if (value < 4.8) return 'Walking speed predicts longevity. Add brisk walking intervals.';
      break;
  }
  return '';
}

export function calculateHealthScore(metrics: Record<string, number>, lang: 'en' | 'zh' = 'en'): HealthScore {
  const assessments = Object.entries(metrics)
    .map(([key, val]) => assessMetric(key, val, lang))
    .filter(Boolean) as MetricAssessment[];

  const scoreMap = { optimal: 100, good: 80, normal: 60, concern: 40, warning: 20 };
  const scores = assessments.map(a => scoreMap[a.level]);
  const overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Category scores
  const cardioMetrics = ['RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max', 'OxygenSaturation'];
  const fitnessMetrics = ['StepCount', 'WalkingSpeed', 'AppleWalkingSteadiness'];
  const bodyMetrics = ['BodyMassIndex', 'BodyFatPercentage'];

  const cardiovascular = calcCategoryScore(metrics, cardioMetrics);
  const fitness = calcCategoryScore(metrics, fitnessMetrics);
  const activity = metrics.StepCount ? (metrics.StepCount >= 10000 ? 100 : Math.round((metrics.StepCount / 10000) * 100)) : 0;
  const sleep = metrics.SleepDuration ? assessMetric('SleepDuration', metrics.SleepDuration)?.level === 'optimal' ? 100 : 60 : 0;

  const topConcerns: string[] = [];
  const strengths: string[] = [];

  assessments.forEach(a => {
    if (a.level === 'warning' || a.level === 'concern') {
      topConcerns.push(`${a.metric}: ${a.interpretation}`);
    }
    if (a.level === 'optimal') {
      strengths.push(a.metric);
    }
  });

  let interpretation = '';
  if (lang === 'zh') {
    if (overall >= 80) interpretation = '整体健康状况优秀，保持当前生活方式。';
    else if (overall >= 60) interpretation = '健康状况良好，部分指标仍有提升空间。';
    else if (overall >= 40) interpretation = '需要关注，请优先处理标记的问题。';
    else interpretation = '检测到多项健康问题，建议进行全面健康评估。';
  } else {
    if (overall >= 80) interpretation = 'Excellent overall health. Maintain current lifestyle.';
    else if (overall >= 60) interpretation = 'Good health with room for improvement in key areas.';
    else if (overall >= 40) interpretation = 'Needs attention. Prioritize the flagged concerns.';
    else interpretation = 'Multiple health concerns detected. Recommend comprehensive health assessment.';
  }

  return {
    overall,
    cardiovascular,
    fitness,
    sleep,
    activity,
    interpretation,
    topConcerns,
    strengths,
  };
}

function calcCategoryScore(metrics: Record<string, number>, keys: string[]): number {
  const scores = keys
    .map(k => metrics[k] ? assessMetric(k, metrics[k]) : null)
    .filter(Boolean)
    .map(a => ({ optimal: 100, good: 80, normal: 60, concern: 40, warning: 20 }[a!.level]));
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

// ============================================================
// PERCENTILE COMPARISON (vs 43-year-old males)
// Based on clinical research: NHANES, Cooper Clinic, Framingham
// ============================================================

interface PercentileRange {
  p5: number; p10: number; p25: number; p50: number; p75: number; p90: number; p95: number;
}

// Reference distributions for 40-49 year old males
const PERCENTILE_TABLES: Record<string, PercentileRange> = {
  RestingHeartRate:         { p5: 48, p10: 52, p25: 58, p50: 66, p75: 74, p90: 80, p95: 86 },
  HeartRateVariabilitySDNN: { p5: 12, p10: 18, p25: 26, p50: 36, p75: 50, p90: 68, p95: 82 },
  VO2Max:                   { p5: 22, p10: 25, p25: 30, p50: 35, p75: 40, p90: 45, p95: 50 },
  OxygenSaturation:         { p5: 94, p10: 95, p25: 96, p50: 97, p75: 98, p90: 99, p95: 99.5 },
  BodyMassIndex:            { p5: 20, p10: 21.5, p25: 24, p50: 27, p75: 30, p90: 33, p95: 36 },
  BodyFatPercentage:        { p5: 11, p10: 14, p25: 18, p50: 23, p75: 27, p90: 31, p95: 34 },
  StepCount:                { p5: 2000, p10: 3000, p25: 5000, p50: 7000, p75: 9500, p90: 12000, p95: 14000 },
  SleepDuration:            { p5: 4.5, p10: 5.2, p25: 6.0, p50: 6.8, p75: 7.5, p90: 8.2, p95: 8.8 },
  WalkingSpeed:             { p5: 3.0, p10: 3.5, p25: 4.2, p50: 4.8, p75: 5.5, p90: 6.0, p95: 6.5 },
  AppleWalkingSteadiness:   { p5: 75, p10: 80, p25: 86, p50: 91, p75: 95, p90: 97, p95: 99 },
};

// For inverted metrics (lower = better), we flip the percentile
const INVERTED_METRICS = new Set(['RestingHeartRate', 'BodyMassIndex', 'BodyFatPercentage']);

export function calculatePercentile(metricName: string, value: number): number | null {
  const table = PERCENTILE_TABLES[metricName];
  if (!table) return null;

  const points = [
    { pct: 5, val: table.p5 },
    { pct: 10, val: table.p10 },
    { pct: 25, val: table.p25 },
    { pct: 50, val: table.p50 },
    { pct: 75, val: table.p75 },
    { pct: 90, val: table.p90 },
    { pct: 95, val: table.p95 },
  ];

  // Linear interpolation
  let percentile: number;
  if (value <= points[0].val) {
    percentile = points[0].pct * (value / points[0].val);
  } else if (value >= points[points.length - 1].val) {
    percentile = 95 + (5 * Math.min(1, (value - points[points.length - 1].val) / (points[points.length - 1].val * 0.1)));
  } else {
    let lower = points[0], upper = points[1];
    for (let i = 0; i < points.length - 1; i++) {
      if (value >= points[i].val && value <= points[i + 1].val) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }
    const ratio = (value - lower.val) / (upper.val - lower.val);
    percentile = lower.pct + ratio * (upper.pct - lower.pct);
  }

  // Invert for metrics where lower is better
  if (INVERTED_METRICS.has(metricName)) {
    percentile = 100 - percentile;
  }

  return Math.max(0, Math.min(100, Math.round(percentile)));
}

export function getPercentileLabel(pct: number, lang: 'en' | 'zh' = 'en'): string {
  if (lang === 'zh') {
    if (pct >= 90) return '前 10%';
    if (pct >= 75) return '高于平均';
    if (pct >= 50) return '平均';
    if (pct >= 25) return '低于平均';
    return '后 25%';
  }
  if (pct >= 90) return 'Top 10%';
  if (pct >= 75) return 'Above Average';
  if (pct >= 50) return 'Average';
  if (pct >= 25) return 'Below Average';
  return 'Bottom 25%';
}

// ============================================================
// TREND ANALYSIS (linear regression slope)
// ============================================================

export interface TrendResult {
  period: '30d' | '90d' | '1y';
  slope: number;           // change per day
  totalChange: number;     // slope * days
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;      // R² value 0-1
  label: string;
}

export function detectTrend(
  data: { date: string; value: number }[],
  period: '30d' | '90d' | '1y',
  invertedBetter = false
): TrendResult | null {
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const filtered = data.filter(d => new Date(d.date) >= cutoff && d.value > 0);
  if (filtered.length < 5) return null;

  // Linear regression
  const n = filtered.length;
  const t0 = new Date(filtered[0].date).getTime();
  const xs = filtered.map(d => (new Date(d.date).getTime() - t0) / 86400000); // days from start
  const ys = filtered.map(d => d.value);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumXX = xs.reduce((s, x) => s + x * x, 0);
  const sumYY = ys.reduce((s, y) => s + y * y, 0);

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const totalChange = slope * (xs[xs.length - 1] - xs[0]);

  // R² for confidence
  const ssRes = ys.reduce((s, y, i) => {
    const intercept = (sumY - slope * sumX) / n;
    const predicted = intercept + slope * xs[i];
    return s + (y - predicted) ** 2;
  }, 0);
  const meanY = sumY / n;
  const ssTot = ys.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // Determine direction - use normalized threshold (% of mean per day)
  const threshold = meanY * 0.001; // 0.1% of mean per day
  let direction: TrendResult['direction'];
  const effectiveSlope = invertedBetter ? -slope : slope;
  if (Math.abs(slope) < threshold || r2 < 0.05) {
    direction = 'stable';
  } else {
    direction = effectiveSlope > 0 ? 'improving' : 'declining';
  }

  const pctChange = meanY !== 0 ? (totalChange / meanY) * 100 : 0;
  let label = '';
  if (direction === 'stable') {
    label = 'Stable';
  } else {
    const arrow = direction === 'improving' ? '↑' : '↓';
    label = `${arrow} ${Math.abs(pctChange).toFixed(1)}%`;
  }

  return { period, slope, totalChange, direction, confidence: r2, label };
}

// ============================================================
// SLEEP STAGE BREAKDOWN ANALYSIS
// ============================================================

export interface SleepStageAnalysis {
  stage: string;
  avgMinutes: number;
  percentage: number;
  idealRange: [number, number]; // percentage range
  status: 'good' | 'low' | 'high';
  interpretation: string;
}

export function analyzeSleepStages(sleepData: { stage_AsleepCore_min?: number; stage_AsleepDeep_min?: number; stage_AsleepREM_min?: number; stage_Awake_min?: number; total_hours: number }[], lang: 'en' | 'zh' = 'en'): SleepStageAnalysis[] {
  const recent = sleepData.slice(-30).filter(s => s.total_hours > 0);
  if (recent.length === 0) return [];

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const coreVals = recent.map(s => s.stage_AsleepCore_min ?? 0);
  const deepVals = recent.map(s => s.stage_AsleepDeep_min ?? 0);
  const remVals = recent.map(s => s.stage_AsleepREM_min ?? 0);
  const awakeVals = recent.map(s => s.stage_Awake_min ?? 0);
  const totalMin = recent.map(s => s.total_hours * 60);

  const avgCore = avg(coreVals);
  const avgDeep = avg(deepVals);
  const avgREM = avg(remVals);
  const avgAwake = avg(awakeVals);
  const avgTotal = avg(totalMin);

  if (avgTotal === 0) return [];

  const analyze = (
    stage: string, avgMin: number, idealPct: [number, number]
  ): SleepStageAnalysis => {
    const pct = (avgMin / avgTotal) * 100;
    let status: 'good' | 'low' | 'high' = 'good';
    let interpretation = '';

    if (pct < idealPct[0]) {
      status = 'low';
      interpretation = lang === 'zh'
        ? `低于理想范围。目标：总睡眠的 ${idealPct[0]}-${idealPct[1]}%。`
        : `Below ideal range. Target: ${idealPct[0]}-${idealPct[1]}% of total sleep.`;
    } else if (pct > idealPct[1]) {
      status = 'high';
      interpretation = lang === 'zh'
        ? '高于典型范围，可能存在睡眠碎片化。'
        : 'Above typical range. May indicate sleep fragmentation.';
    } else {
      interpretation = lang === 'zh'
        ? '处于 43 岁男性的健康范围内。'
        : 'Within healthy range for a 43-year-old male.';
    }

    return { stage, avgMinutes: Math.round(avgMin), percentage: Math.round(pct * 10) / 10, idealRange: idealPct, status, interpretation };
  };

  // Ideal percentages for adults (AASM guidelines)
  return [
    analyze('Deep Sleep', avgDeep, [13, 23]),
    analyze('REM Sleep', avgREM, [20, 25]),
    analyze('Core Sleep', avgCore, [45, 55]),
    analyze('Awake', avgAwake, [2, 10]),
  ];
}

// ============================================================
// ACTIVITY RING ANALYSIS
// ============================================================

export interface ActivityBreakdown {
  metric: string;
  avg: number;
  goal: number;
  completionRate: number; // % of days meeting goal
  trend: 'improving' | 'declining' | 'stable';
  icon: string;
}

export function analyzeActivityRings(activity: { activeEnergy: number; activeEnergyGoal: number; exerciseMin: number; exerciseGoal: number; standHours: number; standGoal: number; date: string }[]): ActivityBreakdown[] {
  const recent = activity.slice(-30).filter(a => a.activeEnergy > 0);
  if (recent.length === 0) return [];

  const moveCompletion = recent.filter(a => a.activeEnergy >= a.activeEnergyGoal).length / recent.length * 100;
  const exerciseCompletion = recent.filter(a => a.exerciseMin >= a.exerciseGoal).length / recent.length * 100;
  const standCompletion = recent.filter(a => a.standHours >= a.standGoal).length / recent.length * 100;

  const avgMove = recent.reduce((s, a) => s + a.activeEnergy, 0) / recent.length;
  const avgExercise = recent.reduce((s, a) => s + a.exerciseMin, 0) / recent.length;
  const avgStand = recent.reduce((s, a) => s + a.standHours, 0) / recent.length;

  // Simple trend: compare last 15 vs first 15
  const half = Math.floor(recent.length / 2);
  const first = recent.slice(0, half);
  const second = recent.slice(half);

  const trendOf = (getter: (a: typeof recent[0]) => number): 'improving' | 'declining' | 'stable' => {
    const avg1 = first.reduce((s, a) => s + getter(a), 0) / first.length;
    const avg2 = second.reduce((s, a) => s + getter(a), 0) / second.length;
    const pctChange = avg1 > 0 ? ((avg2 - avg1) / avg1) * 100 : 0;
    if (Math.abs(pctChange) < 5) return 'stable';
    return pctChange > 0 ? 'improving' : 'declining';
  };

  return [
    { metric: 'Move (kcal)', avg: Math.round(avgMove), goal: recent[0]?.activeEnergyGoal ?? 300, completionRate: Math.round(moveCompletion), trend: trendOf(a => a.activeEnergy), icon: '🔴' },
    { metric: 'Exercise (min)', avg: Math.round(avgExercise), goal: recent[0]?.exerciseGoal ?? 30, completionRate: Math.round(exerciseCompletion), trend: trendOf(a => a.exerciseMin), icon: '🟢' },
    { metric: 'Stand (hrs)', avg: Math.round(avgStand * 10) / 10, goal: recent[0]?.standGoal ?? 12, completionRate: Math.round(standCompletion), trend: trendOf(a => a.standHours), icon: '🔵' },
  ];
}

export function getRiskLevel(level: MetricAssessment['level'], lang: 'en' | 'zh' = 'en'): string {
  if (lang === 'zh') {
    switch (level) {
      case 'optimal': return '优秀';
      case 'good': return '良好';
      case 'normal': return '正常';
      case 'concern': return '需关注';
      case 'warning': return '高风险';
    }
  }
  switch (level) {
    case 'optimal': return 'Excellent';
    case 'good': return 'Good';
    case 'normal': return 'Normal';
    case 'concern': return 'Needs Attention';
    case 'warning': return 'High Risk';
  }
}

export function getLevelColor(level: MetricAssessment['level']): string {
  switch (level) {
    case 'optimal': return 'text-green-600 dark:text-green-400';
    case 'good': return 'text-blue-600 dark:text-blue-400';
    case 'normal': return 'text-brand-600 dark:text-brand-400';
    case 'concern': return 'text-orange-600 dark:text-orange-400';
    case 'warning': return 'text-red-600 dark:text-red-400';
  }
}

export function getLevelBg(level: MetricAssessment['level']): string {
  switch (level) {
    case 'optimal': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'good': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    case 'normal': return 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800';
    case 'concern': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    case 'warning': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }
}

// ============================================================
// DETAILED ANALYSIS (1 metric test)
// ============================================================

export interface DetailedAnalysis {
  clinicalSignificance: string;
  healthImplications: string;
  actionableIntervention: string;
}

export function getDetailedAnalysis(
  metricName: string,
  value: number,
  lang: 'en' | 'zh' = 'en'
): DetailedAnalysis | null {
  let significance = '';
  let implications = '';
  let intervention = '';

  if (metricName === 'RestingHeartRate') {
    significance = lang === 'zh'
      ? '静息心率反映心血管健康和自主神经平衡。高于 60 bpm 的每 10 次/分钟增加与全因死亡率增加约 17% 相关（Framingham 心脏研究）。较低的静息心率表明心脏效率更高。'
      : 'Resting heart rate (RHR) reflects cardiovascular fitness and autonomic balance. Each 10 bpm increase above 60 bpm is associated with ~17% higher all-cause mortality risk (Framingham Heart Study). Lower RHR indicates better cardiac efficiency.';

    if (lang === 'zh') {
      implications = value > 80 ? '心血管疾病风险比最佳范围高 2.3 倍（AHA 2024）' : value > 70 ? '中等心血管负荷' : '处于健康范围';
    } else {
      implications = value > 80 ? '2.3x higher CVD risk vs optimal range (AHA 2024)' : value > 70 ? 'Moderate cardiovascular load' : 'Within healthy range';
    }

    if (value > 75) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每周 3 次，每次 20 分钟快走。第 3-4 周：增加 2 次 HIIT（20 秒冲刺 / 40 秒休息 × 8 轮）。监测每周平均静息心率。'
        : 'Week 1-2: 20min brisk walk 3x/week. Week 3-4: Add 2x HIIT (20s sprint / 40s rest × 8 rounds). Monitor weekly avg RHR.';
    } else {
      intervention = lang === 'zh'
        ? '保持当前活动量。考虑增加 1 次二区有氧训练。'
        : 'Maintain current activity. Consider adding 1x zone 2 cardio.';
    }
  } else if (metricName === 'HeartRateVariabilitySDNN') {
    significance = lang === 'zh'
      ? 'HRV SDNN 测量 24 小时内心跳间隔变异性。低 HRV（<30ms）预示心脏事件，与慢性压力、过度训练和睡眠质量差有关。较高的 HRV 表明副交感神经张力更好。'
      : 'HRV SDNN measures beat-to-beat heart rate variability over 24h. Low HRV (<30ms) predicts cardiac events and is linked to chronic stress, overtraining, and poor sleep quality. Higher HRV indicates better parasympathetic tone.';

    if (lang === 'zh') {
      implications = value < 20 ? '心脏事件风险升高，建议咨询心脏科医生' : value < 30 ? '检测到自主神经失衡' : '自主神经功能健康';
    } else {
      implications = value < 20 ? 'Elevated cardiac event risk. Consult cardiologist.' : value < 30 ? 'Autonomic imbalance detected' : 'Healthy autonomic function';
    }

    if (value < 30) {
      intervention = lang === 'zh'
        ? '第 1-2 周：优先保证 7-8 小时睡眠，下午 2 点后减少咖啡因。第 3-4 周：每天增加 10 分钟呼吸训练（4-7-8 技巧）。每周跟踪 HRV。'
        : 'Week 1-2: 7-8h sleep priority, reduce caffeine after 2pm. Week 3-4: Add 10min daily breathwork (4-7-8 technique). Track HRV weekly.';
    } else {
      intervention = lang === 'zh'
        ? '保持睡眠质量。考虑每周 3 次冥想。'
        : 'Maintain sleep quality. Consider meditation 3x/week.';
    }
  } else if (metricName === 'VO2Max') {
    significance = lang === 'zh'
      ? '最大摄氧量是心肺健康的黄金标准。每增加 1 mL/kg/min，全因死亡率降低约 15%（Cooper Clinic）。优秀的最大摄氧量（40-49 岁男性 >42）预示长寿。'
      : 'VO₂ Max is the gold standard for cardiorespiratory fitness. Each 1 mL/kg/min increase reduces all-cause mortality by ~15% (Cooper Clinic). Superior VO₂ Max (>42 for 40-49y males) predicts longevity.';

    if (lang === 'zh') {
      implications = value < 30 ? '心肺健康差，死亡风险比健康同龄人高 2 倍' : value < 35 ? '低于平均水平' : '良好至优秀';
    } else {
      implications = value < 30 ? 'Poor cardiorespiratory fitness, 2x mortality risk vs fit peers' : value < 35 ? 'Below average fitness' : 'Good to excellent fitness';
    }

    if (value < 35) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每周 2 次，每次 30 分钟二区有氧（最大心率 60-70%）。第 3-4 周：增加 1 次最大摄氧量间歇（4 分钟 @ 最大心率 90% / 3 分钟休息 × 4）。8 周后重测。'
        : 'Week 1-2: 2x 30min zone 2 cardio (60-70% max HR). Week 3-4: Add 1x VO₂ Max interval (4min @ 90% max HR / 3min rest × 4). Retest in 8 weeks.';
    } else {
      intervention = lang === 'zh'
        ? '保持每周 2-3 次 HIIT 或节奏跑。'
        : 'Maintain 2-3x/week HIIT or tempo runs.';
    }
  } else if (metricName === 'OxygenSaturation') {
    significance = lang === 'zh'
      ? '血氧饱和度衡量血红蛋白携氧能力。正常为 95-100%。低于 90% 为低氧血症，可能提示呼吸或心血管问题。'
      : 'Oxygen saturation measures hemoglobin oxygen-carrying capacity. Normal: 95-100%. Below 90% indicates hypoxemia, may signal respiratory or cardiovascular issues.';

    if (lang === 'zh') {
      implications = value < 92 ? '低氧血症，需立即就医' : value < 95 ? '低于正常，监测慢性缺氧' : '正常范围';
    } else {
      implications = value < 92 ? 'Hypoxemia detected. Seek immediate care.' : value < 95 ? 'Below normal. Monitor for chronic hypoxia.' : 'Normal range';
    }

    if (value < 95) {
      intervention = lang === 'zh'
        ? '咨询呼吸科或心脏科医生。考虑肺功能测试。避免高海拔环境。'
        : 'Consult pulmonologist or cardiologist. Consider pulmonary function test. Avoid high altitude.';
    } else {
      intervention = lang === 'zh' ? '保持正常呼吸健康。' : 'Maintain normal respiratory health.';
    }
  } else if (metricName === 'BodyMassIndex') {
    significance = lang === 'zh'
      ? 'BMI 是体重相对身高的指标。WHO 标准：18.5-24.9 为正常。BMI >30 与 2 型糖尿病、心血管疾病风险显著升高相关。'
      : 'BMI measures weight relative to height. WHO standard: 18.5-24.9 is normal. BMI >30 is associated with significantly higher risk of type 2 diabetes and CVD.';

    if (lang === 'zh') {
      implications = value > 30 ? '肥胖，代谢综合征风险高' : value > 27 ? '超重，建议减重' : '正常至稍微超重';
    } else {
      implications = value > 30 ? 'Obese. High metabolic syndrome risk.' : value > 27 ? 'Overweight. Weight loss recommended.' : 'Normal to slightly overweight';
    }

    if (value > 27) {
      intervention = lang === 'zh'
        ? '第 1-4 周：目标每周减 0.5kg（热量赤字 500kcal/天）。增加蛋白质摄入（体重 kg × 1.6g）。每周 3 次力量训练。'
        : 'Week 1-4: Target 0.5kg/week loss (500kcal/day deficit). Increase protein (1.6g per kg bodyweight). 3x/week strength training.';
    } else {
      intervention = lang === 'zh' ? '保持当前体重。' : 'Maintain current weight.';
    }
  } else if (metricName === 'BodyFatPercentage') {
    significance = lang === 'zh'
      ? '体脂率比 BMI 更准确反映代谢健康。40-49 岁男性理想范围 10-18%。高体脂（>25%）与胰岛素抵抗和炎症相关。'
      : 'Body fat % is a better metabolic health marker than BMI. Ideal for 40-49y males: 10-18%. High body fat (>25%) is linked to insulin resistance and inflammation.';

    if (lang === 'zh') {
      implications = value > 30 ? '肥胖级体脂，代谢风险高' : value > 25 ? '超出健康范围' : '健康范围';
    } else {
      implications = value > 30 ? 'Obese-level body fat. High metabolic risk.' : value > 25 ? 'Above healthy range' : 'Healthy range';
    }

    if (value > 25) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每周 3 次全身力量训练（大肌群复合动作）。第 3-4 周：增加 2 次 HIIT。目标 6 个月内降至 18-22%。'
        : 'Week 1-2: 3x/week full-body strength training (compound lifts). Week 3-4: Add 2x HIIT. Target 18-22% in 6 months.';
    } else {
      intervention = lang === 'zh' ? '保持力量训练和有氧运动。' : 'Maintain strength + cardio.';
    }
  } else if (metricName === 'StepCount') {
    significance = lang === 'zh'
      ? '每日步数是日常活动量的简单指标。>10,000 步/天与全因死亡率降低 50% 相关（JAMA 2020）。每增加 1,000 步降低死亡率约 6%。'
      : 'Daily steps are a simple measure of physical activity. >10,000 steps/day is associated with 50% lower all-cause mortality (JAMA 2020). Each 1,000-step increase reduces mortality ~6%.';

    if (lang === 'zh') {
      implications = value < 5000 ? '久坐生活方式，心血管风险高' : value < 7500 ? '低于推荐水平' : '达到健康目标';
    } else {
      implications = value < 5000 ? 'Sedentary lifestyle. High CVD risk.' : value < 7500 ? 'Below recommended level' : 'Meeting health goals';
    }

    if (value < 7500) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每周增加 500 步。第 3-4 周：增加 1,000 步。使用计步器追踪。目标 12 周内达到 10,000 步。'
        : 'Week 1-2: Increase by 500 steps/week. Week 3-4: Increase by 1,000 steps/week. Use step tracker. Target 10,000 in 12 weeks.';
    } else {
      intervention = lang === 'zh' ? '保持当前步数。' : 'Maintain current step count.';
    }
  } else if (metricName === 'SleepDuration') {
    significance = lang === 'zh'
      ? '睡眠时长影响代谢、免疫和心血管健康。成年人理想睡眠 7-8 小时。<6 小时与肥胖、糖尿病和全因死亡率升高相关（NSF 2024）。'
      : 'Sleep duration affects metabolism, immunity, and cardiovascular health. Ideal for adults: 7-8h. <6h is linked to obesity, diabetes, and higher all-cause mortality (NSF 2024).';

    if (lang === 'zh') {
      implications = value < 6 ? '严重睡眠不足，多系统健康风险' : value < 6.5 ? '睡眠不足' : '健康睡眠时长';
    } else {
      implications = value < 6 ? 'Severe sleep deprivation. Multi-system health risk.' : value < 6.5 ? 'Insufficient sleep' : 'Healthy sleep duration';
    }

    if (value < 6.5) {
      intervention = lang === 'zh'
        ? '第 1-2 周：提前 30 分钟上床，关闭屏幕。第 3-4 周：固定作息时间（包括周末）。睡前 2 小时避免咖啡因和酒精。'
        : 'Week 1-2: Go to bed 30min earlier, screens off. Week 3-4: Fixed sleep schedule (incl. weekends). Avoid caffeine/alcohol 2h before bed.';
    } else {
      intervention = lang === 'zh' ? '保持睡眠习惯。' : 'Maintain sleep habits.';
    }
  } else if (metricName === 'WalkingSpeed') {
    significance = lang === 'zh'
      ? '步行速度是整体健康和长寿的强预测因子。步速 <4.0 km/h 与全因死亡率升高相关。快速步行（>5.5 km/h）预示更长寿命（Cooper Clinic）。'
      : 'Walking speed is a strong predictor of overall health and longevity. Gait speed <4.0 km/h is associated with higher all-cause mortality. Brisk walking (>5.5 km/h) predicts longer lifespan (Cooper Clinic).';

    if (lang === 'zh') {
      implications = value < 4.0 ? '步速慢，健康风险升高' : value < 4.8 ? '低于平均水平' : '健康步速';
    } else {
      implications = value < 4.0 ? 'Slow gait. Elevated health risk.' : value < 4.8 ? 'Below average gait speed' : 'Healthy gait speed';
    }

    if (value < 4.8) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每天 10 分钟快走练习。第 3-4 周：增加至 20 分钟。目标步速 >5.0 km/h。每周测量 1 次。'
        : 'Week 1-2: 10min daily brisk walking drills. Week 3-4: Increase to 20min. Target >5.0 km/h. Measure 1x/week.';
    } else {
      intervention = lang === 'zh' ? '保持步速。' : 'Maintain gait speed.';
    }
  } else if (metricName === 'AppleWalkingSteadiness') {
    significance = lang === 'zh'
      ? '步行稳定性反映平衡和跌倒风险。低稳定性（<80%）与未来 12 个月内跌倒风险增加相关。稳定性由 Apple Watch 通过加速度计和陀螺仪测量。'
      : 'Walking steadiness reflects balance and fall risk. Low steadiness (<80%) is associated with increased fall risk in the next 12 months. Measured by Apple Watch via accelerometer and gyroscope.';

    if (lang === 'zh') {
      implications = value < 80 ? '跌倒风险高，需评估' : value < 90 ? '稳定性稍低' : '步行稳定性良好';
    } else {
      implications = value < 80 ? 'High fall risk. Assessment needed.' : value < 90 ? 'Slightly reduced steadiness' : 'Good walking steadiness';
    }

    if (value < 90) {
      intervention = lang === 'zh'
        ? '第 1-2 周：每天 5 分钟单腿站立练习（每侧 30 秒 × 5 组）。第 3-4 周：增加平衡板或瑜伽。咨询物理治疗师。'
        : 'Week 1-2: 5min daily single-leg stance (30s each side × 5 sets). Week 3-4: Add balance board or yoga. Consult physiotherapist.';
    } else {
      intervention = lang === 'zh' ? '保持平衡训练。' : 'Maintain balance training.';
    }
  } else {
    return null;
  }

  return { clinicalSignificance: significance, healthImplications: implications, actionableIntervention: intervention };
}
