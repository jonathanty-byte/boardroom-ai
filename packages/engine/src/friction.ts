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
  // Step 1: Find all strongly contradictory pairs (gap >= 1.5)
  const contradictoryPairs: Array<[number, number]> = [];
  for (let i = 0; i < round1.length; i++) {
    for (let j = i + 1; j < round1.length; j++) {
      if (areContradictory(round1[i].output.verdict, round1[j].output.verdict)) {
        contradictoryPairs.push([i, j]);
      }
    }
  }

  if (contradictoryPairs.length > 0) {
    // Merge connected pairs into multi-member frictions via union-find
    const components = findConnectedComponents(contradictoryPairs, round1.length);
    return components.map((indices) => buildGroupFriction(indices.map((i) => round1[i])));
  }

  // Step 2: Fallback — collect ALL members involved in max-gap pairs
  if (round1.length >= 2) {
    let maxGap = 0;
    for (let i = 0; i < round1.length; i++) {
      for (let j = i + 1; j < round1.length; j++) {
        const gap = Math.abs(
          getSentiment(round1[i].output.verdict) - getSentiment(round1[j].output.verdict),
        );
        if (gap > maxGap) maxGap = gap;
      }
    }

    if (maxGap > 0) {
      // Collect all unique members in any max-gap pair
      const memberIndices = new Set<number>();
      for (let i = 0; i < round1.length; i++) {
        for (let j = i + 1; j < round1.length; j++) {
          const gap = Math.abs(
            getSentiment(round1[i].output.verdict) - getSentiment(round1[j].output.verdict),
          );
          if (gap === maxGap) {
            memberIndices.add(i);
            memberIndices.add(j);
          }
        }
      }

      return [buildGroupFriction([...memberIndices].map((i) => round1[i]))];
    }
  }

  return [];
}

/** Union-find to merge connected contradiction pairs into groups. */
function findConnectedComponents(
  pairs: Array<[number, number]>,
  n: number,
): number[][] {
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  for (const [i, j] of pairs) {
    parent[find(i)] = find(j);
  }

  // Group only members that are in at least one pair
  const inPair = new Set(pairs.flat());
  const groups = new Map<number, number[]>();
  for (const idx of inPair) {
    const root = find(idx);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(idx);
  }

  return [...groups.values()];
}

/** Build a friction from a group of results, sorted by sentiment for readable description. */
function buildGroupFriction(results: Round1Result[]): FrictionPoint {
  // Sort: most positive first, most negative last
  const sorted = [...results].sort(
    (a, b) => getSentiment(b.output.verdict) - getSentiment(a.output.verdict),
  );

  // Build "positive side vs negative side" description
  const midpoint = getSentiment(sorted[0].output.verdict) + getSentiment(sorted[sorted.length - 1].output.verdict);
  const highSide = sorted.filter((r) => getSentiment(r.output.verdict) * 2 > midpoint);
  const lowSide = sorted.filter((r) => getSentiment(r.output.verdict) * 2 <= midpoint);

  // Fallback: just split in half if grouping fails
  const left = highSide.length > 0 ? highSide : sorted.slice(0, Math.ceil(sorted.length / 2));
  const right = lowSide.length > 0 ? lowSide : sorted.slice(Math.ceil(sorted.length / 2));

  const formatSide = (side: Round1Result[]) =>
    side.map((r) => `${r.output.name} (${r.output.verdict})`).join(", ");

  const description = `${formatSide(left)} vs ${formatSide(right)}`;

  const members = sorted.map((r) => r.output.role);
  const positions: Record<string, string> = {};
  for (const r of sorted) {
    positions[r.output.role] = `${r.output.verdict}: ${r.output.verdictDetails.recommandationConcrete ?? r.output.verdictDetails.pointFort ?? r.output.analysis.slice(0, 200)}`;
  }

  return { description, members, positions };
}
