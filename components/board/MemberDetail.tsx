"use client";

import type { BoardMemberRole, Round1Output } from "@/lib/engine/types";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@/lib/engine/types";
import { VerdictBadge } from "./VerdictBadge";

interface MemberDetailProps {
  role: BoardMemberRole;
  result: Round1Output;
  onClose: () => void;
}

const MEMBER_COLORS: Record<BoardMemberRole, string> = {
  cpo: "#FF6B00",
  cmo: "#2196F3",
  cfo: "#4CAF50",
  cro: "#9C27B0",
  cco: "#F44336",
  cto: "#00BCD4",
};

export function MemberDetail({ role, result, onClose }: MemberDetailProps) {
  const color = MEMBER_COLORS[role];

  return (
    <div
      className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="pixel-border p-0 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }}
        >
          <div className="flex items-center gap-3">
            <img
              src={`/avatars/${role === "cpo" ? "vegeta" : role === "cmo" ? "bulma" : role === "cfo" ? "piccolo" : role === "cro" ? "whis" : role === "cco" ? "gohan" : "trunks"}.svg`}
              alt={BOARD_MEMBER_NAMES[role]}
              className="w-10 h-10 pixel-border-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div>
              <h2 className="text-sm font-bold" style={{ color }}>
                {BOARD_MEMBER_NAMES[role]}
              </h2>
              <p className="stat-label">{BOARD_MEMBER_TITLES[role]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xs px-3 py-1.5 pixel-border-sm"
          >
            CLOSE
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-4 flex flex-col gap-4">
          {/* Verdict */}
          <div className="flex items-center gap-3">
            <span className="stat-label">VERDICT:</span>
            <VerdictBadge verdict={result.verdict} animated={false} size="lg" />
          </div>

          {/* Analysis */}
          <div className="dialogue-box p-4">
            <div className="stat-label mb-2" style={{ color }}>ANALYSIS</div>
            <p className="font-[family-name:var(--font-terminal)] text-lg text-gray-200 whitespace-pre-wrap leading-relaxed">
              {result.analysis}
            </p>
          </div>

          {/* Challenges */}
          {result.challenges.length > 0 && (
            <div>
              <div className="stat-label mb-2 text-[var(--color-dbz-red)]">
                CHALLENGES FOR CEO
              </div>
              <div className="space-y-2">
                {result.challenges.map((c, i) => (
                  <div
                    key={i}
                    className="dialogue-box p-3 font-[family-name:var(--font-terminal)] text-base text-gray-300"
                    style={{ borderLeftColor: "var(--color-dbz-red)", borderLeftWidth: "4px" }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdict Details */}
          <div>
            <div className="stat-label mb-2">VERDICT DETAILS</div>
            <div className="space-y-2">
              {Object.entries(result.verdictDetails).map(([key, value]) =>
                value ? (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="stat-label" style={{ color }}>
                      {key.replace(/([A-Z])/g, " $1").trim().toUpperCase()}
                    </span>
                    <span className="font-[family-name:var(--font-terminal)] text-base text-gray-300">
                      {value}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
