"use client";

import type { BoardMemberRole } from "@/lib/engine/types";
import type { MemberState, DebateState } from "@/lib/hooks/useAnalysisState";
import type { FrictionPoint, Synthesis } from "@/lib/engine/types";
import { BOARD_MEMBER_NAMES } from "@/lib/engine/types";
import { MemberCard } from "./MemberCard";
import { VerdictBadge } from "./VerdictBadge";

interface BoardRoomProps {
  members: Record<BoardMemberRole, MemberState>;
  frictions: FrictionPoint[];
  debates: Record<BoardMemberRole, DebateState>;
  synthesis: Synthesis | null;
  phase: string;
}

const ROLES: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];

export function BoardRoom({
  members,
  frictions,
  debates,
  synthesis,
  phase,
}: BoardRoomProps) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Progress indicator */}
      <ProgressBar phase={phase} />

      {/* Board members grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <MemberCard key={role} role={role} state={members[role]} />
        ))}
      </div>

      {/* Frictions section */}
      {frictions.length > 0 && (
        <div className="pixel-border p-4 bg-[var(--color-surface-card)]">
          <h3 className="font-[family-name:var(--font-retro)] text-xs text-[var(--color-dbz-red)] mb-3">
            FRICTION POINTS DETECTED
          </h3>
          <div className="space-y-3">
            {frictions.map((f, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-sm text-white font-bold">
                  {f.description}
                </span>
                {Object.entries(f.positions).map(([role, pos]) => (
                  <span key={role} className="text-xs text-gray-400 pl-4">
                    {BOARD_MEMBER_NAMES[role as BoardMemberRole]}: {pos}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round 2 debates */}
      {Object.values(debates).some((d) => d.status !== "waiting") && (
        <div className="pixel-border p-4 bg-[var(--color-surface-card)]">
          <h3 className="font-[family-name:var(--font-retro)] text-xs text-[var(--color-dbz-purple)] mb-3">
            ROUND 2 — CONTRADICTORY DEBATE
          </h3>
          <div className="space-y-3">
            {ROLES.filter((r) => debates[r].status !== "waiting").map((role) => {
              const debate = debates[role];
              return (
                <div key={role} className="flex flex-col gap-1">
                  <span className="text-sm text-white font-bold">
                    {BOARD_MEMBER_NAMES[role]}
                  </span>
                  {debate.status === "debating" && (
                    <span className="text-xs text-gray-400 cursor-blink">
                      {debate.streamedText.slice(-200)}
                    </span>
                  )}
                  {debate.result && (
                    <div className="pl-4 border-l-2 border-[var(--color-dbz-purple)]">
                      <VerdictBadge verdict={debate.result.position} animated={false} />
                      <p className="text-xs text-gray-300 mt-1">
                        {debate.result.argument}
                      </p>
                      {debate.result.condition && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Condition: {debate.result.condition}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthesis */}
      {synthesis && (
        <div className="pixel-border p-4 bg-[var(--color-surface-card)]">
          <h3 className="font-[family-name:var(--font-retro)] text-xs text-[var(--color-dbz-gold)] mb-3">
            SYNTHESIS
          </h3>
          <div className="mb-4 text-center">
            <span className="text-xs text-gray-400">Collective Verdict:</span>
            <div className="mt-2">
              <VerdictBadge verdict={synthesis.collectiveVerdict} />
            </div>
          </div>

          {synthesis.consensus.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs text-green-400 font-bold mb-1">Consensus</h4>
              {synthesis.consensus.map((c, i) => (
                <p key={i} className="text-xs text-gray-300 pl-3 border-l border-green-800 mb-1">
                  {c}
                </p>
              ))}
            </div>
          )}

          {synthesis.compromises.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs text-amber-400 font-bold mb-1">Compromises</h4>
              {synthesis.compromises.map((c, i) => (
                <p key={i} className="text-xs text-gray-300 pl-3 border-l border-amber-800 mb-1">
                  {c}
                </p>
              ))}
            </div>
          )}

          {synthesis.impasses.length > 0 && (
            <div>
              <h4 className="text-xs text-red-400 font-bold mb-1">Impasses (CEO decides)</h4>
              {synthesis.impasses.map((c, i) => (
                <p key={i} className="text-xs text-gray-300 pl-3 border-l border-red-800 mb-1">
                  {c}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ phase }: { phase: string }) {
  const phases = [
    { key: "round1", label: "ROUND 1" },
    { key: "frictions", label: "FRICTIONS" },
    { key: "round2", label: "ROUND 2" },
    { key: "synthesis", label: "SYNTHESIS" },
    { key: "complete", label: "COMPLETE" },
  ];

  const currentIndex = phases.findIndex((p) => p.key === phase);

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <div key={p.key} className="flex items-center gap-1 flex-1">
            <div
              className={`flex-1 h-1 ${
                isDone
                  ? "bg-[var(--color-dbz-orange)]"
                  : isActive
                    ? "bg-[var(--color-dbz-orange)] animate-pulse"
                    : "bg-[var(--color-border)]"
              }`}
            />
            <span
              className={`text-[8px] font-[family-name:var(--font-retro)] ${
                isDone || isActive ? "text-[var(--color-dbz-orange)]" : "text-gray-600"
              }`}
            >
              {p.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
