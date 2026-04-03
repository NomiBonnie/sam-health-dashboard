import MetricChart from '../components/MetricChart';

export default function BodyTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Body Composition</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MetricChart metricName="BodyMass" color="#3b82f6" />
        <MetricChart metricName="BodyMassIndex" color="#8b5cf6" />
        <MetricChart metricName="BodyFatPercentage" color="#f97316" />
        <MetricChart metricName="Height" color="#22c55e" />
      </div>
    </div>
  );
}
