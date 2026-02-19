"use client";

import type { BoardMemberRole } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@boardroom/engine";
import { useState } from "react";
import { StreamingText } from "@/components/analysis/StreamingText";
import type { MemberState } from "@/lib/hooks/useAnalysisState";
import { MEMBER_AVATARS, MEMBER_COLORS } from "@/lib/utils/constants";
import { MemberDetail } from "./MemberDetail";
import { VerdictBadge } from "./VerdictBadge";

interface MemberCardProps {
  role: BoardMemberRole;
  state: MemberState;
}

export function MemberCard({ role, state }: MemberCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [imgError, setImgError] = useState(false);
  const name = BOARD_MEMBER_NAMES[role];
  const title = BOARD_MEMBER_TITLES[role];
  const color = MEMBER_COLORS[role];

  const isAnalyzing = state.status === "analyzing";
  const isComplete = state.status === "complete";

  return (
    <>
      <div
        data-testid={`member-card-${role}`}
        className={`char-card p-3 flex flex-col gap-2 min-h-[200px] transition-all duration-300 ${
          isAnalyzing ? "analyzing-glow" : ""
        } ${isComplete ? "cursor-pointer" : ""}`}
        onClick={() => isComplete && setShowDetail(true)}
        style={isComplete ? { borderColor: color } : undefined}
      >
        {/* Character Header */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-14 h-14 flex-shrink-0 pixel-border-sm flex items-center justify-center overflow-hidden"
            style={{ borderColor: color }}
          >
            {imgError ? (
              <span style={{ color, fontSize: 16, fontFamily: "var(--font-retro)" }}>
                {name[0]}
              </span>
            ) : (
              <img
                src={MEMBER_AVATARS[role]}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Name + Role */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold truncate" style={{ color }}>
              {name}
            </div>
            <div className="stat-label truncate">{role.toUpperCase()}</div>
            <div className="text-[7px] text-gray-500 truncate">{title}</div>
          </div>
        </div>

        {/* Power Bar (shows during analysis) */}
        {isAnalyzing && (
          <div>
            <div className="stat-label mb-1">ANALYZING...</div>
            <div className="power-bar-track">
              <div
                className="power-bar-fill"
                style={{ width: `${Math.min(95, state.streamedText.length / 20)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        {state.status === "waiting" && (
          <div className="flex-1 flex items-center justify-center">
            <span
              data-testid={`member-status-${role}`}
              className="text-[8px] text-gray-600 tracking-widest uppercase"
            >
              Standby
            </span>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 overflow-hidden dialogue-box p-2">
            <StreamingText text={state.streamedText} isStreaming={true} maxLines={3} />
          </div>
        )}

        {isComplete && state.result && (
          <div className="flex-1 flex flex-col gap-2">
            <VerdictBadge verdict={state.result.verdict} data-testid={`member-verdict-${role}`} />
            <p className="text-gray-400 line-clamp-3 font-[family-name:var(--font-terminal)] text-base leading-tight">
              {state.result.analysis.slice(0, 120)}...
            </p>
            <span className="text-[7px] text-gray-600 tracking-wider mt-auto">
              CLICK TO INSPECT
            </span>
          </div>
        )}
      </div>

      {showDetail && state.result && (
        <MemberDetail role={role} result={state.result} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
