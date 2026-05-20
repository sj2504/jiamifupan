import type { ReactNode } from 'react';

export function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border border-line bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      <div className="h-[300px] min-w-0">{children}</div>
    </div>
  );
}
