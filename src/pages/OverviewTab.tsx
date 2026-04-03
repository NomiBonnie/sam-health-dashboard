import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ActivityEntry, MetricEntry } from '../types';
import { fetchJson, formatNumber, getMetricDisplayName, getMetricUnit, getTrend } from '../utils';

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
    <div className="space-y-6">
      {/* Key metrics grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Key Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keyMetrics.map(m => {
            const displayLatest = m.latestValue;
            const displayRecent = m.recent30dAvg;
            const displayOverall = m.overallAvg;
            const trendDir = displayRecent > displayOverall * 1.03 ? 'up' : displayRecent < displayOverall * 0.97 ? 'down' : 'stable';
            const trendIcon = trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→';
            const trendColor = trendDir === 'up' ? 'var(--success)' : trendDir === 'down' ? 'var(--danger)' : 'var(--text-muted)';
            return (
              <div key={m.shortName} className="card p-4">
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  {getMetricDisplayName(m.shortName)}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {displayLatest < 100 ? displayLatest.toFixed(1) : Math.round(displayLatest).toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{getMetricUnit(m.shortName)}</span>
                  <span className="text-xs font-medium" style={{ color: trendColor }}>{trendIcon}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  30d avg: {displayRecent.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Rings */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>30-Day Ring Closure</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Move', pct: ringStats.energy, color: '#ef4444', icon: '🔴' },
            { label: 'Exercise', pct: ringStats.exercise, color: '#22c55e', icon: '🟢' },
            { label: 'Stand', pct: ringStats.stand, color: '#3b82f6', icon: '🔵' },
          ].map(r => (
            <div key={r.label} className="card p-4 text-center">
              <div className="text-3xl mb-1">{r.icon}</div>
              <div className="text-3xl font-bold" style={{ color: r.color }}>{r.pct}%</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{r.label} Goal</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Insights</h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {keyMetrics.slice(0, 4).map(m => {
            const r30 = m.recent30dAvg;
            const all = m.overallAvg;
            const diff = ((r30 - all) / all * 100);
            const direction = diff > 0 ? 'higher' : 'lower';
            return (
              <p key={m.shortName}>
                <strong style={{ color: 'var(--text-primary)' }}>{getMetricDisplayName(m.shortName)}</strong>: Recent 30d avg ({r30.toFixed(1)}) is{' '}
                <span style={{ color: Math.abs(diff) > 5 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                  {Math.abs(diff).toFixed(1)}% {direction}
                </span>{' '}
                than overall avg ({all.toFixed(1)})
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
