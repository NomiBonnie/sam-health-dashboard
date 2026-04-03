import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { WorkoutEntry } from '../types';
import { fetchJson } from '../utils';
import { useTheme } from '../ThemeContext';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#84cc16', '#e11d48', '#0ea5e9'];

export default function WorkoutsTab() {
  const { dark } = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    fetchJson<WorkoutEntry[]>('/data/workouts.json').then(setWorkouts);
  }, []);

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    workouts.forEach(w => { counts[w.type] = (counts[w.type] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [workouts]);

  const monthlyWorkouts = useMemo(() => {
    const monthly: Record<string, number> = {};
    workouts.forEach(w => {
      const m = w.date.slice(0, 7);
      monthly[m] = (monthly[m] || 0) + 1;
    });
    return Object.entries(monthly).map(([month, count]) => ({ month, count })).slice(-24);
  }, [workouts]);

  const gridColor = dark ? '#2e2e2e' : '#e5e7eb';
  const textColor = dark ? '#a1a1aa' : '#6b7280';

  const totalDuration = workouts.reduce((s, w) => s + w.duration_min, 0);
  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Workouts</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Workouts', value: workouts.length.toString() },
          { label: 'Types', value: typeDistribution.length.toString() },
          { label: 'Total Duration', value: `${Math.round(totalDuration / 60)}h` },
          { label: 'Total Calories', value: totalCalories > 0 ? `${Math.round(totalCalories / 1000)}K` : 'N/A' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="card p-4">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Workout Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {typeDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly timeline */}
        <div className="card p-4">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Monthly Workouts</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyWorkouts}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: textColor }} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: textColor }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#1f1f1f' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent workouts list */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Recent Workouts</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {workouts.slice(-20).reverse().map((w, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{w.type}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{w.date}</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {w.duration_min.toFixed(0)} min
                {w.distance_km > 0 && ` · ${w.distance_km.toFixed(1)} km`}
                {w.calories > 0 && ` · ${w.calories} kcal`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
