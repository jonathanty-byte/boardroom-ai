// Config
export { boardMembers, getMemberConfig } from "./board-members";

// V0.2 debate modules
export { analyzeConvergence } from "./convergence";
export { flattenDebatesToRound2, runDebateForFriction } from "./debate-engine";
export { runAnalysis } from "./engine-streaming";

// Engine functions
export { identifyFrictions } from "./friction";
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
  Round2Response,
  Round2Result,
  SSEEvent,
  Synthesis,
} from "./types";
// Constants
export { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "./types";
