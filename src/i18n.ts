// i18n translation strings
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Header
    siteTitle: "Sam's Health",
    recordsSummary: (total: number, types: number) => `${(total / 1000000).toFixed(1)}M records · ${types} types · 2017–2026`,
    
    // Tabs
    tabOverview: 'Overview',
    tabAnalysis: 'Health Analysis',
    tabHeart: 'Heart',
    tabActivity: 'Activity',
    tabSleep: 'Sleep',
    tabBody: 'Body',
    tabWorkouts: 'Workouts',
    tabMobility: 'Mobility',
    tabEnvironment: 'Environment',
    tabAll: 'All Metrics',
    vitals: 'Vitals',
    movement: 'Movement',
    
    // Analysis Tab
    overallHealthScore: 'Overall Health Score',
    ageAdjustedFor: 'Age-adjusted for 43-year-old male',
    lastUpdated: 'Last updated',
    excellent: 'Excellent',
    good: 'Good',
    needsImprovement: 'Needs Improvement',
    
    categoryCardiovascular: 'Cardiovascular',
    categoryFitness: 'Fitness',
    categorySleep: 'Sleep',
    categoryActivity: 'Activity',
    
    strengths: 'Strengths',
    areasNeedingAttention: 'Areas Needing Attention',
    
    sleepBreakdown: 'Sleep Stage Breakdown',
    activityRings: 'Activity Rings',
    dayAvg: '(30-day avg)',
    
    detailedAnalysis: 'Detailed Analysis',
    recommendation: 'Recommendation',
    
    medicalDisclaimer: 'Medical Disclaimer:',
    disclaimerText: 'This analysis is for informational purposes only and does not constitute medical advice. Reference ranges are based on clinical guidelines (AHA, WHO, ACE, NSF, Cooper Clinic) adjusted for a 43-year-old male. Percentile rankings derived from NHANES and Framingham population data. Individual needs may vary. Consult healthcare providers for personalized medical guidance.',
    
    percentileVs: 'Percentile vs 43y males',
    topPercentile: 'Top 10%',
    aboveAverage: 'Above Average',
    average: 'Average',
    belowAverage: 'Below Average',
    bottomPercentile: 'Bottom 25%',
    
    trendImproving: 'Improving',
    trendDeclining: 'Declining',
    trendStable: 'Stable',
    
    sleepDeep: 'Deep Sleep',
    sleepREM: 'REM Sleep',
    sleepCore: 'Core Sleep',
    sleepAwake: 'Awake',
    idealRange: 'Ideal',
    
    moveCalories: 'Move (kcal)',
    exerciseMin: 'Exercise (min)',
    standHours: 'Stand (hrs)',
    goalMet: 'Goal met',
    ofDays: 'of days',
    
    // Risk levels
    riskOptimal: 'Excellent',
    riskGood: 'Good',
    riskNormal: 'Normal',
    riskConcern: 'Needs Attention',
    riskWarning: 'High Risk',
    
    // Overview Tab
    keyMetrics: 'Key Metrics',
    thirtyDayAvg: '30d avg',
    thirtyDayGoalCompletion: '30-Day Goal Completion',
    move: 'Move',
    exercise: 'Exercise',
    stand: 'Stand',
    recentTrends: 'Recent Trends',
    higherThan: 'higher',
    lowerThan: 'lower',
    thanOverall: 'than overall',
    is: 'is',

    // Sleep Tab
    sleep: 'Sleep',
    sleepDuration: 'Sleep Duration',
    sleepStages: 'Sleep Stages',
    sleepInsights: 'Sleep Insights',
    averageSleep: 'Average sleep',
    hours: 'hours',
    last30Days: 'last 30 days',
    belowRecommended: '⚠️ Below recommended 7-9 hours',
    withinRecommended: '✅ Within recommended range',
    totalHours: 'Total Hours',

    // Heart Tab
    heartHealth: 'Heart Health',

    // Body Tab
    bodyComposition: 'Body Composition',

    // Mobility Tab
    mobility: 'Mobility',

    // Environment Tab
    environment: 'Environment',

    // Health Analysis strings
    excellentInterpretation: (metric: string) => `Excellent. Your ${metric} is in the optimal range for a 43-year-old male.`,
    goodInterpretation: (metric: string) => `Good. Your ${metric} is above average.`,
    normalInterpretation: 'Normal range, but room for improvement.',
    concernInterpretation: 'Needs attention. Below recommended levels.',
    warningInterpretation: 'Concerning. Consult a healthcare provider.',
    excellentOverall: 'Excellent overall health. Maintain current lifestyle.',
    goodOverall: 'Good health with room for improvement in key areas.',
    needsAttentionOverall: 'Needs attention. Prioritize the flagged concerns.',
    multipleOverall: 'Multiple health concerns detected. Recommend comprehensive health assessment.',

    // Sleep stage interpretations
    belowIdealRange: (low: number, high: number) => `Below ideal range. Target: ${low}-${high}% of total sleep.`,
    aboveTypicalRange: 'Above typical range. May indicate sleep fragmentation.',
    withinHealthyRange: 'Within healthy range for a 43-year-old male.',

    // Footer
    appleHealthExport: 'Apple Health Export',
  },
  
  zh: {
    // Header
    siteTitle: 'Sam 的健康数据',
    recordsSummary: (total: number, types: number) => `${(total / 1000000).toFixed(1)}M 条记录 · ${types} 种类型 · 2017–2026`,
    
    // Tabs
    tabOverview: '概览',
    tabAnalysis: '健康分析',
    tabHeart: '心脏',
    tabActivity: '活动',
    tabSleep: '睡眠',
    tabBody: '身体',
    tabWorkouts: '锻炼',
    tabMobility: '行动力',
    tabEnvironment: '环境',
    tabAll: '所有指标',
    vitals: '生命体征',
    movement: '运动',
    
    // Analysis Tab
    overallHealthScore: '综合健康评分',
    ageAdjustedFor: '已根据 43 岁男性校准',
    lastUpdated: '最后更新',
    excellent: '优秀',
    good: '良好',
    needsImprovement: '需改善',
    
    categoryCardiovascular: '心血管',
    categoryFitness: '体能',
    categorySleep: '睡眠',
    categoryActivity: '活动',
    
    strengths: '优势',
    areasNeedingAttention: '需要关注的方面',
    
    sleepBreakdown: '睡眠阶段分解',
    activityRings: '活动圆环',
    dayAvg: '（30 天平均）',
    
    detailedAnalysis: '详细分析',
    recommendation: '建议',
    
    medicalDisclaimer: '医疗免责声明：',
    disclaimerText: '本分析仅供参考，不构成医疗建议。参考范围基于临床指南（AHA、WHO、ACE、NSF、Cooper Clinic），已针对 43 岁男性进行校准。百分位排名源自 NHANES 和 Framingham 人群数据。个体需求可能有所不同。请咨询医疗专业人员获取个性化医疗指导。',
    
    percentileVs: '相比 43 岁男性百分位',
    topPercentile: '前 10%',
    aboveAverage: '高于平均',
    average: '平均',
    belowAverage: '低于平均',
    bottomPercentile: '后 25%',
    
    trendImproving: '改善中',
    trendDeclining: '下降中',
    trendStable: '稳定',
    
    sleepDeep: '深度睡眠',
    sleepREM: 'REM 睡眠',
    sleepCore: '核心睡眠',
    sleepAwake: '清醒',
    idealRange: '理想',
    
    moveCalories: '活动（千卡）',
    exerciseMin: '锻炼（分钟）',
    standHours: '站立（小时）',
    goalMet: '达成目标',
    ofDays: '的天数',
    
    // Risk levels
    riskOptimal: '优秀',
    riskGood: '良好',
    riskNormal: '正常',
    riskConcern: '需关注',
    riskWarning: '高风险',
    
    // Overview Tab
    keyMetrics: '关键指标',
    thirtyDayAvg: '30天均值',
    thirtyDayGoalCompletion: '30 天目标达成',
    move: '活动',
    exercise: '锻炼',
    stand: '站立',
    recentTrends: '近期趋势',
    higherThan: '高于',
    lowerThan: '低于',
    thanOverall: '总体均值',
    is: '',

    // Sleep Tab
    sleep: '睡眠',
    sleepDuration: '睡眠时长',
    sleepStages: '睡眠阶段',
    sleepInsights: '睡眠洞察',
    averageSleep: '平均睡眠',
    hours: '小时',
    last30Days: '近 30 天',
    belowRecommended: '⚠️ 低于建议的 7-9 小时',
    withinRecommended: '✅ 在建议范围内',
    totalHours: '总时长',

    // Heart Tab
    heartHealth: '心脏健康',

    // Body Tab
    bodyComposition: '身体成分',

    // Mobility Tab
    mobility: '行动力',

    // Environment Tab
    environment: '环境',

    // Health Analysis strings
    excellentInterpretation: (metric: string) => `优秀。您的${metric}处于 43 岁男性的最佳范围。`,
    goodInterpretation: (metric: string) => `良好。您的${metric}高于平均水平。`,
    normalInterpretation: '正常范围，但仍有提升空间。',
    concernInterpretation: '需要关注，低于建议水平。',
    warningInterpretation: '令人担忧，建议咨询医疗专业人员。',
    excellentOverall: '整体健康状况优秀，保持当前生活方式。',
    goodOverall: '健康状况良好，部分指标仍有提升空间。',
    needsAttentionOverall: '需要关注，请优先处理标记的问题。',
    multipleOverall: '检测到多项健康问题，建议进行全面健康评估。',

    // Sleep stage interpretations
    belowIdealRange: (low: number, high: number) => `低于理想范围。目标：总睡眠的 ${low}-${high}%。`,
    aboveTypicalRange: '高于典型范围，可能存在睡眠碎片化。',
    withinHealthyRange: '处于 43 岁男性的健康范围内。',

    // Footer
    appleHealthExport: 'Apple Health 导出',
  },
};

export function t(key: string, lang: Language = 'en'): string | (((...args: any[]) => string)) {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value ?? key;
}
