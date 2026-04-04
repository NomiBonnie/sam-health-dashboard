import { MetricEntry } from './types';

interface CorrelationPair {
  metricA: string;
  metricB: string;
  labelEn: string;
  labelZh: string;
  r: number;
  p: number;
  n: number;
  significant: boolean;
}

function pearson(x: number[], y: number[]): { r: number; n: number } {
  const n = x.length;
  if (n < 5) return { r: 0, n };
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx;
    const yi = y[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  if (dx === 0 || dy === 0) return { r: 0, n };
  return { r: num / Math.sqrt(dx * dy), n };
}

function pValue(r: number, n: number): number {
  if (n < 3) return 1;
  const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r + 1e-10);
  // Approximate two-tailed p from t-distribution using normal approx for large n
  const absT = Math.abs(t);
  // Simple normal CDF approximation
  const p = Math.exp(-0.717 * absT - 0.416 * absT * absT);
  return Math.min(1, p * 2);
}

function buildDateMap(entries: MetricEntry[], field: 'sum' | 'avg'): Map<string, number> {
  const map = new Map<string, number>();
  entries.forEach(e => {
    const val = field === 'sum' ? e.sum : e.avg;
    if (val != null && !isNaN(val)) map.set(e.date, val);
  });
  return map;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function alignSameDay(mapA: Map<string, number>, mapB: Map<string, number>): { x: number[]; y: number[] } {
  const x: number[] = [], y: number[] = [];
  mapA.forEach((va, date) => {
    const vb = mapB.get(date);
    if (vb !== undefined) { x.push(va); y.push(vb); }
  });
  return { x, y };
}

function alignNextDay(mapA: Map<string, number>, mapB: Map<string, number>): { x: number[]; y: number[] } {
  const x: number[] = [], y: number[] = [];
  mapA.forEach((va, date) => {
    const nextDate = addDays(date, 1);
    const vb = mapB.get(nextDate);
    if (vb !== undefined) { x.push(va); y.push(vb); }
  });
  return { x, y };
}

function alignMonthly(mapA: Map<string, number>, mapB: Map<string, number>): { x: number[]; y: number[] } {
  const monthA = new Map<string, number[]>();
  const monthB = new Map<string, number[]>();
  mapA.forEach((v, d) => {
    const m = d.slice(0, 7);
    if (!monthA.has(m)) monthA.set(m, []);
    monthA.get(m)!.push(v);
  });
  mapB.forEach((v, d) => {
    const m = d.slice(0, 7);
    if (!monthB.has(m)) monthB.set(m, []);
    monthB.get(m)!.push(v);
  });
  const x: number[] = [], y: number[] = [];
  monthA.forEach((vals, m) => {
    const bVals = monthB.get(m);
    if (bVals && bVals.length > 0) {
      x.push(vals.reduce((a, b) => a + b, 0) / vals.length);
      y.push(bVals.reduce((a, b) => a + b, 0) / bVals.length);
    }
  });
  return { x, y };
}

export interface CorrelationResult {
  pairs: CorrelationPair[];
}

export function calculateCorrelations(metricData: Record<string, MetricEntry[]>): CorrelationResult {
  const sleep = buildDateMap(metricData['SleepDuration'] || [], 'avg');
  const rhr = buildDateMap(metricData['RestingHeartRate'] || [], 'avg');
  const hrv = buildDateMap(metricData['HeartRateVariabilitySDNN'] || [], 'avg');
  const steps = buildDateMap(metricData['StepCount'] || [], 'sum');
  const energy = buildDateMap(metricData['ActiveEnergyBurned'] || [], 'sum');
  const walkSpeed = buildDateMap(metricData['WalkingSpeed'] || [], 'avg');
  const vo2max = buildDateMap(metricData['VO2Max'] || [], 'avg');

  const definitions: {
    metricA: string; metricB: string;
    labelEn: string; labelZh: string;
    align: () => { x: number[]; y: number[] };
  }[] = [
    {
      metricA: 'SleepDuration', metricB: 'RestingHeartRate',
      labelEn: 'Sleep → Next-day RHR', labelZh: '睡眠 → 次日静息心率',
      align: () => alignNextDay(sleep, rhr),
    },
    {
      metricA: 'SleepDuration', metricB: 'HeartRateVariabilitySDNN',
      labelEn: 'Sleep → Next-day HRV', labelZh: '睡眠 → 次日 HRV',
      align: () => alignNextDay(sleep, hrv),
    },
    {
      metricA: 'StepCount', metricB: 'RestingHeartRate',
      labelEn: 'Steps vs RHR', labelZh: '步数 vs 静息心率',
      align: () => alignSameDay(steps, rhr),
    },
    {
      metricA: 'StepCount', metricB: 'SleepDuration',
      labelEn: 'Steps vs Sleep', labelZh: '步数 vs 睡眠时长',
      align: () => alignSameDay(steps, sleep),
    },
    {
      metricA: 'ActiveEnergyBurned', metricB: 'HeartRateVariabilitySDNN',
      labelEn: 'Active Energy vs HRV', labelZh: '活动能量 vs HRV',
      align: () => alignSameDay(energy, hrv),
    },
    {
      metricA: 'WalkingSpeed', metricB: 'VO2Max',
      labelEn: 'Walking Speed vs VO₂ Max (monthly)', labelZh: '步行速度 vs VO₂ Max（月均值）',
      align: () => alignMonthly(walkSpeed, vo2max),
    },
  ];

  const pairs: CorrelationPair[] = definitions.map(def => {
    const { x, y } = def.align();
    const { r, n } = pearson(x, y);
    const p = pValue(r, n);
    return {
      metricA: def.metricA,
      metricB: def.metricB,
      labelEn: def.labelEn,
      labelZh: def.labelZh,
      r: Math.round(r * 100) / 100,
      p,
      n,
      significant: p < 0.05 && n >= 10,
    };
  });

  return { pairs };
}
