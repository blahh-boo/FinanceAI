"use client";

import { ChartWrapper } from "./ChartWrapper";

interface Axis {
  label: string;
  values: string[];
}

interface ReturnsMatrixData {
  title?: string;
  x_axis: Axis;
  y_axis: Axis;
  metric: string;
  values: string[][];
  thresholds?: { high: number; medium: number; low: number };
  source?: string;
  as_of?: string;
}

function cellColor(value: string, thresholds?: ReturnsMatrixData["thresholds"]): string {
  if (!thresholds) return "";
  const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (isNaN(num)) return "";
  if (num >= thresholds.high) return "bg-positive/20 text-positive";
  if (num >= thresholds.medium) return "bg-accent/10 text-fg";
  if (num < thresholds.low) return "bg-negative/20 text-negative";
  return "text-muted";
}

export function ReturnsMatrix({ data }: { data: ReturnsMatrixData }) {
  return (
    <ChartWrapper title={data.title} source={data.source} asOf={data.as_of}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr>
              <th className="pb-2 pr-3 text-left text-[10px] uppercase tracking-wider text-muted">
                {data.y_axis.label} ↓ / {data.x_axis.label} →
              </th>
              {data.x_axis.values.map((v, i) => (
                <th key={i} className="pb-2 px-3 text-center text-[10px] uppercase tracking-wider text-muted">
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.values.map((row, ri) => (
              <tr key={ri} className="border-t border-line/40">
                <td className="py-1.5 pr-3 text-left text-muted text-[10px] uppercase tracking-wider">
                  {data.y_axis.values[ri]}
                </td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={[
                      "py-1.5 px-3 text-center rounded-sm transition-colors",
                      cellColor(cell, data.thresholds),
                    ].join(" ")}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.thresholds && (
        <div className="mt-3 flex gap-4 text-[10px] font-mono">
          <span className="text-positive">▲ ≥{data.thresholds.high}% {data.metric}</span>
          <span className="text-muted">● ≥{data.thresholds.medium}%</span>
          <span className="text-negative">▼ &lt;{data.thresholds.low}%</span>
        </div>
      )}
    </ChartWrapper>
  );
}
