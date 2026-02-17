import type { Round1Result, FrictionPoint } from "./types";

const POSITIVE_VERDICTS = ["GO", "VIABLE", "VALIDATED", "SHIP_IT", "FEASIBLE"];
const NEGATIVE_VERDICTS = ["RETHINK", "NOT_VIABLE", "HYPOTHESIS_ONLY", "WILL_FEEL_GENERIC", "UNREALISTIC"];

function areContradictory(a: string, b: string): boolean {
  const aPos = POSITIVE_VERDICTS.includes(a);
  const aNeg = NEGATIVE_VERDICTS.includes(a);
  const bPos = POSITIVE_VERDICTS.includes(b);
  const bNeg = NEGATIVE_VERDICTS.includes(b);
  return (aPos && bNeg) || (aNeg && bPos);
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

  return frictions;
}
