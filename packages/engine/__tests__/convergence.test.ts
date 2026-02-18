import { describe, expect, it } from "vitest";
import { analyzeConvergence } from "../src/convergence";
import { makeDebateTurn } from "./fixtures";

describe("analyzeConvergence", () => {
  it("detects position shift when SOFTENED is present", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1, positionShift: "UNCHANGED" }),
      makeDebateTurn({ turnNumber: 2, positionShift: "SOFTENED" }),
    ];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.hasPositionShift).toBe(true);
  });

  it("detects position shift when REVERSED is present", () => {
    const turns = [makeDebateTurn({ turnNumber: 1, positionShift: "REVERSED" })];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.hasPositionShift).toBe(true);
  });

  it("reports no position shift when all UNCHANGED", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1, positionShift: "UNCHANGED" }),
      makeDebateTurn({ turnNumber: 2, positionShift: "UNCHANGED" }),
    ];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.hasPositionShift).toBe(false);
  });

  it("detects allUnchanged when last 2 turns are UNCHANGED", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1, positionShift: "SOFTENED" }),
      makeDebateTurn({ turnNumber: 2, positionShift: "UNCHANGED" }),
      makeDebateTurn({ turnNumber: 3, positionShift: "UNCHANGED" }),
    ];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.allUnchanged).toBe(true);
  });

  it("allUnchanged is false with fewer than 2 turns", () => {
    const turns = [makeDebateTurn({ turnNumber: 1, positionShift: "UNCHANGED" })];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.allUnchanged).toBe(false);
  });

  it("counts concessions correctly", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1, type: "CONCESSION", positionShift: "REVERSED" }),
      makeDebateTurn({ turnNumber: 2, type: "RESPONSE", positionShift: "SOFTENED" }),
      makeDebateTurn({ turnNumber: 3, type: "CHALLENGE", positionShift: "UNCHANGED" }),
    ];
    const signals = analyzeConvergence(turns, 5);
    // Turn 1: CONCESSION + REVERSED = 1 (deduped by filter logic: matches both conditions but counted once)
    // Turn 2: SOFTENED = 1
    // Turn 3: nothing
    expect(signals.concessionCount).toBe(2);
  });

  it("calculates turnsRemaining correctly", () => {
    const turns = [makeDebateTurn({ turnNumber: 1 }), makeDebateTurn({ turnNumber: 2 })];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.turnsRemaining).toBe(3);
  });

  it("detects argument repetition from same speaker", () => {
    const repeatedContent = "The market data clearly shows strong demand for this product segment";
    const turns = [
      makeDebateTurn({ turnNumber: 1, speaker: "cpo", content: repeatedContent }),
      makeDebateTurn({ turnNumber: 2, speaker: "cfo", content: "Unit economics are broken." }),
      makeDebateTurn({ turnNumber: 3, speaker: "cpo", content: repeatedContent }),
    ];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.argumentsRepeating).toBe(true);
  });

  it("does not flag repetition with fewer than 3 turns", () => {
    const turns = [
      makeDebateTurn({ turnNumber: 1, speaker: "cpo", content: "Same argument" }),
      makeDebateTurn({ turnNumber: 2, speaker: "cpo", content: "Same argument" }),
    ];
    const signals = analyzeConvergence(turns, 5);
    expect(signals.argumentsRepeating).toBe(false);
  });

  it("does not flag repetition from different speakers", () => {
    const content = "The market data supports this position clearly";
    const turns = [
      makeDebateTurn({ turnNumber: 1, speaker: "cpo", content }),
      makeDebateTurn({ turnNumber: 2, speaker: "cfo", content: "Different argument here." }),
      makeDebateTurn({ turnNumber: 3, speaker: "cfo", content }),
    ];
    const signals = analyzeConvergence(turns, 5);
    // cfo has no previous turn with same content (only 1 previous turn from cfo)
    // but turn 2 is different from turn 3, so no repetition
    expect(signals.argumentsRepeating).toBe(false);
  });
});
