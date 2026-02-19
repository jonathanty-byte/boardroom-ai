import { describe, expect, it } from "vitest";
import { StreamingAgentRunner } from "../src/runner-streaming";
import type { BoardMemberConfig } from "../src/types";

const runner = new StreamingAgentRunner("fake-key-for-testing");

const mockConfig: BoardMemberConfig = {
  role: "cpo",
  name: "Vegeta",
  title: "Chief Product Officer",
  systemPrompt: "",
  temperature: 0.8,
  maxTokens: 4096,
};

describe("extractJSON", () => {
  it("returns clean JSON as-is", () => {
    const input = '{"verdict": "GO", "analysis": "Looks good"}';
    const result = runner.extractJSON(input);
    expect(JSON.parse(result)).toEqual({ verdict: "GO", analysis: "Looks good" });
  });

  it("strips ```json fences", () => {
    const input = '```json\n{"verdict": "GO"}\n```';
    const result = runner.extractJSON(input);
    expect(JSON.parse(result)).toEqual({ verdict: "GO" });
  });

  it("extracts JSON from surrounding text", () => {
    const input = 'Here is my analysis:\n{"verdict": "RETHINK", "analysis": "Not good"}\nEnd.';
    const result = runner.extractJSON(input);
    expect(JSON.parse(result)).toEqual({ verdict: "RETHINK", analysis: "Not good" });
  });

  it("returns raw text when no JSON braces found", () => {
    const input = "This is just plain text with no JSON";
    const result = runner.extractJSON(input);
    expect(result).toBe(input);
  });
});

describe("parseRound1", () => {
  it("parses valid complete JSON", () => {
    const raw = JSON.stringify({
      name: "Vegeta",
      analysis: "Strong product-market fit.",
      challenges: ["Target user?", "Pricing?"],
      verdict: "GO",
      verdictDetails: {
        pointFort: "Clear value prop",
        recommandationConcrete: "Launch now",
      },
    });

    const result = runner.parseRound1(raw, mockConfig);
    expect(result.role).toBe("cpo");
    expect(result.name).toBe("Vegeta");
    expect(result.analysis).toBe("Strong product-market fit.");
    expect(result.challenges).toEqual(["Target user?", "Pricing?"]);
    expect(result.verdict).toBe("GO");
    expect(result.verdictDetails.pointFort).toBe("Clear value prop");
  });

  it("applies fallbacks for missing fields", () => {
    const raw = JSON.stringify({});

    const result = runner.parseRound1(raw, mockConfig);
    expect(result.role).toBe("cpo");
    expect(result.name).toBe("Vegeta"); // falls back to config.name
    expect(result.analysis).toBe("");
    expect(result.challenges).toEqual([]);
    expect(result.verdict).toBe("RETHINK"); // default fallback
    expect(result.verdictDetails).toEqual({});
  });

  it("throws on invalid JSON", () => {
    const raw = "This is not JSON at all, no braces anywhere";
    expect(() => runner.parseRound1(raw, mockConfig)).toThrow();
  });
});
