import { useTheme } from '../ThemeContext';
import { MeData, TabConfig } from '../types';

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '' },
  { id: 'analysis', label: 'Health Analysis', icon: '' },
  { id: 'heart', label: 'Heart', icon: '' },
  { id: 'activity', label: 'Activity', icon: '' },
  { id: 'sleep', label: 'Sleep', icon: '' },
  { id: 'body', label: 'Body', icon: '' },
  { id: 'workouts', label: 'Workouts', icon: '' },
  { id: 'mobility', label: 'Mobility', icon: '' },
  { id: 'environment', label: 'Environment', icon: '' },
  { id: 'all', label: 'All Metrics', icon: '' },
];

interface HeaderProps {
  me: MeData | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ me, activeTab, onTabChange }: HeaderProps) {
  const { dark, toggle } = useTheme();

  return (
    <header className="border-b border-brand-200 dark:border-brand-800 bg-brand-50/80 dark:bg-brand-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-light tracking-wide uppercase font-display">
            Sam's Health
          </h1>
          {me && (
            <span className="hidden md:inline text-xs text-brand-400 dark:text-brand-600 font-light tracking-luxury uppercase">
              {(me.totalRecords / 1000000).toFixed(1)}M records · {me.uniqueTypes} types · 2017–2026
            </span>
          )}
        </div>
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-200 dark:border-brand-800 text-brand-400 dark:text-brand-500 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
          aria-label="Toggle theme"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>
      {/* Tab navigation */}
      <nav className="border-t border-brand-100 dark:border-brand-900 bg-brand-50/80 dark:bg-brand-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 text-xs tracking-luxury uppercase transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-brand-900 dark:border-brand-100 text-brand-900 dark:text-brand-100'
                    : 'border-transparent text-brand-400 dark:text-brand-600 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
