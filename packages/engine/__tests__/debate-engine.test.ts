import { describe, expect, it, vi } from "vitest";
import { flattenDebatesToRound2, runDebateForFriction } from "../src/debate-engine";
import type { BoardMemberConfig } from "../src/types";
import {
  makeDebateHistory,
  makeDebateTurn,
  makeFriction,
  makeModeratorAction,
  makeRound1Result,
} from "./fixtures";

// Mock board member configs
const mockConfigs: BoardMemberConfig[] = [
  {
    role: "cpo",
    name: "Vegeta",
    title: "Chief Product Officer",
    systemPrompt: "You are Vegeta.",
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    role: "cfo",
    name: "Piccolo",
    title: "Chief Financial Officer",
    systemPrompt: "You are Piccolo.",
    temperature: 0.6,
    maxTokens: 4096,
  },
];

function createMockRunner(moderatorSequence: Array<ReturnType<typeof makeModeratorAction>>) {
  let moderatorCallIndex = 0;

  return {
    runModeratorStreaming: vi.fn(async () => {
      const action =
        moderatorSequence[moderatorCallIndex] ??
        makeModeratorAction({ action: "DECLARE_IMPASSE", reasoning: "Fallback" });
      moderatorCallIndex++;
      return action;
    }),

    runDebateTurnStreaming: vi.fn(
      async (config: BoardMemberConfig, _sys: string, _user: string, turnNumber: number) => {
        return makeDebateTurn({
          turnNumber,
          speaker: config.role,
          content: `${config.name} argues at turn ${turnNumber}.`,
        });
      },
    ),
  };
}

describe("runDebateForFriction", () => {
  const friction = makeFriction();
  const round1Results = [
    makeRound1Result({ role: "cpo", verdict: "GO" }),
    makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
  ];

  it("stops when moderator declares CONVERGENCE", async () => {
    const events: Array<{ type: string }> = [];
    const send = (e: { type: string }) => events.push(e);

    const runner = createMockRunner([
      // Opening: ask cpo
      makeModeratorAction({
        action: "ASK_QUESTION",
        targetMember: "cpo",
        question: "Defend your GO.",
      }),
      // After turn 1: declare convergence
      makeModeratorAction({
        action: "DECLARE_CONVERGENCE",
        reasoning: "Members agree",
        convergenceSummary: "Phased launch agreed",
      }),
    ]);

    const history = await runDebateForFriction(
      runner as any,
      friction,
      0,
      round1Results,
      mockConfigs,
      send,
    );

    expect(history.outcome).toBe("CONVERGED");
    expect(history.outcomeSummary).toContain("Phased launch");
    expect(history.totalTurns).toBe(1);
  });

  it("stops when moderator declares IMPASSE", async () => {
    const events: Array<{ type: string }> = [];
    const send = (e: { type: string }) => events.push(e);

    const runner = createMockRunner([
      makeModeratorAction({
        action: "ASK_QUESTION",
        targetMember: "cfo",
        question: "Piccolo, respond.",
      }),
      makeModeratorAction({ action: "DECLARE_IMPASSE", reasoning: "Positions hardened" }),
    ]);

    const history = await runDebateForFriction(
      runner as any,
      friction,
      0,
      round1Results,
      mockConfigs,
      send,
    );

    expect(history.outcome).toBe("IMPASSE");
    expect(history.totalTurns).toBe(1);
  });

  it("stops at MAX_TURNS_REACHED when moderator keeps asking", async () => {
    const events: Array<{ type: string }> = [];
    const send = (e: { type: string }) => events.push(e);

    // Always ask questions — never declare convergence/impasse
    const runner = createMockRunner(
      Array(10).fill(
        makeModeratorAction({
          action: "ASK_QUESTION",
          targetMember: "cpo",
          question: "Argue more.",
        }),
      ),
    );

    const history = await runDebateForFriction(
      runner as any,
      friction,
      0,
      round1Results,
      mockConfigs,
      send,
    );

    expect(history.outcome).toBe("MAX_TURNS_REACHED");
    expect(history.totalTurns).toBeLessThanOrEqual(5);
  });

  it("emits correct SSE events in order", async () => {
    const eventTypes: string[] = [];
    const send = (e: { type: string }) => eventTypes.push(e.type);

    const runner = createMockRunner([
      makeModeratorAction({ action: "ASK_QUESTION", targetMember: "cpo", question: "Go." }),
      makeModeratorAction({
        action: "DECLARE_CONVERGENCE",
        reasoning: "Done",
        convergenceSummary: "Agreed",
      }),
    ]);

    await runDebateForFriction(runner as any, friction, 0, round1Results, mockConfigs, send);

    expect(eventTypes).toEqual([
      "moderator_action", // Opening
      "debate_turn_start", // Turn 1 start
      "debate_turn_complete", // Turn 1 complete
      "moderator_action", // Next action (convergence)
      "debate_resolved", // Resolution
    ]);
  });

  it("builds cumulative history across turns", async () => {
    const events: Array<{ type: string }> = [];
    const send = (e: { type: string }) => events.push(e);

    const runner = createMockRunner([
      makeModeratorAction({ action: "ASK_QUESTION", targetMember: "cpo", question: "Q1" }),
      makeModeratorAction({ action: "ASK_QUESTION", targetMember: "cfo", question: "Q2" }),
      makeModeratorAction({
        action: "DECLARE_CONVERGENCE",
        reasoning: "Done",
        convergenceSummary: "Agreed",
      }),
    ]);

    const history = await runDebateForFriction(
      runner as any,
      friction,
      0,
      round1Results,
      mockConfigs,
      send,
    );

    expect(history.totalTurns).toBe(2);
    expect(history.turns[0].speaker).toBe("cpo");
    expect(history.turns[1].speaker).toBe("cfo");
  });
});

describe("flattenDebatesToRound2", () => {
  it("maps CONCESSION to CONCEDE", () => {
    const history = makeDebateHistory({
      turns: [makeDebateTurn({ speaker: "cpo", type: "CONCESSION", positionShift: "REVERSED" })],
    });
    const results = flattenDebatesToRound2([history]);
    expect(results).toHaveLength(1);
    expect(results[0].output.position).toBe("CONCEDE");
    expect(results[0].output.role).toBe("cpo");
  });

  it("maps SOFTENED to COMPROMISE", () => {
    const history = makeDebateHistory({
      turns: [makeDebateTurn({ speaker: "cfo", type: "RESPONSE", positionShift: "SOFTENED" })],
    });
    const results = flattenDebatesToRound2([history]);
    expect(results[0].output.position).toBe("COMPROMISE");
  });

  it("maps UNCHANGED to MAINTAIN", () => {
    const history = makeDebateHistory({
      turns: [makeDebateTurn({ speaker: "cpo", type: "CHALLENGE", positionShift: "UNCHANGED" })],
    });
    const results = flattenDebatesToRound2([history]);
    expect(results[0].output.position).toBe("MAINTAIN");
  });

  it("takes last turn per speaker when multiple turns exist", () => {
    const history = makeDebateHistory({
      turns: [
        makeDebateTurn({
          turnNumber: 1,
          speaker: "cpo",
          positionShift: "UNCHANGED",
          content: "First argument",
        }),
        makeDebateTurn({
          turnNumber: 2,
          speaker: "cfo",
          positionShift: "UNCHANGED",
          content: "Counter",
        }),
        makeDebateTurn({
          turnNumber: 3,
          speaker: "cpo",
          positionShift: "SOFTENED",
          content: "I soften",
        }),
      ],
    });
    const results = flattenDebatesToRound2([history]);
    const cpoResult = results.find((r) => r.output.role === "cpo");
    expect(cpoResult?.output.position).toBe("COMPROMISE");
    expect(cpoResult?.output.argument).toBe("I soften");
  });

  it("handles empty debate history", () => {
    const history = makeDebateHistory({ turns: [] });
    const results = flattenDebatesToRound2([history]);
    expect(results).toHaveLength(0);
  });
});
