"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/shared/types";
import { CitationList } from "@/components/Citations/CitationList";
import { CodeFenceRenderer } from "@/components/Charts/CodeFenceRenderer";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1">
        <div className="max-w-[70%] whitespace-pre-wrap break-words rounded-xl rounded-br-sm border border-line bg-elevated px-3.5 py-2.5 text-sm leading-relaxed text-fg">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-1">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-accent">
          ANALYST
        </span>
        {message.isStreaming && (
          <span className="inline-block h-1.5 w-1.5 animate-[pulse_1s_infinite] rounded-full bg-accent" />
        )}
      </div>

      <div className="prose">
        {message.content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            disallowedElements={["html"]}
            components={{ pre: CodeFenceRenderer }}
          >
            {message.content}
          </ReactMarkdown>
        ) : message.isStreaming ? (
          <span className="text-[13px] text-muted">Thinking…</span>
        ) : null}
      </div>

      <CitationList citations={message.citations} />
    </div>
  );
}
