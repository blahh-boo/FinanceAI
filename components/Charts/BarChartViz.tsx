"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface BarChartData {
  title?: string;
  x_key: string;
  y_key: string;
  unit?: string;
  data: Record<string, string | number>[];
  source?: string;
  as_of?: string;
}

export function BarChartViz({ data }: { data: BarChartData }) {
  return (
    <ChartWrapper title={data.title} source={data.source} asOf={data.as_of}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data.data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--app-line)"
            strokeDasharray="3 3"
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
            tickFormatter={(v) => `${v}${data.unit ? " " + data.unit : ""}`}
            width={60}
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
            cursor={{ fill: "var(--app-line)", fillOpacity: 0.4 }}
            formatter={(v) => [`${v}${data.unit ? " " + data.unit : ""}`, data.y_key]}
          />
          <Bar dataKey={data.y_key} radius={[3, 3, 0, 0]}>
            {data.data.map((_, i) => (
              <Cell key={i} fill="var(--app-accent)" fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
