"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { MODEL_ID } from "@/lib/shared/model";

interface MessageInputProps {
  onSend: (text: string, depth: "quick" | "deep") => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSend, onStop, isLoading, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    onSend(trimmed, depth);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoresize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-line bg-surface px-6 pb-5 pt-4">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <div className="flex flex-1 items-end rounded-xl border border-line bg-elevated px-3.5 py-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={autoresize}
            placeholder="Ask a financial research question…"
            rows={1}
            disabled={disabled}
            className="max-h-[200px] w-full resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-fg outline-none"
          />
        </div>

        {isLoading ? (
          <button
            onClick={onStop}
            className="whitespace-nowrap rounded-lg border border-line bg-elevated px-4 py-2.5 text-[13px] text-muted hover:text-fg"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canSend}
            className={[
              "rounded-lg border border-line px-4 py-2.5 text-[13px] font-medium transition-colors",
              canSend
                ? "bg-accent text-white hover:opacity-90"
                : "cursor-default bg-elevated text-muted",
            ].join(" ")}
          >
            Send
          </button>
        )}
      </div>

      <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between">
        <p className="font-mono text-[11px] text-muted">
          Enter to send · Shift+Enter for new line · {MODEL_ID} + web search
        </p>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-elevated p-0.5">
          <button
            onClick={() => setDepth("quick")}
            className={[
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              depth === "quick"
                ? "bg-accent text-white"
                : "text-muted hover:text-fg",
            ].join(" ")}
          >
            Quick
          </button>
          <button
            onClick={() => setDepth("deep")}
            className={[
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              depth === "deep"
                ? "bg-accent text-white"
                : "text-muted hover:text-fg",
            ].join(" ")}
          >
            Deep
          </button>
        </div>
      </div>
    </div>
  );
}
