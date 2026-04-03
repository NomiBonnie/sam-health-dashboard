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
        <h2 className="font-display text-xl uppercase tracking-luxury mb-4" style={{ color: 'var(--text-primary)', fontWeight: 300 }}>
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
                <div className="text-[10px] font-light uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  {getMetricDisplayName(m.shortName)}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
                    {displayLatest < 100 ? displayLatest.toFixed(1) : Math.round(displayLatest).toLocaleString()}
                  </span>
                  <span className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>{getMetricUnit(m.shortName)}</span>
                </div>
                <div className="text-[11px] font-light mt-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>30d avg: {displayRecent.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{trendIcon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Rings */}
      <div>
        <h2 className="font-display text-xl uppercase tracking-luxury mb-4" style={{ color: 'var(--text-primary)', fontWeight: 300 }}>
          30-Day Goal Completion
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Move', pct: ringStats.energy, bar: '#171717' },
            { label: 'Exercise', pct: ringStats.exercise, bar: '#525252' },
            { label: 'Stand', pct: ringStats.stand, bar: '#737373' },
          ].map(r => (
            <div key={r.label} className="card p-6">
              <div className="text-[10px] font-light uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                {r.label}
              </div>
              <div className="text-4xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>{r.pct}<span className="text-2xl">%</span></div>
              <div className="h-1 w-full" style={{ backgroundColor: 'var(--border)' }}>
                <div className="h-full transition-all duration-500" style={{ width: `${r.pct}%`, backgroundColor: r.bar }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card p-6">
        <h3 className="font-display text-lg uppercase tracking-luxury mb-4" style={{ color: 'var(--text-primary)', fontWeight: 300 }}>
          Recent Trends
        </h3>
        <div className="space-y-3 text-sm font-light" style={{ color: 'var(--text-secondary)' }}>
          {keyMetrics.slice(0, 4).map(m => {
            const r30 = m.recent30dAvg;
            const all = m.overallAvg;
            const diff = ((r30 - all) / all * 100);
            const direction = diff > 0 ? 'higher' : 'lower';
            return (
              <p key={m.shortName} className="leading-relaxed">
                <span className="uppercase text-[11px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {getMetricDisplayName(m.shortName)}
                </span>
                {' · '}
                30d avg <strong style={{ color: 'var(--text-primary)', fontWeight: 400 }}>{r30.toFixed(1)}</strong> is{' '}
                <strong style={{ color: Math.abs(diff) > 5 ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 400 }}>
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
