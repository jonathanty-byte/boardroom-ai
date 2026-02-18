# BoardRoom AI

**Multi-Agent Decision Engine**

[![CI](https://github.com/jonathanty-byte/boardroom-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanty-byte/boardroom-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<!-- TODO: Add GIF demo after V0.2 -->

## What it does

BoardRoom AI simulates a board of 6 AI executives — each with a distinct personality inspired by Dragon Ball Z characters — who independently analyze your project, then debate their disagreements in real-time. The result is a structured decision report with consensus points, compromises, and unresolved impasses for the CEO to decide.

## How it works

```
┌─────────────────────────────────────────────────────────────────┐
│                        CEO Briefing                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Round 1 — Independent Analysis (6 members in parallel)         │
│  Each member analyzes from their C-suite perspective            │
│  → Verdict + Challenges + Recommendations                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Friction Detection                                             │
│  Identify contradictory verdicts (sentiment gap >= 1.5)         │
│  → Friction pairs for debate                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Round 2 — Contradictory Debate                                 │
│  Opposing members argue: MAINTAIN / CONCEDE / COMPROMISE        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Synthesis                                                      │
│  Collective verdict (GO / GO_WITH_CHANGES / RETHINK)            │
│  Consensus + Compromises + Impasses                             │
└─────────────────────────────────────────────────────────────────┘
```

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5
- **AI**: OpenRouter API (multi-model, BYOK)
- **Streaming**: Server-Sent Events (SSE)
- **Linter**: Biome
- **Tests**: Vitest

## Quick start

```bash
git clone https://github.com/jonathanty-byte/boardroom-ai.git
cd boardroom-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your OpenRouter API key, and submit a project briefing.

## Architecture

```
boardroom-ai/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/analyze/        # SSE streaming endpoint
│   └── page.tsx            # Main UI
├── lib/
│   ├── engine/             # Core decision engine
│   │   ├── board-members.ts    # 6 board member configs & prompts
│   │   ├── friction.ts         # Friction detection (sentiment scoring)
│   │   ├── synthesis.ts        # Final synthesis & collective verdict
│   │   ├── runner-streaming.ts # LLM calls + JSON parsing
│   │   ├── engine-streaming.ts # Orchestrator (Round 1 → Friction → Round 2 → Synthesis)
│   │   └── types.ts            # TypeScript interfaces
│   └── utils/
│       └── markdown-export.ts  # Report → Markdown formatter
├── components/             # React UI components
├── vitest.config.ts        # Test configuration
├── biome.json              # Linter & formatter config
└── .github/workflows/ci.yml  # CI pipeline
```

## Board members

| Name    | Role | Specialty |
|---------|------|-----------|
| Vegeta  | CPO  | Product-market fit, scope control, user obsession |
| Bulma   | CMO  | Positioning, acquisition channels, launch strategy |
| Piccolo | CFO  | Unit economics, pricing, financial risk |
| Whis    | CRO  | Market research, frameworks, validation experiments |
| Gohan   | CCO  | UX/UI, brand identity, emotional design |
| Trunks  | CTO  | Feasibility, stack choices, tech debt |

## Built by

[Jonathan Ty](https://github.com/jonathanty-byte) — Built with [Claude Code](https://claude.ai/code)

## License

MIT
