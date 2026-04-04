import { useState, useEffect, useMemo } from 'react';
import { MetricEntry } from '../types';
import { fetchJson } from '../utils';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { calculateCorrelations, CorrelationResult } from '../correlationAnalysis';

function rToColor(r: number, dark: boolean): string {
  const abs = Math.min(1, Math.abs(r));
  const intensity = Math.round(abs * 255);
  if (r > 0) {
    // Blue for positive
    return dark
      ? `rgba(96, 165, 250, ${abs * 0.9 + 0.1})`
      : `rgb(${255 - intensity}, ${255 - intensity * 0.3}, 255)`;
  } else if (r < 0) {
    // Red for negative
    return dark
      ? `rgba(248, 113, 113, ${abs * 0.9 + 0.1})`
      : `rgb(255, ${255 - intensity * 0.7}, ${255 - intensity})`;
  }
  return dark ? 'rgba(100,100,100,0.3)' : '#f5f5f5';
}

export default function CorrelationMatrix() {
  const { dark } = useTheme();
  const { lang } = useLanguage();
  const [metricData, setMetricData] = useState<Record<string, MetricEntry[]>>({});

  useEffect(() => {
    const files = [
      'StepCount', 'RestingHeartRate',
      'HeartRateVariabilitySDNN', 'ActiveEnergyBurned',
      'WalkingSpeed', 'FlightsClimbed',
    ];
    Promise.all([
      ...files.map(name =>
        fetchJson<MetricEntry[]>(`/data/metrics/${name}.json`)
          .then(data => ({ name, data }))
          .catch(() => ({ name, data: [] as MetricEntry[] }))
      ),
      // Sleep data comes from sleep.json, not metrics/SleepDuration.json
      fetchJson<{ date: string; total_hours: number }[]>('/data/sleep.json')
        .then(data => ({
          name: 'SleepDuration',
          data: data.filter(d => d.total_hours > 0 && d.total_hours <= 14).map(d => ({ date: d.date, avg: d.total_hours, min: d.total_hours, max: d.total_hours, sum: d.total_hours } as MetricEntry))
        }))
        .catch(() => ({ name: 'SleepDuration', data: [] as MetricEntry[] }))
    ]).then(results => {
      const map: Record<string, MetricEntry[]> = {};
      results.forEach(r => { map[r.name] = r.data; });
      setMetricData(map);
    });
  }, []);

  const result = useMemo<CorrelationResult | null>(() => {
    if (Object.keys(metricData).length === 0) return null;
    return calculateCorrelations(metricData);
  }, [metricData]);

  if (!result) return null;

  const significantPairs = result.pairs.filter(p => p.significant);
  const topCorrelations = [...significantPairs]
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
    .slice(0, 3);

  const CELL = 70;
  const LABEL_W = 200;
  const pairs = result.pairs;
  const svgW = LABEL_W + CELL + 20;
  const svgH = pairs.length * CELL + 30;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-light tracking-tight text-brand-900 dark:text-brand-100 mb-4">
        🔗 {lang === 'zh' ? '指标关联分析' : 'Metric Correlations'}
      </h3>

      {/* Heatmap rows */}
      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} className="block">
          {pairs.map((pair, i) => {
            const y = i * CELL;
            const label = lang === 'zh' ? pair.labelZh : pair.labelEn;
            const bg = pair.significant ? rToColor(pair.r, dark) : (dark ? 'rgba(50,50,50,0.3)' : '#f9fafb');
            const textColor = pair.significant
              ? (Math.abs(pair.r) > 0.3 ? (dark ? '#fff' : '#111') : (dark ? '#ccc' : '#333'))
              : (dark ? '#666' : '#aaa');

            return (
              <g key={i}>
                {/* Label */}
                <text
                  x={LABEL_W - 8}
                  y={y + CELL / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={12}
                  className="fill-brand-700 dark:fill-brand-300"
                >
                  {label}
                </text>
                {/* Cell */}
                <rect
                  x={LABEL_W}
                  y={y + 4}
                  width={CELL - 4}
                  height={CELL - 8}
                  rx={6}
                  fill={bg}
                  stroke={dark ? '#333' : '#e5e7eb'}
                  strokeWidth={1}
                />
                {/* r value */}
                <text
                  x={LABEL_W + CELL / 2 - 2}
                  y={y + CELL / 2 - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                  fontWeight="600"
                  fill={textColor}
                >
                  {pair.significant ? pair.r.toFixed(2) : '—'}
                </text>
                {/* n */}
                <text
                  x={LABEL_W + CELL / 2 - 2}
                  y={y + CELL / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fill={dark ? '#888' : '#999'}
                >
                  n={pair.n}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-brand-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: rToColor(-0.7, dark) }} />
          <span>{lang === 'zh' ? '负相关' : 'Negative'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: rToColor(0, dark) }} />
          <span>{lang === 'zh' ? '无关' : 'None'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: rToColor(0.7, dark) }} />
          <span>{lang === 'zh' ? '正相关' : 'Positive'}</span>
        </div>
        <span className="ml-2 opacity-60">p &lt; 0.05</span>
      </div>

      {/* Natural language insights */}
      {topCorrelations.length > 0 && (
        <div className="mt-5 pt-4 border-t border-brand-200 dark:border-brand-700">
          <h4 className="text-xs font-medium tracking-luxury uppercase text-brand-500 mb-3">
            {lang === 'zh' ? '主要发现' : 'Key Findings'}
          </h4>
          <div className="space-y-2">
            {topCorrelations.map((p, i) => {
              const direction = p.r > 0
                ? (lang === 'zh' ? '正相关' : 'positively correlated')
                : (lang === 'zh' ? '负相关' : 'negatively correlated');
              const strength = Math.abs(p.r) > 0.5
                ? (lang === 'zh' ? '较强' : 'moderately strong')
                : (lang === 'zh' ? '弱' : 'weak');
              const label = lang === 'zh' ? p.labelZh : p.labelEn;
              const text = lang === 'zh'
                ? `${label}呈${strength}${direction} (r=${p.r.toFixed(2)}, n=${p.n})`
                : `${label}: ${strength} ${direction} (r=${p.r.toFixed(2)}, n=${p.n})`;
              return (
                <p key={i} className="text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
                  {i + 1}. {text}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {significantPairs.length === 0 && (
        <p className="mt-4 text-sm text-brand-500">
          {lang === 'zh' ? '未发现统计显著的关联（p < 0.05）' : 'No statistically significant correlations found (p < 0.05)'}
        </p>
      )}
    </div>
  );
}
