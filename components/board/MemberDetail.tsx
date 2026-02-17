"use client";

import type { BoardMemberRole, Round1Output } from "@/lib/engine/types";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@/lib/engine/types";
import { VerdictBadge } from "./VerdictBadge";

interface MemberDetailProps {
  role: BoardMemberRole;
  result: Round1Output;
  onClose: () => void;
}

export function MemberDetail({ role, result, onClose }: MemberDetailProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="pixel-border bg-[var(--color-surface-card)] p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-[family-name:var(--font-retro)] text-sm text-[var(--color-dbz-orange)]">
              {BOARD_MEMBER_NAMES[role]}
            </h2>
            <p className="text-xs text-gray-400">{BOARD_MEMBER_TITLES[role]}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            x
          </button>
        </div>

        {/* Verdict */}
        <div className="mb-4">
          <VerdictBadge verdict={result.verdict} animated={false} />
        </div>

        {/* Analysis */}
        <div className="mb-4">
          <h3 className="text-xs font-[family-name:var(--font-retro)] text-gray-400 mb-2">
            ANALYSIS
          </h3>
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
            {result.analysis}
          </p>
        </div>

        {/* Challenges */}
        {result.challenges.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-[family-name:var(--font-retro)] text-[var(--color-dbz-red)] mb-2">
              CHALLENGES FOR THE CEO
            </h3>
            <ul className="space-y-1">
              {result.challenges.map((c, i) => (
                <li key={i} className="text-sm text-gray-300 pl-4 border-l-2 border-[var(--color-dbz-red)]">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verdict Details */}
        <div>
          <h3 className="text-xs font-[family-name:var(--font-retro)] text-gray-400 mb-2">
            VERDICT DETAILS
          </h3>
          <div className="space-y-2">
            {Object.entries(result.verdictDetails).map(([key, value]) =>
              value ? (
                <div key={key} className="text-sm">
                  <span className="text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  <span className="text-gray-200">{value}</span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
