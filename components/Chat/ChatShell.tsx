"use client";

import { useChat } from "@/lib/client/use-chat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationSidebar } from "./ConversationSidebar";

export function ChatShell() {
  const {
    conversations,
    activeConversation,
    isLoading,
    sendMessage,
    stopGeneration,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useChat();

  return (
    <div className="flex h-full overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        onSelect={selectConversation}
        onNew={newConversation}
        onDelete={deleteConversation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MessageList
          messages={activeConversation?.messages ?? []}
          onSelectQuery={(prompt) => sendMessage(prompt, "deep")}
        />
        <MessageInput
          onSend={(text, depth) => sendMessage(text, depth)}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
