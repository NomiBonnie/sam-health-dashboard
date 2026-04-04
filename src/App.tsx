import { useState, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import Header from './components/Header';
import OverviewTab from './pages/OverviewTab';
import VitalsTab from './pages/VitalsTab';
import MovementTab from './pages/MovementTab';
import SleepTab from './pages/SleepTab';
import WorkoutsTab from './pages/WorkoutsTab';
import AnalysisTab from './pages/AnalysisTab';
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
      case 'analysis': return <AnalysisTab />;
      case 'vitals': return <VitalsTab />;
      case 'movement': return <MovementTab />;
      case 'sleep': return <SleepTab />;
      case 'workouts': return <WorkoutsTab />;
      case 'all': return <AllMetricsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950">
      <Header me={me} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderTab()}
      </main>
      <footer className="border-t border-brand-100 dark:border-brand-900 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-brand-400 dark:text-brand-600 font-light tracking-luxury uppercase">
            Apple Health Export · {me?.exportDate?.slice(0, 10) || ''}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}
