/**
 * Core types for the COMEX web engine.
 * Adapted from ai-decision-engine for OpenRouter + streaming.
 */

export type BoardMemberRole = "cpo" | "cmo" | "cfo" | "cro" | "cco" | "cto";

export const BOARD_MEMBER_NAMES: Record<BoardMemberRole, string> = {
  cpo: "Vegeta",
  cmo: "Bulma",
  cfo: "Piccolo",
  cro: "Whis",
  cco: "Gohan",
  cto: "Trunks",
};

export const BOARD_MEMBER_TITLES: Record<BoardMemberRole, string> = {
  cpo: "Chief Product Officer",
  cmo: "Chief Marketing Officer",
  cfo: "Chief Financial Officer",
  cro: "Chief Research Officer",
  cco: "Chief Creative Officer",
  cto: "Chief Technology Officer",
};

export type CpoVerdict = "GO" | "GO_WITH_CHANGES" | "RETHINK";
export type CmoVerdict = "GO" | "GO_WITH_CHANGES" | "RETHINK";
export type CfoVerdict = "VIABLE" | "VIABLE_WITH_ADJUSTMENTS" | "NOT_VIABLE";
export type CroVerdict = "VALIDATED" | "NEEDS_RESEARCH" | "HYPOTHESIS_ONLY";
export type CcoVerdict = "SHIP_IT" | "NEEDS_DESIGN_DIRECTION" | "WILL_FEEL_GENERIC";
export type CtoVerdict = "FEASIBLE" | "FEASIBLE_WITH_CUTS" | "UNREALISTIC";

export type AnyVerdict =
  | CpoVerdict | CmoVerdict | CfoVerdict
  | CroVerdict | CcoVerdict | CtoVerdict;

export type CollectiveVerdict = "GO" | "GO_WITH_CHANGES" | "RETHINK";

export interface Round1Output {
  role: BoardMemberRole;
  name: string;
  analysis: string;
  challenges: string[];
  verdict: AnyVerdict;
  verdictDetails: Record<string, string>;
}

export interface Round1Result {
  output: Round1Output;
  durationMs: number;
}

export interface FrictionPoint {
  description: string;
  members: BoardMemberRole[];
  positions: Partial<Record<BoardMemberRole, string>>;
}

export interface Round2Response {
  role: BoardMemberRole;
  position: "MAINTAIN" | "CONCEDE" | "COMPROMISE";
  argument: string;
  condition: string;
}

export interface Round2Result {
  output: Round2Response;
  durationMs: number;
}

export interface Synthesis {
  consensus: string[];
  compromises: string[];
  impasses: string[];
  collectiveVerdict: CollectiveVerdict;
}

export interface AnalysisInput {
  content: string;
  ceoVision?: string;
  apiKey: string;
  model?: string;
}

export interface CostratReport {
  projectName: string;
  timestamp: string;
  ceoVision: string;
  round1: Round1Result[];
  frictions: FrictionPoint[];
  round2: Round2Result[];
  synthesis: Synthesis;
  totalDurationMs: number;
}

export interface BoardMemberConfig {
  role: BoardMemberRole;
  name: string;
  title: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// SSE event types for streaming to frontend
export type SSEEvent =
  | { type: "state_change"; state: string }
  | { type: "member_chunk"; role: BoardMemberRole; chunk: string }
  | { type: "member_complete"; role: BoardMemberRole; result: Round1Output }
  | { type: "frictions_detected"; frictions: FrictionPoint[] }
  | { type: "debate_chunk"; role: BoardMemberRole; chunk: string }
  | { type: "debate_complete"; role: BoardMemberRole; result: Round2Response }
  | { type: "synthesis_complete"; synthesis: Synthesis }
  | { type: "analysis_complete"; report: CostratReport }
  | { type: "error"; message: string };
