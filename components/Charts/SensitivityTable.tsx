"use client";

import { ChartWrapper } from "./ChartWrapper";

interface Axis {
  label: string;
  values: string[];
}

interface SensitivityData {
  title?: string;
  x_axis: Axis;
  y_axis: Axis;
  values: string[][];
  base_case?: [number, number];
  source?: string;
  as_of?: string;
}

export function SensitivityTable({ data }: { data: SensitivityData }) {
  const [baseRow, baseCol] = data.base_case ?? [-1, -1];

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
                <th
                  key={i}
                  className={[
                    "pb-2 px-3 text-center text-[10px] uppercase tracking-wider",
                    i === baseCol ? "text-accent" : "text-muted",
                  ].join(" ")}
                >
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.values.map((row, ri) => (
              <tr key={ri} className="border-t border-line/40">
                <td
                  className={[
                    "py-1.5 pr-3 text-left text-[10px] uppercase tracking-wider",
                    ri === baseRow ? "text-accent" : "text-muted",
                  ].join(" ")}
                >
                  {data.y_axis.values[ri]}
                </td>
                {row.map((cell, ci) => {
                  const isBase = ri === baseRow && ci === baseCol;
                  return (
                    <td
                      key={ci}
                      className={[
                        "py-1.5 px-3 text-center",
                        isBase
                          ? "bg-accent/15 text-accent font-semibold ring-1 ring-accent/40 rounded-sm"
                          : "text-fg",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.base_case && (
        <p className="mt-2 font-mono text-[10px] text-muted">
          Base case highlighted
        </p>
      )}
    </ChartWrapper>
  );
}
