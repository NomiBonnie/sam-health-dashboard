import { useState, useEffect, useMemo } from 'react';
import MetricChart from '../components/MetricChart';
import { useLanguage } from '../LanguageContext';
import { InventoryItem } from '../types';
import { fetchJson, isDataFresh, getMetricDisplayName } from '../utils';
import { assessMetric, type MetricAssessment } from '../healthAnalysis';

function StatusDot({ level }: { level: MetricAssessment['level'] }) {
  const colors: Record<string, string> = {
    optimal: 'bg-green-500',
    good: 'bg-green-400',
    normal: 'bg-yellow-500',
    concern: 'bg-orange-500',
    warning: 'bg-red-500',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[level]}`} />;
}

export default function VitalsTab() {
  const { lang, t } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchJson<InventoryItem[]>('/data/inventory.json').then(setInventory);
  }, []);

  const summary = useMemo(() => {
    if (inventory.length === 0) return null;
    const getValue = (name: string) => {
      const item = inventory.find(i => i.shortName === name);
      return item ? (item.recent30dAvg ?? item.latestValue ?? 0) : null;
    };
    const getLastDate = (name: string) => {
      const item = inventory.find(i => i.shortName === name);
      return item?.lastDate ?? null;
    };

    const metrics = ['RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max', 'OxygenSaturation', 'HeartRateRecoveryOneMinute', 'BodyMassIndex', 'BodyFatPercentage'] as const;
    const assessments: Record<string, MetricAssessment | null> = {};
    const freshMap: Record<string, boolean> = {};
    const lastDateMap: Record<string, string | null> = {};
    for (const m of metrics) {
      const val = getValue(m);
      const ld = getLastDate(m);
      freshMap[m] = ld ? isDataFresh(ld) : false;
      lastDateMap[m] = ld;
      assessments[m] = val !== null && val > 0 && freshMap[m] ? assessMetric(m, val, lang) : null;
    }

    // Heart health sentence
    const heartMetrics = ['RestingHeartRate', 'HeartRateVariabilitySDNN', 'VO2Max'] as const;
    const heartLevels = heartMetrics.map(m => assessments[m]?.level).filter(Boolean) as MetricAssessment['level'][];
    const heartGood = heartLevels.filter(l => l === 'optimal' || l === 'good').length;
    const heartTotal = heartLevels.length;

    let heartSentence = '';
    if (heartTotal > 0) {
      if (heartGood === heartTotal) {
        heartSentence = lang === 'zh' ? '心脏健康状况优秀，各项指标均在良好范围。' : 'Heart health is excellent — all key metrics are in good range.';
      } else if (heartGood >= heartTotal / 2) {
        heartSentence = lang === 'zh' ? '心脏健康整体良好，部分指标有提升空间。' : 'Heart health is generally good, with some room for improvement.';
      } else {
        heartSentence = lang === 'zh' ? '心脏健康需要关注，多项指标低于理想水平。' : 'Heart health needs attention — multiple metrics below ideal levels.';
      }
    }

    // Body composition sentence — check freshness
    const bodyMetrics = ['BodyMassIndex', 'BodyFatPercentage'] as const;
    const bodyFresh = bodyMetrics.some(m => freshMap[m]);
    const bodyLevels = bodyMetrics.map(m => assessments[m]?.level).filter(Boolean) as MetricAssessment['level'][];
    const bodyGood = bodyLevels.filter(l => l === 'optimal' || l === 'good').length;

    let bodySentence = '';
    if (!bodyFresh) {
      // All body composition data is stale
      const bmiDate = lastDateMap['BodyMassIndex'] || lastDateMap['BodyFatPercentage'] || '';
      bodySentence = lang === 'zh'
        ? `⚠️ 身体成分数据最后测量日期：${bmiDate}，已过期，不反映当前状况。`
        : `⚠️ Body composition last measured: ${bmiDate} — data is outdated and may not reflect current status.`;
    } else if (bodyLevels.length > 0) {
      if (bodyGood === bodyLevels.length) {
        bodySentence = lang === 'zh' ? '身体成分在健康范围内。' : 'Body composition is within healthy range.';
      } else {
        bodySentence = lang === 'zh' ? '身体成分有改善空间，建议关注体重管理。' : 'Body composition has room for improvement — consider weight management.';
      }
    }

    return { assessments, heartSentence, bodySentence, metrics, freshMap, lastDateMap };
  }, [inventory, lang]);

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('vitals') as string}</h2>

      {/* Summary Card */}
      {summary && (
        <div className="card p-5">
          <h3 className="text-sm font-medium tracking-luxury uppercase text-brand-900 dark:text-brand-100 mb-3">
            {t('vitalsSummaryTitle') as string}
          </h3>
          <div className="space-y-2 text-sm font-light text-brand-700 dark:text-brand-300 leading-relaxed">
            {summary.heartSentence && <p>{summary.heartSentence}</p>}
            {summary.bodySentence && <p>{summary.bodySentence}</p>}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {summary.metrics.map(m => {
              const a = summary.assessments[m];
              const fresh = summary.freshMap[m];
              if (!fresh) {
                return (
                  <span key={m} className="inline-flex items-center gap-1.5 text-xs text-brand-400">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-300" />
                    {getMetricDisplayName(m)} — {t('noRecentData') as string}
                  </span>
                );
              }
              if (!a) return null;
              return (
                <span key={m} className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                  <StatusDot level={a.level} />
                  {a.metric}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
