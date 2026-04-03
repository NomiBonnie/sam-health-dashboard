import { TimeRange } from '../types';

interface Props {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '1y', label: '1Y' },
  { value: '3y', label: '3Y' },
  { value: 'all', label: 'All' },
];

export default function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex rounded-md border border-brand-200 dark:border-brand-800 overflow-hidden">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs transition-colors ${
            value === opt.value
              ? 'bg-brand-900 dark:bg-brand-100 text-brand-50 dark:text-brand-900'
              : 'text-brand-400 dark:text-brand-600 hover:text-brand-600 dark:hover:text-brand-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
