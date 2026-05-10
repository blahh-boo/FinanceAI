import { NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL_ID } from "@/lib/server/anthropic";
import { FINANCIAL_ANALYST_PROMPT } from "@/lib/server/prompts/financial-analyst";
import { chatRequestSchema } from "@/lib/server/schemas";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { encodeSSE, SSE_HEADERS } from "@/lib/server/sse";
import { env } from "@/lib/server/env";

export const runtime = "nodejs";
export const maxDuration = 120;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  if (env.NODE_ENV === "production") {
    const origin = req.headers.get("origin");
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return new Response("Unsupported Media Type", { status: 415 });
  }

  const rate = checkRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, depth } = parsed.data;
  const isDeep = depth === "deep";

  const webSearchTool: Anthropic.WebSearchTool20250305 = {
    type: "web_search_20250305",
    name: "web_search",
    max_uses: isDeep ? 8 : 3,
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encodeSSE(event, data));

      try {
        const upstream = anthropic.messages.stream({
          model: MODEL_ID,
          max_tokens: isDeep ? 16384 : 8192,
          system: FINANCIAL_ANALYST_PROMPT,
          thinking: { type: "adaptive" },
          output_config: { effort: isDeep ? "high" : "medium" },
          tools: [webSearchTool],
          messages,
        } as Parameters<typeof anthropic.messages.stream>[0]);

        for await (const event of upstream) {
          switch (event.type) {
            case "content_block_start":
            case "content_block_delta":
            case "content_block_stop":
            case "message_delta":
            case "message_stop":
              send(event.type, event);
              break;
          }
        }

        send("done", {});
      } catch (err) {
        const safe =
          err instanceof Error && err.message.includes("rate_limit")
            ? "Rate limited by upstream. Please try again shortly."
            : "An error occurred. Please try again.";
        send("error", { message: safe });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
