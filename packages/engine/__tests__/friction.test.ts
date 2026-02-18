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

  it("does NOT flag GO vs GO_WITH_CHANGES as strong (gap 1) — uses fallback", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO_WITH_CHANGES" }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toContain("cpo");
    expect(frictions[0].members).toContain("cmo");
  });

  it("does NOT flag GO_WITH_CHANGES vs NEEDS_RESEARCH as strong (gap 0.5)", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
    ];

    const frictions = identifyFrictions(round1);
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
    // Many contradictory pairs: GO vs NOT_VIABLE, GO vs UNREALISTIC, etc.
    expect(frictions.length).toBeGreaterThanOrEqual(4);
  });

  it("fallback picks randomly among tied max-gap pairs", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "RETHINK" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "RETHINK" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "FEASIBLE_WITH_CUTS" }),
    ];

    const frictions = identifyFrictions(round1);
    // Max gap = 1: RETHINK(-1) vs FEASIBLE_WITH_CUTS(0) and NOT_VIABLE(-1) vs FEASIBLE_WITH_CUTS(0)
    // 3 candidate pairs: cpo-cto, cmo-cto, cfo-cto — one picked randomly
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toHaveLength(2);
    expect(frictions[0].members).toContain("cto"); // Trunks always in the pair
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

  it("puts the more positive member first in description", () => {
    const round1 = [
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
    ];

    const frictions = identifyFrictions(round1);
    // Vegeta (GO, +1) should come before Piccolo (NOT_VIABLE, -1)
    expect(frictions[0].description).toMatch(/^Vegeta.*vs.*Piccolo/);
  });
});
