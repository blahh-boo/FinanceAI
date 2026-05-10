"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface LineChartData {
  title?: string;
  x_key: string;
  y_key: string;
  unit?: string;
  data: Record<string, string | number>[];
  source?: string;
  as_of?: string;
}

export function LineChartViz({ data }: { data: LineChartData }) {
  return (
    <ChartWrapper title={data.title} source={data.source} asOf={data.as_of}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data.data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid
            stroke="var(--app-line)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey={data.x_key}
            tick={{ fill: "var(--app-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--app-line)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--app-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}${data.unit ? data.unit : ""}`}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: "var(--app-elevated)",
              border: "1px solid var(--app-line)",
              borderRadius: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--app-fg)",
            }}
            formatter={(v) => [`${v}${data.unit ?? ""}`, data.y_key]}
          />
          <Line
            type="monotone"
            dataKey={data.y_key}
            stroke="var(--app-accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--app-accent)", stroke: "var(--app-surface)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
