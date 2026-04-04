import { MetricEntry, TimeRange } from './types';

// Data export reference date — used instead of Date.now() since data is static until next export
export const DATA_EXPORT_DATE = '2026-03-17';

/**
 * Check if a metric's lastDate is recent enough to be considered fresh.
 * Uses the data export date as reference, not current time.
 */
export function isDataFresh(lastDate: string, maxDaysOld: number = 90): boolean {
  const last = new Date(lastDate);
  const ref = new Date(DATA_EXPORT_DATE);
  const diffDays = (ref.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= maxDaysOld;
}

/** Format a date string for display, e.g. "2021-03-10" */
export function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10);
}

export async function fetchJson<T>(path: string): Promise<T> {
  const base = import.meta.env.BASE_URL || '/';
  const url = path.startsWith('/') ? `${base.replace(/\/$/, '')}${path}` : path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export function filterByTimeRange<T extends { date: string }>(data: T[], range: TimeRange): T[] {
  if (range === 'all') return data;
  const now = new Date(DATA_EXPORT_DATE);
  const months: Record<string, number> = { '1m': 1, '3m': 3, '1y': 12, '3y': 36 };
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months[range]);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return data.filter(d => d.date >= cutoffStr);
}

export function sampleData<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = data.length / maxPoints;
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.floor(i * step)]);
  }
  // Always include last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  return result;
}

export function computeMA(data: MetricEntry[], field: keyof MetricEntry, window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    let sum = 0;
    let count = 0;
    for (let j = i - window + 1; j <= i; j++) {
      const val = data[j][field];
      if (val != null && typeof val === 'number') { sum += val; count++; }
    }
    return count > 0 ? Math.round((sum / count) * 100) / 100 : null;
  });
}

export function getTrend(data: { avg: number }[], days: number = 30): 'up' | 'down' | 'stable' {
  if (data.length < days * 2) return 'stable';
  const recent = data.slice(-days);
  const prev = data.slice(-days * 2, -days);
  const recentAvg = recent.reduce((s, d) => s + d.avg, 0) / recent.length;
  const prevAvg = prev.reduce((s, d) => s + d.avg, 0) / prev.length;
  const change = ((recentAvg - prevAvg) / prevAvg) * 100;
  if (change > 3) return 'up';
  if (change < -3) return 'down';
  return 'stable';
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toFixed(n < 10 ? 1 : 0);
}

export function getMetricDisplayName(shortName: string): string {
  const map: Record<string, string> = {
    ActiveEnergyBurned: 'Active Energy',
    HeartRate: 'Heart Rate',
    StepCount: 'Steps',
    BasalEnergyBurned: 'Basal Energy',
    DistanceWalkingRunning: 'Distance (Walk/Run)',
    PhysicalEffort: 'Physical Effort',
    AppleStandTime: 'Stand Time',
    WalkingSpeed: 'Walking Speed',
    WalkingStepLength: 'Step Length',
    WalkingDoubleSupportPercentage: 'Double Support %',
    EnvironmentalAudioExposure: 'Env. Audio',
    AppleExerciseTime: 'Exercise Time',
    WalkingAsymmetryPercentage: 'Walk Asymmetry %',
    RespiratoryRate: 'Respiratory Rate',
    FlightsClimbed: 'Flights Climbed',
    HeadphoneAudioExposure: 'Headphone Audio',
    HeartRateVariabilitySDNN: 'HRV (SDNN)',
    OxygenSaturation: 'Blood Oxygen',
    TimeInDaylight: 'Time in Daylight',
    EnvironmentalSoundReduction: 'Sound Reduction',
    StairDescentSpeed: 'Stair Descent Speed',
    StairAscentSpeed: 'Stair Ascent Speed',
    RestingHeartRate: 'Resting Heart Rate',
    WalkingHeartRateAverage: 'Walking Heart Rate',
    DistanceCycling: 'Cycling Distance',
    AppleSleepingWristTemperature: 'Wrist Temperature',
    SixMinuteWalkTestDistance: '6-Min Walk',
    VO2Max: 'VO₂ Max',
    AppleWalkingSteadiness: 'Walk Steadiness',
    SwimmingStrokeCount: 'Swim Strokes',
    DistanceSwimming: 'Swim Distance',
    BodyMass: 'Body Weight',
    BodyMassIndex: 'BMI',
    HeartRateRecoveryOneMinute: 'HR Recovery',
    BodyFatPercentage: 'Body Fat %',
    LeanBodyMass: 'Lean Body Mass',
    RunningPower: 'Running Power',
    RunningSpeed: 'Running Speed',
    Height: 'Height',
    RunningVerticalOscillation: 'Vertical Oscillation',
    RunningGroundContactTime: 'Ground Contact',
    WaterTemperature: 'Water Temperature',
    HKDataTypeSleepDurationGoal: 'Sleep Goal',
  };
  return map[shortName] || shortName.replace(/([A-Z])/g, ' $1').trim();
}

// Metrics where daily "sum" is more meaningful than "avg"
export const SUM_METRICS = new Set([
  'StepCount', 'DistanceWalkingRunning', 'DistanceCycling', 'DistanceSwimming',
  'ActiveEnergyBurned', 'BasalEnergyBurned', 'AppleExerciseTime', 'AppleStandTime',
  'FlightsClimbed', 'SwimmingStrokeCount', 'TimeInDaylight',
]);

// Metrics stored as 0-1 fraction that should display as percentage
export const FRACTION_TO_PCT = new Set([
  'OxygenSaturation', 'BodyFatPercentage', 'WalkingDoubleSupportPercentage',
  'WalkingAsymmetryPercentage', 'AppleWalkingSteadiness',
]);

export function transformValue(shortName: string, value: number): number {
  if (FRACTION_TO_PCT.has(shortName)) return Math.round(value * 1000) / 10; // 0.96 → 96.0
  return value;
}

export function getDisplayField(shortName: string): 'sum' | 'avg' {
  return SUM_METRICS.has(shortName) ? 'sum' : 'avg';
}

export function getMetricUnit(shortName: string): string {
  const map: Record<string, string> = {
    HeartRate: 'bpm', RestingHeartRate: 'bpm', WalkingHeartRateAverage: 'bpm',
    HeartRateRecoveryOneMinute: 'bpm', HeartRateVariabilitySDNN: 'ms',
    OxygenSaturation: '%', VO2Max: 'mL/kg/min',
    StepCount: 'steps', FlightsClimbed: 'flights',
    ActiveEnergyBurned: 'kcal', BasalEnergyBurned: 'kcal',
    DistanceWalkingRunning: 'km', DistanceCycling: 'km', DistanceSwimming: 'm',
    WalkingSpeed: 'km/h', RunningSpeed: 'km/h',
    WalkingStepLength: 'cm', WalkingDoubleSupportPercentage: '%',
    WalkingAsymmetryPercentage: '%', BodyFatPercentage: '%',
    AppleWalkingSteadiness: '%',
    BodyMass: 'kg', BodyMassIndex: '', LeanBodyMass: 'kg', Height: 'cm',
    AppleSleepingWristTemperature: '°C', WaterTemperature: '°C',
    EnvironmentalAudioExposure: 'dB', HeadphoneAudioExposure: 'dB',
    AppleExerciseTime: 'min', AppleStandTime: 'min',
    TimeInDaylight: 'min', RespiratoryRate: 'br/min',
    StairAscentSpeed: 'ft/s', StairDescentSpeed: 'ft/s',
    SixMinuteWalkTestDistance: 'm',
    RunningPower: 'W', RunningVerticalOscillation: 'cm',
    RunningGroundContactTime: 'ms', SwimmingStrokeCount: 'strokes',
    PhysicalEffort: '', EnvironmentalSoundReduction: 'dB',
  };
  return map[shortName] || '';
}

export const METRIC_CATEGORIES: Record<string, string[]> = {
  heart: ['HeartRate', 'RestingHeartRate', 'HeartRateVariabilitySDNN', 'OxygenSaturation', 'VO2Max', 'WalkingHeartRateAverage', 'HeartRateRecoveryOneMinute'],
  activity: ['StepCount', 'DistanceWalkingRunning', 'ActiveEnergyBurned', 'AppleExerciseTime', 'FlightsClimbed', 'BasalEnergyBurned', 'AppleStandTime', 'PhysicalEffort'],
  sleep: ['AppleSleepingWristTemperature', 'RespiratoryRate'],
  body: ['BodyMass', 'BodyMassIndex', 'BodyFatPercentage', 'LeanBodyMass', 'Height'],
  mobility: ['WalkingSpeed', 'WalkingStepLength', 'WalkingDoubleSupportPercentage', 'WalkingAsymmetryPercentage', 'StairAscentSpeed', 'StairDescentSpeed', 'AppleWalkingSteadiness', 'SixMinuteWalkTestDistance'],
  environment: ['EnvironmentalAudioExposure', 'HeadphoneAudioExposure', 'TimeInDaylight', 'EnvironmentalSoundReduction'],
};
