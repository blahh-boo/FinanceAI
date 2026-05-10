"use client";

import type { Citation } from "@/lib/shared/types";

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        Sources
      </p>
      <ol className="space-y-1">
        {citations.map((c) => (
          <li key={c.url} className="flex items-baseline gap-2">
            <span className="min-w-[20px] shrink-0 font-mono text-[10px] text-accent">
              [{c.index}]
            </span>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted hover:text-accent"
            >
              {c.title || c.url}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
