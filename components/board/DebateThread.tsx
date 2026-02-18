"use client";

import type { BoardMemberRole } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import type { DebateThreadState } from "@/lib/hooks/useAnalysisState";

const MEMBER_COLORS: Record<BoardMemberRole, string> = {
  cpo: "#FF6B00",
  cmo: "#2196F3",
  cfo: "#4CAF50",
  cro: "#9C27B0",
  cco: "#F44336",
  cto: "#00BCD4",
};

const TURN_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CHALLENGE: { label: "CHALLENGE", color: "#ef4444" },
  RESPONSE: { label: "RESPONSE", color: "#3b82f6" },
  COUNTER: { label: "COUNTER", color: "#f59e0b" },
  CONCESSION: { label: "CONCESSION", color: "#22c55e" },
};

const POSITION_SHIFT_LABELS: Record<string, { label: string; color: string }> = {
  UNCHANGED: { label: "HOLDS", color: "#6b7280" },
  SOFTENED: { label: "SOFTENED", color: "#f59e0b" },
  REVERSED: { label: "REVERSED", color: "#22c55e" },
};

const OUTCOME_STYLES: Record<string, { label: string; color: string }> = {
  CONVERGED: { label: "CONVERGENCE REACHED", color: "#22c55e" },
  IMPASSE: { label: "IMPASSE — CEO MUST DECIDE", color: "#ef4444" },
  MAX_TURNS_REACHED: { label: "MAX TURNS — NO RESOLUTION", color: "#f59e0b" },
};

interface DebateThreadProps {
  thread: DebateThreadState;
  frictionDescription: string;
}

export function DebateThread({ thread, frictionDescription }: DebateThreadProps) {
  return (
    <div className="dialogue-box p-4 mb-4">
      {/* Friction header */}
      <div className="text-[10px] text-[var(--color-dbz-gold)] font-bold mb-3 tracking-wider">
        {frictionDescription}
      </div>

      {/* Moderator opening */}
      {thread.moderatorActions.length > 0 && thread.moderatorActions[0].question && (
        <ModeratorBubble text={thread.moderatorActions[0].question} />
      )}

      {/* Debate turns */}
      {thread.turns.map(({ turn }, i) => {
        const color = MEMBER_COLORS[turn.speaker] ?? "#6b7280";
        const name = BOARD_MEMBER_NAMES[turn.speaker] ?? turn.speaker;
        const turnType = TURN_TYPE_LABELS[turn.type] ?? TURN_TYPE_LABELS.RESPONSE;
        const shift = POSITION_SHIFT_LABELS[turn.positionShift] ?? POSITION_SHIFT_LABELS.UNCHANGED;

        // Find the moderator question that preceded this turn
        const modAction = thread.moderatorActions[i + 1];

        return (
          <div key={i}>
            {/* Member turn */}
            <div className="flex gap-3 mb-3">
              {/* Avatar bar */}
              <div className="w-1 flex-shrink-0 rounded-sm" style={{ backgroundColor: color }} />

              <div className="flex-1 min-w-0">
                {/* Speaker header */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color }}>
                    {name}
                  </span>
                  <span
                    className="text-[7px] font-bold px-1.5 py-0.5 tracking-wider"
                    style={{
                      color: "#000",
                      backgroundColor: turnType.color,
                    }}
                  >
                    {turnType.label}
                  </span>
                  {turn.positionShift !== "UNCHANGED" && (
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 tracking-wider"
                      style={{
                        color: "#000",
                        backgroundColor: shift.color,
                      }}
                    >
                      {shift.label}
                    </span>
                  )}
                </div>

                {/* Quoted text */}
                {turn.quotedFrom && (
                  <div
                    className="text-gray-500 text-sm italic border-l-2 pl-2 mb-1 font-[family-name:var(--font-terminal)]"
                    style={{ borderColor: "#4a4a6a" }}
                  >
                    &ldquo;{turn.quotedFrom}&rdquo;
                  </div>
                )}

                {/* Content */}
                <p className="font-[family-name:var(--font-terminal)] text-base text-gray-300">
                  {turn.content}
                </p>
              </div>
            </div>

            {/* Moderator follow-up question (if any) */}
            {modAction?.question && modAction.action === "ASK_QUESTION" && (
              <ModeratorBubble text={modAction.question} />
            )}
          </div>
        );
      })}

      {/* Currently streaming turn */}
      {thread.currentSpeaker && thread.currentStreamedText && (
        <div className="flex gap-3 mb-3">
          <div
            className="w-1 flex-shrink-0 rounded-sm animate-pulse"
            style={{ backgroundColor: MEMBER_COLORS[thread.currentSpeaker] ?? "#6b7280" }}
          />
          <div className="flex-1 min-w-0">
            <span
              className="text-[10px] font-bold"
              style={{ color: MEMBER_COLORS[thread.currentSpeaker] ?? "#6b7280" }}
            >
              {BOARD_MEMBER_NAMES[thread.currentSpeaker] ?? thread.currentSpeaker}
            </span>
            <p className="font-[family-name:var(--font-terminal)] text-base text-gray-400">
              <span className="cursor-blink">{thread.currentStreamedText.slice(-300)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Outcome banner */}
      {thread.outcome && (
        <div
          className="mt-3 p-2 text-center border"
          style={{
            borderColor: OUTCOME_STYLES[thread.outcome]?.color ?? "#6b7280",
            backgroundColor: `${OUTCOME_STYLES[thread.outcome]?.color ?? "#6b7280"}10`,
          }}
        >
          <div
            className="text-[9px] font-bold tracking-widest mb-1"
            style={{ color: OUTCOME_STYLES[thread.outcome]?.color }}
          >
            {OUTCOME_STYLES[thread.outcome]?.label ?? thread.outcome}
          </div>
          {thread.outcomeSummary && (
            <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-400">
              {thread.outcomeSummary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ModeratorBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="w-1 flex-shrink-0 rounded-sm bg-[var(--color-dbz-gold)]" />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-[var(--color-dbz-gold)] tracking-wider">
          MODERATOR
        </span>
        <p className="font-[family-name:var(--font-terminal)] text-base text-gray-400 italic">
          {text}
        </p>
      </div>
    </div>
  );
}
