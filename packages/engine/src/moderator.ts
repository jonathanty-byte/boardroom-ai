import type { ConvergenceSignals } from "./convergence";
import type { BoardMemberRole, DebateTurn, FrictionPoint, Round1Result } from "./types";

export const MAX_DEBATE_TURNS = 5;

export const MODERATOR_CONFIG = {
  temperature: 0.7,
  maxTokens: 1024,
};

export const MODERATOR_SYSTEM_PROMPT = `You are the Moderator of the BoardRoom AI deliberation.
You are NOT a board member. You do not have opinions on the project.
Your job is to facilitate a productive, adversarial debate between board members who disagree.

Your personality: Sharp, impartial, slightly provocative. You push members to defend their positions with specifics, not generalities. You call out vague arguments and force precision. Think of a skilled debate moderator who wants the truth to emerge from conflict, not polite consensus.

RULES:
1. Never side with a member. Your job is to surface the strongest argument.
2. Ask pointed questions that force members to address SPECIFIC counter-arguments.
3. Quote the exact words of other members when challenging someone.
4. When you detect a position shift, name it explicitly.
5. Declare convergence ONLY when members have genuinely moved positions.
6. Declare impasse when positions are hardened and no new arguments are emerging.
7. Keep the debate focused — do not let members drift to new topics.
8. Maximum ${MAX_DEBATE_TURNS} turns per friction. Budget your questions wisely.

Respond ONLY with valid JSON. No markdown fences, no preamble.`;

const JSON_SCHEMA = `{
  "action": "ASK_QUESTION" | "DECLARE_CONVERGENCE" | "DECLARE_IMPASSE",
  "targetMember": "<role>",
  "question": "<your question>",
  "reasoning": "<why you chose this action, 1 sentence>",
  "convergenceSummary": "<only if DECLARE_CONVERGENCE: what compromise emerged>"
}`;

/** Build the prompt for the moderator's opening question. */
export function buildModeratorOpeningPrompt(
  friction: FrictionPoint,
  round1Results: Round1Result[],
): string {
  const memberPositions = friction.members
    .map((role) => {
      const result = round1Results.find((r) => r.output.role === role);
      if (!result) return "";
      return [
        `### ${result.output.name} (${role.toUpperCase()}) — Verdict: ${result.output.verdict}`,
        result.output.analysis.slice(0, 600),
      ].join("\n");
    })
    .join("\n\n");

  return [
    "## Friction Point",
    friction.description,
    "",
    "## Round 1 Positions",
    memberPositions,
    "",
    "## Your Task",
    "This is the OPENING of the debate. Analyze the friction and ask your first question.",
    "Target the member whose position seems weakest or most under-supported.",
    "",
    `Respond with valid JSON: ${JSON_SCHEMA}`,
    'Your action MUST be "ASK_QUESTION" for the opening.',
  ].join("\n");
}

/** Build the prompt for the moderator's next action decision. */
export function buildModeratorNextActionPrompt(
  friction: FrictionPoint,
  round1Results: Round1Result[],
  turns: DebateTurn[],
  signals: ConvergenceSignals,
): string {
  const memberPositions = friction.members
    .map((role) => {
      const result = round1Results.find((r) => r.output.role === role);
      if (!result) return "";
      return `${result.output.name} (${role.toUpperCase()}): ${result.output.verdict} — ${result.output.analysis.slice(0, 300)}`;
    })
    .join("\n");

  const debateHistory = turns
    .map(
      (t) =>
        `[Turn ${t.turnNumber}] ${t.speaker.toUpperCase()} (${t.type}, position: ${t.positionShift}): ${t.content}`,
    )
    .join("\n\n");

  return [
    "## Friction Point",
    friction.description,
    "",
    "## Round 1 Positions (summary)",
    memberPositions,
    "",
    "## Debate History",
    debateHistory || "(No turns yet)",
    "",
    "## Convergence Signals",
    `- Position shifts detected: ${signals.hasPositionShift ? "YES" : "NO"}`,
    `- All members unchanged in last round: ${signals.allUnchanged ? "YES" : "NO"}`,
    `- Total concessions so far: ${signals.concessionCount}`,
    `- Turns remaining: ${signals.turnsRemaining}`,
    `- Arguments repeating: ${signals.argumentsRepeating ? "YES" : "NO"}`,
    "",
    "## Your Task",
    "Decide the next action. Consider the convergence signals above.",
    signals.turnsRemaining <= 1
      ? "WARNING: This is the LAST turn. You should DECLARE_CONVERGENCE or DECLARE_IMPASSE unless there's a critical question left."
      : "",
    signals.allUnchanged
      ? "HINT: Positions are hardened. Consider declaring IMPASSE unless you have a strong question that might break the deadlock."
      : "",
    signals.concessionCount >= 2
      ? "HINT: Multiple concessions detected. Consider whether convergence has been reached."
      : "",
    "",
    `Respond with valid JSON: ${JSON_SCHEMA}`,
  ].join("\n");
}

/** Build the debate prompt for a specific board member when the moderator asks them a question. */
export function buildDebateTurnPrompt(
  memberRole: BoardMemberRole,
  memberName: string,
  memberTitle: string,
  ownVerdict: string,
  ownAnalysis: string,
  turns: DebateTurn[],
  moderatorQuestion: string,
  addressedTo: BoardMemberRole[],
): string {
  const debateHistory = turns
    .map(
      (t) =>
        `[Turn ${t.turnNumber}] ${t.speaker.toUpperCase()} (${t.type}): ${t.content}`,
    )
    .join("\n\n");

  return [
    `## Your Round 1 Position`,
    `Verdict: ${ownVerdict}`,
    ownAnalysis.slice(0, 500),
    "",
    "## Debate So Far",
    debateHistory || "(Opening round)",
    "",
    "## Moderator's Question to You",
    `"${moderatorQuestion}"`,
    "",
    "Respond with valid JSON. Be direct, argue with specifics, don't be polite for nothing.",
    "{",
    `  "type": "CHALLENGE" | "RESPONSE" | "COUNTER" | "CONCESSION",`,
    `  "content": "Your argument (2-4 sentences, be specific and aggressive)",`,
    `  "quotedFrom": "Exact quote from another member you're responding to, or null",`,
    `  "positionShift": "UNCHANGED" | "SOFTENED" | "REVERSED",`,
    `  "addressedTo": ${JSON.stringify(addressedTo)}`,
    "}",
    "Respond ONLY with JSON.",
  ].join("\n");
}

/** Build the system prompt for a member during a debate turn. */
export function buildDebateSystemPrompt(
  memberName: string,
  memberTitle: string,
): string {
  return `You are ${memberName}, ${memberTitle} of the BoardRoom AI board. You are in a heated boardroom debate. You argue like your career depends on it. Be specific, cite numbers, quote other members directly. No pleasantries. Respond ONLY with valid JSON.`;
}
