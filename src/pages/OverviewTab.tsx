import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ActivityEntry } from '../types';
import { fetchJson, getMetricDisplayName, getMetricUnit } from '../utils';

export default function OverviewTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(setInventory);
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
  }, []);

  const keyMetrics = useMemo(() => {
    const keys = ['HeartRate', 'RestingHeartRate', 'StepCount', 'ActiveEnergyBurned', 'VO2Max', 'OxygenSaturation', 'BodyMass', 'HeartRateVariabilitySDNN'];
    return keys.map(k => inventory.find(i => i.shortName === k)).filter(Boolean) as InventoryItem[];
  }, [inventory]);

  const ringStats = useMemo(() => {
    const last30 = activity.slice(-30);
    if (last30.length === 0) return { energy: 0, exercise: 0, stand: 0 };
    const energyHit = last30.filter(d => d.activeEnergy >= d.activeEnergyGoal).length;
    const exerciseHit = last30.filter(d => d.exerciseMin >= d.exerciseGoal).length;
    const standHit = last30.filter(d => d.standHours >= d.standGoal).length;
    return {
      energy: Math.round((energyHit / last30.length) * 100),
      exercise: Math.round((exerciseHit / last30.length) * 100),
      stand: Math.round((standHit / last30.length) * 100),
    };
  }, [activity]);

  return (
    <div className="space-y-8">
      {/* Key metrics grid */}
      <div>
        <h2 className="text-xl font-light tracking-tight mb-4 text-brand-900 dark:text-brand-100">
          Key Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {keyMetrics.map(m => {
            const displayLatest = m.latestValue;
            const displayRecent = m.recent30dAvg;
            const displayOverall = m.overallAvg;
            const trendDir = displayRecent > displayOverall * 1.03 ? 'up' : displayRecent < displayOverall * 0.97 ? 'down' : 'stable';
            const trendIcon = trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '—';
            return (
              <div key={m.shortName} className="card p-5">
                <div className="text-xs font-light tracking-luxury uppercase mb-2 text-brand-400 dark:text-brand-600">
                  {getMetricDisplayName(m.shortName)}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light text-brand-900 dark:text-brand-100">
                    {displayLatest < 100 ? displayLatest.toFixed(1) : Math.round(displayLatest).toLocaleString()}
                  </span>
                  <span className="text-xs font-light text-brand-500">{getMetricUnit(m.shortName)}</span>
                </div>
                <div className="text-xs font-light mt-2 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                  <span>30d avg: {displayRecent.toFixed(1)}</span>
                  <span className="text-brand-500">{trendIcon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Rings */}
      <div>
        <h2 className="text-xl font-light tracking-tight mb-4 text-brand-900 dark:text-brand-100">
          30-Day Goal Completion
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Move', pct: ringStats.energy, bar: 'bg-brand-900 dark:bg-brand-100' },
            { label: 'Exercise', pct: ringStats.exercise, bar: 'bg-brand-700 dark:bg-brand-300' },
            { label: 'Stand', pct: ringStats.stand, bar: 'bg-brand-500' },
          ].map(r => (
            <div key={r.label} className="card p-6">
              <div className="text-xs font-light tracking-luxury uppercase mb-3 text-brand-400 dark:text-brand-600">
                {r.label}
              </div>
              <div className="text-4xl font-light mb-3 text-brand-900 dark:text-brand-100">
                {r.pct}<span className="text-2xl">%</span>
              </div>
              <div className="h-1 w-full bg-brand-200 dark:bg-brand-800">
                <div 
                  className={`h-full transition-all duration-500 ${r.bar}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card p-6">
        <h3 className="text-lg font-light tracking-tight mb-4 text-brand-900 dark:text-brand-100">
          Recent Trends
        </h3>
        <div className="space-y-3 text-sm font-light text-brand-600 dark:text-brand-400 leading-relaxed">
          {keyMetrics.slice(0, 4).map(m => {
            const r30 = m.recent30dAvg;
            const all = m.overallAvg;
            const diff = ((r30 - all) / all * 100);
            const direction = diff > 0 ? 'higher' : 'lower';
            return (
              <p key={m.shortName}>
                <span className="text-xs tracking-luxury uppercase text-brand-500">
                  {getMetricDisplayName(m.shortName)}
                </span>
                {' · '}
                30d avg <strong className="font-medium text-brand-900 dark:text-brand-100">{r30.toFixed(1)}</strong> is{' '}
                <strong className={`font-medium ${Math.abs(diff) > 5 ? 'text-brand-900 dark:text-brand-100' : 'text-brand-600 dark:text-brand-400'}`}>
                  {Math.abs(diff).toFixed(1)}% {direction}
                </strong>{' '}
                than overall ({all.toFixed(1)})
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
