import { useTheme } from '../ThemeContext';
import { MeData, TabConfig } from '../types';

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '' },
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
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: dark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: dark ? 'rgb(38, 38, 38)' : 'rgb(229, 231, 235)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-baseline gap-4">
            <h1
              className="font-display text-2xl uppercase tracking-luxury"
              style={{ color: 'var(--text-primary)', fontWeight: 300 }}
            >
              Sam's Health
            </h1>
            {me && (
              <span
                className="hidden md:inline text-[10px] font-light tracking-widest uppercase"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}
              >
                {(me.totalRecords / 1000000).toFixed(1)}M · {me.uniqueTypes} types · 2017–2026
              </span>
            )}
          </div>
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center border transition-all duration-200 hover:border-accent"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Toggle theme"
          >
            <span className="text-xs">{dark ? '☀' : '☾'}</span>
          </button>
        </div>

        {/* Tab navigation */}
        <nav className="flex overflow-x-auto -mb-px" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-4 py-3 text-[11px] font-light uppercase tracking-widest whitespace-nowrap transition-all duration-200 border-b-2"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderColor: isActive ? 'var(--accent)' : 'transparent',
                  letterSpacing: '0.12em',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
