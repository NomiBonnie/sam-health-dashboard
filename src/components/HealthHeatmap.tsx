import { useState, useEffect, useMemo, useCallback } from 'react';
import { MetricEntry } from '../types';
import { fetchJson, DOUBLE_COUNTED_METRICS, DEDUP_FACTOR } from '../utils';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

type HeatmapMetric = 'StepCount' | 'SleepDuration' | 'RestingHeartRate' | 'ActiveEnergyBurned';

interface DayData {
  date: string;
  value: number;
}

const METRIC_CONFIG: Record<HeatmapMetric, {
  file: string;
  field: 'sum' | 'avg';
  labelEn: string;
  labelZh: string;
  unitEn: string;
  unitZh: string;
  colorsDark: string[];
  colorsLight: string[];
  thresholds: number[];
  inverted?: boolean;
  formatValue: (v: number) => string;
}> = {
  StepCount: {
    file: 'StepCount', field: 'sum',
    labelEn: 'Steps', labelZh: '步数',
    unitEn: 'steps', unitZh: '步',
    colorsDark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    colorsLight: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    thresholds: [0, 3000, 6000, 10000, 15000],
    formatValue: v => v.toLocaleString(),
  },
  SleepDuration: {
    file: 'SleepDuration', field: 'avg',
    labelEn: 'Sleep', labelZh: '睡眠',
    unitEn: 'hrs', unitZh: '小时',
    colorsDark: ['#161b22', '#2d1b69', '#5b21b6', '#7c3aed', '#a78bfa'],
    colorsLight: ['#ebedf0', '#c4b5fd', '#8b5cf6', '#6d28d9', '#4c1d95'],
    thresholds: [0, 4, 5.5, 7, 8],
    formatValue: v => v.toFixed(1),
  },
  RestingHeartRate: {
    file: 'RestingHeartRate', field: 'avg',
    labelEn: 'Resting HR', labelZh: '静息心率',
    unitEn: 'bpm', unitZh: 'bpm',
    // Inverted: lower = better = darker
    colorsDark: ['#161b22', '#b91c1c', '#dc2626', '#f87171', '#fca5a5'],
    colorsLight: ['#ebedf0', '#fca5a5', '#f87171', '#dc2626', '#991b1b'],
    thresholds: [0, 55, 60, 68, 75], // inverted logic handled separately
    inverted: true,
    formatValue: v => v.toFixed(0),
  },
  ActiveEnergyBurned: {
    file: 'ActiveEnergyBurned', field: 'sum',
    labelEn: 'Active Energy', labelZh: '活动能量',
    unitEn: 'kcal', unitZh: '千卡',
    colorsDark: ['#161b22', '#7c2d12', '#c2410c', '#ea580c', '#fb923c'],
    colorsLight: ['#ebedf0', '#fed7aa', '#fb923c', '#ea580c', '#9a3412'],
    thresholds: [0, 100, 300, 500, 800],
    formatValue: v => Math.round(v).toLocaleString(),
  },
};

function getColorIndex(value: number, thresholds: number[], inverted?: boolean): number {
  if (value === 0) return 0;
  if (inverted) {
    // For RHR: lower is better. Reverse the logic.
    // <55 = best (4), 55-60 = good (3), 60-68 = ok (2), 68-75 = meh (1), >75 = worst (0 but still has data)
    if (value <= thresholds[1]) return 4;
    if (value <= thresholds[2]) return 3;
    if (value <= thresholds[3]) return 2;
    if (value <= thresholds[4]) return 1;
    return 1; // still show something for very high
  }
  for (let i = thresholds.length - 1; i >= 1; i--) {
    if (value > thresholds[i]) return i;
  }
  return 1; // has data but very low
}

const CELL_SIZE = 13;
const CELL_GAP = 3;
const TOTAL_CELL = CELL_SIZE + CELL_GAP;

// Month labels
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const DAYS_EN = ['Mon', 'Wed', 'Fri'];
const DAYS_ZH = ['一', '三', '五'];

export default function HealthHeatmap() {
  const { dark } = useTheme();
  const { lang, t } = useLanguage();
  const [metric, setMetric] = useState<HeatmapMetric>('StepCount');
  const [data, setData] = useState<Record<string, MetricEntry[]>>({});
  const [yearOffset, setYearOffset] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Load all metric data once
  useEffect(() => {
    const metricFiles: HeatmapMetric[] = ['StepCount', 'RestingHeartRate', 'ActiveEnergyBurned'];
    Promise.all([
      ...metricFiles.map(f =>
        fetchJson<MetricEntry[]>(`/data/metrics/${METRIC_CONFIG[f].file}.json`)
          .then(d => ({
            key: f,
            data: DOUBLE_COUNTED_METRICS.has(f)
              ? d.map(e => ({ ...e, sum: e.sum * DEDUP_FACTOR, avg: e.avg * DEDUP_FACTOR }))
              : d
          }))
          .catch(() => ({ key: f, data: [] as MetricEntry[] }))
      ),
      // Sleep data from sleep.json
      fetchJson<{ date: string; total_hours: number }[]>('/data/sleep.json')
        .then(d => ({
          key: 'SleepDuration' as HeatmapMetric,
          data: d.filter(s => s.total_hours > 0 && s.total_hours <= 14).map(s => ({ date: s.date, avg: s.total_hours, min: s.total_hours, max: s.total_hours, sum: s.total_hours } as MetricEntry))
        }))
        .catch(() => ({ key: 'SleepDuration' as HeatmapMetric, data: [] as MetricEntry[] }))
    ]).then(results => {
      const map: Record<string, MetricEntry[]> = {};
      results.forEach(r => { map[r.key] = r.data; });
      setData(map);
    });
  }, []);

  const config = METRIC_CONFIG[metric];

  // Determine date range
  const { endDate, startDate, yearLabel } = useMemo(() => {
    // Reference: export date = 2026-03-17, use that as "now"
    const ref = new Date('2026-03-17');
    const end = new Date(ref);
    end.setFullYear(end.getFullYear() - yearOffset);
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    start.setDate(start.getDate() + 1);
    const label = yearOffset === 0
      ? (lang === 'zh' ? '最近一年' : 'Last 12 months')
      : `${start.getFullYear()}–${end.getFullYear()}`;
    return {
      endDate: end.toISOString().slice(0, 10),
      startDate: start.toISOString().slice(0, 10),
      yearLabel: label,
    };
  }, [yearOffset, lang]);

  // Build lookup map
  const dayMap = useMemo(() => {
    const entries = data[metric] || [];
    const map: Record<string, number> = {};
    entries.forEach(e => {
      if (e.date >= startDate && e.date <= endDate) {
        map[e.date] = config.field === 'sum' ? e.sum : e.avg;
      }
    });
    return map;
  }, [data, metric, startDate, endDate, config.field]);

  // Available years
  const canGoBack = useMemo(() => {
    const entries = data[metric] || [];
    if (entries.length === 0) return false;
    const earliest = entries[0]?.date;
    const ref = new Date('2026-03-17');
    ref.setFullYear(ref.getFullYear() - yearOffset - 1);
    return earliest <= ref.toISOString().slice(0, 10);
  }, [data, metric, yearOffset]);

  // Generate grid: 53 weeks x 7 days
  const { cells, monthLabels } = useMemo(() => {
    const end = new Date(endDate);
    const cells: { date: string; col: number; row: number; value: number }[] = [];
    const monthStarts: { month: number; col: number }[] = [];

    // End date's day of week (0=Sun)
    const endDow = end.getDay();
    // Total days to show: go back to fill complete weeks
    const totalWeeks = 53;
    const totalDays = totalWeeks * 7;

    // Start from the first Sunday of the grid
    const gridStart = new Date(end);
    gridStart.setDate(gridStart.getDate() - totalDays + (6 - endDow) + 1);

    let prevMonth = -1;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const col = Math.floor(i / 7);
      const row = d.getDay(); // 0=Sun

      if (dateStr >= startDate && dateStr <= endDate) {
        cells.push({ date: dateStr, col, row, value: dayMap[dateStr] || 0 });
      }

      if (d.getMonth() !== prevMonth && d.getDate() <= 7) {
        monthStarts.push({ month: d.getMonth(), col });
        prevMonth = d.getMonth();
      }
    }

    return { cells, monthLabels: monthStarts };
  }, [endDate, startDate, dayMap]);

  const colors = dark ? config.colorsDark : config.colorsLight;
  const emptyColor = dark ? '#161b22' : '#ebedf0';

  const svgWidth = 53 * TOTAL_CELL + 40;
  const svgHeight = 7 * TOTAL_CELL + 30;

  const handleMouseEnter = useCallback((e: React.MouseEvent, date: string, value: number) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const text = `${date}: ${value === 0 ? (lang === 'zh' ? '无数据' : 'No data') : `${config.formatValue(value)} ${lang === 'zh' ? config.unitZh : config.unitEn}`}`;
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, text });
  }, [lang, config]);

  const metricButtons: { key: HeatmapMetric; labelEn: string; labelZh: string }[] = [
    { key: 'StepCount', labelEn: 'Steps', labelZh: '步数' },
    { key: 'SleepDuration', labelEn: 'Sleep', labelZh: '睡眠' },
    { key: 'RestingHeartRate', labelEn: 'Resting HR', labelZh: '静息心率' },
    { key: 'ActiveEnergyBurned', labelEn: 'Energy', labelZh: '活动能量' },
  ];

  const months = lang === 'zh' ? MONTHS_ZH : MONTHS_EN;
  const dayLabels = lang === 'zh' ? DAYS_ZH : DAYS_EN;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-light tracking-tight text-brand-900 dark:text-brand-100">
          🟩 {lang === 'zh' ? '健康热力图' : 'Health Heatmap'}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year navigation */}
          <button
            onClick={() => setYearOffset(o => o + 1)}
            disabled={!canGoBack}
            className="px-2 py-1 text-xs rounded bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-xs text-brand-500 min-w-[100px] text-center">{yearLabel}</span>
          <button
            onClick={() => setYearOffset(o => Math.max(0, o - 1))}
            disabled={yearOffset === 0}
            className="px-2 py-1 text-xs rounded bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      {/* Metric selector */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {metricButtons.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              metric === m.key
                ? 'bg-brand-900 dark:bg-brand-100 text-white dark:text-brand-900'
                : 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-700'
            }`}
          >
            {lang === 'zh' ? m.labelZh : m.labelEn}
          </button>
        ))}
      </div>

      {/* Heatmap SVG */}
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="block">
          {/* Day labels */}
          {[1, 3, 5].map((row, i) => (
            <text
              key={row}
              x={28}
              y={30 + row * TOTAL_CELL + CELL_SIZE / 2}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-brand-400 dark:fill-brand-600"
              fontSize={10}
            >
              {dayLabels[i]}
            </text>
          ))}

          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={36 + m.col * TOTAL_CELL}
              y={22}
              className="fill-brand-400 dark:fill-brand-600"
              fontSize={10}
            >
              {months[m.month]}
            </text>
          ))}

          {/* Cells */}
          {cells.map(cell => {
            const colorIdx = getColorIndex(cell.value, config.thresholds, config.inverted);
            const fill = cell.value === 0 ? emptyColor : colors[colorIdx];
            return (
              <rect
                key={cell.date}
                x={36 + cell.col * TOTAL_CELL}
                y={30 + cell.row * TOTAL_CELL}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                ry={2}
                fill={fill}
                className="cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(e, cell.date, cell.value)}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-brand-500">
        <span>{lang === 'zh' ? '少' : 'Less'}</span>
        {colors.map((c, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>{lang === 'zh' ? '多' : 'More'}</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs rounded shadow-lg bg-brand-900 dark:bg-brand-100 text-white dark:text-brand-900 pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
