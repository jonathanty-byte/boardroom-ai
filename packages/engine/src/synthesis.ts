import type { FrictionPoint, Round1Result, Round2Result, Synthesis } from "./types";

export function synthesize(
  round1: Round1Result[],
  round2: Round2Result[],
  frictions: FrictionPoint[],
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

  return {
    consensus: allRecommendations,
    compromises,
    impasses,
    collectiveVerdict,
  };
}
