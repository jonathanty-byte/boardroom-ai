/**
 * Core types for the BoardRoom AI engine.
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
  | CpoVerdict
  | CmoVerdict
  | CfoVerdict
  | CroVerdict
  | CcoVerdict
  | CtoVerdict;

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
  unresolvedConcerns?: string[];
}

export interface AnalysisInput {
  content: string;
  ceoVision?: string;
  apiKey: string;
  model?: string;
}

export interface BoardroomReport {
  projectName: string;
  timestamp: string;
  ceoVision: string;
  round1: Round1Result[];
  frictions: FrictionPoint[];
  round2: Round2Result[];
  synthesis: Synthesis;
  totalDurationMs: number;
  debates?: DebateHistory[];
  ceoFollowUp?: CEOFollowUpQuestion[];
  finalVerdict?: CEOFinalVerdict;
  ceoAnswers?: string;
}

export interface BoardMemberConfig {
  role: BoardMemberRole;
  name: string;
  title: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// === V0.2 DEBATE ENGINE TYPES ===

/** A single turn in the multi-turn debate. */
export interface DebateTurn {
  turnNumber: number;
  speaker: BoardMemberRole;
  addressedTo: BoardMemberRole[];
  type: "CHALLENGE" | "RESPONSE" | "COUNTER" | "CONCESSION";
  content: string;
  quotedFrom?: string;
  positionShift: "UNCHANGED" | "SOFTENED" | "REVERSED";
}

/** A moderator decision: who speaks next and whether the debate continues. */
export interface ModeratorAction {
  action: "ASK_QUESTION" | "DECLARE_CONVERGENCE" | "DECLARE_IMPASSE";
  targetMember?: BoardMemberRole;
  question?: string;
  reasoning: string;
  convergenceSummary?: string;
}

/** Complete history of a debate on one friction point. */
export interface DebateHistory {
  frictionIndex: number;
  friction: FrictionPoint;
  moderatorOpening: string;
  turns: DebateTurn[];
  outcome: "CONVERGED" | "IMPASSE" | "MAX_TURNS_REACHED";
  outcomeSummary: string;
  totalTurns: number;
  durationMs: number;
}

// === CEO FOLLOW-UP TYPES ===

export interface CEOFollowUpQuestion {
  id: number;
  question: string;
  source: "challenge" | "debate_unresolved";
  fromMember: BoardMemberRole;
  frictionIndex?: number;
}

/** Final verdict produced after CEO answers follow-up questions. */
export interface CEOFinalVerdict {
  collectiveVerdict: CollectiveVerdict;
  reasoning: string;
  keyActions: string[];
  risks: string[];
  nextSteps: string[];
}

// SSE event types for streaming to frontend
export type SSEEvent =
  | { type: "state_change"; state: string }
  | { type: "member_chunk"; role: BoardMemberRole; chunk: string }
  | { type: "member_complete"; role: BoardMemberRole; result: Round1Output }
  | { type: "frictions_detected"; frictions: FrictionPoint[] }
  // Legacy Round 2 events (kept for backward compat)
  | { type: "debate_chunk"; role: BoardMemberRole; chunk: string }
  | { type: "debate_complete"; role: BoardMemberRole; result: Round2Response }
  // V0.2 debate events
  | { type: "moderator_action"; frictionIndex: number; action: ModeratorAction }
  | {
      type: "debate_turn_start";
      frictionIndex: number;
      turnNumber: number;
      speaker: BoardMemberRole;
    }
  | { type: "debate_turn_chunk"; frictionIndex: number; speaker: BoardMemberRole; chunk: string }
  | { type: "debate_turn_complete"; frictionIndex: number; turn: DebateTurn }
  | { type: "debate_resolved"; frictionIndex: number; history: DebateHistory }
  | { type: "synthesis_complete"; synthesis: Synthesis }
  | { type: "ceo_followup"; questions: CEOFollowUpQuestion[] }
  | { type: "final_verdict_start" }
  | { type: "final_verdict_chunk"; chunk: string }
  | { type: "final_verdict_complete"; verdict: CEOFinalVerdict }
  | { type: "analysis_complete"; report: BoardroomReport }
  | { type: "error"; message: string };
