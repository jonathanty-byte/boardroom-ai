# Post LinkedIn — BoardRoom AI Launch

## Post

Most AI tools give you one answer.

But real decisions aren't made by one voice in a room.

---

I've spent the last few weeks building **BoardRoom AI** — a multi-agent decision engine where 6 AI executives debate your business strategy before reaching a verdict.

Not a chatbot. Not a wrapper around GPT. A full deliberation pipeline.

Here's how it works:

You submit a strategic decision. Six executives (CPO, CMO, CFO, CRO, CCO, CTO) each analyze it independently. Then a friction detection layer identifies where they genuinely disagree. A moderator agent surfaces the real tensions. Structured multi-turn debates follow. If they hit an impasse, the CEO asks follow-up questions. A Final Arbiter synthesizes everything into a verdict.

Round 1 → friction detection → moderated debate → synthesis → CEO Q&A → final verdict.

That's the pipeline. Every step deliberate. Every disagreement load-bearing.

[MEDIA: screen recording of a debate playing out between two board members, with the retro RPG interface visible]

---

Why build this?

I wanted to demonstrate something specific: that multi-agent AI engineering is not just "call the API twice." It's orchestration, convergence detection, state management, streaming architecture.

The aesthetic is DBZ-themed retro RPG — because if you're going to watch AI executives argue about your go-to-market strategy, it should at least be entertaining.

Under the hood: Next.js 16, React 19, Edge Runtime, SSE streaming, a pure TypeScript engine (zero framework deps), 88 unit tests, full E2E suite, clean monorepo.

---

What I learned building this:

The hard part isn't the LLM calls. It's knowing when agents have genuinely converged vs. when they're just agreeing to agree. Designing that convergence detection was the most interesting engineering problem in the whole project.

---

Try the demo — no API key required.
Repo is open source on GitHub.

Links in the comments.

---

#AIEngineering #MultiAgentAI #BuildInPublic #NextJS #PortfolioProject

## Notes

- ~1,450 characters — within LinkedIn optimal range (1,200-1,500)
- "Links in the comments" technique avoids LinkedIn's link-penalty on reach
- MEDIA: 15-30s screen recording of debate phase with retro RPG UI, or static screenshot of mid-debate board state
- Hashtags: #AIEngineering and #MultiAgentAI target tech hiring managers. #BuildInPublic taps indie builder community. 5 max before it looks spammy.
