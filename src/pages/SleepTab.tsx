import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import MetricChart from '../components/MetricChart';
import TimeRangeSelector from '../components/TimeRangeSelector';
import { SleepEntry, TimeRange } from '../types';
import { fetchJson, filterByTimeRange, sampleData, isDataFresh, DATA_EXPORT_DATE } from '../utils';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

export default function SleepTab() {
  const { dark } = useTheme();
  const { lang, t } = useLanguage();
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

  const sleepSummary = useMemo(() => {
    if (sleep.length === 0) return null;
    // Check if we have recent sleep data (last entry within 90 days of export)
    const lastSleepDate = sleep[sleep.length - 1]?.date;
    if (lastSleepDate && !isDataFresh(lastSleepDate)) return null;
    const last30 = sleep.slice(-30);
    const avg = last30.reduce((s, d) => s + d.total_hours, 0) / last30.length;
    const meetsGoal = avg >= 7;

    // Check deep sleep ratio
    const hasStages = last30.some(s => s.stage_AsleepDeep_min && s.stage_AsleepDeep_min > 0);
    let deepSleepNote = '';
    if (hasStages) {
      const totalMin = last30.reduce((s, d) => s + d.total_hours * 60, 0) / last30.length;
      const deepMin = last30.reduce((s, d) => s + (d.stage_AsleepDeep_min ?? 0), 0) / last30.length;
      const deepPct = totalMin > 0 ? (deepMin / totalMin) * 100 : 0;
      if (deepPct < 13) {
        deepSleepNote = lang === 'zh'
          ? `深度睡眠占比 ${deepPct.toFixed(0)}%，低于理想范围（13-23%）。`
          : `Deep sleep ratio ${deepPct.toFixed(0)}% — below ideal range (13-23%).`;
      } else if (deepPct <= 23) {
        deepSleepNote = lang === 'zh'
          ? `深度睡眠占比 ${deepPct.toFixed(0)}%，在理想范围内。`
          : `Deep sleep ratio ${deepPct.toFixed(0)}% — within ideal range.`;
      } else {
        deepSleepNote = lang === 'zh'
          ? `深度睡眠占比 ${deepPct.toFixed(0)}%，高于典型范围。`
          : `Deep sleep ratio ${deepPct.toFixed(0)}% — above typical range.`;
      }
    }

    return { avg, meetsGoal, deepSleepNote };
  }, [sleep, lang]);

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
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('sleep') as string}</h2>
        <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          30d avg: {avgHours.toFixed(1)}h
        </span>
      </div>

      {/* Sleep Summary Card */}
      {sleepSummary && (
        <div className="card p-5">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-3">
            {t('sleepSummaryTitle') as string}
          </h3>
          <div className="space-y-2 text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
            <p>
              {lang === 'zh'
                ? `30 天平均睡眠 ${sleepSummary.avg.toFixed(1)} 小时。NSF 建议成人每晚 7-9 小时。`
                : `30-day average: ${sleepSummary.avg.toFixed(1)}h. NSF recommends 7-9h for adults.`}
              {sleepSummary.meetsGoal
                ? (lang === 'zh' ? ' ✅ 达到建议标准。' : ' ✅ Meeting recommendation.')
                : (lang === 'zh' ? ' ⚠️ 未达到建议标准。' : ' ⚠️ Below recommendation.')}
            </p>
            {sleepSummary.deepSleepNote && <p>{sleepSummary.deepSleepNote}</p>}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('sleepDuration') as string}</h3>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} width={30} domain={[0, 12]} />
            <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="total_hours" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name={t('totalHours') as string} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Stages */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('sleepStages') as string}</h3>
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
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('sleepInsights') as string}</h3>
        <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>{t('averageSleep') as string}: <strong style={{ color: 'var(--text-primary)' }}>{avgHours.toFixed(1)} {t('hours') as string}</strong> ({t('last30Days') as string})</p>
          {avgHours < 7 && <p style={{ color: 'var(--warning)' }}>{t('belowRecommended') as string}</p>}
          {avgHours >= 7 && <p style={{ color: 'var(--success)' }}>{t('withinRecommended') as string}</p>}
        </div>
      </div>
    </div>
  );
}
