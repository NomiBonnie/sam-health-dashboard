import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import MetricChart from '../components/MetricChart';
import TimeRangeSelector from '../components/TimeRangeSelector';
import { ActivityEntry, InventoryItem, TimeRange } from '../types';
import { fetchJson, filterByTimeRange, sampleData, isDataFresh, dedupInventory } from '../utils';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { assessMetric, type MetricAssessment } from '../healthAnalysis';

function StatusDot({ level }: { level: MetricAssessment['level'] }) {
  const colors: Record<string, string> = {
    optimal: 'bg-green-500', good: 'bg-green-400', normal: 'bg-yellow-500', concern: 'bg-orange-500', warning: 'bg-red-500',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[level]}`} />;
}

export default function MovementTab() {
  const { dark } = useTheme();
  const { lang, t } = useLanguage();
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [range, setRange] = useState<TimeRange>('3m');

  useEffect(() => {
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
    fetchJson<InventoryItem[]>('/data/inventory.json').then(d => setInventory(dedupInventory(d)));
  }, []);

  const filtered = useMemo(() => sampleData(filterByTimeRange(activity, range), 90), [activity, range]);
  const gridColor = dark ? '#2e2e2e' : '#e5e7eb';
  const textColor = dark ? '#a1a1aa' : '#6b7280';

  const movementSummary = useMemo(() => {
    if (inventory.length === 0) return null;
    const getValue = (name: string) => {
      const item = inventory.find(i => i.shortName === name);
      if (!item || !isDataFresh(item.lastDate)) return null;
      return item.recent30dAvg ?? item.latestValue ?? 0;
    };
    const steps = getValue('StepCount');
    const speed = getValue('WalkingSpeed');
    const steadiness = getValue('AppleWalkingSteadiness');

    const stepsAssess = steps && steps > 0 ? assessMetric('StepCount', steps, lang) : null;
    const speedAssess = speed && speed > 0 ? assessMetric('WalkingSpeed', speed, lang) : null;
    const steadinessAssess = steadiness && steadiness > 0 ? assessMetric('AppleWalkingSteadiness', steadiness, lang) : null;

    const stepsSentence = steps && steps > 0
      ? (lang === 'zh'
        ? `日均步数 ${Math.round(steps).toLocaleString()} 步${steps >= 10000 ? '，达到 WHO 推荐标准（10,000 步/天）。' : `，低于 WHO 推荐的 10,000 步/天。`}`
        : `Daily average: ${Math.round(steps).toLocaleString()} steps${steps >= 10000 ? ' — meets WHO recommendation (10,000 steps/day).' : ` — below WHO recommendation of 10,000 steps/day.`}`)
      : null;

    const mobilityItems = [
      speedAssess ? { label: speedAssess.metric, level: speedAssess.level } : null,
      steadinessAssess ? { label: steadinessAssess.metric, level: steadinessAssess.level } : null,
      stepsAssess ? { label: stepsAssess.metric, level: stepsAssess.level } : null,
    ].filter(Boolean) as { label: string; level: MetricAssessment['level'] }[];

    return { stepsSentence, mobilityItems };
  }, [inventory, lang]);

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('movement') as string}</h2>

      {/* Movement Summary */}
      {movementSummary && (
        <div className="card p-5">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-3">
            {t('movementSummaryTitle') as string}
          </h3>
          {movementSummary.stepsSentence && (
            <p className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed mb-3">{movementSummary.stepsSentence}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {movementSummary.mobilityItems.map(item => (
              <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                <StatusDot level={item.level} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <section className="space-y-4">
        <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{t('tabActivity') as string}</h3>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Active Energy</h3>
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
              <YAxis tick={{ fontSize: 10, fill: textColor }} width={40} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="activeEnergy" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} name="Active Energy (kcal)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart metricName="StepCount" color="#3b82f6" />
          <MetricChart metricName="DistanceWalkingRunning" color="#8b5cf6" />
          <MetricChart metricName="ActiveEnergyBurned" color="#ef4444" />
          <MetricChart metricName="AppleExerciseTime" color="#22c55e" />
          <MetricChart metricName="FlightsClimbed" color="#f59e0b" />
          <MetricChart metricName="AppleStandTime" color="#06b6d4" />
        </div>
      </section>

      {/* Mobility */}
      <section className="space-y-4">
        <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{t('mobility') as string}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart metricName="WalkingSpeed" color="#3b82f6" />
          <MetricChart metricName="WalkingStepLength" color="#8b5cf6" />
          <MetricChart metricName="WalkingDoubleSupportPercentage" color="#f97316" />
          <MetricChart metricName="WalkingAsymmetryPercentage" color="#ef4444" />
          <MetricChart metricName="StairAscentSpeed" color="#22c55e" />
          <MetricChart metricName="StairDescentSpeed" color="#06b6d4" />
          <MetricChart metricName="AppleWalkingSteadiness" color="#14b8a6" />
          <MetricChart metricName="SixMinuteWalkTestDistance" color="#6366f1" />
        </div>
      </section>
    </div>
  );
}
