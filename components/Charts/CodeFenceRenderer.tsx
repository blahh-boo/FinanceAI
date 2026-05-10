"use client";

import type { ComponentProps } from "react";
import { CompTable } from "./CompTable";
import { ReturnsMatrix } from "./ReturnsMatrix";
import { SensitivityTable } from "./SensitivityTable";
import { BarChartViz } from "./BarChartViz";
import { LineChartViz } from "./LineChartViz";

const CHART_TYPES = new Set([
  "comp-table",
  "returns-matrix",
  "sensitivity-table",
  "bar-chart",
  "line-chart",
]);

type PreProps = ComponentProps<"pre">;

// Drop-in replacement for react-markdown's <pre> component.
// Intercepts typed code fences and renders chart components;
// falls back to a styled <pre> for everything else.
export function CodeFenceRenderer({ children, ...rest }: PreProps) {
  const codeEl = (children as React.ReactElement | null)?.props;
  if (codeEl) {
    const lang = (codeEl.className ?? "").replace("language-", "");
    if (CHART_TYPES.has(lang)) {
      const raw = String(codeEl.children ?? "").trim();
      try {
        const data = JSON.parse(raw);
        switch (lang) {
          case "comp-table":      return <CompTable data={data} />;
          case "returns-matrix":  return <ReturnsMatrix data={data} />;
          case "sensitivity-table": return <SensitivityTable data={data} />;
          case "bar-chart":       return <BarChartViz data={data} />;
          case "line-chart":      return <LineChartViz data={data} />;
        }
      } catch {
        // Malformed JSON — fall through to default code block
      }
    }
  }

  return (
    <pre
      {...rest}
      className="overflow-x-auto rounded-md border border-line bg-elevated p-4 font-mono text-sm leading-relaxed text-fg"
    >
      {children}
    </pre>
  );
}
