import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import MetricChart from '../components/MetricChart';
import TimeRangeSelector from '../components/TimeRangeSelector';
import { SleepEntry, TimeRange } from '../types';
import { fetchJson, filterByTimeRange, sampleData } from '../utils';
import { useTheme } from '../ThemeContext';

export default function SleepTab() {
  const { dark } = useTheme();
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [range, setRange] = useState<TimeRange>('3m');

  useEffect(() => {
    fetchJson<SleepEntry[]>('/data/sleep.json').then(setSleep);
  }, []);

  const filtered = useMemo(() => sampleData(filterByTimeRange(sleep, range), 90) as SleepEntry[], [sleep, range]);
  const gridColor = dark ? '#2e2e2e' : '#e5e7eb';
  const textColor = dark ? '#a1a1aa' : '#6b7280';

  const avgHours = useMemo(() => {
    if (sleep.length === 0) return 0;
    const last30 = sleep.slice(-30);
    return last30.reduce((s, d) => s + d.total_hours, 0) / last30.length;
  }, [sleep]);

  // Prepare stacked data
  const stackedData = useMemo(() => filtered.map(d => ({
    date: d.date,
    Deep: d.stage_AsleepDeep_min ? +(d.stage_AsleepDeep_min / 60).toFixed(2) : 0,
    Core: d.stage_AsleepCore_min ? +(d.stage_AsleepCore_min / 60).toFixed(2) : 0,
    REM: d.stage_AsleepREM_min ? +(d.stage_AsleepREM_min / 60).toFixed(2) : 0,
    Awake: d.stage_Awake_min ? +(d.stage_Awake_min / 60).toFixed(2) : 0,
  })), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Sleep</h2>
        <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          30d avg: {avgHours.toFixed(1)}h
        </span>
      </div>

      {/* Sleep Duration */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Sleep Duration</h3>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} width={30} domain={[0, 12]} />
            <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="total_hours" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Total Hours" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Stages */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Sleep Stages</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stackedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} width={30} label={{ value: 'hours', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: textColor } }} />
            <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: textColor }} />
            <Bar dataKey="Deep" stackId="a" fill="#1e40af" name="Deep" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Core" stackId="a" fill="#6366f1" name="Core" />
            <Bar dataKey="REM" stackId="a" fill="#a78bfa" name="REM" />
            <Bar dataKey="Awake" stackId="a" fill="#fbbf24" name="Awake" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional sleep metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart metricName="AppleSleepingWristTemperature" color="#f97316" />
        <MetricChart metricName="RespiratoryRate" color="#06b6d4" />
      </div>

      {/* Insights */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sleep Insights</h3>
        <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>Average sleep: <strong style={{ color: 'var(--text-primary)' }}>{avgHours.toFixed(1)} hours</strong> (last 30 days)</p>
          {avgHours < 7 && <p style={{ color: 'var(--warning)' }}>⚠️ Below recommended 7-9 hours</p>}
          {avgHours >= 7 && <p style={{ color: 'var(--success)' }}>✅ Within recommended range</p>}
        </div>
      </div>
    </div>
  );
}
