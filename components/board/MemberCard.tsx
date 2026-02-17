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
  cpo: "#FF6B00",  // Vegeta - orange
  cmo: "#1A73E8",  // Bulma - blue
  cfo: "#2D8E4E",  // Piccolo - green
  cro: "#9B59B6",  // Whis - purple
  cco: "#E74C3C",  // Gohan - red
  cto: "#3498DB",  // Trunks - light blue
};

const MEMBER_INITIALS: Record<BoardMemberRole, string> = {
  cpo: "VG",
  cmo: "BL",
  cfo: "PC",
  cro: "WH",
  cco: "GH",
  cto: "TR",
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
        className={`pixel-border p-4 bg-[var(--color-surface-card)] flex flex-col gap-2 min-h-[180px] transition-all duration-300 ${
          isAnalyzing ? "analyzing-glow" : ""
        } ${isComplete ? "cursor-pointer hover:bg-[var(--color-border)]" : ""}`}
        onClick={() => isComplete && setShowDetail(true)}
        style={isComplete ? { borderColor: color } : undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-black font-bold text-sm font-[family-name:var(--font-retro)]"
            style={{ backgroundColor: color }}
          >
            {MEMBER_INITIALS[role]}
          </div>
          <div className="flex-1">
            <div className="font-[family-name:var(--font-retro)] text-xs" style={{ color }}>
              {name}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {role.toUpperCase()} - {title.split(" ").pop()}
            </div>
          </div>
        </div>

        {/* Content */}
        {state.status === "waiting" && (
          <div className="text-gray-600 text-sm italic flex-1 flex items-center">
            Awaiting briefing...
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 overflow-hidden">
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
            <p className="text-xs text-gray-400 line-clamp-3">
              {state.result.analysis.slice(0, 150)}...
            </p>
            <span className="text-xs text-gray-600">Click for details</span>
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
