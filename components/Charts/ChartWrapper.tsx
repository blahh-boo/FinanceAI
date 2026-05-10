"use client";

interface ChartWrapperProps {
  title?: string;
  source?: string;
  asOf?: string;
  children: React.ReactNode;
}

export function ChartWrapper({ title, source, asOf, children }: ChartWrapperProps) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-line bg-surface">
      {title && (
        <div className="border-b border-line px-4 py-2.5">
          <p className="text-sm font-semibold text-fg">{title}</p>
        </div>
      )}
      <div className="p-4">{children}</div>
      {(source || asOf) && (
        <div className="border-t border-line px-4 py-2 flex gap-3">
          {source && (
            <span className="font-mono text-[10px] text-muted">Source: {source}</span>
          )}
          {asOf && (
            <span className="font-mono text-[10px] text-muted">As of {asOf}</span>
          )}
        </div>
      )}
    </div>
  );
}
