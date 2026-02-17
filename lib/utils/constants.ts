export const RECOMMENDED_MODELS = [
  {
    id: "anthropic/claude-sonnet-4-5-20250514",
    name: "Claude Sonnet 4.5",
    description: "Recommended - best quality/price",
  },
  {
    id: "anthropic/claude-haiku-3-5-20241022",
    name: "Claude Haiku 3.5",
    description: "Budget - fast and cheap",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Alternative - OpenAI",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    description: "Budget - very fast",
  },
];

export const VERDICT_COLORS: Record<string, string> = {
  // Positive (green)
  GO: "#22c55e",
  VIABLE: "#22c55e",
  VALIDATED: "#22c55e",
  SHIP_IT: "#22c55e",
  FEASIBLE: "#22c55e",
  // Middle (orange)
  GO_WITH_CHANGES: "#f59e0b",
  VIABLE_WITH_ADJUSTMENTS: "#f59e0b",
  NEEDS_RESEARCH: "#f59e0b",
  NEEDS_DESIGN_DIRECTION: "#f59e0b",
  FEASIBLE_WITH_CUTS: "#f59e0b",
  // Negative (red)
  RETHINK: "#ef4444",
  NOT_VIABLE: "#ef4444",
  HYPOTHESIS_ONLY: "#ef4444",
  WILL_FEEL_GENERIC: "#ef4444",
  UNREALISTIC: "#ef4444",
};

export function getVerdictColor(verdict: string): string {
  return VERDICT_COLORS[verdict] ?? "#6b7280";
}

export function getVerdictCategory(verdict: string): "positive" | "middle" | "negative" {
  if (["GO", "VIABLE", "VALIDATED", "SHIP_IT", "FEASIBLE"].includes(verdict)) return "positive";
  if (["RETHINK", "NOT_VIABLE", "HYPOTHESIS_ONLY", "WILL_FEEL_GENERIC", "UNREALISTIC"].includes(verdict)) return "negative";
  return "middle";
}
