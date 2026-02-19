# Thread X — BoardRoom AI Launch

## Tweet 1 — Hook

Most AI "decision tools" give you one answer from one model. No pushback. No tension. No real thinking.

Real decisions need friction.

Introducing BoardRoom AI — 6 AI executives who actually disagree with each other. A thread on how I built it.

## Tweet 2 — The Board

BoardRoom AI runs your business decision through a board of 6 AI executives inspired by DBZ characters:

- Vegeta (CPO) — product ruthlessness
- Bulma (CMO) — market strategy
- Piccolo (CFO) — financial discipline
- Whis (CRO) — revenue optimization
- Gohan (CCO) — compliance & risk
- Trunks (CTO) — technical viability

They don't agree. That's the point.

## Tweet 3 — Architecture

The full pipeline:

Round 1 (6 parallel LLM calls) → Friction Detection → Moderator → Multi-Turn Debate → Synthesis → [CEO Follow-Up if needed] → Final Arbiter

Everything streams live to the UI via SSE. You watch the board think in real time.

[MEDIA: GIF of the full pipeline streaming — 15-20s showing member cards populating, debate turns appearing, final verdict rendering]

## Tweet 4 — Technical Differentiators

What makes this non-trivial:

1. Friction detection uses sentiment scoring + union-find grouping to identify real disagreements
2. Convergence detection ends debates early if positions shift enough
3. Debates only happen where friction is detected — no wasted tokens
4. Final Arbiter is a single LLM call with the full debate history as context

The engine is pure TypeScript, zero framework deps. 88 unit tests.

## Tweet 5 — Demo

[MEDIA: Screenshot of a concrete example — vague business decision showing: 6 member cards with mixed verdicts, an active debate thread, and the CEO follow-up Q&A section]

The CEO follow-up path is my favorite feature. When debates hit impasse, it surfaces targeted questions for the human to answer — then re-runs judgment with that new context.

No black box. You see exactly why the board is stuck.

## Tweet 6 — CTA

Built with Next.js 16 / React 19 / Tailwind 4 + OpenRouter (BYOK or demo mode — no account needed to try it).

Try it live: [LINK TO DEMO]
Source code: [LINK TO REPO]

If you're building multi-agent systems or just curious about non-trivial LLM orchestration — the engine code in `packages/engine/` is worth a read.

## Tweet 7 — Lessons

I built this as a credibility project — to show concrete AI engineering skills, not just vibes.

Lessons:
- Multi-agent debate needs explicit convergence logic or it loops forever
- Friction detection is worth building — generic "debate everything" wastes 3x the tokens
- SSE streaming changes how users perceive AI latency dramatically

Still early. Feedback welcome.

---

## Production Notes

- Tweet 3: code block breaks on mobile Twitter, use plain-text pipeline version
- GIF (Tweet 3): capture real analysis run, show state transitions, keep under 15s for clean loop
- Screenshot (Tweet 5): choose a decision with 2-3 frictions so board looks divided
