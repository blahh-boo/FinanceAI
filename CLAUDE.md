# Rogo Clone — Financial Research AI

## What this is

A locally-hosted Next.js app that lets users ask financial research questions and get cited, structured answers from Claude. Inspired by Rogo. Backend wraps the Claude API with `web_search` for live data; later phases add MCP servers for proprietary data sources (CapIQ, internal docs, etc.).

**Status:** Phase 1 (vibe-coding stage). Local-only. No auth, no persistence yet.

---

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (no separate server)
- **AI:** Claude `claude-sonnet-4-6` via the Anthropic SDK, with `web_search` tool and extended thinking
- **Streaming:** Server-Sent Events from API route → client
- **State:** React state + URL params for now (no DB in Phase 1)

---

## Repo layout

```
app/
  api/chat/route.ts            # streaming Claude handler — entry point for all model calls
  page.tsx                     # main chat UI
  layout.tsx                   # root layout, theme provider
  globals.css                  # design tokens + Tailwind @theme

lib/
  server/                      # server-only — each file has 'import "server-only"'
    anthropic.ts               # Anthropic client + MODEL_ID
    env.ts                     # zod-validated process.env (throws on boot if missing)
    rate-limit.ts              # in-memory token bucket per IP
    schemas.ts                 # zod request body schemas
    sse.ts                     # SSE encoder + headers
    prompts/
      financial-analyst.ts     # system prompt — DO NOT inline elsewhere

  client/                      # browser-only
    use-chat.ts                # streaming chat hook
    storage.ts                 # localStorage with zod validation on read
    theme.ts                   # theme state + applyTheme

  shared/                      # safe in both server and client
    types.ts                   # Message, Conversation, Citation types
    citations.ts               # citation parser (no I/O)

components/
  Chat/                        # ChatShell, MessageList, MessageItem, MessageInput, ConversationSidebar
  Citations/                   # CitationList
  ThemeToggle.tsx

config/
  security.ts                  # CSP directives, rate limit config, max lengths

middleware.ts                  # security headers (CSP, HSTS, X-Frame-Options, etc.)
```

---

## Design system

Two themes, switched via a top-bar toggle. Theme state in `localStorage`, hydrated on mount, applied via a `data-theme` attribute on `<html>`.

### Dark — "Espresso"

Dense, terminal-feeling, information-first. Reach for this as the default.

- **Background:** `#0A0A0A` (near-black, not pure black)
- **Surface:** `#141414` (cards, message bubbles)
- **Surface elevated:** `#1C1C1C` (hover, modals)
- **Border:** `#2A2A2A`
- **Text primary:** `#E8E8E8`
- **Text secondary:** `#9A9A9A`
- **Accent:** `#FF9500` (amber — for active states, key numbers, links)
- **Positive:** `#00C853` (gains)
- **Negative:** `#FF3B30` (losses)
- **Mono font for numbers/tickers:** `JetBrains Mono` or `IBM Plex Mono`
- **UI font:** `Inter`

### Light — "Cream"

Sophisticated, off-white, generous whitespace, editorial feel.

- **Background:** `#FAF8F5` (warm off-white, NOT pure white)
- **Surface:** `#FFFFFF`
- **Surface elevated:** `#F5F2ED`
- **Border:** `#E8E4DD`
- **Text primary:** `#1A1A1A`
- **Text secondary:** `#6B6B6B`
- **Accent:** `#1A1A1A` (use a subtle navy `#0F2A4A` for links if needed)
- **Positive:** `#0A8043`
- **Negative:** `#C8201A`
- **UI font:** `Inter` (or a serif like `Source Serif Pro` for prose blocks)

### Theme rules for Claude

- **Always use CSS variables**, never hardcoded hex in components. Tokens live in `lib/theme.ts` and are exposed via Tailwind's `theme.extend.colors`.
- Reference colors as `bg-surface`, `text-primary`, `border-default` — not `bg-[#141414]`.
- When adding a new color, add it to BOTH themes. Never one-sided.
- Avoid drop shadows in dark mode; use border + background contrast instead.
- Light mode can use shadows but keep them soft (`shadow-sm` max).

---

## Claude API conventions

- Model: `claude-sonnet-4-6` — pin in `lib/claude.ts` as `MODEL_ID`, import everywhere.
- Always stream. `stream: true`, handle `content_block_delta` events.
- `max_tokens: 8192` minimum. Bump to 16384 for long research answers.
- Always pass the `web_search` tool. Verify the current tool version string in the Anthropic docs before each release — it's date-stamped and updates periodically.
- Citations: extract from `content` blocks of type `text` with `citations` arrays. Render as superscript links inline. Build the citation list at the bottom of the message.
- Extended thinking: on for any query that triggers `web_search` (let the model plan multi-search workflows). Budget tokens adaptively — small budget for greetings, larger for research.

---

## System prompt

Lives in `lib/prompts/financial-analyst.ts`. Exported as a `const` named `FINANCIAL_ANALYST_PROMPT`.

**Never inline the system prompt in API route handlers.** If you need variants (e.g., a "concise mode"), add them to the same file as named exports.

---

## Local dev

```bash
npm install
cp .env.example .env.local       # add ANTHROPIC_API_KEY
npm run dev                      # localhost:3000
```

`.env.local` is gitignored. Never commit API keys.

---

## What I'm vibe-coding right now

Phase 1 milestones, in order:
1. Streaming chat UI with markdown rendering
2. Theme toggle + design tokens wired up
3. Web search citations rendered inline + as a footnote list
4. Adaptive thinking budget based on query type
5. Persist conversations to `localStorage` (then Postgres later)

---

## Phase 2 — coming soon

- **MCP servers:** CapIQ for fundamentals, internal data sources via custom MCP, Exa for deeper web research
- **Memory across sessions:** likely Postgres + per-user conversation history
- **Structured output:** tables and charts in responses (probably via tool use → render as React components, not raw markdown tables)
- **Auth:** Clerk or NextAuth, defer until needed

---

## Conventions

- TypeScript strict mode on. No `any` unless justified with a comment.
- Server-only code goes in `lib/server/`. Every file there starts with `import "server-only"` — Next.js build fails at compile time if any of these leak into the client bundle. **Never import anything from `lib/server/` in a client component.**
- Client-only code (hooks, localStorage, theme) goes in `lib/client/`. Pure types and parsers go in `lib/shared/`.
- **Never import the Anthropic SDK in a client component** — it leaks the API key.
- Components: function declarations, not arrow consts. Named exports.
- Tailwind only. No CSS modules, no styled-components.
- File names: `kebab-case` for routes, `PascalCase` for components, `camelCase` for utilities.

---

## Notes for Claude (rules of engagement)

- **System prompt stays in `lib/prompts/`.** Don't inline it in route handlers.
- **Always stream.** Non-streaming responses are a bug, not a shortcut.
- **Citations are non-negotiable.** Every web-search-backed claim renders with its citation. If you're unsure how to extract them, ask before guessing.
- **Use design tokens, never hex literals** in components.
- **Pin the model ID in one place** (`MODEL_ID` in `lib/shared/model.ts` — re-exported from `lib/server/anthropic.ts`).
- **Don't add dependencies casually.** Ask before installing anything beyond what's already in `package.json`. Keep the stack tight.
- **No premature abstraction.** Phase 1 is for shipping a working prototype. Inline duplication is fine until a third use case appears.
- **Verify Anthropic API details against the live docs** when uncertain — your training data may be stale on tool versions, model IDs, or feature flags.
- When something looks unclear or you'd be guessing, **ask** before writing code.