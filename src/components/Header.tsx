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
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: dark ? 'rgba(15,15,15,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-baseline gap-3">
            <h1
              className="font-display text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Sam's Health
            </h1>
            {me && (
              <span
                className="hidden md:inline text-xs font-medium tracking-widest uppercase"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
              >
                {(me.totalRecords / 1000000).toFixed(1)}M records · {me.uniqueTypes} types · 2017–2026
              </span>
            )}
          </div>
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Toggle theme"
          >
            <span className="text-sm">{dark ? '☀️' : '🌙'}</span>
          </button>
        </div>

        {/* Tab navigation — Sanono minimal style */}
        <nav
          className="flex overflow-x-auto -mb-px"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  letterSpacing: '0.02em',
                }}
              >
                <span className="text-sm sm:text-base opacity-80">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {/* Active indicator — thin elegant line */}
                <span
                  className="absolute bottom-0 left-4 right-4 h-[1.5px] rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
