# BoardRoom AI

**Multi-Agent AI Decision Engine**

[![CI](https://github.com/jonathanty-byte/boardroom-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanty-byte/boardroom-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What it does

BoardRoom AI simulates a board of 6 AI executives — each with a distinct personality inspired by Dragon Ball Z characters — who independently analyze your project, then debate their disagreements in real-time. The result is a structured decision report with consensus points, compromises, and unresolved impasses for the CEO to decide.

## How it works

```
CEO Briefing
     │
     ▼
Round 1 — Independent Analysis (6 members in parallel)
Each member analyzes from their C-suite perspective
→ Verdict + Challenges + Recommendations
     │
     ▼
Friction Detection (code, no LLM)
Identify contradictory verdicts (sentiment gap >= 1.5)
→ Friction pairs for debate
     │
     ▼
Moderator (LLM) — Opens each debate, formulates questions
     │
     ▼
Multi-Turn Debate (LLM loop, 3-5 turns per friction)
Moderator orchestrates: who speaks, when to conclude
→ CONVERGED / IMPASSE / MAX_TURNS_REACHED
     │
     ▼
Synthesis (code) — Collective verdict: GO / GO_WITH_CHANGES / RETHINK
Consensus + Compromises + Impasses + Unresolved Concerns
     │
     ▼ (if unresolved debates)
CEO Follow-Up Questions — Board asks the CEO for clarification
     │
     ▼ (after CEO answers)
Final Arbiter (single LLM call) — Definitive verdict incorporating CEO input
```

### Two user paths

1. **Detailed brief**: All debates converge → no CEO questions → report immediately
2. **Vague brief**: Debates hit IMPASSE → CEO follow-up questions → CEO answers → Final Arbiter verdict → report

## Tech stack

- **Framework**: Next.js 16 (App Router, Edge Runtime)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5
- **AI**: OpenRouter API (multi-model, BYOK)
- **Streaming**: Server-Sent Events (SSE) over POST
- **Linter**: Biome
- **Tests**: Vitest + Playwright (e2e)

## Quick start

```bash
git clone https://github.com/jonathanty-byte/boardroom-ai.git
cd boardroom-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your OpenRouter API key, and submit a project briefing.

## Architecture

### Monorepo (npm workspaces)

```
boardroom-ai/
├── packages/engine/           # @boardroom/engine — pure TS, zero framework deps
│   ├── src/
│   │   ├── types.ts               # All TypeScript interfaces
│   │   ├── board-members.ts       # 6 member configs + system prompts
│   │   ├── runner-streaming.ts    # OpenRouter client (OpenAI SDK), streaming, JSON parsing
│   │   ├── engine-streaming.ts    # Main orchestrator — runs the full pipeline, emits SSE
│   │   ├── friction.ts            # Friction detection: sentiment scoring + union-find grouping
│   │   ├── moderator.ts           # Moderator agent: formulates debate questions
│   │   ├── debate-engine.ts       # Multi-turn debate loop (max 5 turns, convergence detection)
│   │   ├── convergence.ts         # Detects debate convergence from position shifts
│   │   ├── ceo-followup.ts        # Heuristic question extraction + Final Arbiter
│   │   └── synthesis.ts           # Synthesis + collective verdict computation
│   └── __tests__/                 # Pure logic tests (no LLM calls)
├── app/                           # Next.js App Router
│   ├── api/analyze/route.ts       # Main SSE endpoint (Edge Runtime)
│   ├── api/finalize/route.ts      # Final Arbiter SSE endpoint
│   └── page.tsx                   # Main UI
├── components/                    # React UI components
│   ├── board/                     # BoardRoom, MemberCard, DebateThread, CEOFollowUp, FinalVerdict
│   ├── analysis/                  # AnalysisForm, StreamingText
│   └── report/                    # ExportButton, ShareImage
├── lib/
│   ├── hooks/                     # useAnalysisState (15+ SSE event types), useBoardroomAnalysis
│   └── utils/                     # constants, markdown-export
└── public/avatars/                # SVG character avatars
```

### SSE event flow

Two endpoints, both Edge Runtime, SSE over POST:

**`POST /api/analyze`**
`state_change` → `member_chunk`/`member_complete` → `frictions_detected` → `moderator_action` → `debate_turn_start`/`debate_turn_chunk`/`debate_turn_complete` → `debate_resolved` → `synthesis_complete` → `ceo_followup` (optional) → `analysis_complete`

**`POST /api/finalize`**
`final_verdict_start` → `final_verdict_chunk` → `final_verdict_complete`

## Board members

| Name    | Role | Specialty |
|---------|------|-----------|
| Vegeta  | CPO  | Product-market fit, scope control, user obsession |
| Bulma   | CMO  | Positioning, acquisition channels, launch strategy |
| Piccolo | CFO  | Unit economics, pricing, financial risk |
| Whis    | CRO  | Market research, frameworks, validation experiments |
| Gohan   | CCO  | UX/UI, brand identity, emotional design |
| Trunks  | CTO  | Feasibility, stack choices, tech debt |

## Testing

```bash
npm test               # Run all unit tests (vitest)
npm run test:watch     # Watch mode
npx tsc --noEmit       # TypeScript type check
npm run lint           # Biome linter
npm run build          # Production build
```

## Built by

[Jonathan Ty](https://github.com/jonathanty-byte) — Built with [Claude Code](https://claude.ai/code)

## License

MIT
