import type { BoardMemberConfig } from "./types";
import type {
  DebateHistory,
  DebateTurn,
  FrictionPoint,
  Round1Result,
  Round2Response,
  Round2Result,
  SSEEvent,
} from "./types";
import { analyzeConvergence } from "./convergence";
import {
  MAX_DEBATE_TURNS,
  buildDebateSystemPrompt,
  buildDebateTurnPrompt,
  buildModeratorNextActionPrompt,
  buildModeratorOpeningPrompt,
} from "./moderator";
import type { StreamingAgentRunner } from "./runner-streaming";

/**
 * Run a multi-turn moderated debate for a single friction point.
 * The moderator LLM decides who speaks and when to conclude.
 */
export async function runDebateForFriction(
  runner: StreamingAgentRunner,
  friction: FrictionPoint,
  frictionIndex: number,
  round1Results: Round1Result[],
  boardMemberConfigs: BoardMemberConfig[],
  send: (event: SSEEvent) => void,
): Promise<DebateHistory> {
  const startTime = performance.now();
  const turns: DebateTurn[] = [];

  // Step 1: Moderator opening — ask the first question
  const openingPrompt = buildModeratorOpeningPrompt(friction, round1Results);
  const openingAction = await runner.runModeratorStreaming(openingPrompt, () => {});

  const moderatorOpening = openingAction.question ?? openingAction.reasoning;
  send({ type: "moderator_action", frictionIndex, action: openingAction });

  // If moderator immediately declares convergence/impasse (shouldn't happen, but safety)
  if (openingAction.action !== "ASK_QUESTION") {
    const durationMs = Math.round(performance.now() - startTime);
    const history: DebateHistory = {
      frictionIndex,
      friction,
      moderatorOpening,
      turns: [],
      outcome: openingAction.action === "DECLARE_CONVERGENCE" ? "CONVERGED" : "IMPASSE",
      outcomeSummary: openingAction.convergenceSummary ?? openingAction.reasoning,
      totalTurns: 0,
      durationMs,
    };
    send({ type: "debate_resolved", frictionIndex, history });
    return history;
  }

  // Step 2: First turn — targeted member responds
  let turnNumber = 1;
  if (openingAction.targetMember) {
    const firstTurn = await runSingleTurn(
      runner,
      openingAction.targetMember,
      openingAction.question ?? "",
      friction,
      round1Results,
      boardMemberConfigs,
      turns,
      turnNumber,
      frictionIndex,
      send,
    );
    if (firstTurn) {
      turns.push(firstTurn);
      turnNumber++;
    }
  }

  // Step 3: Debate loop — moderator decides next action each iteration
  let outcome: DebateHistory["outcome"] = "MAX_TURNS_REACHED";
  let outcomeSummary = "Maximum debate turns reached without resolution.";

  while (turnNumber <= MAX_DEBATE_TURNS) {
    const signals = analyzeConvergence(turns, MAX_DEBATE_TURNS);
    const nextActionPrompt = buildModeratorNextActionPrompt(
      friction,
      round1Results,
      turns,
      signals,
    );

    const nextAction = await runner.runModeratorStreaming(nextActionPrompt, () => {});
    send({ type: "moderator_action", frictionIndex, action: nextAction });

    if (nextAction.action === "DECLARE_CONVERGENCE") {
      outcome = "CONVERGED";
      outcomeSummary = nextAction.convergenceSummary ?? nextAction.reasoning;
      break;
    }

    if (nextAction.action === "DECLARE_IMPASSE") {
      outcome = "IMPASSE";
      outcomeSummary = nextAction.reasoning;
      break;
    }

    // ASK_QUESTION: target member responds
    if (nextAction.targetMember) {
      const turn = await runSingleTurn(
        runner,
        nextAction.targetMember,
        nextAction.question ?? "",
        friction,
        round1Results,
        boardMemberConfigs,
        turns,
        turnNumber,
        frictionIndex,
        send,
      );
      if (turn) {
        turns.push(turn);
        turnNumber++;
      }
    } else {
      // No target member specified — break to avoid infinite loop
      break;
    }
  }

  const durationMs = Math.round(performance.now() - startTime);
  const history: DebateHistory = {
    frictionIndex,
    friction,
    moderatorOpening,
    turns,
    outcome,
    outcomeSummary,
    totalTurns: turns.length,
    durationMs,
  };

  send({ type: "debate_resolved", frictionIndex, history });
  return history;
}

/** Run a single debate turn for a targeted member. */
async function runSingleTurn(
  runner: StreamingAgentRunner,
  targetRole: string,
  question: string,
  friction: FrictionPoint,
  round1Results: Round1Result[],
  boardMemberConfigs: BoardMemberConfig[],
  turns: DebateTurn[],
  turnNumber: number,
  frictionIndex: number,
  send: (event: SSEEvent) => void,
): Promise<DebateTurn | null> {
  const config = boardMemberConfigs.find((m) => m.role === targetRole);
  const ownResult = round1Results.find((r) => r.output.role === targetRole);
  if (!config || !ownResult) return null;

  const otherMembers = friction.members.filter((r) => r !== targetRole);

  send({
    type: "debate_turn_start",
    frictionIndex,
    turnNumber,
    speaker: config.role,
  });

  const systemPrompt = buildDebateSystemPrompt(config.name, config.title);
  const userPrompt = buildDebateTurnPrompt(
    config.role,
    config.name,
    config.title,
    ownResult.output.verdict,
    ownResult.output.analysis,
    turns,
    question,
    otherMembers,
  );

  const turn = await runner.runDebateTurnStreaming(
    config,
    systemPrompt,
    userPrompt,
    turnNumber,
    (role, chunk) => {
      send({ type: "debate_turn_chunk", frictionIndex, speaker: role, chunk });
    },
  );

  send({ type: "debate_turn_complete", frictionIndex, turn });
  return turn;
}

/**
 * Convert debate histories to legacy Round2Result[] for backward compat with synthesis.
 * Takes the last turn of each unique speaker and maps it to a Round2Response.
 */
export function flattenDebatesToRound2(histories: DebateHistory[]): Round2Result[] {
  const results: Round2Result[] = [];

  for (const history of histories) {
    const lastTurnBySpeaker = new Map<string, DebateTurn>();
    for (const turn of history.turns) {
      lastTurnBySpeaker.set(turn.speaker, turn);
    }

    for (const [role, turn] of lastTurnBySpeaker) {
      results.push({
        output: turnToRound2Response(role, turn),
        durationMs: history.totalTurns > 0 ? Math.round(history.durationMs / history.totalTurns) : 0,
      });
    }
  }

  return results;
}

function turnToRound2Response(role: string, turn: DebateTurn): Round2Response {
  let position: Round2Response["position"];
  if (turn.type === "CONCESSION" || turn.positionShift === "REVERSED") {
    position = "CONCEDE";
  } else if (turn.positionShift === "SOFTENED") {
    position = "COMPROMISE";
  } else {
    position = "MAINTAIN";
  }

  let condition: string;
  if (turn.positionShift === "REVERSED") {
    condition = "Position reversed during debate";
  } else if (turn.positionShift === "SOFTENED") {
    condition = "Position softened during debate";
  } else {
    condition = "Position maintained through debate";
  }

  return {
    role: role as Round2Response["role"],
    position,
    argument: turn.content,
    condition,
  };
}
