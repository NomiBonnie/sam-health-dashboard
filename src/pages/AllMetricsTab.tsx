import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { fetchJson, getMetricDisplayName, getMetricUnit, formatNumber, dedupInventory } from '../utils';
import MetricChart from '../components/MetricChart';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

export default function AllMetricsTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(d => setInventory(dedupInventory(d)));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        All Metrics <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({inventory.length} types)</span>
      </h2>

      <div className="space-y-2">
        {inventory.map((item, idx) => {
          const isExpanded = expanded === item.shortName;
          const color = COLORS[idx % COLORS.length];
          const hasMetricFile = !['AppleStandHour', 'SleepAnalysis', 'HandwashingEvent', 'AudioExposureEvent', 'MindfulSession', 'LowCardioFitnessEvent', 'HighHeartRateEvent', 'SleepDurationGoal'].includes(item.shortName);

          return (
            <div key={item.shortName}>
              <button
                onClick={() => setExpanded(isExpanded ? null : item.shortName)}
                className="card w-full p-3 flex items-center justify-between text-left transition-colors"
                style={{ borderColor: isExpanded ? 'var(--accent)' : undefined }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {getMetricDisplayName(item.shortName)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.firstDate} → {item.lastDate} · {formatNumber(item.totalRecords)} records · {item.daysWithData} days
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.latestValue != null ? (item.latestValue < 100 ? item.latestValue.toFixed(1) : Math.round(item.latestValue)) : '—'} {getMetricUnit(item.shortName)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      avg: {item.overallAvg != null ? item.overallAvg.toFixed(1) : '—'}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {isExpanded && hasMetricFile && (
                <div className="mt-2">
                  <MetricChart metricName={item.shortName} color={color} />
                </div>
              )}
              {isExpanded && !hasMetricFile && (
                <div className="card p-4 mt-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Event-based data — no daily metrics chart available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
