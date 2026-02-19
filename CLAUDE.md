# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BoardRoom AI — a multi-agent AI decision engine. 6 AI executives (DBZ-themed) analyze, debate, and judge business decisions via a retro RPG-styled web app.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm test             # Run all tests (vitest)
npm run test:watch   # Watch mode
npm run lint         # Biome check
npm run lint:fix     # Biome auto-fix
npx tsc --noEmit     # TypeScript type check (no build artifacts)
```

Run a single test file:
```bash
npx vitest run packages/engine/__tests__/ceo-followup.test.ts
```

CI runs: `tsc --noEmit` → `biome check .` → `vitest run` (Node 20, Ubuntu).

## Architecture

### Monorepo (npm workspaces)

- **`packages/engine/`** (`@boardroom/engine`): Pure TypeScript engine, zero framework deps. All LLM orchestration, debate logic, friction detection, synthesis. Only dependency: `openai` SDK.
- **Root**: Next.js 16 app (App Router, React 19, Tailwind 4) consuming the engine via SSE streaming. Engine is transpiled via `transpilePackages` in `next.config.ts`.

### Path Aliases

- `@/*` → project root (e.g. `@/components/board/BoardRoom`)
- `@boardroom/engine` → `packages/engine/src/index.ts`

Both are defined in `tsconfig.json` and mirrored in `vitest.config.ts`.

### Pipeline Flow

```
Round 1 (6 parallel LLM calls) → Friction Detection (code) → Moderator (LLM)
→ Multi-Turn Debate (LLM loop, 3-5 turns/friction) → Synthesis (code)
→ [if unresolved debates] CEO Follow-Up Questions (heuristic)
→ [if CEO answers] Final Arbiter (single LLM call) → Report
```

### Key Engine Files (`packages/engine/src/`)

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript types (Board, Debate, CEO, SSE events, Report) |
| `board-members.ts` | 6 member configs + detailed system prompts |
| `runner-streaming.ts` | OpenRouter client (OpenAI SDK), streaming, JSON parsing, Final Arbiter method |
| `engine-streaming.ts` | Main orchestrator — runs the full pipeline, emits SSE events |
| `friction.ts` | Friction detection: sentiment scoring + union-find multi-member grouping |
| `moderator.ts` | Moderator agent: analyzes tensions, formulates debate questions |
| `debate-engine.ts` | Multi-turn debate loop (max 5 turns, convergence detection) |
| `convergence.ts` | Detects debate convergence from position shifts |
| `ceo-followup.ts` | Heuristic question extraction + Final Arbiter orchestration |
| `synthesis.ts` | Synthesis + collective verdict computation |

### Key Frontend Files

| File | Purpose |
|------|---------|
| `app/api/analyze/route.ts` | Main SSE endpoint (Edge Runtime) |
| `app/api/finalize/route.ts` | Final Arbiter SSE endpoint |
| `lib/hooks/useAnalysisState.ts` | State reducer handling 15+ SSE event types |
| `lib/hooks/useBoardroomAnalysis.ts` | SSE streaming hook (analyze + finalize) |
| `components/board/BoardRoom.tsx` | Main board UI (member grid + phases + debates + synthesis) |
| `components/board/CEOFollowUp.tsx` | CEO Q&A UI (questions + textarea responses + verdict button) |
| `components/board/FinalVerdict.tsx` | Final verdict display (streaming + complete) |
| `lib/utils/markdown-export.ts` | Report export (includes Q&A + final verdict if present) |

### SSE Event Flow

Two endpoints, both Edge Runtime, SSE over POST (not EventSource):
- **`/api/analyze`**: `state_change` → `member_chunk`/`member_complete` → `frictions_detected` → `moderator_action` → `debate_turn_*` → `debate_resolved` → `synthesis_complete` → `ceo_followup` (optional) → `analysis_complete`
- **`/api/finalize`**: `final_verdict_start` → `final_verdict_chunk` → `final_verdict_complete`

### Two User Paths

1. **Detailed brief**: All debates converge → no CEO questions → report immediately
2. **Vague brief**: Debates hit IMPASSE/MAX_TURNS → CEO follow-up questions → CEO answers → Final Arbiter verdict → report

## Demo Mode

- **Server env var**: `OPENROUTER_API_KEY` in `.env.local` enables demo mode (no client key needed)
- **`GET /api/demo-status`**: Returns `{ available: true/false }` — frontend checks on mount
- **Rate limiting**: `lib/rate-limit.ts` — in-memory, 50 requests/day/IP (approximate, per Edge instance)
- **Model lock**: Demo mode forces DeepSeek V3.2 (cheapest). Both `/api/analyze` and `/api/finalize` enforce this server-side.
- **UI**: Model selector hidden in demo mode, replaced with locked display + BYOK encouragement link to OpenRouter

## Deployment

- **Production**: https://comex-board-web.vercel.app (Vercel, Edge Runtime)
- **Env vars on Vercel**: `OPENROUTER_API_KEY` set for production + preview
- **Deploy command**: `npx vercel --prod`

## Video Assets

- `e2e/record-demo.spec.ts` — Playwright script that records a full demo session (real LLM calls)
- `scripts/convert-demo-video.sh` — Converts WebM to MP4 at 1x/2x/3x/4x speeds
- `video-demo/` — Remotion project for 60s animated marketing video
- `launch/` — Launch content drafts (X thread, LinkedIn post, video storyboard)

## Conventions

- **BYOK + Demo**: Users can bring their own OpenRouter key OR use demo mode (server key, rate-limited, model-locked). Default model: `deepseek/deepseek-v3.2`
- Engine uses OpenAI SDK pointed at OpenRouter's base URL
- Frontend state management: `useReducer` pattern, no external state lib
- CSS: Tailwind 4 + custom RPG theme in `globals.css` (pixel-border, stat-label, rpg-title, char-card classes)
- Linting: Biome (not ESLint) — line width 100, 2-space indent, semicolons always. `noExplicitAny` and some a11y rules are off for velocity.
- Board member roles: `cpo`, `cmo`, `cfo`, `cro`, `cco`, `cto` (always lowercase)

## Testing

Tests are in `packages/engine/__tests__/`. They test pure logic (no LLM calls, no network). Fixtures in `fixtures.ts` provide mock Round1Results, DebateHistories, etc. Vitest globals are enabled — no need to import `describe`, `it`, `expect`.

When adding engine logic, write tests alongside. The engine is the core differentiator — keep it well-tested.
