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
    <div className="flex gap-0 border" style={{ borderColor: 'var(--border)' }}>
      {OPTIONS.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1 text-[10px] font-light uppercase tracking-widest transition-all border-r last:border-r-0"
          style={{
            backgroundColor: value === opt.value ? 'var(--accent)' : 'transparent',
            color: value === opt.value ? (value === opt.value ? 'var(--bg-primary)' : 'var(--text-muted)') : 'var(--text-muted)',
            borderColor: 'var(--border)',
            letterSpacing: '0.1em',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
