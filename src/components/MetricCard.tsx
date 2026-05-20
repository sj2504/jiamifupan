import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'good' | 'bad';
  helper?: string;
}

export function MetricCard({ label, value, tone = 'default', helper }: MetricCardProps) {
  const toneClass = tone === 'good' ? 'text-positive' : tone === 'bad' ? 'text-negative' : 'text-ink';

  return (
    <div className="rounded border border-line bg-white p-4">
      <p className="text-sm text-muted">{label}</p>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
      {helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}
