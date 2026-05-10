"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, Conversation } from "@/lib/shared/types";
import { parseCitationsFromEvents } from "@/lib/shared/citations";
import { loadConversations, saveConversations, upsertConversation } from "./storage";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildTitle(content: string): string {
  return content.length > 60 ? content.slice(0, 60) + "…" : content;
}

export function useChat() {
  // Start empty so SSR and first client render match.
  // Hydrate from localStorage post-mount via useEffect below.
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const persist = useCallback(
    (convs: Conversation[]) => {
      setConversations(convs);
      saveConversations(convs);
    },
    []
  );

  const newConversation = useCallback(() => {
    const id = newId();
    const conv: Conversation = {
      id,
      title: "New conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const next = upsertConversation(prev, conv);
      saveConversations(next);
      return next;
    });
    setActiveId(id);
    return id;
  }, []);

  const sendMessage = useCallback(
    async (userText: string, depth: "quick" | "deep" = "quick") => {
      if (!userText.trim() || isLoading) return;

      // Snapshot prior messages before state updates
      let convId = activeId;
      const priorConvs = conversations;
      let priorMessages: Message[] = [];

      let conv: Conversation;

      if (!convId) {
        convId = newId();
        conv = {
          id: convId,
          title: buildTitle(userText),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      } else {
        conv = priorConvs.find((c) => c.id === convId)!;
        if (!conv) return;
        priorMessages = conv.messages;
        if (conv.messages.length === 0) {
          conv = { ...conv, title: buildTitle(userText) };
        }
      }

      setActiveId(convId);

      const userMsg: Message = {
        id: newId(),
        role: "user",
        content: userText,
        citations: [],
      };
      const assistantId = newId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        citations: [],
        isStreaming: true,
      };

      const withNewMessages: Conversation = {
        ...conv,
        messages: [...priorMessages, userMsg, assistantMsg],
        updatedAt: Date.now(),
      };

      setConversations((prev) => {
        const next = upsertConversation(prev, withNewMessages);
        saveConversations(next);
        return next;
      });

      setIsLoading(true);
      abortRef.current = new AbortController();

      // Build API payload from prior messages + new user message
      const apiMessages = [
        ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userText },
      ];

      const updateAssistant = (text: string, citations: typeof assistantMsg.citations, streaming: boolean) => {
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantId ? { ...m, content: text, citations, isStreaming: streaming } : m
              ),
            };
          });
          saveConversations(next);
          return next;
        });
      };

      let accumulated = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, depth }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const toolResultPayloads: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const raw = line.slice(6);

              if (eventType === "content_block_start") {
                try {
                  const ev = JSON.parse(raw);
                  const block = ev?.content_block;
                  // Capture tool_result / web_search_tool_result blocks
                  if (block?.type?.includes("tool_result") || block?.type?.includes("web_search")) {
                    toolResultPayloads.push(raw);
                  }
                } catch { /* skip */ }
              }

              if (eventType === "content_block_delta") {
                try {
                  const ev = JSON.parse(raw);
                  const delta = ev?.delta;
                  if (delta?.type === "text_delta" && typeof delta.text === "string") {
                    accumulated += delta.text;
                    updateAssistant(accumulated, [], true);
                  }
                  // Some versions emit search result deltas
                  if (delta?.type === "tool_result" || delta?.type?.includes("web_search")) {
                    toolResultPayloads.push(raw);
                  }
                } catch { /* skip */ }
              }

              if (eventType === "message_stop" || eventType === "done") {
                const citations = parseCitationsFromEvents(toolResultPayloads);
                updateAssistant(accumulated, citations, false);
              }

              if (eventType === "error") {
                try {
                  const ev = JSON.parse(raw);
                  updateAssistant(ev?.message ?? "An error occurred.", [], false);
                } catch {
                  updateAssistant("An error occurred.", [], false);
                }
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Finalize whatever was accumulated
          updateAssistant(accumulated || "(Stopped)", [], false);
          return;
        }
        updateAssistant("Error: " + (err instanceof Error ? err.message : "Unknown error"), [], false);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [activeId, conversations, isLoading]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveConversations(next);
        return next;
      });
      setActiveId((prev) => {
        if (prev !== id) return prev;
        return conversations.find((c) => c.id !== id)?.id ?? null;
      });
    },
    [conversations]
  );

  return {
    conversations,
    activeConversation,
    isLoading,
    sendMessage,
    stopGeneration,
    newConversation,
    selectConversation,
    deleteConversation,
  };
}
