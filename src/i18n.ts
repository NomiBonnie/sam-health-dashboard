// i18n translations for Health Dashboard

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Header
    healthTitle: "Sam's Health",
    themeToggle: "Toggle theme",
    recordsSummary: (records: number, types: number) => `${(records / 1000000).toFixed(1)}M records · ${types} types · 2017–2026`,
    
    // Tabs
    overview: "Overview",
    healthAnalysis: "Health Analysis",
    heart: "Heart",
    activity: "Activity",
    sleep: "Sleep",
    body: "Body",
    workouts: "Workouts",
    mobility: "Mobility",
    environment: "Environment",
    allMetrics: "All Metrics",
    
    // Analysis
    overallHealthScore: "Overall Health Score",
    ageAdjusted: "Age-adjusted for 43-year-old male",
    lastUpdated: "Last updated",
    excellent: "Excellent",
    good: "Good",
    needsImprovement: "Needs Improvement",
    cardiovascular: "Cardiovascular",
    fitness: "Fitness",
    strengths: "Strengths",
    areasNeedingAttention: "Areas Needing Attention",
    detailedAnalysis: "Detailed Analysis",
    recommendation: "Recommendation",
    medicalDisclaimer: "Medical Disclaimer",
    disclaimerText: "This analysis is for informational purposes only and does not constitute medical advice. Reference ranges are based on clinical guidelines (AHA, WHO, ACE, NSF, Cooper Clinic) adjusted for a 43-year-old male. Individual needs may vary. Consult healthcare providers for personalized medical guidance.",
    
    // Risk levels
    optimal: "Excellent",
    normal: "Normal",
    concern: "Needs Attention",
    warning: "High Risk",
    
    // Time ranges
    oneMonth: "1M",
    threeMonths: "3M",
    oneYear: "1Y",
    threeYears: "3Y",
    all: "All",
    
    // Footer
    exportDate: "Apple Health Export",
  },
  zh: {
    // Header
    healthTitle: "Sam 的健康数据",
    themeToggle: "切换主题",
    recordsSummary: (records: number, types: number) => `${(records / 1000000).toFixed(1)}百万条记录 · ${types} 种指标 · 2017–2026`,
    
    // Tabs
    overview: "总览",
    healthAnalysis: "健康分析",
    heart: "心脏",
    activity: "活动",
    sleep: "睡眠",
    body: "身体",
    workouts: "运动",
    mobility: "移动能力",
    environment: "环境",
    allMetrics: "所有指标",
    
    // Analysis
    overallHealthScore: "综合健康评分",
    ageAdjusted: "基于 43 岁男性年龄校正",
    lastUpdated: "更新时间",
    excellent: "优秀",
    good: "良好",
    needsImprovement: "需改进",
    cardiovascular: "心血管",
    fitness: "体能",
    strengths: "优势",
    areasNeedingAttention: "需要关注的领域",
    detailedAnalysis: "详细分析",
    recommendation: "建议",
    medicalDisclaimer: "医疗免责声明",
    disclaimerText: "本分析仅供参考，不构成医疗建议。参考范围基于临床指南（AHA、WHO、ACE、NSF、Cooper Clinic）并针对 43 岁男性调整。个体需求可能有所不同。请咨询医疗专业人员获取个性化医疗指导。",
    
    // Risk levels
    optimal: "优秀",
    good: "良好",
    normal: "正常",
    concern: "需关注",
    warning: "高风险",
    
    // Time ranges
    oneMonth: "1月",
    threeMonths: "3月",
    oneYear: "1年",
    threeYears: "3年",
    all: "全部",
    
    // Footer
    exportDate: "Apple Health 导出",
  },
};

export function t(lang: Language, key: keyof typeof translations.en, ...args: any[]): string {
  const value = translations[lang][key];
  if (typeof value === 'function') {
    return (value as any)(...args);
  }
  return value as string;
}
