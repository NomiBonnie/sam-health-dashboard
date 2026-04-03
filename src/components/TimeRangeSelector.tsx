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
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            value === opt.value ? 'shadow-sm' : ''
          }`}
          style={{
            backgroundColor: value === opt.value ? 'var(--bg-card)' : 'transparent',
            color: value === opt.value ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
