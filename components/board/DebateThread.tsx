"use client";

import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import { useMemo } from "react";
import type { DebateThreadState } from "@/lib/hooks/useAnalysisState";
import { useT } from "@/lib/i18n/LanguageContext";
import { MEMBER_COLORS } from "@/lib/utils/constants";

interface DebateThreadProps {
  thread: DebateThreadState;
  frictionDescription: string;
}

export function DebateThread({ thread, frictionDescription }: DebateThreadProps) {
  const { t, locale } = useT();

  const TURN_TYPE_LABELS = useMemo<Record<string, { label: string; color: string }>>(
    () => ({
      CHALLENGE: { label: t("debate.challenge"), color: "#ef4444" },
      RESPONSE: { label: t("debate.response"), color: "#3b82f6" },
      COUNTER: { label: t("debate.counter"), color: "#f59e0b" },
      CONCESSION: { label: t("debate.concession"), color: "#22c55e" },
    }),
    [locale, t],
  );

  const POSITION_SHIFT_LABELS = useMemo<Record<string, { label: string; color: string }>>(
    () => ({
      UNCHANGED: { label: t("debate.holds"), color: "#6b7280" },
      SOFTENED: { label: t("debate.softened"), color: "#f59e0b" },
      REVERSED: { label: t("debate.reversed"), color: "#22c55e" },
    }),
    [locale, t],
  );

  const OUTCOME_STYLES = useMemo<Record<string, { label: string; color: string }>>(
    () => ({
      CONVERGED: { label: t("debate.converged"), color: "#22c55e" },
      IMPASSE: { label: t("debate.impasse"), color: "#ef4444" },
      MAX_TURNS_REACHED: { label: t("debate.maxTurns"), color: "#f59e0b" },
    }),
    [locale, t],
  );

  return (
    <div data-testid={`debate-thread-${thread.frictionIndex}`} className="dialogue-box p-4 mb-4">
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

      {/* Currently streaming turn or thinking indicator */}
      {thread.currentSpeaker && (
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
            {thread.currentStreamedText ? (
              <p className="font-[family-name:var(--font-terminal)] text-base text-gray-400">
                <span className="cursor-blink">{thread.currentStreamedText.slice(-300)}</span>
              </p>
            ) : (
              <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500 animate-pulse">
                {t("debate.thinking")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Moderator thinking indicator (between turns, no speaker active, not resolved) */}
      {!thread.currentSpeaker &&
        !thread.outcome &&
        thread.status === "in_progress" &&
        thread.turns.length > 0 && (
          <div className="flex gap-3 mb-3">
            <div className="w-1 flex-shrink-0 rounded-sm bg-[var(--color-dbz-gold)] animate-pulse" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[var(--color-dbz-gold)] tracking-wider">
                {t("debate.moderator")}
              </span>
              <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500 animate-pulse">
                {t("debate.evaluating")}
              </p>
            </div>
          </div>
        )}

      {/* Outcome banner */}
      {thread.outcome && (
        <div
          data-testid={`debate-outcome-${thread.frictionIndex}`}
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
  const { t } = useT();
  return (
    <div className="flex gap-3 mb-3">
      <div className="w-1 flex-shrink-0 rounded-sm bg-[var(--color-dbz-gold)]" />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-[var(--color-dbz-gold)] tracking-wider">
          {t("debate.moderator")}
        </span>
        <p className="font-[family-name:var(--font-terminal)] text-base text-gray-400 italic">
          {text}
        </p>
      </div>
    </div>
  );
}
