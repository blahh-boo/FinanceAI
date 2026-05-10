"use client";

import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/client/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "Cream" : "Espresso"} theme`}
      className="flex items-center gap-1.5 rounded-md border border-line bg-elevated px-3 py-1 font-mono text-[11px] tracking-wide text-muted hover:text-fg"
    >
      <span className="text-[13px]">{theme === "dark" ? "☕︎" : "●"}</span>
      <span>{theme === "dark" ? "CREAM" : "ESPRESSO"}</span>
    </button>
  );
}
