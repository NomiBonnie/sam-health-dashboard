import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ActivityEntry, SleepEntry } from '../types';
import { fetchJson, getMetricDisplayName } from '../utils';
import { assessMetric, calculateHealthScore, getRiskLevel, getLevelColor, getLevelBg, type MetricAssessment } from '../healthAnalysis';

export default function AnalysisTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sleep, setSleep] = useState<SleepEntry[]>([]);

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(setInventory);
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
    fetchJson<SleepEntry[]>('/data/sleep.json').then(setSleep);
  }, []);

  const currentMetrics = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach(item => {
      const val = item.latestValue ?? item.recent30dAvg ?? 0;
      map[item.shortName] = val;
    });
    
    // Add sleep duration from recent data
    if (sleep.length > 0) {
      const recent30Sleep = sleep.slice(-30);
      const avgSleep = recent30Sleep.reduce((sum, s) => sum + s.total_hours, 0) / recent30Sleep.length;
      map.SleepDuration = avgSleep;
    }
    
    return map;
  }, [inventory, sleep]);

  const healthScore = useMemo(() => calculateHealthScore(currentMetrics), [currentMetrics]);

  const keyAssessments = useMemo(() => {
    const keys = [
      'RestingHeartRate',
      'HeartRateVariabilitySDNN',
      'VO2Max',
      'OxygenSaturation',
      'BodyMassIndex',
      'BodyFatPercentage',
      'StepCount',
      'SleepDuration',
      'WalkingSpeed',
      'AppleWalkingSteadiness',
    ];
    return keys
      .map(k => assessMetric(k, currentMetrics[k]))
      .filter(Boolean) as MetricAssessment[];
  }, [currentMetrics]);

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

      {/* Strengths */}
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

      {/* Top Concerns */}
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

      {/* Detailed Metric Assessments */}
      <div>
        <h2 className="text-xl font-light tracking-tight mb-4 text-brand-900 dark:text-brand-100">
          Detailed Analysis
        </h2>
        <div className="space-y-4">
          {keyAssessments.map(assessment => (
            <div key={assessment.metric} className={`card p-5 border ${getLevelBg(assessment.level)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h4 className="text-base font-medium text-brand-900 dark:text-brand-100">
                      {assessment.metric}
                    </h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(assessment.level)}`}>
                      {getRiskLevel(assessment.level)}
                    </span>
                  </div>
                  <div className="text-2xl font-light text-brand-900 dark:text-brand-100 mb-2">
                    {assessment.value < 100 ? assessment.value.toFixed(1) : Math.round(assessment.value).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed mb-3">
                {assessment.interpretation}
              </p>
              {assessment.recommendation && (
                <div className="pt-3 border-t border-brand-200 dark:border-brand-700">
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
          <strong className="font-medium text-brand-900 dark:text-brand-100">Medical Disclaimer:</strong> This analysis is for informational purposes only and does not constitute medical advice. Reference ranges are based on clinical guidelines (AHA, WHO, ACE, NSF, Cooper Clinic) adjusted for a 43-year-old male. Individual needs may vary. Consult healthcare providers for personalized medical guidance.
        </p>
      </div>
    </div>
  );
}
