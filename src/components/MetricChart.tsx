import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { MetricEntry, TimeRange } from '../types';
import { fetchJson, filterByTimeRange, sampleData, computeMA, getMetricDisplayName, getMetricUnit, getTrend, getDisplayField, transformValue, FRACTION_TO_PCT } from '../utils';
import { useTheme } from '../ThemeContext';
import TimeRangeSelector from './TimeRangeSelector';

interface Props {
  metricName: string;
  chartType?: 'line' | 'area';
  color?: string;
  showRange?: boolean;
  height?: number;
  compact?: boolean;
}

export default function MetricChart({ metricName, chartType = 'line', color = '#3b82f6', showRange = false, height = 280, compact = false }: Props) {
  const { dark } = useTheme();
  const [data, setData] = useState<MetricEntry[]>([]);
  const [range, setRange] = useState<TimeRange>('1y');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJson<MetricEntry[]>(`/data/metrics/${metricName}.json`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [metricName]);

  const filtered = useMemo(() => filterByTimeRange(data, range), [data, range]);
  const sampled = useMemo(() => sampleData(filtered, 200), [filtered]);
  const trend = useMemo(() => getTrend(data), [data]);

  const field = getDisplayField(metricName);
  const needsTransform = FRACTION_TO_PCT.has(metricName);

  const chartData = useMemo(() => {
    // Use sum or avg depending on metric type, transform if needed
    const mapped = sampled.map(d => ({
      ...d,
      displayVal: transformValue(metricName, field === 'sum' ? d.sum : d.avg),
      displayMin: transformValue(metricName, d.min),
      displayMax: transformValue(metricName, d.max),
    }));
    const ma = mapped.map((_, i) => {
      if (i < 6) return null;
      let sum = 0, count = 0;
      for (let j = i - 6; j <= i; j++) {
        if (mapped[j].displayVal != null) { sum += mapped[j].displayVal; count++; }
      }
      return count > 0 ? Math.round((sum / count) * 100) / 100 : null;
    });
    return mapped.map((d, i) => ({ ...d, ma7: ma[i] }));
  }, [sampled, field, metricName]);

  const displayName = getMetricDisplayName(metricName);
  const unit = getMetricUnit(metricName);
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const latestDisplay = latest ? transformValue(metricName, field === 'sum' ? latest.sum : latest.avg) : null;

  if (loading) {
    return (
      <div className="card p-4 animate-pulse" style={{ height }}>
        <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
      </div>
    );
  }

  if (data.length === 0) return null;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)';
  const gridColor = dark ? '#2e2e2e' : '#e5e7eb';
  const textColor = dark ? '#a1a1aa' : '#6b7280';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`} style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </h3>
          {latest && (
            <span className="text-sm font-medium" style={{ color }}>
              {latestDisplay != null ? (latestDisplay < 100 ? latestDisplay.toFixed(1) : Math.round(latestDisplay).toLocaleString()) : ''} {unit}
            </span>
          )}
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {trendIcon}
          </span>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <ResponsiveContainer width="100%" height={compact ? 180 : height - 60}>
        {chartType === 'area' && showRange ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} width={40} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="displayMax" stroke="none" fill={`url(#grad-${metricName})`} />
            <Area type="monotone" dataKey="displayMin" stroke="none" fill={dark ? '#0f0f0f' : '#ffffff'} />
            <Line type="monotone" dataKey="displayVal" stroke={color} strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="ma7" stroke={color} strokeWidth={2} dot={false} strokeDasharray="4 2" opacity={0.7} />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} width={40} />
            <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="displayVal" stroke={color} strokeWidth={1.5} dot={false} name={field === 'sum' ? 'Daily Total' : 'Avg'} />
            <Line type="monotone" dataKey="ma7" stroke={color} strokeWidth={2} dot={false} strokeDasharray="4 2" opacity={0.6} name="7d MA" />
            {showRange && (
              <>
                <Line type="monotone" dataKey="displayMax" stroke={color} strokeWidth={0.5} dot={false} opacity={0.3} name="Max" />
                <Line type="monotone" dataKey="displayMin" stroke={color} strokeWidth={0.5} dot={false} opacity={0.3} name="Min" />
              </>
            )}
            {latestDisplay != null && <ReferenceLine y={latestDisplay} stroke={color} strokeDasharray="3 3" opacity={0.4} />}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
