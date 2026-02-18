import type { CEOFollowUpQuestion, DebateHistory, Round1Result } from "./types";

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
