// i18n translations for Health Dashboard

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    healthTitle: "Sam's Health",
    themeToggle: "Toggle theme",
    recordsSummary: (records: number, types: number) => `${(records / 1000000).toFixed(1)}M records · ${types} types`,
  },
  zh: {
    healthTitle: "Sam 的健康数据",
    themeToggle: "切换主题",
    recordsSummary: (records: number, types: number) => `${(records / 1000000).toFixed(1)} 百万条记录 · ${types} 种类型`,
  }
};