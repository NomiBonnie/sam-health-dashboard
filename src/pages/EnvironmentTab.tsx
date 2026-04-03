import MetricChart from '../components/MetricChart';

export default function EnvironmentTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Environment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart metricName="EnvironmentalAudioExposure" color="#f59e0b" />
        <MetricChart metricName="HeadphoneAudioExposure" color="#8b5cf6" />
        <MetricChart metricName="TimeInDaylight" color="#22c55e" />
      </div>
    </div>
  );
}
