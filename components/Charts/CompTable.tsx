"use client";

import { ChartWrapper } from "./ChartWrapper";

interface CompTableData {
  title?: string;
  headers: string[];
  rows: string[][];
  source?: string;
  as_of?: string;
}

export function CompTable({ data }: { data: CompTableData }) {
  const summaryLabels = new Set(["mean", "median", "average"]);

  return (
    <ChartWrapper title={data.title} source={data.source} asOf={data.as_of}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-line">
              {data.headers.map((h, i) => (
                <th
                  key={i}
                  className={[
                    "pb-2 pt-1 text-[10px] uppercase tracking-wider text-muted",
                    i === 0 ? "text-left pr-4" : "text-right px-3",
                  ].join(" ")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => {
              const isSummary = summaryLabels.has(row[0]?.toLowerCase() ?? "");
              return (
                <tr
                  key={ri}
                  className={[
                    "border-b border-line/50 transition-colors hover:bg-elevated",
                    isSummary ? "bg-elevated/60 font-semibold" : "",
                  ].join(" ")}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={[
                        "py-2 text-fg",
                        ci === 0 ? "text-left pr-4" : "text-right px-3",
                        isSummary && ci > 0 ? "text-accent" : "",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartWrapper>
  );
}
