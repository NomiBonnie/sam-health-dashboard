import { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import Header from './components/Header';
import OverviewTab from './pages/OverviewTab';
import HeartTab from './pages/HeartTab';
import ActivityTab from './pages/ActivityTab';
import SleepTab from './pages/SleepTab';
import BodyTab from './pages/BodyTab';
import WorkoutsTab from './pages/WorkoutsTab';
import MobilityTab from './pages/MobilityTab';
import EnvironmentTab from './pages/EnvironmentTab';
import AllMetricsTab from './pages/AllMetricsTab';
import { MeData } from './types';
import { fetchJson } from './utils';

function Dashboard() {
  const [me, setMe] = useState<MeData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchJson<MeData>('/data/me.json').then(setMe);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'heart': return <HeartTab />;
      case 'activity': return <ActivityTab />;
      case 'sleep': return <SleepTab />;
      case 'body': return <BodyTab />;
      case 'workouts': return <WorkoutsTab />;
      case 'mobility': return <MobilityTab />;
      case 'environment': return <EnvironmentTab />;
      case 'all': return <AllMetricsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header me={me} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderTab()}
      </main>
      <footer className="text-center py-8 text-[10px] font-light uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
        Apple Health Export · {me?.exportDate?.slice(0, 10) || ''}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
