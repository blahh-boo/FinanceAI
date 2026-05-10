"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/shared/types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  onSelectQuery?: (prompt: string) => void;
}

const EXAMPLE_QUERIES: { label: string; prompt: string }[] = [
  {
    label: "Mag 7 comps table",
    prompt:
      "Build a trading comps table for the Magnificent 7 — include EV/EBITDA, P/E forward, EV/Revenue, and revenue growth. Flag who looks expensive vs. cheap.",
  },
  {
    label: "AAPL returns matrix",
    prompt:
      "Create a returns matrix for Apple showing what the stock returns at exit P/E multiples of 18x, 22x, 26x, 30x and revenue growth scenarios of 5%, 8%, 12%, 15% over 3 years.",
  },
  {
    label: "NVDA DCF sensitivity",
    prompt:
      "Run a DCF sensitivity analysis on Nvidia — show implied share price at WACC ranging 8%–12% and terminal growth rate 2%–5%.",
  },
  {
    label: "MSFT revenue by segment",
    prompt:
      "Chart the last 5 years of revenue for Microsoft by segment: Productivity, Intelligent Cloud, and More Personal Computing.",
  },
  {
    label: "Big bank margin trends",
    prompt:
      "Compare net income margins for JPMorgan, Goldman Sachs, Morgan Stanley, and Citi over the past 4 years as a bar chart.",
  },
  {
    label: "Mag 7 price performance",
    prompt:
      "Plot the stock price performance of META, GOOGL, AMZN, and MSFT from January 2023 to today — indexed to 100.",
  },
  {
    label: "Software LBO tearsheet",
    prompt:
      "I'm underwriting a leveraged buyout of a $2B EBITDA industrial company at 9x entry. Give me: a public comps table, an LBO returns matrix at 5x–8x exit and 4x–6x leverage, and a DCF sensitivity on WACC vs. terminal growth.",
  },
  {
    label: "Asset manager comps",
    prompt:
      "Show me a public comps table for large-cap asset managers (BlackRock, KKR, Ares, Blue Owl) with AUM, fee-related earnings, and P/FRE multiples.",
  },
];

export function MessageList({ messages, onSelectQuery }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10">
        <p className="text-center text-[22px] font-semibold text-fg">
          Financial Research AI
        </p>
        <p className="max-w-md text-center text-sm leading-relaxed text-muted">
          Ask about earnings, valuations, market trends, or any financial topic.
          Live web search included.
        </p>
        <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q.label}
              onClick={() => onSelectQuery?.(q.prompt)}
              className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-fg"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
