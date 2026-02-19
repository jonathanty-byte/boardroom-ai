import { describe, expect, it } from "vitest";
import {
  buildDebateSystemPrompt,
  buildDebateTurnPrompt,
  buildModeratorNextActionPrompt,
  buildModeratorOpeningPrompt,
  MODERATOR_SYSTEM_PROMPT,
} from "../src/moderator";
import { StreamingAgentRunner } from "../src/runner-streaming";
import { makeDebateTurn, makeFriction, makeRound1Result } from "./fixtures";

// Create a runner instance to test parsing methods (no API calls)
const runner = new StreamingAgentRunner("fake-key");

describe("parseModeratorResponse", () => {
  it("parses valid ASK_QUESTION JSON", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "cpo",
      question: "Vegeta, how do you justify your optimistic timeline?",
      reasoning: "CPO's timeline seems unrealistic given CFO's concerns",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.action).toBe("ASK_QUESTION");
    expect(result.targetMember).toBe("cpo");
    expect(result.question).toContain("Vegeta");
    expect(result.reasoning).toBeTruthy();
  });

  it("parses valid DECLARE_CONVERGENCE with summary", () => {
    const raw = JSON.stringify({
      action: "DECLARE_CONVERGENCE",
      reasoning: "Both members have moved to a middle ground",
      convergenceSummary: "Vegeta accepts phased launch, Piccolo accepts revised unit economics",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.action).toBe("DECLARE_CONVERGENCE");
    expect(result.convergenceSummary).toContain("phased launch");
  });

  it("parses valid DECLARE_IMPASSE", () => {
    const raw = JSON.stringify({
      action: "DECLARE_IMPASSE",
      reasoning: "Neither member is willing to budge",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.action).toBe("DECLARE_IMPASSE");
  });

  it("handles markdown fences around JSON", () => {
    const raw =
      '```json\n{"action":"ASK_QUESTION","targetMember":"cfo","question":"Piccolo, respond.","reasoning":"Testing"}\n```';
    const result = runner.parseModeratorResponse(raw);
    expect(result.action).toBe("ASK_QUESTION");
    expect(result.targetMember).toBe("cfo");
  });

  it("falls back to DECLARE_IMPASSE on invalid JSON", () => {
    const raw = "This is not JSON at all";
    const result = runner.parseModeratorResponse(raw);
    expect(result.action).toBe("DECLARE_IMPASSE");
    expect(result.reasoning).toContain("could not be parsed");
  });

  it("normalizes uppercase role to lowercase", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "CFO",
      question: "Piccolo, defend your numbers.",
      reasoning: "Testing uppercase",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.targetMember).toBe("cfo");
  });

  it("normalizes member name to role", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "Piccolo",
      question: "Defend your numbers.",
      reasoning: "Testing name",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.targetMember).toBe("cfo");
  });

  it("normalizes mixed case name to role", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "VEGETA",
      question: "Defend your position.",
      reasoning: "Testing name uppercase",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.targetMember).toBe("cpo");
  });

  it("normalizes name with parenthetical title", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "Trunks (CTO)",
      question: "Defend your feasibility claim.",
      reasoning: "Testing parenthetical",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.targetMember).toBe("cto");
  });

  it("normalizes full title to role", () => {
    const raw = JSON.stringify({
      action: "ASK_QUESTION",
      targetMember: "Chief Financial Officer",
      question: "Show me the numbers.",
      reasoning: "Testing title",
    });
    const result = runner.parseModeratorResponse(raw);
    expect(result.targetMember).toBe("cfo");
  });
});

describe("parseDebateTurn", () => {
  const config = {
    role: "cpo" as const,
    name: "Vegeta",
    title: "Chief Product Officer",
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 4096,
  };

  it("parses valid debate turn JSON", () => {
    const raw = JSON.stringify({
      type: "COUNTER",
      content: "The market data clearly supports my position.",
      quotedFrom: "Unit economics don't work",
      positionShift: "UNCHANGED",
      addressedTo: ["cfo"],
    });
    const result = runner.parseDebateTurn(raw, config, 2);
    expect(result.turnNumber).toBe(2);
    expect(result.speaker).toBe("cpo");
    expect(result.type).toBe("COUNTER");
    expect(result.content).toContain("market data");
    expect(result.quotedFrom).toContain("Unit economics");
    expect(result.positionShift).toBe("UNCHANGED");
    expect(result.addressedTo).toEqual(["cfo"]);
  });

  it("defaults missing fields gracefully", () => {
    const raw = JSON.stringify({ content: "I concede the point." });
    const result = runner.parseDebateTurn(raw, config, 3);
    expect(result.type).toBe("RESPONSE");
    expect(result.positionShift).toBe("UNCHANGED");
    expect(result.addressedTo).toEqual([]);
  });

  it("throws on completely invalid JSON", () => {
    expect(() => runner.parseDebateTurn("not json {{{", config, 1)).toThrow(/invalid JSON/);
  });
});

describe("buildModeratorOpeningPrompt", () => {
  it("includes friction description and member positions", () => {
    const friction = makeFriction();
    const round1Results = [
      makeRound1Result({ role: "cpo", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
    ];
    const prompt = buildModeratorOpeningPrompt(friction, round1Results);
    expect(prompt).toContain("Vegeta (GO) vs Piccolo (NOT_VIABLE)");
    expect(prompt).toContain("ASK_QUESTION");
  });
});

describe("buildModeratorNextActionPrompt", () => {
  it("includes debate history and convergence signals", () => {
    const friction = makeFriction();
    const round1Results = [
      makeRound1Result({ role: "cpo" }),
      makeRound1Result({ role: "cfo", name: "Piccolo" }),
    ];
    const turns = [makeDebateTurn({ turnNumber: 1, speaker: "cpo", content: "Market is ready." })];
    const signals = {
      hasPositionShift: false,
      allUnchanged: false,
      concessionCount: 0,
      turnsRemaining: 4,
      argumentsRepeating: false,
    };
    const prompt = buildModeratorNextActionPrompt(friction, round1Results, turns, signals);
    expect(prompt).toContain("Market is ready.");
    expect(prompt).toContain("Position shifts detected: NO");
    expect(prompt).toContain("Turns remaining: 4");
  });

  it("includes concession nudge when turnsRemaining <= 2 and no concessions", () => {
    const friction = makeFriction();
    const round1Results = [
      makeRound1Result({ role: "cpo" }),
      makeRound1Result({ role: "cfo", name: "Piccolo" }),
    ];
    const turns = [
      makeDebateTurn({ turnNumber: 1, speaker: "cpo" }),
      makeDebateTurn({ turnNumber: 2, speaker: "cfo" }),
      makeDebateTurn({ turnNumber: 3, speaker: "cpo" }),
    ];
    const signals = {
      hasPositionShift: false,
      allUnchanged: false,
      concessionCount: 0,
      turnsRemaining: 2,
      argumentsRepeating: false,
    };
    const prompt = buildModeratorNextActionPrompt(friction, round1Results, turns, signals);
    expect(prompt).toContain("No concessions yet");
    expect(prompt).toContain("concrete trade-off");
  });

  it("does NOT include concession nudge when concessions exist", () => {
    const friction = makeFriction();
    const round1Results = [
      makeRound1Result({ role: "cpo" }),
      makeRound1Result({ role: "cfo", name: "Piccolo" }),
    ];
    const turns = [makeDebateTurn({ turnNumber: 1, speaker: "cpo" })];
    const signals = {
      hasPositionShift: true,
      allUnchanged: false,
      concessionCount: 1,
      turnsRemaining: 2,
      argumentsRepeating: false,
    };
    const prompt = buildModeratorNextActionPrompt(friction, round1Results, turns, signals);
    expect(prompt).not.toContain("No concessions yet");
  });
});

describe("P2 — prompt softening", () => {
  it("MODERATOR_SYSTEM_PROMPT uses 'productive' not 'adversarial'", () => {
    expect(MODERATOR_SYSTEM_PROMPT).toContain("productive debate");
    expect(MODERATOR_SYSTEM_PROMPT).not.toContain("adversarial");
  });

  it("MODERATOR_SYSTEM_PROMPT includes compromise and condition rules", () => {
    expect(MODERATOR_SYSTEM_PROMPT).toContain("suggest compromises");
    expect(MODERATOR_SYSTEM_PROMPT).toContain("What specific condition would change your position");
  });

  it("buildDebateSystemPrompt uses 'direct but fair' instead of 'heated'", () => {
    const prompt = buildDebateSystemPrompt("Vegeta", "Chief Product Officer");
    expect(prompt).toContain("direct but fair");
    expect(prompt).not.toContain("heated");
    expect(prompt).not.toContain("argue like your career depends on it");
    expect(prompt).toContain("open to concessions");
  });

  it("buildDebateTurnPrompt acknowledges valid points and adds late-game nudge", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1 }),
      makeDebateTurn({ turnNumber: 2 }),
      makeDebateTurn({ turnNumber: 3 }),
    ];
    const prompt = buildDebateTurnPrompt("GO", "Analysis text", turns, "Question?", ["cfo"]);
    expect(prompt).toContain("acknowledge it");
    expect(prompt).toContain("compromise");
    expect(prompt).not.toContain("don't be polite for nothing");
    expect(prompt).not.toContain("be aggressive");
  });

  it("buildDebateTurnPrompt does NOT add late-game nudge for early turns", () => {
    const turns = [makeDebateTurn({ turnNumber: 1 })];
    const prompt = buildDebateTurnPrompt("GO", "Analysis text", turns, "Question?", ["cfo"]);
    expect(prompt).toContain("acknowledge it");
    expect(prompt).not.toContain("nearing its end");
  });
});
