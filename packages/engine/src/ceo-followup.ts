import { getSentiment } from "./friction";
import { StreamingAgentRunner } from "./runner-streaming";
import type {
  BoardMemberRole,
  BoardroomReport,
  CEOFinalVerdict,
  CEOFollowUpQuestion,
  DebateHistory,
  Round1Result,
  SSEEvent,
} from "./types";
import { BOARD_MEMBER_NAMES } from "./types";

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

  const MAX_DEBATER_QUESTIONS = 3;
  const MAX_SILENT_QUESTIONS = 2;
  const MAX_TOTAL = 5;

  const debaterQuestions: CEOFollowUpQuestion[] = [];
  const silentQuestions: CEOFollowUpQuestion[] = [];
  let nextId = 1;

  // Collect all debating member roles
  const debatingRoles = new Set<BoardMemberRole>();
  for (const debate of debateHistories) {
    for (const role of debate.friction.members) {
      debatingRoles.add(role);
    }
  }

  // Collect from unresolved debates, ordered by severity (IMPASSE first)
  const sorted = [...unresolvedDebates].sort((a, b) => {
    const priority = { IMPASSE: 0, MAX_TURNS_REACHED: 1 } as Record<string, number>;
    return (priority[a.outcome] ?? 2) - (priority[b.outcome] ?? 2);
  });

  // Step 1: Collect challenge questions from debating members (max 3)
  for (const debate of sorted) {
    for (const role of debate.friction.members) {
      if (debaterQuestions.length >= MAX_DEBATER_QUESTIONS) break;

      const memberResult = round1Results.find((r) => r.output.role === role);
      if (!memberResult) continue;

      for (const challenge of memberResult.output.challenges) {
        if (debaterQuestions.length >= MAX_DEBATER_QUESTIONS) break;
        if (isDuplicate([...debaterQuestions, ...silentQuestions], challenge)) continue;

        debaterQuestions.push({
          id: nextId++,
          question: challenge,
          source: "challenge",
          fromMember: role,
          frictionIndex: debate.frictionIndex,
        });
      }
    }
  }

  // Step 2: Collect questions from non-debating members with negative sentiment (max 2)
  for (const result of round1Results) {
    if (silentQuestions.length >= MAX_SILENT_QUESTIONS) break;
    if (debatingRoles.has(result.output.role)) continue;
    if (getSentiment(result.output.verdict) >= 0) continue;

    for (const challenge of result.output.challenges) {
      if (silentQuestions.length >= MAX_SILENT_QUESTIONS) break;
      if (isDuplicate([...debaterQuestions, ...silentQuestions], challenge)) continue;

      silentQuestions.push({
        id: nextId++,
        question: challenge,
        source: "challenge",
        fromMember: result.output.role,
      });
    }
  }

  // Step 3: Fill remaining slots with contextual debate questions and overflow challenges
  const combined = [...debaterQuestions, ...silentQuestions];
  if (combined.length < MAX_TOTAL) {
    // First add contextual questions from unresolved debate summaries
    for (const debate of sorted) {
      if (combined.length >= MAX_TOTAL) break;
      if (debate.outcomeSummary) {
        const contextQ = `The board could not reach agreement: "${debate.outcomeSummary}" — What is your position on this?`;
        if (!isDuplicate(combined, contextQ)) {
          combined.push({
            id: nextId++,
            question: contextQ,
            source: "debate_unresolved",
            fromMember: debate.friction.members[0],
            frictionIndex: debate.frictionIndex,
          });
        }
      }
    }

    // Then fill with more debater challenges
    for (const debate of sorted) {
      if (combined.length >= MAX_TOTAL) break;
      for (const role of debate.friction.members) {
        if (combined.length >= MAX_TOTAL) break;
        const memberResult = round1Results.find((r) => r.output.role === role);
        if (!memberResult) continue;

        for (const challenge of memberResult.output.challenges) {
          if (combined.length >= MAX_TOTAL) break;
          if (isDuplicate(combined, challenge)) continue;

          combined.push({
            id: nextId++,
            question: challenge,
            source: "challenge",
            fromMember: role,
            frictionIndex: debate.frictionIndex,
          });
        }
      }
    }
  }

  // Re-number IDs sequentially
  return combined.slice(0, MAX_TOTAL).map((q, i) => ({ ...q, id: i + 1 }));
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
  locale?: string,
): Promise<CEOFinalVerdict> {
  const runner = new StreamingAgentRunner(apiKey, model, locale);

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
  if (report.synthesis.unresolvedConcerns && report.synthesis.unresolvedConcerns.length > 0) {
    contextParts.push(
      `Unresolved Concerns from silent members: ${report.synthesis.unresolvedConcerns.join("; ")}`,
    );
  }
  contextParts.push("");

  // CEO answers
  contextParts.push("## CEO Answers to Board Questions\n");
  contextParts.push(ceoAnswers);
  contextParts.push("");

  contextParts.push(
    "Based on ALL the above — the board's analyses, debates, unresolved points, AND the CEO's clarifications — deliver your FINAL VERDICT. Be decisive and pragmatic. The CEO needs concrete actions, not more questions.",
  );

  const verdict = await runner.runFinalVerdictStreaming(contextParts.join("\n"), (chunk) =>
    send({ type: "final_verdict_chunk", chunk }),
  );

  send({ type: "final_verdict_complete", verdict });

  return verdict;
}
