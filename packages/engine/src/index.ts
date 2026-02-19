// Config
export { boardMembers, getMemberConfig } from "./board-members";

// CEO follow-up
export { extractCEOFollowUp, runFinalVerdictFlow } from "./ceo-followup";

// V0.2 debate modules
export { analyzeConvergence } from "./convergence";
export { runDebateForFriction } from "./debate-engine";
export { runAnalysis } from "./engine-streaming";

// Engine functions
export { getSentiment, identifyFrictions } from "./friction";
export {
  buildDebateSystemPrompt,
  buildDebateTurnPrompt,
  buildModeratorNextActionPrompt,
  buildModeratorOpeningPrompt,
  MAX_DEBATE_TURNS,
  MODERATOR_CONFIG,
} from "./moderator";
export { StreamingAgentRunner } from "./runner-streaming";
export { synthesize } from "./synthesis";
export type {
  AnalysisInput,
  AnyVerdict,
  BoardMemberConfig,
  BoardMemberRole,
  BoardroomReport,
  CcoVerdict,
  CEOFinalVerdict,
  CEOFollowUpQuestion,
  CfoVerdict,
  CmoVerdict,
  CollectiveVerdict,
  CpoVerdict,
  CroVerdict,
  CtoVerdict,
  DebateHistory,
  DebateTurn,
  FrictionPoint,
  ModeratorAction,
  Round1Output,
  Round1Result,
  SSEEvent,
  Synthesis,
} from "./types";
// Constants
export { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "./types";
