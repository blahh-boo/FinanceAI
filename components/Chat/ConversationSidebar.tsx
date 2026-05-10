"use client";

import type { Conversation } from "@/lib/shared/types";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationSidebarProps) {
  return (
    <div className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Conversations
        </span>
        <button
          onClick={onNew}
          title="New conversation"
          className="rounded border border-line px-2 py-0 text-base leading-none text-muted hover:text-fg"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-5 text-center text-xs text-muted">
            No conversations yet
          </p>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onSelect={() => onSelect(c.id)}
              onDelete={() => onDelete(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={[
        "mb-0.5 flex cursor-pointer items-center justify-between gap-1.5 rounded-md border px-2.5 py-2",
        isActive ? "border-line bg-elevated" : "border-transparent hover:bg-elevated/50",
      ].join(" ")}
    >
      <span
        className={[
          "flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px]",
          isActive ? "text-fg" : "text-muted",
        ].join(" ")}
      >
        {conversation.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        className="shrink-0 px-0.5 text-sm leading-none text-muted opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
