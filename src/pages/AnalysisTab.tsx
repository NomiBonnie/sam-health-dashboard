import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ActivityEntry, SleepEntry, MetricEntry } from '../types';
import { fetchJson, getMetricDisplayName, isDataFresh, DATA_EXPORT_DATE, formatDate } from '../utils';
import { useLanguage } from '../LanguageContext';
import CorrelationMatrix from '../components/CorrelationMatrix';
import {
  assessMetric, calculateHealthScore, getRiskLevel, getLevelColor, getLevelBg,
  calculatePercentile, getPercentileLabel, detectTrend, analyzeSleepStages,
  analyzeActivityRings, getDetailedAnalysis, compareYears, generatePersonalizedPlan,
  type MetricAssessment, type TrendResult, type SleepStageAnalysis, type ActivityBreakdown,
  type YearComparison, type PersonalizedPlan,
} from '../healthAnalysis';

function TrendBadge({ trend }: { trend: TrendResult }) {
  const colors: Record<string, string> = {
    improving: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    declining: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    stable: 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[trend.direction]}`}>
      {trend.label} <span className="ml-1 opacity-60">({trend.period})</span>
    </span>
  );
}

function PercentileBar({ percentile, label, lang }: { percentile: number; label: string; lang: 'en' | 'zh' }) {
  const color = percentile >= 75 ? 'bg-green-500' : percentile >= 50 ? 'bg-blue-500' : percentile >= 25 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-brand-500 mb-1">
        <span>{label}</span>
        <span className="font-medium">{getPercentileLabel(percentile, lang)} ({percentile}{percentile % 10 === 1 && percentile !== 11 ? 'st' : percentile % 10 === 2 && percentile !== 12 ? 'nd' : percentile % 10 === 3 && percentile !== 13 ? 'rd' : 'th'})</span>
      </div>
      <div className="w-full h-2 bg-brand-200 dark:bg-brand-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentile}%` }} />
      </div>
    </div>
  );
}

function SleepBreakdownCard({ stages, title, avgLabel }: { stages: SleepStageAnalysis[]; title: string; avgLabel: string }) {
  if (stages.length === 0) return null;
  const stageColors: Record<string, string> = {
    'Deep Sleep': 'bg-indigo-500', 'REM Sleep': 'bg-cyan-500', 'Core Sleep': 'bg-blue-400', 'Awake': 'bg-orange-400',
  };
  const stageEmoji: Record<string, string> = {
    'Deep Sleep': '🌙', 'REM Sleep': '💭', 'Core Sleep': '😴', 'Awake': '👀',
  };

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-4">
        🛏️ {title} <span className="text-xs font-light normal-case tracking-normal text-brand-500">{avgLabel}</span>
      </h3>
      <div className="space-y-4">
        {stages.map(s => {
          const statusColor = s.status === 'good' ? 'text-green-600 dark:text-green-400' : s.status === 'low' ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400';
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-brand-900 dark:text-brand-100">
                  {stageEmoji[s.stage] || ''} {s.stage}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-600 dark:text-brand-400">{s.avgMinutes} min</span>
                  <span className={`text-xs font-medium ${statusColor}`}>{s.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-brand-200 dark:bg-brand-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${stageColors[s.stage] || 'bg-brand-400'}`} style={{ width: `${Math.min(100, s.percentage * 2)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-brand-400">Ideal: {s.idealRange[0]}–{s.idealRange[1]}%</span>
                <span className={`text-xs ${statusColor}`}>
                  {s.status === 'good' ? '✓' : s.status === 'low' ? '↓ Low' : '↑ High'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityRingsCard({ rings, title, avgLabel }: { rings: ActivityBreakdown[]; title: string; avgLabel: string }) {
  if (rings.length === 0) return null;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-4">
        ⌚ {title} <span className="text-xs font-light normal-case tracking-normal text-brand-500">{avgLabel}</span>
      </h3>
      <div className="space-y-4">
        {rings.map(r => {
          const trendColors: Record<string, string> = { improving: 'text-green-600', declining: 'text-red-500', stable: 'text-brand-500' };
          const trendArrow: Record<string, string> = { improving: '↑', declining: '↓', stable: '→' };
          return (
            <div key={r.metric} className="flex items-center gap-4">
              <span className="text-xl w-8 text-center">{r.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-brand-900 dark:text-brand-100">{r.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-700 dark:text-brand-300">{r.avg} / {r.goal}</span>
                    <span className={`text-xs ${trendColors[r.trend]}`}>{trendArrow[r.trend]}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-brand-200 dark:bg-brand-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${r.completionRate >= 80 ? 'bg-green-500' : r.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, r.completionRate)}%` }}
                  />
                </div>
                <div className="text-xs text-brand-400 mt-1">Goal met {r.completionRate}% of days</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WorkoutEntry {
  date: string;
  type: string;
  duration_min: number;
  distance_km?: number;
  calories?: number;
  source?: string;
  startDate?: string;
}

export default function AnalysisTab() {
  const { lang, t } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [metricData, setMetricData] = useState<Record<string, MetricEntry[]>>({});
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<'30d' | '90d' | '1y'>('90d');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(setInventory);
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
    fetchJson<SleepEntry[]>('/data/sleep.json').then(setSleep);
    fetchJson<WorkoutEntry[]>('/data/workouts.json').then(setWorkouts).catch(() => setWorkouts([]));

    const metricFiles = [
      'RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max',
      'OxygenSaturation', 'BodyMassIndex', 'BodyFatPercentage',
      'StepCount', 'WalkingSpeed', 'AppleWalkingSteadiness', 'HeartRateRecoveryOneMinute',
    ];
    Promise.all(
      metricFiles.map(name =>
        fetchJson<MetricEntry[]>(`/data/metrics/${name}.json`)
          .then(data => ({ name, data }))
          .catch(() => fetchJson<MetricEntry[]>(`/data/${name}.json`)
            .then(data => ({ name, data }))
            .catch(() => ({ name, data: [] }))
          )
      )
    ).then(results => {
      const map: Record<string, MetricEntry[]> = {};
      results.forEach(r => { map[r.name] = r.data; });
      setMetricData(map);
    });
  }, []);

  // Track which metrics are stale
  const staleMetrics = useMemo(() => {
    const stale: Record<string, string> = {}; // shortName -> lastDate
    inventory.forEach(item => {
      if (!isDataFresh(item.lastDate)) {
        stale[item.shortName] = item.lastDate;
      }
    });
    return stale;
  }, [inventory]);

  const currentMetrics = useMemo(() => {
    const map: Record<string, number> = {};
    // Calculate cutoff date based on trendPeriod
    const exportDate = new Date(DATA_EXPORT_DATE);
    const periodDays: Record<string, number> = { '30d': 30, '90d': 90, '1y': 365 };
    const days = periodDays[trendPeriod] || 90;
    const cutoff = new Date(exportDate);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    // For metrics with raw data, compute from metricData based on period
    const metricKeys = Object.keys(metricData);
    metricKeys.forEach(key => {
      const entries = metricData[key];
      if (!entries || entries.length === 0) return;
      // Skip stale metrics
      if (!isDataFresh(entries[entries.length - 1]?.date)) return;
      const filtered = entries.filter(d => d.date >= cutoffStr);
      if (filtered.length === 0) return;
      const isSumMetric = ['StepCount', 'DistanceWalkingRunning', 'DistanceCycling', 'ActiveEnergyBurned', 'BasalEnergyBurned', 'AppleExerciseTime', 'FlightsClimbed'].includes(key);
      if (isSumMetric) {
        // For sum metrics, compute daily average of sums
        const total = filtered.reduce((sum, d) => sum + (d.sum ?? d.avg ?? 0), 0);
        map[key] = total / filtered.length;
      } else {
        // For avg metrics, compute mean of averages
        const total = filtered.reduce((sum, d) => sum + (d.avg ?? 0), 0);
        map[key] = total / filtered.length;
      }
    });

    // Fallback: fill from inventory for metrics not in metricData
    inventory.forEach(item => {
      if (map[item.shortName] !== undefined) return;
      if (!isDataFresh(item.lastDate)) return;
      const val = item.recent30dAvg ?? item.latestValue ?? 0;
      map[item.shortName] = val;
    });

    // Sleep duration from sleep entries
    if (sleep.length > 0) {
      const filteredSleep = sleep.filter(s => s.date >= cutoffStr);
      const sleepData = filteredSleep.length > 0 ? filteredSleep : sleep.slice(-30);
      const avgSleep = sleepData.reduce((sum, s) => sum + s.total_hours, 0) / sleepData.length;
      map.SleepDuration = avgSleep;
    }
    return map;
  }, [inventory, sleep, metricData, trendPeriod]);

  const healthScore = useMemo(() => calculateHealthScore(currentMetrics, lang), [currentMetrics, lang]);

  const INVERTED_BETTER = new Set(['RestingHeartRate', 'BodyMassIndex', 'BodyFatPercentage']);

  // Build lastDate lookup for data-age annotations
  const lastDateMap = useMemo(() => {
    const m: Record<string, string> = {};
    inventory.forEach(item => { m[item.shortName] = item.lastDate; });
    return m;
  }, [inventory]);

  const keyAssessments = useMemo(() => {
    const keys = [
      'RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max', 'OxygenSaturation',
      'BodyMassIndex', 'BodyFatPercentage', 'StepCount', 'SleepDuration',
      'WalkingSpeed', 'AppleWalkingSteadiness', 'HeartRateRecoveryOneMinute',
    ];
    return keys
      .map(k => {
        // If metric is stale (>90d), return a stale marker instead
        if (staleMetrics[k]) {
          return { key: k, stale: true, lastDate: staleMetrics[k], assessment: null, percentile: null, trend: null, nearStale: false };
        }
        const assessment = assessMetric(k, currentMetrics[k], lang);
        if (!assessment) return null;
        // Skip percentile for OxygenSaturation — SpO2 has too narrow a clinical range for population comparison to be meaningful
        const percentile = k === 'OxygenSaturation' ? null : calculatePercentile(k, currentMetrics[k]);
        const trendData = metricData[k]?.map(d => ({ date: d.date, value: d.avg })) || [];
        const trend = detectTrend(trendData, trendPeriod, INVERTED_BETTER.has(k));
        // Mark metrics with data older than 30 days as "near-stale" for annotation
        const ld = lastDateMap[k];
        const nearStale = ld ? !isDataFresh(ld, 30) : false;
        return { key: k, stale: false, lastDate: ld || null, assessment, percentile, trend, nearStale };
      })
      .filter(Boolean) as ({ key: string; stale: boolean; lastDate: string | null; assessment: MetricAssessment | null; percentile: number | null; trend: TrendResult | null; nearStale: boolean })[];
  }, [currentMetrics, metricData, trendPeriod, staleMetrics, lastDateMap]);

  const sleepStages = useMemo(() => analyzeSleepStages(sleep, lang), [sleep, lang]);
  const activityRings = useMemo(() => analyzeActivityRings(activity), [activity]);

  const yearComparisons = useMemo(() => {
    const INVERTED_METRICS_SET = new Set(['RestingHeartRate', 'BodyMassIndex', 'BodyFatPercentage']);
    const metricNames = [
      'RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max',
      'OxygenSaturation', 'BodyMassIndex', 'BodyFatPercentage',
      'StepCount', 'WalkingSpeed', 'AppleWalkingSteadiness', 'HeartRateRecoveryOneMinute',
    ];
    return metricNames
      .map(name => {
        // Skip metrics with stale data
        if (staleMetrics[name]) return null;
        const data = metricData[name];
        if (!data || data.length === 0) return null;
        return compareYears(name, data, INVERTED_METRICS_SET.has(name));
      })
      .filter(Boolean) as YearComparison[];
  }, [metricData, staleMetrics]);

  const personalizedPlan = useMemo(() => {
    if (workouts.length === 0) return null;
    // Only pass workouts from last 90 days relative to export date
    const exportRef = new Date(DATA_EXPORT_DATE);
    const cutoff = new Date(exportRef);
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const recentWorkouts = workouts.filter(w => w.date >= cutoffStr);
    return generatePersonalizedPlan(currentMetrics, recentWorkouts, lang);
  }, [currentMetrics, workouts, lang]);

  const riskLevelText = (level: MetricAssessment['level']): string => {
    const map: Record<string, string> = {
      optimal: t('riskOptimal') as string,
      good: t('riskGood') as string,
      normal: t('riskNormal') as string,
      concern: t('riskConcern') as string,
      warning: t('riskWarning') as string,
    };
    return map[level] || getRiskLevel(level);
  };

  const categoryScores = [
    { label: t('categoryCardiovascular') as string, score: healthScore.cardiovascular, icon: '❤️' },
    { label: t('categoryFitness') as string, score: healthScore.fitness, icon: '🏃' },
    { label: t('categorySleep') as string, score: healthScore.sleep, icon: '😴' },
    { label: t('categoryActivity') as string, score: healthScore.activity, icon: '📊' },
  ];

  const scoreLabel = healthScore.overall >= 80 ? t('excellent') as string : healthScore.overall >= 60 ? t('good') as string : t('needsImprovement') as string;

  return (
    <div className="space-y-8">
      {/* Overall Health Score */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-light tracking-tight mb-2 text-brand-900 dark:text-brand-100">
              {t('overallHealthScore') as string}
            </h2>
            <p className="text-sm font-light text-brand-600 dark:text-brand-400">
              {t('ageAdjustedFor') as string} · {t('lastUpdated') as string}: {DATA_EXPORT_DATE}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-light text-brand-900 dark:text-brand-100 mb-1">
              {healthScore.overall}
              <span className="text-2xl text-brand-500">/100</span>
            </div>
            <div className={`text-sm font-medium ${healthScore.overall >= 80 ? 'text-green-600 dark:text-green-400' : healthScore.overall >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {scoreLabel}
            </div>
          </div>
        </div>
        <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed mb-6">
          {healthScore.interpretation}
        </p>

        {/* Category Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryScores.map(cat => (
            <div key={cat.label} className="text-center p-4 border border-brand-200 dark:border-brand-800 rounded-lg">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-2xl font-light text-brand-900 dark:text-brand-100 mb-1">{cat.score}</div>
              <div className="text-xs text-brand-500 uppercase tracking-luxury">{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Year-over-Year Comparison - prominent position after score */}
      {yearComparisons.length > 0 && (
        <div>
          <h2 className="text-xl font-light tracking-tight text-brand-900 dark:text-brand-100 mb-4">
            📅 {t('yearComparison') as string}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {yearComparisons.map(yc => {
              const arrow = yc.direction === 'improving' ? '↑' : yc.direction === 'declining' ? '↓' : '→';
              const color = yc.direction === 'improving'
                ? 'text-green-600 dark:text-green-400'
                : yc.direction === 'declining'
                ? 'text-red-600 dark:text-red-400'
                : 'text-brand-500';
              const bgColor = yc.direction === 'improving'
                ? 'border-green-200 dark:border-green-800'
                : yc.direction === 'declining'
                ? 'border-red-200 dark:border-red-800'
                : 'border-brand-200 dark:border-brand-800';
              return (
                <div key={yc.metric} className={`card p-3 border ${bgColor}`}>
                  <div className="text-xs text-brand-500 mb-1 truncate">{yc.metric}</div>
                  <div className="text-sm font-medium text-brand-900 dark:text-brand-100">
                    {yc.currentYear.avg < 100 ? yc.currentYear.avg.toFixed(1) : Math.round(yc.currentYear.avg).toLocaleString()}
                  </div>
                  <div className="text-xs text-brand-400">
                    {t('vsLastYear') as string}: {yc.previousYear.avg < 100 ? yc.previousYear.avg.toFixed(1) : Math.round(yc.previousYear.avg).toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium mt-1 ${color}`}>
                    {arrow} {Math.abs(yc.change)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personalized Plan */}
      {personalizedPlan && (
        <div className="card p-6">
          <h3 className="text-lg font-light tracking-tight text-brand-900 dark:text-brand-100 mb-4">
            🏋️ {t('personalizedPlan') as string}
          </h3>

          {/* Current Activity Pattern */}
          <div className="mb-5">
            <h4 className="text-xs font-medium tracking-luxury uppercase text-brand-500 mb-3">
              {t('currentPattern') as string}
            </h4>
            <div className="flex flex-wrap gap-2">
              {personalizedPlan.currentActivities.map(a => (
                <span key={a.type} className="px-3 py-1.5 text-sm bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 rounded-lg">
                  {a.type} · {a.frequency} · ~{a.avgDuration}{lang === 'zh' ? '分钟' : 'min'}
                </span>
              ))}
              {personalizedPlan.currentActivities.length === 0 && (
                <span className="text-sm text-brand-500">{lang === 'zh' ? '近90天无运动记录' : 'No workouts in last 90 days'}</span>
              )}
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="mb-5">
            <h4 className="text-xs font-medium tracking-luxury uppercase text-brand-500 mb-3">
              {t('recommendation') as string}
            </h4>
            <div className="space-y-3">
              {personalizedPlan.recommendations.map((rec, i) => {
                const priorityColors: Record<string, string> = {
                  high: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10',
                  medium: 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10',
                  low: 'border-brand-200 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/10',
                };
                const priorityLabels: Record<string, string> = {
                  high: lang === 'zh' ? '高' : 'HIGH',
                  medium: lang === 'zh' ? '中' : 'MED',
                  low: lang === 'zh' ? '低' : 'LOW',
                };
                return (
                  <div key={i} className={`p-3 rounded-lg border ${priorityColors[rec.priority]}`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${rec.priority === 'high' ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' : rec.priority === 'medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' : 'bg-brand-200 dark:bg-brand-700 text-brand-600'}`}>
                        {priorityLabels[rec.priority]}
                      </span>
                      <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                        {lang === 'zh' ? rec.textZh : rec.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div>
            <h4 className="text-xs font-medium tracking-luxury uppercase text-brand-500 mb-3">
              {t('weeklySchedule') as string}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {personalizedPlan.weeklyPlan.map(d => (
                <div key={d.day} className="text-center p-2 bg-brand-50 dark:bg-brand-800/50 rounded-lg">
                  <div className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1">
                    {lang === 'zh' ? d.activityZh.split(' ')[0] : d.day.slice(0, 3)}
                  </div>
                  <div className="text-[10px] text-brand-500 leading-tight">
                    {lang === 'zh' ? d.activityZh : d.activity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strengths + Concerns */}
      {healthScore.strengths.length > 0 && (
        <div className="card p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-3">
            💪 {t('strengths') as string}
          </h3>
          <div className="flex flex-wrap gap-2">
            {healthScore.strengths.map((s: string) => (
              <span key={s} className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full">
                {getMetricDisplayName(s)}
              </span>
            ))}
          </div>
        </div>
      )}

      {healthScore.topConcerns.length > 0 && (
        <div className="card p-6 border-l-4 border-orange-500">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-4">
            ⚠️ {t('areasNeedingAttention') as string}
          </h3>
          <div className="space-y-3">
            {healthScore.topConcerns.map((concern: string, i: number) => (
              <p key={i} className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                {concern}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Sub-metric Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SleepBreakdownCard stages={sleepStages} title={t('sleepBreakdown') as string} avgLabel={t('dayAvg') as string} />
        <ActivityRingsCard rings={activityRings} title={t('activityRings') as string} avgLabel={t('dayAvg') as string} />
      </div>

      {/* Detailed Metric Assessments with Percentiles + Trends + Deep Analysis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light tracking-tight text-brand-900 dark:text-brand-100">
            {t('detailedAnalysis') as string}
          </h2>
          <div className="flex items-center gap-1 bg-brand-100 dark:bg-brand-800 rounded-lg p-1">
            {(['30d', '90d', '1y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setTrendPeriod(p)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${trendPeriod === p ? 'bg-white dark:bg-brand-700 text-brand-900 dark:text-brand-100 shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {keyAssessments.map(({ key, stale, lastDate, assessment, percentile, trend, nearStale }) => {
            // Stale metric card
            if (stale) {
              return (
                <div key={key} className="card p-5 border bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 opacity-70">
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <h4 className="text-base font-medium text-brand-900 dark:text-brand-100">
                      {getMetricDisplayName(key)}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-200 dark:bg-brand-700 text-brand-500">
                      {t('noRecentData') as string}
                    </span>
                  </div>
                  <p className="text-sm font-light text-brand-500 mt-2">
                    ⚠️ {t('lastMeasured') as string}: {lastDate}
                  </p>
                </div>
              );
            }
            if (!assessment) return null;
            const detailed = getDetailedAnalysis(key, assessment.value, lang);
            const isExpanded = expandedMetric === key;

            return (
              <div key={key} className={`card p-5 border ${getLevelBg(assessment.level)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                      <h4 className="text-base font-medium text-brand-900 dark:text-brand-100">
                        {assessment.metric}
                      </h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(assessment.level)}`}>
                        {riskLevelText(assessment.level)}
                      </span>
                      {trend && <TrendBadge trend={trend} />}
                    </div>
                    <div className="text-2xl font-light text-brand-900 dark:text-brand-100 mb-2">
                      {assessment.value < 100 ? assessment.value.toFixed(1) : Math.round(assessment.value).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed mb-2">
                  {assessment.interpretation}
                </p>
                {nearStale && lastDate && (
                  <p className="text-xs font-light text-amber-600 dark:text-amber-400 mb-2">
                    ⚠️ {lang === 'zh' ? `数据日期: ${lastDate}` : `Data from: ${lastDate}`}
                  </p>
                )}
                {percentile !== null && <PercentileBar percentile={percentile} label={t('percentileVs') as string} lang={lang} />}
                {assessment.recommendation && (
                  <div className="pt-3 mt-3 border-t border-brand-200 dark:border-brand-700">
                    <p className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1 uppercase tracking-luxury">
                      {t('recommendation') as string}
                    </p>
                    <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                      {assessment.recommendation}
                    </p>
                  </div>
                )}

                {/* Deep Analysis Toggle */}
                {detailed && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedMetric(isExpanded ? null : key)}
                      className="text-xs text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors flex items-center gap-1"
                    >
                      <span className={`transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                      {lang === 'zh' ? '深度分析' : 'Deep Analysis'}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-brand-200 dark:border-brand-700 space-y-4">
                        <div>
                          <p className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1 uppercase tracking-luxury">
                            {lang === 'zh' ? '临床意义' : 'Clinical Significance'}
                          </p>
                          <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                            {detailed.clinicalSignificance}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1 uppercase tracking-luxury">
                            {lang === 'zh' ? '健康影响' : 'Health Implications'}
                          </p>
                          <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                            {detailed.healthImplications}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1 uppercase tracking-luxury">
                            {lang === 'zh' ? '改进方案' : 'Action Plan'}
                          </p>
                          <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                            {detailed.actionableIntervention}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-5 bg-brand-100/50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700">
        <p className="text-xs font-light text-brand-600 dark:text-brand-400 leading-relaxed">
          <strong className="font-medium text-brand-900 dark:text-brand-100">{t('medicalDisclaimer') as string}</strong>{' '}
          {t('disclaimerText') as string}
        </p>
      </div>

      {/* Metric Correlations */}
      <CorrelationMatrix />
    </div>
  );
}
