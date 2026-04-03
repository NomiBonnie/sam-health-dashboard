import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ActivityEntry, SleepEntry, MetricEntry } from '../types';
import { fetchJson, getMetricDisplayName } from '../utils';
import {
  assessMetric, calculateHealthScore, getRiskLevel, getLevelColor, getLevelBg,
  calculatePercentile, getPercentileLabel, detectTrend, analyzeSleepStages,
  analyzeActivityRings, type MetricAssessment, type TrendResult, type SleepStageAnalysis, type ActivityBreakdown,
} from '../healthAnalysis';

function TrendBadge({ trend }: { trend: TrendResult }) {
  const colors = {
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

function PercentileBar({ percentile }: { percentile: number }) {
  const color = percentile >= 75 ? 'bg-green-500' : percentile >= 50 ? 'bg-blue-500' : percentile >= 25 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-brand-500 mb-1">
        <span>Percentile vs 43y males</span>
        <span className="font-medium">{getPercentileLabel(percentile)} ({percentile}th)</span>
      </div>
      <div className="w-full h-2 bg-brand-200 dark:bg-brand-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentile}%` }} />
      </div>
    </div>
  );
}

function SleepBreakdownCard({ stages }: { stages: SleepStageAnalysis[] }) {
  if (stages.length === 0) return null;
  const stageColors: Record<string, string> = {
    'Deep Sleep': 'bg-indigo-500',
    'REM Sleep': 'bg-cyan-500',
    'Core Sleep': 'bg-blue-400',
    'Awake': 'bg-orange-400',
  };
  const stageEmoji: Record<string, string> = {
    'Deep Sleep': '🌙', 'REM Sleep': '💭', 'Core Sleep': '😴', 'Awake': '👀',
  };

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-4">
        🛏️ Sleep Stage Breakdown <span className="text-xs font-light normal-case tracking-normal text-brand-500">(30-day avg)</span>
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

function ActivityRingsCard({ rings }: { rings: ActivityBreakdown[] }) {
  if (rings.length === 0) return null;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-4">
        ⌚ Activity Rings <span className="text-xs font-light normal-case tracking-normal text-brand-500">(30-day avg)</span>
      </h3>
      <div className="space-y-4">
        {rings.map(r => {
          const trendColors = { improving: 'text-green-600', declining: 'text-red-500', stable: 'text-brand-500' };
          const trendArrow = { improving: '↑', declining: '↓', stable: '→' };
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

export default function AnalysisTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [metricData, setMetricData] = useState<Record<string, MetricEntry[]>>({});
  const [trendPeriod, setTrendPeriod] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(setInventory);
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
    fetchJson<SleepEntry[]>('/data/sleep.json').then(setSleep);

    // Load individual metric time series for trend analysis
    const metricFiles = [
      'RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max',
      'OxygenSaturation', 'BodyMassIndex', 'BodyFatPercentage',
      'StepCount', 'WalkingSpeed', 'AppleWalkingSteadiness',
    ];
    Promise.all(
      metricFiles.map(name =>
        fetchJson<MetricEntry[]>(`/data/${name}.json`)
          .then(data => ({ name, data }))
          .catch(() => ({ name, data: [] }))
      )
    ).then(results => {
      const map: Record<string, MetricEntry[]> = {};
      results.forEach(r => { map[r.name] = r.data; });
      setMetricData(map);
    });
  }, []);

  const currentMetrics = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach(item => {
      const val = item.latestValue ?? item.recent30dAvg ?? 0;
      map[item.shortName] = val;
    });
    if (sleep.length > 0) {
      const recent30Sleep = sleep.slice(-30);
      const avgSleep = recent30Sleep.reduce((sum, s) => sum + s.total_hours, 0) / recent30Sleep.length;
      map.SleepDuration = avgSleep;
    }
    return map;
  }, [inventory, sleep]);

  const healthScore = useMemo(() => calculateHealthScore(currentMetrics), [currentMetrics]);

  const INVERTED_BETTER = new Set(['RestingHeartRate', 'BodyMassIndex', 'BodyFatPercentage']);

  const keyAssessments = useMemo(() => {
    const keys = [
      'RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max', 'OxygenSaturation',
      'BodyMassIndex', 'BodyFatPercentage', 'StepCount', 'SleepDuration',
      'WalkingSpeed', 'AppleWalkingSteadiness',
    ];
    return keys
      .map(k => {
        const assessment = assessMetric(k, currentMetrics[k]);
        if (!assessment) return null;
        const percentile = calculatePercentile(k, currentMetrics[k]);
        const trendData = metricData[k]?.map(d => ({ date: d.date, value: d.avg })) || [];
        const trend = detectTrend(trendData, trendPeriod, INVERTED_BETTER.has(k));
        return { key: k, assessment, percentile, trend };
      })
      .filter(Boolean) as { key: string; assessment: MetricAssessment; percentile: number | null; trend: TrendResult | null }[];
  }, [currentMetrics, metricData, trendPeriod]);

  const sleepStages = useMemo(() => analyzeSleepStages(sleep), [sleep]);
  const activityRings = useMemo(() => analyzeActivityRings(activity), [activity]);

  const categoryScores = [
    { label: 'Cardiovascular', score: healthScore.cardiovascular, icon: '❤️' },
    { label: 'Fitness', score: healthScore.fitness, icon: '🏃' },
    { label: 'Sleep', score: healthScore.sleep, icon: '😴' },
    { label: 'Activity', score: healthScore.activity, icon: '📊' },
  ];

  return (
    <div className="space-y-8">
      {/* Overall Health Score */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-light tracking-tight mb-2 text-brand-900 dark:text-brand-100">
              Overall Health Score
            </h2>
            <p className="text-sm font-light text-brand-600 dark:text-brand-400">
              Age-adjusted for 43-year-old male · Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-light text-brand-900 dark:text-brand-100 mb-1">
              {healthScore.overall}
              <span className="text-2xl text-brand-500">/100</span>
            </div>
            <div className={`text-sm font-medium ${healthScore.overall >= 80 ? 'text-green-600 dark:text-green-400' : healthScore.overall >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {healthScore.overall >= 80 ? 'Excellent' : healthScore.overall >= 60 ? 'Good' : 'Needs Improvement'}
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

      {/* Strengths + Concerns */}
      {healthScore.strengths.length > 0 && (
        <div className="card p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-3">
            💪 Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {healthScore.strengths.map(s => (
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
            ⚠️ Areas Needing Attention
          </h3>
          <div className="space-y-3">
            {healthScore.topConcerns.map((concern, i) => (
              <p key={i} className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                {concern}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Sub-metric Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SleepBreakdownCard stages={sleepStages} />
        <ActivityRingsCard rings={activityRings} />
      </div>

      {/* Detailed Metric Assessments with Percentiles + Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light tracking-tight text-brand-900 dark:text-brand-100">
            Detailed Analysis
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
          {keyAssessments.map(({ key, assessment, percentile, trend }) => (
            <div key={key} className={`card p-5 border ${getLevelBg(assessment.level)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <h4 className="text-base font-medium text-brand-900 dark:text-brand-100">
                      {assessment.metric}
                    </h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(assessment.level)}`}>
                      {getRiskLevel(assessment.level)}
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
              {percentile !== null && <PercentileBar percentile={percentile} />}
              {assessment.recommendation && (
                <div className="pt-3 mt-3 border-t border-brand-200 dark:border-brand-700">
                  <p className="text-xs font-medium text-brand-900 dark:text-brand-100 mb-1 uppercase tracking-luxury">
                    Recommendation
                  </p>
                  <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                    {assessment.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-5 bg-brand-100/50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700">
        <p className="text-xs font-light text-brand-600 dark:text-brand-400 leading-relaxed">
          <strong className="font-medium text-brand-900 dark:text-brand-100">Medical Disclaimer:</strong> This analysis is for informational purposes only and does not constitute medical advice. Reference ranges are based on clinical guidelines (AHA, WHO, ACE, NSF, Cooper Clinic) adjusted for a 43-year-old male. Percentile rankings derived from NHANES and Framingham population data. Individual needs may vary. Consult healthcare providers for personalized medical guidance.
        </p>
      </div>
    </div>
  );
}
