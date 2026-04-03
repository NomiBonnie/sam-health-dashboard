// Types for health data

export interface MetricEntry {
  date: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export interface InventoryItem {
  type: string;
  shortName: string;
  totalRecords: number;
  firstDate: string;
  lastDate: string;
  daysWithData: number;
  overallAvg: number;
  overallMin: number;
  overallMax: number;
  latestValue: number;
  recent30dAvg: number;
}

export interface SleepEntry {
  date: string;
  total_hours: number;
  stage_InBed_min?: number;
  stage_AsleepCore_min?: number;
  stage_AsleepDeep_min?: number;
  stage_AsleepREM_min?: number;
  stage_Awake_min?: number;
}

export interface WorkoutEntry {
  date: string;
  type: string;
  duration_min: number;
  distance_km: number;
  calories: number;
  source: string;
  startDate: string;
}

export interface ActivityEntry {
  date: string;
  activeEnergy: number;
  activeEnergyGoal: number;
  exerciseMin: number;
  exerciseGoal: number;
  standHours: number;
  standGoal: number;
}

export interface MeData {
  me: {
    dateOfBirth: string;
    biologicalSex: string;
    bloodType: string;
    skinType: string;
  };
  exportDate: string;
  totalRecords: number;
  uniqueTypes: number;
  totalWorkouts: number;
  totalActivityDays: number;
}

export type TimeRange = '1m' | '3m' | '1y' | '3y' | 'all';

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
}
