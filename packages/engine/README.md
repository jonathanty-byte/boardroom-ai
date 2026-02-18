# @boardroom/engine

Multi-agent AI decision engine powering BoardRoom AI. Six AI board members (DBZ personas) independently analyze a project, then debate friction points to reach a collective verdict.

> Internal package — not published to npm.

## Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                      ROUND 1                            │
│  CPO ─┐                                                │
│  CMO ─┤                                                │
│  CFO ─┼──▶  6 parallel analyses  ──▶  Individual       │
│  CRO ─┤      (streaming)              verdicts         │
│  CCO ─┤                                                │
│  CTO ─┘                                                │
├─────────────────────────────────────────────────────────┤
│                 FRICTION DETECTION                      │
│  Compare verdicts  ──▶  Identify contradictions         │
│  (sentiment delta > 1.5 = friction)                     │
├─────────────────────────────────────────────────────────┤
│                      ROUND 2                            │
│  Members with frictions  ──▶  Contradictory debate      │
│  (defend or revise position)                            │
├─────────────────────────────────────────────────────────┤
│                     SYNTHESIS                           │
│  All verdicts  ──▶  Consensus / Compromises / Impasses  │
│                ──▶  Collective verdict (GO / RETHINK)   │
└─────────────────────────────────────────────────────────┘
```

## Public API

### `runAnalysis(input, emitter)`

Orchestrates the full pipeline (Round 1 → Friction → Round 2 → Synthesis) with SSE streaming.

### `identifyFrictions(results)`

Detects contradictions between board member verdicts using sentiment scoring.

### `synthesize(round1, round2, frictions)`

Computes collective verdict from all board member positions.

### `StreamingAgentRunner`

Handles OpenRouter API calls with streaming JSON parsing.

### `boardMembers` / `getMemberConfig(role)`

Board member configurations (6 members with DBZ personas).

## Types

All types are exported from the package root:

- `BoardMemberRole` — `"cpo" | "cmo" | "cfo" | "cro" | "cco" | "cto"`
- `AnalysisInput` — Input for `runAnalysis()`
- `BoardroomReport` — Complete analysis output
- `SSEEvent` — Server-Sent Event union type for streaming
- `Round1Output`, `Round2Response`, `FrictionPoint`, `Synthesis`

## Usage

```ts
import { runAnalysis, type AnalysisInput, type SSEEvent } from "@boardroom/engine";

const input: AnalysisInput = {
  content: "Project brief...",
  ceoVision: "Disrupt the market",
  apiKey: "sk-or-...",
};

await runAnalysis(input, (event: SSEEvent) => {
  console.log(event.type, event);
});
```
