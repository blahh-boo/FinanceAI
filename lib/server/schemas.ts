import "server-only";
import { z } from "zod/v4";
import { MAX_MESSAGE_LENGTH, MAX_CONVERSATION_TURNS } from "@/config/security";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1, "At least one message required")
    .max(MAX_CONVERSATION_TURNS, `Exceeds ${MAX_CONVERSATION_TURNS} turn limit`),
  depth: z.enum(["quick", "deep"]).default("quick"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
