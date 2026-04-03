import { useTheme } from '../ThemeContext';
import { MeData, TabConfig } from '../types';

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'heart', label: 'Heart', icon: '❤️' },
  { id: 'activity', label: 'Activity', icon: '🏃' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'body', label: 'Body', icon: '🧍' },
  { id: 'workouts', label: 'Workouts', icon: '💪' },
  { id: 'mobility', label: 'Mobility', icon: '🚶' },
  { id: 'environment', label: 'Environment', icon: '🌍' },
  { id: 'all', label: 'All Metrics', icon: '📋' },
];

interface HeaderProps {
  me: MeData | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ me, activeTab, onTabChange }: HeaderProps) {
  const { dark, toggle } = useTheme();

  return (
    <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}
            className="sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Sam's Health
          </h1>
          <div className="flex items-center gap-4">
            {me && (
              <div className="hidden sm:flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {(me.totalRecords / 1000000).toFixed(1)}M records
                </span>
                <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {me.uniqueTypes} types
                </span>
                <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  2017–2026
                </span>
              </div>
            )}
            <button
              onClick={toggle}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              aria-label="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        {/* Tab nav */}
        <nav className="flex overflow-x-auto gap-1 pb-0 -mb-px scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
