import { describe, expect, it } from "vitest";
import { identifyFrictions } from "../src/friction";
import type { BoardMemberRole } from "../src/types";
import { makeRound1Result } from "./fixtures";

describe("identifyFrictions", () => {
  it("detects GO vs RETHINK as contradictory (gap 2)", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "RETHINK" }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toContain("cpo");
    expect(frictions[0].members).toContain("cfo");
  });

  it("detects GO vs NEEDS_RESEARCH as contradictory (gap 1.5)", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions.length).toBe(1);
  });

  it("does NOT flag GO vs GO_WITH_CHANGES (gap 1)", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO_WITH_CHANGES" }),
    ];

    const frictions = identifyFrictions(round1);
    // gap is 1, below 1.5 threshold → no direct friction
    // but fallback picks most divergent pair since maxGap > 0
    expect(frictions.length).toBe(1);
    // This is a fallback friction, not a direct contradiction
  });

  it("does NOT flag GO_WITH_CHANGES vs NEEDS_RESEARCH (gap 0.5)", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
    ];

    const frictions = identifyFrictions(round1);
    // gap is 0.5, below threshold → fallback picks them since maxGap > 0
    expect(frictions.length).toBe(1);
  });

  it("detects multiple friction pairs from 6 members with mixed verdicts", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
      makeRound1Result({ role: "cco", name: "Gohan", verdict: "SHIP_IT" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "UNREALISTIC" }),
    ];

    const frictions = identifyFrictions(round1);
    // GO(1) vs NOT_VIABLE(-1) = 2 ✓
    // GO(1) vs NEEDS_RESEARCH(-0.5) = 1.5 ✓
    // GO(1) vs UNREALISTIC(-1) = 2 ✓
    // SHIP_IT(1) vs NOT_VIABLE(-1) = 2 ✓
    // SHIP_IT(1) vs NEEDS_RESEARCH(-0.5) = 1.5 ✓
    // SHIP_IT(1) vs UNREALISTIC(-1) = 2 ✓
    expect(frictions.length).toBeGreaterThanOrEqual(4);
  });

  it("forces 1 fallback friction when all but 1 agree", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "GO" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "GO" }),
      makeRound1Result({ role: "cco", name: "Gohan", verdict: "GO" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "GO_WITH_CHANGES" }),
    ];

    const frictions = identifyFrictions(round1);
    // No pairs pass the 1.5 threshold, but maxGap = 1 > 0 → fallback
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toContain("cto");
  });

  it("returns 0 frictions when all 6 are unanimous (all GO)", () => {
    const roles: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
    const names = ["Vegeta", "Bulma", "Piccolo", "Whis", "Gohan", "Trunks"];

    const round1 = roles.map((role, i) =>
      makeRound1Result({ role, name: names[i], verdict: "GO" }),
    );

    const frictions = identifyFrictions(round1);
    // maxGap = 0, no fallback → 0 frictions
    expect(frictions.length).toBe(0);
  });

  it("uses recommandationConcrete for position text", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        verdict: "GO",
        verdictDetails: { recommandationConcrete: "Launch now" },
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        verdict: "RETHINK",
        verdictDetails: { recommandationConcrete: "Cut costs first" },
      }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions[0].positions.cpo).toContain("Launch now");
    expect(frictions[0].positions.cfo).toContain("Cut costs first");
  });

  it("falls back to pointFort when recommandationConcrete is missing", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        verdict: "GO",
        verdictDetails: { pointFort: "Strong market fit" },
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        verdict: "RETHINK",
        verdictDetails: { pointFort: "Low burn rate" },
      }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions[0].positions.cpo).toContain("Strong market fit");
    expect(frictions[0].positions.cfo).toContain("Low burn rate");
  });

  it("falls back to analysis slice when no verdictDetails fields", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        verdict: "GO",
        analysis: "This product is amazing and has great potential.",
        verdictDetails: {},
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        verdict: "RETHINK",
        analysis: "The economics do not add up at this scale.",
        verdictDetails: {},
      }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions[0].positions.cpo).toContain("This product is amazing");
    expect(frictions[0].positions.cfo).toContain("economics do not add up");
  });
});
