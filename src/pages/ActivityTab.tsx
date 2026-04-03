import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import MetricChart from '../components/MetricChart';
import TimeRangeSelector from '../components/TimeRangeSelector';
import { ActivityEntry, TimeRange } from '../types';
import { fetchJson, filterByTimeRange, sampleData } from '../utils';
import { useTheme } from '../ThemeContext';

export default function ActivityTab() {
  const { dark } = useTheme();
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [range, setRange] = useState<TimeRange>('3m');

  useEffect(() => {
    fetchJson<ActivityEntry[]>('/data/activity.json').then(setActivity);
  }, []);

  const filtered = useMemo(() => sampleData(filterByTimeRange(activity, range), 90), [activity, range]);
  const gridColor = dark ? '#2e2e2e' : '#e5e7eb';
  const textColor = dark ? '#a1a1aa' : '#6b7280';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Activity</h2>

      {/* Activity Rings Chart */}
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
    </div>
  );
}
