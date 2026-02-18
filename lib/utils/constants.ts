export const RECOMMENDED_MODELS = [
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    description: "Default - excellent quality, very affordable",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    description: "Premium - best reasoning",
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    description: "Ultra - highest quality",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
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
