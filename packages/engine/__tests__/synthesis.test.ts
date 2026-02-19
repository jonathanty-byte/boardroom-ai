import { describe, expect, it } from "vitest";
import { synthesize } from "../src/synthesis";
import { makeDebateHistory, makeFriction, makeRound1Result } from "./fixtures";

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

    const result = synthesize(round1, []);
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
    const result = synthesize(round1, []);
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

    const result = synthesize(round1, []);
    expect(result.collectiveVerdict).toBe("RETHINK");
  });

  it("classifies CONVERGED debate as compromise", () => {
    const friction = makeFriction({ members: ["cpo", "cfo"] });
    const debates = [
      makeDebateHistory({
        friction,
        outcome: "CONVERGED",
        outcomeSummary: "Both agreed on phased launch approach.",
      }),
    ];

    const result = synthesize(
      [makeRound1Result(), makeRound1Result({ role: "cfo" })],
      [friction],
      debates,
    );

    expect(result.compromises.length).toBe(1);
    expect(result.compromises[0]).toContain("phased launch");
    expect(result.impasses.length).toBe(0);
  });

  it("classifies IMPASSE debate as impasse", () => {
    const friction = makeFriction({ members: ["cpo", "cfo"] });
    const debates = [
      makeDebateHistory({
        friction,
        outcome: "IMPASSE",
        outcomeSummary: "Positions hardened. CEO must decide.",
      }),
    ];

    const result = synthesize(
      [makeRound1Result(), makeRound1Result({ role: "cfo" })],
      [friction],
      debates,
    );

    expect(result.impasses.length).toBe(1);
    expect(result.impasses[0]).toContain("CEO must decide");
    expect(result.compromises.length).toBe(0);
  });

  it("classifies MAX_TURNS_REACHED debate as impasse", () => {
    const friction = makeFriction({ members: ["cpo", "cfo"] });
    const debates = [
      makeDebateHistory({
        friction,
        outcome: "MAX_TURNS_REACHED",
        outcomeSummary: "Maximum debate turns reached without resolution.",
      }),
    ];

    const result = synthesize(
      [makeRound1Result(), makeRound1Result({ role: "cfo" })],
      [friction],
      debates,
    );

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

    const result = synthesize(round1, []);
    expect(result.consensus).toHaveLength(2);
    expect(result.consensus[0]).toContain("Vegeta");
    expect(result.consensus[0]).toContain("Launch with freemium");
    expect(result.consensus[1]).toContain("Bulma");
    expect(result.consensus[1]).toContain("Focus on SEO first");
  });

  it("handles empty case: 0 frictions, 0 debates", () => {
    const round1 = [makeRound1Result({ verdict: "GO" })];

    const result = synthesize(round1, []);
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

    const result = synthesize(round1, []);
    expect(result.consensus).toHaveLength(0);
  });

  it("collects unresolvedConcerns from non-debating negative members", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO" }),
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }),
      makeRound1Result({
        role: "cto",
        name: "Trunks",
        verdict: "UNREALISTIC",
        verdictDetails: { risqueCritique: "Cannot be built in 6 months" },
      }),
      makeRound1Result({
        role: "cro",
        name: "Whis",
        verdict: "HYPOTHESIS_ONLY",
        verdictDetails: { questionNonResolue: "No evidence of product-market fit" },
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const result = synthesize(round1, [], debates);
    expect(result.unresolvedConcerns).toBeDefined();
    expect(result.unresolvedConcerns!.length).toBe(2);
    expect(result.unresolvedConcerns!.some((c) => c.includes("Trunks"))).toBe(true);
    expect(result.unresolvedConcerns!.some((c) => c.includes("Whis"))).toBe(true);
    expect(result.unresolvedConcerns!.some((c) => c.includes("Cannot be built"))).toBe(true);
  });

  it("does NOT include unresolvedConcerns for positive non-debating members", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", verdict: "GO" }),
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }),
      makeRound1Result({
        role: "cmo",
        name: "Bulma",
        verdict: "GO",
        verdictDetails: { risqueCritique: "None" },
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const result = synthesize(round1, [], debates);
    expect(result.unresolvedConcerns).toBeUndefined();
  });

  it("works without debateHistories parameter", () => {
    const round1 = [
      makeRound1Result({ verdict: "GO" }),
      makeRound1Result({ role: "cfo", verdict: "NOT_VIABLE" }),
    ];

    const result = synthesize(round1, []);
    expect(result.unresolvedConcerns).toBeUndefined();
    expect(result.collectiveVerdict).toBeDefined();
  });
});
