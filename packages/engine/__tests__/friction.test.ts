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
    // gap is 1, below 1.5 threshold → fallback picks most divergent pair
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
    // gap is 0.5, below threshold → fallback
    expect(frictions.length).toBe(1);
  });

  it("merges contradictory pairs into multi-member frictions", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
      makeRound1Result({ role: "cco", name: "Gohan", verdict: "SHIP_IT" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "UNREALISTIC" }),
    ];

    const frictions = identifyFrictions(round1);
    // All contradictory pairs are connected → merged into 1 multi-member friction
    expect(frictions.length).toBe(1);
    // All 6 members involved in at least one contradictory pair
    expect(frictions[0].members.length).toBe(6);
    expect(frictions[0].members).toContain("cpo");
    expect(frictions[0].members).toContain("cfo");
    expect(frictions[0].members).toContain("cto");
  });

  it("fallback includes ALL members at max gap, not just first pair", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "RETHINK" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "RETHINK" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
      makeRound1Result({ role: "cco", name: "Gohan", verdict: "NEEDS_DESIGN_DIRECTION" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "FEASIBLE_WITH_CUTS" }),
    ];

    const frictions = identifyFrictions(round1);
    // Max gap = 1 between RETHINK/NOT_VIABLE (-1) and FEASIBLE_WITH_CUTS (0)
    // All 3 negative members + Trunks should be included
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toContain("cpo"); // Vegeta
    expect(frictions[0].members).toContain("cmo"); // Bulma
    expect(frictions[0].members).toContain("cfo"); // Piccolo
    expect(frictions[0].members).toContain("cto"); // Trunks
    // Whis and Gohan (-0.5) have gap 0.5 with Trunks, NOT max gap → excluded
    expect(frictions[0].members).not.toContain("cro");
    expect(frictions[0].members).not.toContain("cco");
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
    // All GO members pair with Trunks at max gap → all 6 included
    expect(frictions[0].members).toContain("cto");
    expect(frictions[0].members.length).toBe(6);
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

  it("creates separate frictions for disconnected contradiction groups", () => {
    // Two separate pairs with no shared members
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "RETHINK" }),
      makeRound1Result({ role: "cmo", name: "Bulma", verdict: "GO_WITH_CHANGES" }),
      makeRound1Result({ role: "cro", name: "Whis", verdict: "NEEDS_RESEARCH" }),
    ];

    const frictions = identifyFrictions(round1);
    // GO vs RETHINK (gap 2) → friction 1 (cpo, cfo)
    // GO vs NEEDS_RESEARCH (gap 1.5) → connected to friction 1 via cpo
    // So all 3 merge: cpo, cfo, cro (Bulma not in any contradictory pair)
    expect(frictions.length).toBe(1);
    expect(frictions[0].members).toContain("cpo");
    expect(frictions[0].members).toContain("cfo");
    expect(frictions[0].members).toContain("cro");
  });

  it("description shows sides separated by 'vs'", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta", verdict: "GO" }),
      makeRound1Result({ role: "cfo", name: "Piccolo", verdict: "NOT_VIABLE" }),
      makeRound1Result({ role: "cto", name: "Trunks", verdict: "UNREALISTIC" }),
    ];

    const frictions = identifyFrictions(round1);
    expect(frictions[0].description).toContain("Vegeta (GO)");
    expect(frictions[0].description).toContain("vs");
    expect(frictions[0].description).toContain("Piccolo (NOT_VIABLE)");
  });
});
