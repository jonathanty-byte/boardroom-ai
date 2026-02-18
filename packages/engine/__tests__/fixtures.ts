import type { BoardMemberRole, FrictionPoint, Round1Result, Round2Result } from "../src/types";

export function makeRound1Result(
  overrides: Partial<Round1Result["output"]> & { durationMs?: number } = {},
): Round1Result {
  const { durationMs = 1000, ...outputOverrides } = overrides;
  return {
    output: {
      role: "cpo" as BoardMemberRole,
      name: "Vegeta",
      analysis: "This is a solid product with clear market fit.",
      challenges: ["Who is the target user?", "What is the pricing model?"],
      verdict: "GO",
      verdictDetails: {
        pointFort: "Strong value proposition",
        risqueCritique: "Unclear monetization",
        recommandationConcrete: "Launch with freemium model",
      },
      ...outputOverrides,
    },
    durationMs,
  };
}

export function makeRound2Result(
  overrides: Partial<Round2Result["output"]> & { durationMs?: number } = {},
): Round2Result {
  const { durationMs = 500, ...outputOverrides } = overrides;
  return {
    output: {
      role: "cpo" as BoardMemberRole,
      position: "MAINTAIN",
      argument: "My analysis stands based on the data.",
      condition: "Unless new market data emerges.",
      ...outputOverrides,
    },
    durationMs,
  };
}

export function makeFriction(overrides: Partial<FrictionPoint> = {}): FrictionPoint {
  return {
    description: "Vegeta (GO) vs Piccolo (NOT_VIABLE)",
    members: ["cpo", "cfo"],
    positions: {
      cpo: "GO: Launch with freemium model",
      cfo: "NOT_VIABLE: Unit economics don't work",
    },
    ...overrides,
  };
}
