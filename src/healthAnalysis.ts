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

export function assessMetric(metricName: string, value: number): MetricAssessment | null {
  const standard = STANDARDS[metricName];
  if (!standard) return null;

  let level: MetricAssessment['level'] = 'normal';
  let interpretation = '';
  let recommendation = '';

  if (value >= standard.optimal[0] && value <= standard.optimal[1]) {
    level = 'optimal';
    interpretation = `Excellent. Your ${standard.metric} is in the optimal range for a 43-year-old male.`;
  } else if (value >= standard.good[0] && value <= standard.good[1]) {
    level = 'good';
    interpretation = `Good. Your ${standard.metric} is above average.`;
  } else if (value >= standard.normal[0] && value <= standard.normal[1]) {
    level = 'normal';
    interpretation = `Normal range, but room for improvement.`;
  } else if (value >= standard.concern[0] && value <= standard.concern[1]) {
    level = 'concern';
    interpretation = `Needs attention. Below recommended levels.`;
    recommendation = generateRecommendation(metricName, value, standard);
  } else {
    level = 'warning';
    interpretation = `Concerning. Consult a healthcare provider.`;
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

export function calculateHealthScore(metrics: Record<string, number>): HealthScore {
  const assessments = Object.entries(metrics)
    .map(([key, val]) => assessMetric(key, val))
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
  if (overall >= 80) interpretation = 'Excellent overall health. Maintain current lifestyle.';
  else if (overall >= 60) interpretation = 'Good health with room for improvement in key areas.';
  else if (overall >= 40) interpretation = 'Needs attention. Prioritize the flagged concerns.';
  else interpretation = 'Multiple health concerns detected. Recommend comprehensive health assessment.';

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

export function getRiskLevel(level: MetricAssessment['level']): string {
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
