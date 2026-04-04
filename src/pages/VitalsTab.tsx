import MetricChart from '../components/MetricChart';
import { useLanguage } from '../LanguageContext';

export default function VitalsTab() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('vitals') as string}</h2>

      {/* Heart Health */}
      <section className="space-y-4">
        <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{t('heartHealth') as string}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart metricName="HeartRate" chartType="area" showRange color="#ef4444" />
          <MetricChart metricName="RestingHeartRate" color="#f97316" />
          <MetricChart metricName="HeartRateVariabilitySDNN" color="#8b5cf6" />
          <MetricChart metricName="OxygenSaturation" color="#06b6d4" />
          <MetricChart metricName="VO2Max" color="#10b981" />
          <MetricChart metricName="WalkingHeartRateAverage" color="#f43f5e" />
        </div>
      </section>

      {/* Body Composition */}
      <section className="space-y-4">
        <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{t('bodyComposition') as string}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricChart metricName="BodyMass" color="#3b82f6" />
          <MetricChart metricName="BodyMassIndex" color="#8b5cf6" />
          <MetricChart metricName="BodyFatPercentage" color="#f97316" />
          <MetricChart metricName="Height" color="#22c55e" />
        </div>
      </section>
    </div>
  );
}
