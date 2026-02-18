"use client";

import type {
  BoardMemberRole,
  BoardroomReport,
  DebateHistory,
  DebateTurn,
  FrictionPoint,
  ModeratorAction,
  Round1Output,
  Round2Response,
  SSEEvent,
  Synthesis,
} from "@boardroom/engine";
import { useReducer } from "react";

export type AnalysisPhase =
  | "idle"
  | "round1"
  | "frictions"
  | "round2"
  | "synthesis"
  | "complete"
  | "error";

export interface MemberState {
  status: "waiting" | "analyzing" | "complete";
  streamedText: string;
  result: Round1Output | null;
}

export interface DebateState {
  status: "waiting" | "debating" | "complete";
  streamedText: string;
  result: Round2Response | null;
}

// V0.2: Multi-turn debate thread state
export interface DebateThreadState {
  frictionIndex: number;
  status: "waiting" | "in_progress" | "resolved";
  moderatorActions: ModeratorAction[];
  turns: Array<{ turn: DebateTurn; status: "streaming" | "complete" }>;
  currentSpeaker: BoardMemberRole | null;
  currentStreamedText: string;
  outcome: DebateHistory["outcome"] | null;
  outcomeSummary: string;
}

export interface AnalysisState {
  phase: AnalysisPhase;
  members: Record<BoardMemberRole, MemberState>;
  frictions: FrictionPoint[];
  debates: Record<BoardMemberRole, DebateState>;
  debateThreads: DebateThreadState[];
  synthesis: Synthesis | null;
  report: BoardroomReport | null;
  error: string | null;
}

const ALL_ROLES: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];

function createInitialMemberState(): Record<BoardMemberRole, MemberState> {
  const members = {} as Record<BoardMemberRole, MemberState>;
  for (const role of ALL_ROLES) {
    members[role] = { status: "waiting", streamedText: "", result: null };
  }
  return members;
}

function createInitialDebateState(): Record<BoardMemberRole, DebateState> {
  const debates = {} as Record<BoardMemberRole, DebateState>;
  for (const role of ALL_ROLES) {
    debates[role] = { status: "waiting", streamedText: "", result: null };
  }
  return debates;
}

export const initialState: AnalysisState = {
  phase: "idle",
  members: createInitialMemberState(),
  frictions: [],
  debates: createInitialDebateState(),
  debateThreads: [],
  synthesis: null,
  report: null,
  error: null,
};

type Action = { type: "RESET" } | { type: "START" } | { type: "SSE_EVENT"; event: SSEEvent };

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "RESET":
      return {
        ...initialState,
        members: createInitialMemberState(),
        debates: createInitialDebateState(),
      };

    case "START":
      return {
        ...initialState,
        phase: "round1",
        members: createInitialMemberState(),
        debates: createInitialDebateState(),
      };

    case "SSE_EVENT":
      return handleSSEEvent(state, action.event);

    default:
      return state;
  }
}

function handleSSEEvent(state: AnalysisState, event: SSEEvent): AnalysisState {
  switch (event.type) {
    case "state_change": {
      const phaseMap: Record<string, AnalysisPhase> = {
        ROUND1_RUNNING: "round1",
        IDENTIFYING_FRICTIONS: "frictions",
        ROUND2_RUNNING: "round2",
        DEBATE_RUNNING: "round2",
        SYNTHESIZING: "synthesis",
      };
      return { ...state, phase: phaseMap[event.state] ?? state.phase };
    }

    case "member_chunk": {
      const member = state.members[event.role];
      return {
        ...state,
        members: {
          ...state.members,
          [event.role]: {
            ...member,
            status: "analyzing",
            streamedText: member.streamedText + event.chunk,
          },
        },
      };
    }

    case "member_complete":
      return {
        ...state,
        members: {
          ...state.members,
          [event.role]: {
            status: "complete",
            streamedText: "",
            result: event.result,
          },
        },
      };

    case "frictions_detected":
      return { ...state, frictions: event.frictions };

    // Legacy Round 2 events (backward compat)
    case "debate_chunk": {
      const debate = state.debates[event.role];
      return {
        ...state,
        debates: {
          ...state.debates,
          [event.role]: {
            ...debate,
            status: "debating",
            streamedText: debate.streamedText + event.chunk,
          },
        },
      };
    }

    case "debate_complete":
      return {
        ...state,
        debates: {
          ...state.debates,
          [event.role]: {
            status: "complete",
            streamedText: "",
            result: event.result,
          },
        },
      };

    // V0.2 debate events
    case "moderator_action":
      return updateDebateThread(state, event.frictionIndex, (thread) => ({
        ...thread,
        status: "in_progress",
        moderatorActions: [...thread.moderatorActions, event.action],
      }));

    case "debate_turn_start":
      return updateDebateThread(state, event.frictionIndex, (thread) => ({
        ...thread,
        status: "in_progress",
        currentSpeaker: event.speaker,
        currentStreamedText: "",
      }));

    case "debate_turn_chunk":
      return updateDebateThread(state, event.frictionIndex, (thread) => ({
        ...thread,
        currentStreamedText: thread.currentStreamedText + event.chunk,
      }));

    case "debate_turn_complete":
      return updateDebateThread(state, event.frictionIndex, (thread) => ({
        ...thread,
        turns: [...thread.turns, { turn: event.turn, status: "complete" as const }],
        currentSpeaker: null,
        currentStreamedText: "",
      }));

    case "debate_resolved":
      return updateDebateThread(state, event.frictionIndex, (thread) => ({
        ...thread,
        status: "resolved",
        outcome: event.history.outcome,
        outcomeSummary: event.history.outcomeSummary,
      }));

    case "synthesis_complete":
      return { ...state, synthesis: event.synthesis };

    case "analysis_complete":
      return { ...state, phase: "complete", report: event.report };

    case "error":
      return { ...state, phase: "error", error: event.message };

    default:
      return state;
  }
}

function updateDebateThread(
  state: AnalysisState,
  frictionIndex: number,
  updater: (thread: DebateThreadState) => DebateThreadState,
): AnalysisState {
  const threads = [...state.debateThreads];
  // Ensure thread exists for this friction index
  while (threads.length <= frictionIndex) {
    threads.push(createEmptyThread(threads.length));
  }
  threads[frictionIndex] = updater(threads[frictionIndex]);
  return { ...state, debateThreads: threads };
}

function createEmptyThread(frictionIndex: number): DebateThreadState {
  return {
    frictionIndex,
    status: "waiting",
    moderatorActions: [],
    turns: [],
    currentSpeaker: null,
    currentStreamedText: "",
    outcome: null,
    outcomeSummary: "",
  };
}

export function useAnalysisState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    start: () => dispatch({ type: "START" }),
    reset: () => dispatch({ type: "RESET" }),
    handleEvent: (event: SSEEvent) => dispatch({ type: "SSE_EVENT", event }),
  };
}
