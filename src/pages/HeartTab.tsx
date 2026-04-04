import MetricChart from '../components/MetricChart';
import { useLanguage } from '../LanguageContext';

export default function HeartTab() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('heartHealth') as string}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart metricName="HeartRate" chartType="area" showRange color="#ef4444" />
        <MetricChart metricName="RestingHeartRate" color="#f97316" />
        <MetricChart metricName="HeartRateVariabilitySDNN" color="#8b5cf6" />
        <MetricChart metricName="OxygenSaturation" color="#06b6d4" />
        <MetricChart metricName="VO2Max" color="#10b981" />
        <MetricChart metricName="WalkingHeartRateAverage" color="#f43f5e" />
      </div>
    </div>
  );
}
