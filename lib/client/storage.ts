import { z } from "zod/v4";
import type { Conversation } from "@/lib/shared/types";

const KEY = "financeai-conversations";

const citationSchema = z.object({
  index: z.number(),
  url: z.string(),
  title: z.string(),
});

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  citations: z.array(citationSchema),
  isStreaming: z.boolean().optional(),
});

const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(messageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const conversationsSchema = z.array(conversationSchema);

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = conversationsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(conversations));
  } catch {
    // localStorage quota exceeded — silently skip
  }
}

export function upsertConversation(
  conversations: Conversation[],
  updated: Conversation
): Conversation[] {
  const idx = conversations.findIndex((c) => c.id === updated.id);
  if (idx === -1) return [updated, ...conversations];
  const next = [...conversations];
  next[idx] = updated;
  return next;
}
