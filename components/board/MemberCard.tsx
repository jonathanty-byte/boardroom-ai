"use client";

import { useState } from "react";
import type { MemberState } from "@/lib/hooks/useAnalysisState";
import type { BoardMemberRole } from "@/lib/engine/types";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@/lib/engine/types";
import { VerdictBadge } from "./VerdictBadge";
import { StreamingText } from "@/components/analysis/StreamingText";
import { MemberDetail } from "./MemberDetail";

interface MemberCardProps {
  role: BoardMemberRole;
  state: MemberState;
}

const MEMBER_COLORS: Record<BoardMemberRole, string> = {
  cpo: "#FF6B00",  // Vegeta - fiery orange
  cmo: "#2196F3",  // Bulma - tech blue
  cfo: "#4CAF50",  // Piccolo - namekian green
  cro: "#9C27B0",  // Whis - divine purple
  cco: "#F44336",  // Gohan - power red
  cto: "#00BCD4",  // Trunks - future cyan
};

const MEMBER_AVATARS: Record<BoardMemberRole, string> = {
  cpo: "/avatars/vegeta.svg",
  cmo: "/avatars/bulma.svg",
  cfo: "/avatars/piccolo.svg",
  cro: "/avatars/whis.svg",
  cco: "/avatars/gohan.svg",
  cto: "/avatars/trunks.svg",
};

export function MemberCard({ role, state }: MemberCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const name = BOARD_MEMBER_NAMES[role];
  const title = BOARD_MEMBER_TITLES[role];
  const color = MEMBER_COLORS[role];

  const isAnalyzing = state.status === "analyzing";
  const isComplete = state.status === "complete";

  return (
    <>
      <div
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
            <img
              src={MEMBER_AVATARS[role]}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to colored initial if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `<span style="color:${color};font-size:16px;font-family:var(--font-retro)">${name[0]}</span>`;
              }}
            />
          </div>

          {/* Name + Role */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold truncate" style={{ color }}>
              {name}
            </div>
            <div className="stat-label truncate">
              {role.toUpperCase()}
            </div>
            <div className="text-[7px] text-gray-500 truncate">
              {title}
            </div>
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
            <span className="text-[8px] text-gray-600 tracking-widest uppercase">
              Standby
            </span>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 overflow-hidden dialogue-box p-2">
            <StreamingText
              text={state.streamedText}
              isStreaming={true}
              maxLines={3}
            />
          </div>
        )}

        {isComplete && state.result && (
          <div className="flex-1 flex flex-col gap-2">
            <VerdictBadge verdict={state.result.verdict} />
            <p className="text-[10px] text-gray-400 line-clamp-3 font-[family-name:var(--font-terminal)] text-sm leading-tight">
              {state.result.analysis.slice(0, 120)}...
            </p>
            <span className="text-[7px] text-gray-600 tracking-wider mt-auto">
              CLICK TO INSPECT
            </span>
          </div>
        )}
      </div>

      {showDetail && state.result && (
        <MemberDetail
          role={role}
          result={state.result}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
