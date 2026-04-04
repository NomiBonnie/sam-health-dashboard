import MetricChart from '../components/MetricChart';
import { useLanguage } from '../LanguageContext';

export default function MobilityTab() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('mobility') as string}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart metricName="WalkingSpeed" color="#3b82f6" />
        <MetricChart metricName="WalkingStepLength" color="#8b5cf6" />
        <MetricChart metricName="WalkingDoubleSupportPercentage" color="#f97316" />
        <MetricChart metricName="WalkingAsymmetryPercentage" color="#ef4444" />
        <MetricChart metricName="StairAscentSpeed" color="#22c55e" />
        <MetricChart metricName="StairDescentSpeed" color="#06b6d4" />
        <MetricChart metricName="AppleWalkingSteadiness" color="#14b8a6" />
        <MetricChart metricName="SixMinuteWalkTestDistance" color="#6366f1" />
      </div>
    </div>
  );
}
