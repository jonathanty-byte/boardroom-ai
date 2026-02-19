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

export function getSentiment(verdict: string): number {
  return VERDICT_SENTIMENT[verdict] ?? 0;
}

/**
 * Two verdicts are contradictory if their sentiment gap is >= 1.5.
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
          frictions.push(buildPairFriction(round1[i], round1[j]));
        }
      }
    }
  }

  // Fallback: pick a random pair among all max-gap pairs
  if (frictions.length === 0 && round1.length >= 2) {
    let maxGap = 0;
    const candidates: Array<[number, number]> = [];

    for (let i = 0; i < round1.length; i++) {
      for (let j = i + 1; j < round1.length; j++) {
        const gap = Math.abs(
          getSentiment(round1[i].output.verdict) - getSentiment(round1[j].output.verdict),
        );
        if (gap > maxGap) {
          maxGap = gap;
          candidates.length = 0;
          candidates.push([i, j]);
        } else if (gap === maxGap && maxGap > 0) {
          candidates.push([i, j]);
        }
      }
    }

    if (candidates.length > 0) {
      // Pick a random pair among tied candidates
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      frictions.push(buildPairFriction(round1[pick[0]], round1[pick[1]]));
    }
  }

  return frictions;
}

function buildPairFriction(a: Round1Result, b: Round1Result): FrictionPoint {
  // Put the more positive member first for consistent description
  const [high, low] =
    getSentiment(a.output.verdict) >= getSentiment(b.output.verdict) ? [a, b] : [b, a];

  return {
    description: `${high.output.name} (${high.output.verdict}) vs ${low.output.name} (${low.output.verdict})`,
    members: [high.output.role, low.output.role],
    positions: {
      [high.output.role]:
        `${high.output.verdict}: ${high.output.verdictDetails.recommandationConcrete ?? high.output.verdictDetails.pointFort ?? high.output.analysis.slice(0, 200)}`,
      [low.output.role]:
        `${low.output.verdict}: ${low.output.verdictDetails.recommandationConcrete ?? low.output.verdictDetails.pointFort ?? low.output.analysis.slice(0, 200)}`,
    },
  };
}
