# FinanceAI

A locally-hosted financial research AI built with Next.js and Claude. Ask questions about earnings, valuations, market trends, or any financial topic — get cited, structured answers with live web search and interactive data visualizations.

Inspired by [Rogo](https://rogo.ai) and [Hebbia](https://hebbia.ai).

## Features

- **Streaming chat** with markdown rendering
- **Live web search** — every answer backed by real-time data
- **Interactive visualizations** rendered inline:
  - Trading comps tables
  - Returns matrices (LBO / equity)
  - DCF sensitivity tables
  - Bar charts and line charts
- **Deep / Quick mode** — toggle between fast answers and full research depth
- **Conversation history** persisted to localStorage
- **Dual theme** — Cream (light) and Espresso (dark)
- **Security controls** — CSP headers, rate limiting, input validation, server-only API key handling

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

## Setup

```bash
git clone <repo-url>
cd FinanceAI
npm install
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example prompts

**Comps table**
> Build a trading comps table for the Magnificent 7 — include EV/EBITDA, P/E forward, EV/Revenue, and revenue growth.

**LBO returns matrix**
> Build an LBO returns matrix for a $2B EBITDA industrial company at 9x entry — vary exit multiple (5x–8x) and leverage (4x–6x). Show IRR and MOIC.

**DCF sensitivity**
> Run a DCF sensitivity analysis on Nvidia — show implied share price at WACC ranging 8%–12% and terminal growth rate 2%–5%.

**Multi-chart tearsheet**
> I'm underwriting an LBO of a $2B EBITDA industrial company at 9x entry. Give me a public comps table, an LBO returns matrix at 5x–8x exit, and a DCF sensitivity on WACC vs. terminal growth.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| AI | Claude (`claude-sonnet-4-6`) via Anthropic SDK |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |

## Architecture

```
app/
  api/chat/route.ts     # streaming Claude handler
  page.tsx              # main chat UI

lib/
  server/               # server-only (API key, rate limit, prompts)
  client/               # browser hooks and localStorage
  shared/               # types and parsers safe in both environments

components/
  Chat/                 # ChatShell, MessageList, MessageItem, MessageInput
  Charts/               # CodeFenceRenderer + 5 chart components
```

Server code is enforced via `import "server-only"` — the Anthropic SDK and API key cannot leak to the browser bundle.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `ALLOWED_ORIGIN` | No | Lock CORS to a specific origin in production |

## Production

```bash
npm run build
npm start
```

Source maps and dev tooling are stripped automatically. Set `ALLOWED_ORIGIN` to your deployed URL to enable CSRF protection.
