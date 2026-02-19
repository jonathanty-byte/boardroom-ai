import type {
  BoardMemberRole,
  DebateHistory,
  DebateTurn,
  FrictionPoint,
  ModeratorAction,
  Round1Result,
} from "../src/types";

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

export function makeDebateTurn(overrides: Partial<DebateTurn> = {}): DebateTurn {
  return {
    turnNumber: 1,
    speaker: "cpo",
    addressedTo: ["cfo"],
    type: "CHALLENGE",
    content: "My position stands. The market data supports my verdict.",
    positionShift: "UNCHANGED",
    ...overrides,
  };
}

export function makeModeratorAction(overrides: Partial<ModeratorAction> = {}): ModeratorAction {
  return {
    action: "ASK_QUESTION",
    targetMember: "cpo",
    question: "Vegeta, Piccolo says the unit economics don't work. What's your response?",
    reasoning: "Testing CPO's financial awareness",
    ...overrides,
  };
}

export function makeDebateHistory(overrides: Partial<DebateHistory> = {}): DebateHistory {
  return {
    frictionIndex: 0,
    friction: makeFriction(),
    moderatorOpening:
      "Let's discuss the fundamental disagreement between product vision and financial viability.",
    turns: [makeDebateTurn()],
    outcome: "CONVERGED",
    outcomeSummary: "Vegeta softened to accept a phased launch approach.",
    totalTurns: 1,
    durationMs: 5000,
    ...overrides,
  };
}
