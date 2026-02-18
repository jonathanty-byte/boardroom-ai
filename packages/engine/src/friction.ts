import type { FrictionPoint, Round1Result } from "./types";

// Sentiment scoring: +1 positive, 0 middle, -1 negative
const VERDICT_SENTIMENT: Record<string, number> = {
  // Positive (+1)
  GO: 1,
  VIABLE: 1,
  VALIDATED: 1,
  SHIP_IT: 1,
  FEASIBLE: 1,
  // Middle (0)
  GO_WITH_CHANGES: 0,
  VIABLE_WITH_ADJUSTMENTS: 0,
  FEASIBLE_WITH_CUTS: 0,
  // Cautious (-0.5 — lean negative but not fully against)
  NEEDS_RESEARCH: -0.5,
  NEEDS_DESIGN_DIRECTION: -0.5,
  // Negative (-1)
  RETHINK: -1,
  NOT_VIABLE: -1,
  HYPOTHESIS_ONLY: -1,
  WILL_FEEL_GENERIC: -1,
  UNREALISTIC: -1,
};

function getSentiment(verdict: string): number {
  return VERDICT_SENTIMENT[verdict] ?? 0;
}

/**
 * Two verdicts are contradictory if their sentiment gap is >= 1.5.
 * This catches:
 * - positive vs negative (gap 2) — e.g. GO vs RETHINK
 * - positive vs cautious (gap 1.5) — e.g. GO vs NEEDS_RESEARCH
 * But NOT:
 * - middle vs cautious (gap 0.5) — e.g. GO_WITH_CHANGES vs NEEDS_RESEARCH
 * - positive vs middle (gap 1) — e.g. GO vs GO_WITH_CHANGES
 */
function areContradictory(a: string, b: string): boolean {
  const gap = Math.abs(getSentiment(a) - getSentiment(b));
  return gap >= 1.5;
}

export function identifyFrictions(round1: Round1Result[]): FrictionPoint[] {
  const frictions: FrictionPoint[] = [];

  for (let i = 0; i < round1.length; i++) {
    for (let j = i + 1; j < round1.length; j++) {
      const a = round1[i].output;
      const b = round1[j].output;

      if (areContradictory(a.verdict, b.verdict)) {
        const existing = frictions.find(
          (f) => f.members.includes(a.role) && f.members.includes(b.role),
        );

        if (!existing) {
          frictions.push({
            description: `${a.name} (${a.verdict}) vs ${b.name} (${b.verdict})`,
            members: [a.role, b.role],
            positions: {
              [a.role]: `${a.verdict}: ${a.verdictDetails.recommandationConcrete ?? a.verdictDetails.pointFort ?? a.analysis.slice(0, 200)}`,
              [b.role]: `${b.verdict}: ${b.verdictDetails.recommandationConcrete ?? b.verdictDetails.pointFort ?? b.analysis.slice(0, 200)}`,
            },
          });
        }
      }
    }
  }

  // If still no frictions, pick the two most divergent members
  if (frictions.length === 0 && round1.length >= 2) {
    let maxGap = 0;
    let bestPair: [number, number] = [0, 1];

    for (let i = 0; i < round1.length; i++) {
      for (let j = i + 1; j < round1.length; j++) {
        const gap = Math.abs(
          getSentiment(round1[i].output.verdict) - getSentiment(round1[j].output.verdict),
        );
        if (gap > maxGap) {
          maxGap = gap;
          bestPair = [i, j];
        }
      }
    }

    // Only force a friction if there's at least some divergence
    if (maxGap > 0) {
      const a = round1[bestPair[0]].output;
      const b = round1[bestPair[1]].output;
      frictions.push({
        description: `${a.name} (${a.verdict}) vs ${b.name} (${b.verdict})`,
        members: [a.role, b.role],
        positions: {
          [a.role]: `${a.verdict}: ${a.verdictDetails.recommandationConcrete ?? a.verdictDetails.pointFort ?? a.analysis.slice(0, 200)}`,
          [b.role]: `${b.verdict}: ${b.verdictDetails.recommandationConcrete ?? b.verdictDetails.pointFort ?? b.analysis.slice(0, 200)}`,
        },
      });
    }
  }

  return frictions;
}
