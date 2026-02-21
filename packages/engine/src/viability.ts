import type { Round1Result, ViabilityScore } from "./types";

const VERDICT_POINTS: Record<string, number> = {
  GO: 10,
  VIABLE: 10,
  VALIDATED: 10,
  SHIP_IT: 10,
  FEASIBLE: 10,
  GO_WITH_CHANGES: 6,
  VIABLE_WITH_ADJUSTMENTS: 6,
  NEEDS_RESEARCH: 6,
  NEEDS_DESIGN_DIRECTION: 6,
  FEASIBLE_WITH_CUTS: 6,
  RETHINK: 2,
  NOT_VIABLE: 2,
  HYPOTHESIS_ONLY: 2,
  WILL_FEEL_GENERIC: 2,
  UNREALISTIC: 2,
};

function getVerdictPoints(verdict: string): number {
  return VERDICT_POINTS[verdict] ?? 6;
}

function getTier(score: number): ViabilityScore["tier"] {
  if (score >= 8) return "green";
  if (score >= 6) return "yellow";
  if (score >= 4) return "orange";
  return "red";
}

function getCeoOneLiner(score: number): string {
  if (score >= 8) return "Ship it. The board is behind you.";
  if (score >= 6) return "Promising, but the CFO has questions.";
  if (score >= 4) return "Pivot territory. Listen to the CTO.";
  return "Back to the whiteboard. The board says no.";
}

export function calculateViabilityScore(round1: Round1Result[]): ViabilityScore {
  if (round1.length === 0) {
    return { score: 0, tier: "red", ceoOneLiner: getCeoOneLiner(0) };
  }

  const total = round1.reduce((sum, r) => sum + getVerdictPoints(r.output.verdict), 0);
  const raw = total / round1.length;
  const score = Math.round(raw * 10) / 10;

  return {
    score,
    tier: getTier(score),
    ceoOneLiner: getCeoOneLiner(score),
  };
}
