import type { DebateTurn } from "./types";

/**
 * Heuristic convergence signals injected into the moderator's context.
 * These help the LLM moderator decide whether to continue or conclude.
 */
export interface ConvergenceSignals {
  /** At least one member has shifted position (SOFTENED or REVERSED) */
  hasPositionShift: boolean;
  /** Last 2 turns both UNCHANGED — positions are hardened */
  allUnchanged: boolean;
  /** Total CONCESSION + SOFTENED + REVERSED across all turns */
  concessionCount: number;
  /** Turns remaining before hitting MAX_DEBATE_TURNS */
  turnsRemaining: number;
  /** Same speaker is repeating similar arguments (overlap > 60%) */
  argumentsRepeating: boolean;
}

export function analyzeConvergence(turns: DebateTurn[], maxTurns: number): ConvergenceSignals {
  const hasPositionShift = turns.some(
    (t) => t.positionShift === "SOFTENED" || t.positionShift === "REVERSED",
  );

  const lastTwo = turns.slice(-2);
  const allUnchanged = lastTwo.length >= 2 && lastTwo.every((t) => t.positionShift === "UNCHANGED");

  const concessionCount = turns.filter(
    (t) =>
      t.type === "CONCESSION" || t.positionShift === "SOFTENED" || t.positionShift === "REVERSED",
  ).length;

  const turnsRemaining = maxTurns - turns.length;
  const argumentsRepeating = detectRepetition(turns);

  return { hasPositionShift, allUnchanged, concessionCount, turnsRemaining, argumentsRepeating };
}

/** Detect if the latest turn repeats arguments from a previous turn by the same speaker. */
function detectRepetition(turns: DebateTurn[]): boolean {
  if (turns.length < 3) return false;

  const latest = turns[turns.length - 1];
  const latestWords = latest.content.toLowerCase().split(/\s+/);
  if (latestWords.length === 0) return false;

  const sameSpeakerPrevious = turns.slice(0, -1).filter((t) => t.speaker === latest.speaker);

  for (const prev of sameSpeakerPrevious) {
    const words = new Set(prev.content.toLowerCase().split(/\s+/));
    const overlap = latestWords.filter((w) => words.has(w)).length / latestWords.length;
    if (overlap > 0.6) return true;
  }

  return false;
}
