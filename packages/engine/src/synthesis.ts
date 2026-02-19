import { getSentiment } from "./friction";
import type {
  BoardMemberRole,
  DebateHistory,
  FrictionPoint,
  Round1Result,
  Round2Result,
  Synthesis,
} from "./types";
import { BOARD_MEMBER_NAMES } from "./types";

export function synthesize(
  round1: Round1Result[],
  round2: Round2Result[],
  frictions: FrictionPoint[],
  debateHistories?: DebateHistory[],
): Synthesis {
  const compromises: string[] = [];
  const impasses: string[] = [];

  // Consensus from Round 1 recommendations
  const allRecommendations = round1.flatMap((r) => {
    const rec = r.output.verdictDetails.recommandationConcrete;
    return rec ? [`${r.output.name}: ${rec}`] : [];
  });

  // Check Round 2 for compromises and impasses
  for (const friction of frictions) {
    const responses = round2.filter((r) => friction.members.includes(r.output.role));

    const hasCompromise = responses.some(
      (r) => r.output.position === "COMPROMISE" || r.output.position === "CONCEDE",
    );
    const allMaintain = responses.every((r) => r.output.position === "MAINTAIN");

    if (allMaintain) {
      impasses.push(
        `${friction.description}: ${responses
          .map((r) => `${r.output.role} maintains (${r.output.condition})`)
          .join(" | ")}`,
      );
    } else if (hasCompromise) {
      compromises.push(
        `${friction.description}: ${responses
          .map((r) => `${r.output.role} ${r.output.position.toLowerCase()}s (${r.output.argument})`)
          .join(" | ")}`,
      );
    }
  }

  // Collective verdict based on sentiment
  const verdictSentiment = round1.map((r) => {
    const v = r.output.verdict;
    if (["GO", "VIABLE", "VALIDATED", "SHIP_IT", "FEASIBLE"].includes(v)) return 1;
    if (
      [
        "GO_WITH_CHANGES",
        "VIABLE_WITH_ADJUSTMENTS",
        "NEEDS_RESEARCH",
        "NEEDS_DESIGN_DIRECTION",
        "FEASIBLE_WITH_CUTS",
      ].includes(v)
    )
      return 0;
    return -1;
  });

  const avg = verdictSentiment.reduce<number>((a, b) => a + b, 0) / verdictSentiment.length;

  let collectiveVerdict: Synthesis["collectiveVerdict"];
  if (avg > 0.3) collectiveVerdict = "GO";
  else if (avg >= -0.3) collectiveVerdict = "GO_WITH_CHANGES";
  else collectiveVerdict = "RETHINK";

  // Collect unresolved concerns from non-debating members with negative sentiment
  const unresolvedConcerns: string[] = [];
  if (debateHistories && debateHistories.length > 0) {
    const debatingRoles = new Set<BoardMemberRole>();
    for (const debate of debateHistories) {
      for (const role of debate.friction.members) {
        debatingRoles.add(role);
      }
    }

    for (const r of round1) {
      if (debatingRoles.has(r.output.role)) continue;
      if (getSentiment(r.output.verdict) > 0) continue;

      const name = BOARD_MEMBER_NAMES[r.output.role] ?? r.output.role;
      const detail =
        r.output.verdictDetails.risqueCritique ||
        r.output.verdictDetails.questionNonResolue ||
        r.output.verdictDetails.recommandationConcrete ||
        r.output.analysis.slice(0, 150);

      unresolvedConcerns.push(`${name} (${r.output.verdict}): ${detail}`);
    }
  }

  return {
    consensus: allRecommendations,
    compromises,
    impasses,
    collectiveVerdict,
    ...(unresolvedConcerns.length > 0 ? { unresolvedConcerns } : {}),
  };
}
