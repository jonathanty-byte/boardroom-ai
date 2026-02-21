import { describe, expect, it } from "vitest";
import { calculateViabilityScore } from "../src/viability";
import { makeRound1Result } from "./fixtures";

describe("calculateViabilityScore", () => {
  it("returns 10.0 green when all verdicts are positive", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO" }),
      makeRound1Result({ role: "cmo", verdict: "GO" }),
      makeRound1Result({ role: "cfo", verdict: "VIABLE" }),
      makeRound1Result({ role: "cro", verdict: "VALIDATED" }),
      makeRound1Result({ role: "cco", verdict: "SHIP_IT" }),
      makeRound1Result({ role: "cto", verdict: "FEASIBLE" }),
    ];
    const result = calculateViabilityScore(round1);
    expect(result.score).toBe(10);
    expect(result.tier).toBe("green");
    expect(result.ceoOneLiner).toContain("Ship it");
  });

  it("returns 2.0 red when all verdicts are negative", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "RETHINK" }),
      makeRound1Result({ role: "cmo", verdict: "RETHINK" }),
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cro", verdict: "HYPOTHESIS_ONLY" }),
      makeRound1Result({ role: "cco", verdict: "WILL_FEEL_GENERIC" }),
      makeRound1Result({ role: "cto", verdict: "UNREALISTIC" }),
    ];
    const result = calculateViabilityScore(round1);
    expect(result.score).toBe(2);
    expect(result.tier).toBe("red");
    expect(result.ceoOneLiner).toContain("Back to the whiteboard");
  });

  it("returns 6.0 yellow for all mixed verdicts", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cmo", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cfo", verdict: "VIABLE_WITH_ADJUSTMENTS" }),
      makeRound1Result({ role: "cro", verdict: "NEEDS_RESEARCH" }),
      makeRound1Result({ role: "cco", verdict: "NEEDS_DESIGN_DIRECTION" }),
      makeRound1Result({ role: "cto", verdict: "FEASIBLE_WITH_CUTS" }),
    ];
    const result = calculateViabilityScore(round1);
    expect(result.score).toBe(6);
    expect(result.tier).toBe("yellow");
    expect(result.ceoOneLiner).toContain("Promising");
  });

  it("handles mixed verdicts giving a realistic score", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO" }), // 10
      makeRound1Result({ role: "cmo", verdict: "GO_WITH_CHANGES" }), // 6
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }), // 2
      makeRound1Result({ role: "cro", verdict: "VALIDATED" }), // 10
      makeRound1Result({ role: "cco", verdict: "NEEDS_DESIGN_DIRECTION" }), // 6
      makeRound1Result({ role: "cto", verdict: "FEASIBLE_WITH_CUTS" }), // 6
    ];
    // (10+6+2+10+6+6)/6 = 40/6 = 6.666... → 6.7
    const result = calculateViabilityScore(round1);
    expect(result.score).toBeCloseTo(6.7, 1);
    expect(result.tier).toBe("yellow");
  });

  it("returns orange tier for borderline score", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO" }), // 10
      makeRound1Result({ role: "cmo", verdict: "RETHINK" }), // 2
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }), // 2
      makeRound1Result({ role: "cro", verdict: "NEEDS_RESEARCH" }), // 6
      makeRound1Result({ role: "cco", verdict: "WILL_FEEL_GENERIC" }), // 2
      makeRound1Result({ role: "cto", verdict: "FEASIBLE_WITH_CUTS" }), // 6
    ];
    // (10+2+2+6+2+6)/6 = 28/6 = 4.666... → 4.7
    const result = calculateViabilityScore(round1);
    expect(result.score).toBeCloseTo(4.7, 1);
    expect(result.tier).toBe("orange");
    expect(result.ceoOneLiner).toContain("Pivot territory");
  });

  it("handles empty round1", () => {
    const result = calculateViabilityScore([]);
    expect(result.score).toBe(0);
    expect(result.tier).toBe("red");
  });

  it("defaults unknown verdict to 6 points", () => {
    const round1 = [makeRound1Result({ role: "cpo", verdict: "UNKNOWN_VERDICT" as never })];
    const result = calculateViabilityScore(round1);
    expect(result.score).toBe(6);
    expect(result.tier).toBe("yellow");
  });
});
