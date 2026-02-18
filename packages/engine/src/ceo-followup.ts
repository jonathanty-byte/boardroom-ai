import { BOARD_MEMBER_NAMES } from "./types";
import type {
  BoardroomReport,
  CEOFinalVerdict,
  CEOFollowUpQuestion,
  DebateHistory,
  Round1Result,
  SSEEvent,
} from "./types";
import { StreamingAgentRunner } from "./runner-streaming";

/**
 * Extract follow-up questions for the CEO when debates are unresolved.
 * Pure heuristic — no extra LLM call.
 *
 * Returns [] if all debates converged or there are no debates.
 */
export function extractCEOFollowUp(
  round1Results: Round1Result[],
  debateHistories: DebateHistory[],
): CEOFollowUpQuestion[] {
  const unresolvedDebates = debateHistories.filter((d) => d.outcome !== "CONVERGED");

  if (unresolvedDebates.length === 0) {
    return [];
  }

  const questions: CEOFollowUpQuestion[] = [];
  let nextId = 1;

  // Collect from unresolved debates, ordered by severity (IMPASSE first)
  const sorted = [...unresolvedDebates].sort((a, b) => {
    const priority = { IMPASSE: 0, MAX_TURNS_REACHED: 1 } as Record<string, number>;
    return (priority[a.outcome] ?? 2) - (priority[b.outcome] ?? 2);
  });

  for (const debate of sorted) {
    const involvedRoles = debate.friction.members;

    // Add challenges from involved members
    for (const role of involvedRoles) {
      const memberResult = round1Results.find((r) => r.output.role === role);
      if (!memberResult) continue;

      for (const challenge of memberResult.output.challenges) {
        if (isDuplicate(questions, challenge)) continue;

        questions.push({
          id: nextId++,
          question: challenge,
          source: "challenge",
          fromMember: role,
          frictionIndex: debate.frictionIndex,
        });
      }
    }

    // Add a contextual question from the debate outcome summary
    if (debate.outcomeSummary) {
      const contextQ = `The board could not reach agreement: "${debate.outcomeSummary}" — What is your position on this?`;
      if (!isDuplicate(questions, contextQ)) {
        // Attribute to the first member in the friction
        questions.push({
          id: nextId++,
          question: contextQ,
          source: "debate_unresolved",
          fromMember: involvedRoles[0],
          frictionIndex: debate.frictionIndex,
        });
      }
    }
  }

  // Limit to 5 max
  return questions.slice(0, 5);
}

/**
 * Simple deduplication: two questions are duplicates if they share
 * the same first 20 characters (case-insensitive).
 */
function isDuplicate(existing: CEOFollowUpQuestion[], newQuestion: string): boolean {
  const prefix = newQuestion.slice(0, 20).toLowerCase();
  return existing.some((q) => q.question.slice(0, 20).toLowerCase() === prefix);
}

/**
 * Run the Final Verdict: one LLM call that takes the full context
 * (Round 1 + debates + CEO answers) and produces a definitive decision.
 * No more debate — just a pragmatic verdict.
 */
export async function runFinalVerdictFlow(
  report: BoardroomReport,
  ceoAnswers: string,
  apiKey: string,
  model: string | undefined,
  send: (event: SSEEvent) => void,
): Promise<CEOFinalVerdict> {
  const runner = new StreamingAgentRunner(apiKey, model);

  send({ type: "final_verdict_start" });

  // Build context for the arbiter
  const contextParts: string[] = [];

  contextParts.push("# Full Board Deliberation Summary\n");

  // Round 1 verdicts
  contextParts.push("## Round 1 — Individual Verdicts\n");
  for (const r of report.round1) {
    const name = BOARD_MEMBER_NAMES[r.output.role] ?? r.output.role;
    contextParts.push(`**${name} (${r.output.role.toUpperCase()})**: ${r.output.verdict}`);
    contextParts.push(`Analysis: ${r.output.analysis.slice(0, 300)}`);
    if (r.output.challenges.length > 0) {
      contextParts.push(`Challenges: ${r.output.challenges.join("; ")}`);
    }
    contextParts.push("");
  }

  // Debate outcomes
  if (report.debates && report.debates.length > 0) {
    contextParts.push("## Debate Outcomes\n");
    for (const debate of report.debates) {
      contextParts.push(`**${debate.friction.description}**`);
      contextParts.push(`Outcome: ${debate.outcome}`);
      contextParts.push(`Summary: ${debate.outcomeSummary}`);
      contextParts.push("");
    }
  }

  // Synthesis
  contextParts.push("## Board Synthesis\n");
  contextParts.push(`Collective Verdict: ${report.synthesis.collectiveVerdict}`);
  if (report.synthesis.consensus.length > 0) {
    contextParts.push(`Consensus: ${report.synthesis.consensus.join("; ")}`);
  }
  if (report.synthesis.impasses.length > 0) {
    contextParts.push(`Impasses: ${report.synthesis.impasses.join("; ")}`);
  }
  contextParts.push("");

  // CEO answers
  contextParts.push("## CEO Answers to Board Questions\n");
  contextParts.push(ceoAnswers);
  contextParts.push("");

  contextParts.push(
    "Based on ALL the above — the board's analyses, debates, unresolved points, AND the CEO's clarifications — deliver your FINAL VERDICT. Be decisive and pragmatic. The CEO needs concrete actions, not more questions.",
  );

  const verdict = await runner.runFinalVerdictStreaming(
    contextParts.join("\n"),
    (chunk) => send({ type: "final_verdict_chunk", chunk }),
  );

  send({ type: "final_verdict_complete", verdict });

  return verdict;
}
