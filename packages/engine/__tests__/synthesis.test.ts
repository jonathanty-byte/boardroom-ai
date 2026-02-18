import { describe, expect, it } from "vitest";
import { synthesize } from "../src/synthesis";
import { makeFriction, makeRound1Result, makeRound2Result } from "./fixtures";

describe("synthesize", () => {
  it("returns GO when all verdicts are positive (avg > 0.3)", () => {
    const round1 = [
      makeRound1Result({ verdict: "GO" }),
      makeRound1Result({ role: "cmo", verdict: "GO" }),
      makeRound1Result({ role: "cfo", verdict: "VIABLE" }),
      makeRound1Result({ role: "cro", verdict: "VALIDATED" }),
      makeRound1Result({ role: "cco", verdict: "SHIP_IT" }),
      makeRound1Result({ role: "cto", verdict: "FEASIBLE" }),
    ];

    const result = synthesize(round1, [], []);
    expect(result.collectiveVerdict).toBe("GO");
  });

  it("returns GO_WITH_CHANGES for mixed positive/neutral (avg between -0.3 and 0.3)", () => {
    const round1 = [
      makeRound1Result({ verdict: "GO" }),
      makeRound1Result({ role: "cmo", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cfo", verdict: "VIABLE_WITH_ADJUSTMENTS" }),
      makeRound1Result({ role: "cro", verdict: "NEEDS_RESEARCH" }),
      makeRound1Result({ role: "cco", verdict: "NEEDS_DESIGN_DIRECTION" }),
      makeRound1Result({ role: "cto", verdict: "FEASIBLE_WITH_CUTS" }),
    ];

    // Sentiments in synthesize: GO→1, GO_WITH_CHANGES→0, VIABLE_WITH_ADJUSTMENTS→0,
    // NEEDS_RESEARCH→0, NEEDS_DESIGN_DIRECTION→0, FEASIBLE_WITH_CUTS→0
    // avg = 1/6 ≈ 0.167 → between -0.3 and 0.3 → GO_WITH_CHANGES
    const result = synthesize(round1, [], []);
    expect(result.collectiveVerdict).toBe("GO_WITH_CHANGES");
  });

  it("returns RETHINK when majority is negative (avg < -0.3)", () => {
    const round1 = [
      makeRound1Result({ verdict: "RETHINK" }),
      makeRound1Result({ role: "cmo", verdict: "RETHINK" }),
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cro", verdict: "HYPOTHESIS_ONLY" }),
      makeRound1Result({ role: "cco", verdict: "WILL_FEEL_GENERIC" }),
      makeRound1Result({ role: "cto", verdict: "UNREALISTIC" }),
    ];

    const result = synthesize(round1, [], []);
    expect(result.collectiveVerdict).toBe("RETHINK");
  });

  it("classifies CONCEDE as compromise", () => {
    const friction = makeFriction({ members: ["cpo", "cfo"] });
    const round2 = [
      makeRound2Result({
        role: "cpo",
        position: "CONCEDE",
        argument: "I accept the financial concerns.",
      }),
      makeRound2Result({
        role: "cfo",
        position: "MAINTAIN",
        argument: "Numbers speak for themselves.",
        condition: "Risk accepted.",
      }),
    ];

    const result = synthesize([makeRound1Result(), makeRound1Result({ role: "cfo" })], round2, [
      friction,
    ]);

    expect(result.compromises.length).toBe(1);
    expect(result.impasses.length).toBe(0);
  });

  it("classifies two MAINTAIN as impasse", () => {
    const friction = makeFriction({ members: ["cpo", "cfo"] });
    const round2 = [
      makeRound2Result({
        role: "cpo",
        position: "MAINTAIN",
        condition: "I accept the risk of being wrong.",
      }),
      makeRound2Result({
        role: "cfo",
        position: "MAINTAIN",
        condition: "The CEO must decide.",
      }),
    ];

    const result = synthesize([makeRound1Result(), makeRound1Result({ role: "cfo" })], round2, [
      friction,
    ]);

    expect(result.impasses.length).toBe(1);
    expect(result.compromises.length).toBe(0);
  });

  it("extracts consensus from Round 1 recommandationConcrete", () => {
    const round1 = [
      makeRound1Result({
        name: "Vegeta",
        verdictDetails: { recommandationConcrete: "Launch with freemium" },
      }),
      makeRound1Result({
        role: "cmo",
        name: "Bulma",
        verdictDetails: { recommandationConcrete: "Focus on SEO first" },
      }),
    ];

    const result = synthesize(round1, [], []);
    expect(result.consensus).toHaveLength(2);
    expect(result.consensus[0]).toContain("Vegeta");
    expect(result.consensus[0]).toContain("Launch with freemium");
    expect(result.consensus[1]).toContain("Bulma");
    expect(result.consensus[1]).toContain("Focus on SEO first");
  });

  it("handles empty case: 0 frictions, 0 round2", () => {
    const round1 = [makeRound1Result({ verdict: "GO" })];

    const result = synthesize(round1, [], []);
    expect(result.compromises).toHaveLength(0);
    expect(result.impasses).toHaveLength(0);
    expect(result.consensus.length).toBeGreaterThanOrEqual(0);
    expect(result.collectiveVerdict).toBe("GO");
  });

  it("skips consensus for members without recommandationConcrete", () => {
    const round1 = [
      makeRound1Result({
        name: "Vegeta",
        verdictDetails: { pointFort: "Great idea" },
      }),
    ];

    const result = synthesize(round1, [], []);
    expect(result.consensus).toHaveLength(0);
  });
});
