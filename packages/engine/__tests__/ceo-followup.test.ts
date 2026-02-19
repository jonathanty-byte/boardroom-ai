import { describe, expect, it } from "vitest";
import { extractCEOFollowUp } from "../src/ceo-followup";
import { makeDebateHistory, makeFriction, makeRound1Result } from "./fixtures";

describe("extractCEOFollowUp", () => {
  it("returns [] when all debates converged", () => {
    const round1 = [
      makeRound1Result({ role: "cpo", name: "Vegeta" }),
      makeRound1Result({ role: "cfo", name: "Piccolo" }),
    ];
    const debates = [makeDebateHistory({ outcome: "CONVERGED" })];

    expect(extractCEOFollowUp(round1, debates)).toEqual([]);
  });

  it("returns [] when there are no debates", () => {
    const round1 = [makeRound1Result({ role: "cpo", name: "Vegeta" })];

    expect(extractCEOFollowUp(round1, [])).toEqual([]);
  });

  it("extracts challenges from members in an IMPASSE debate", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["Who is the target user?", "What is the pricing model?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["What are the unit economics?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Vegeta and Piccolo disagree on viability.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions.some((q) => q.question.includes("target user"))).toBe(true);
    expect(questions.some((q) => q.question.includes("unit economics"))).toBe(true);
    expect(questions.some((q) => q.source === "debate_unresolved")).toBe(true);
  });

  it("extracts challenges from members in a MAX_TURNS_REACHED debate", () => {
    const round1 = [
      makeRound1Result({
        role: "cmo",
        name: "Bulma",
        challenges: ["Where is the distribution channel?"],
      }),
      makeRound1Result({
        role: "cto",
        name: "Trunks",
        challenges: ["Is the tech stack realistic?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "MAX_TURNS_REACHED",
        outcomeSummary: "No resolution on technical feasibility vs marketing.",
        friction: makeFriction({ members: ["cmo", "cto"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions.some((q) => q.question.includes("distribution channel"))).toBe(true);
  });

  it("limits to 5 questions max", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["Q1?", "Q2?", "Q3?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["Q4?", "Q5?", "Q6?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Total disagreement.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    expect(questions.length).toBeLessThanOrEqual(5);
  });

  it("prioritizes IMPASSE over MAX_TURNS_REACHED", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["IMPASSE question from CPO?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["IMPASSE question from CFO?"],
      }),
      makeRound1Result({
        role: "cmo",
        name: "Bulma",
        challenges: ["MAX_TURNS question from CMO?"],
      }),
      makeRound1Result({
        role: "cto",
        name: "Trunks",
        challenges: ["MAX_TURNS question from CTO?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        frictionIndex: 1,
        outcome: "MAX_TURNS_REACHED",
        outcomeSummary: "No resolution.",
        friction: makeFriction({ members: ["cmo", "cto"] }),
      }),
      makeDebateHistory({
        frictionIndex: 0,
        outcome: "IMPASSE",
        outcomeSummary: "Total impasse.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    // First questions should come from the IMPASSE debate (cpo/cfo)
    expect(questions[0].fromMember).toMatch(/^(cpo|cfo)$/);
  });

  it("includes questions from non-debating members with negative sentiment", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["CPO challenge?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["CFO challenge?"],
      }),
      // Non-debating member with negative verdict
      makeRound1Result({
        role: "cto",
        name: "Trunks",
        verdict: "UNREALISTIC",
        challenges: ["Is the tech stack viable at this scale?"],
      }),
      // Non-debating member with negative verdict
      makeRound1Result({
        role: "cro",
        name: "Whis",
        verdict: "HYPOTHESIS_ONLY",
        challenges: ["Where is the evidence for market demand?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Disagreement on viability.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    // Should include questions from non-debating negative members
    expect(questions.some((q) => q.fromMember === "cto")).toBe(true);
    expect(questions.some((q) => q.fromMember === "cro")).toBe(true);
  });

  it("excludes non-debating members with positive sentiment", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["CPO question?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["CFO question?"],
      }),
      // Non-debating member with positive verdict — should be excluded
      makeRound1Result({
        role: "cmo",
        name: "Bulma",
        verdict: "GO",
        challenges: ["Marketing question?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Disagreement.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    // CMO is positive (GO), so should NOT contribute silent-member questions
    const cmoQuestions = questions.filter((q) => q.fromMember === "cmo");
    expect(cmoQuestions.length).toBe(0);
  });

  it("respects max 3 debater + max 2 silent-member split", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["D1?", "D2?", "D3?", "D4?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["D5?", "D6?"],
      }),
      makeRound1Result({
        role: "cto",
        name: "Trunks",
        verdict: "UNREALISTIC",
        challenges: ["S1?", "S2?", "S3?"],
      }),
      makeRound1Result({
        role: "cro",
        name: "Whis",
        verdict: "HYPOTHESIS_ONLY",
        challenges: ["S4?", "S5?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Total disagreement.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    const silentQs = questions.filter((q) => q.fromMember === "cto" || q.fromMember === "cro");
    // Silent questions should be at most 2
    expect(silentQs.length).toBeLessThanOrEqual(2);
    expect(questions.length).toBeLessThanOrEqual(5);
    // Should have at least one silent member question
    expect(silentQs.length).toBeGreaterThanOrEqual(1);
  });

  it("deduplicates questions with identical prefixes", () => {
    const round1 = [
      makeRound1Result({
        role: "cpo",
        name: "Vegeta",
        challenges: ["Who is the target user for this product?"],
      }),
      makeRound1Result({
        role: "cfo",
        name: "Piccolo",
        challenges: ["Who is the target user and how much will they pay?"],
      }),
    ];
    const debates = [
      makeDebateHistory({
        outcome: "IMPASSE",
        outcomeSummary: "Disagreement.",
        friction: makeFriction({ members: ["cpo", "cfo"] }),
      }),
    ];

    const questions = extractCEOFollowUp(round1, debates);
    const targetUserQs = questions.filter((q) =>
      q.question.toLowerCase().startsWith("who is the target user"),
    );
    expect(targetUserQs.length).toBe(1);
  });
});
