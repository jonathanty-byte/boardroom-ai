// Types

// Config
export { boardMembers, getMemberConfig } from "./board-members";
export { runAnalysis } from "./engine-streaming";

// Engine functions
export { identifyFrictions } from "./friction";
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
  FrictionPoint,
  Round1Output,
  Round1Result,
  Round2Response,
  Round2Result,
  SSEEvent,
  Synthesis,
} from "./types";
// Constants
export { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "./types";
