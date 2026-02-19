"use client";

import type { BoardMemberRole, FrictionPoint, Synthesis } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import type { DebateThreadState, MemberState } from "@/lib/hooks/useAnalysisState";
import { DebateThread } from "./DebateThread";
import { MemberCard } from "./MemberCard";
import { VerdictBadge } from "./VerdictBadge";

interface BoardRoomProps {
  members: Record<BoardMemberRole, MemberState>;
  frictions: FrictionPoint[];
  debateThreads: DebateThreadState[];
  synthesis: Synthesis | null;
  phase: string;
}

const ROLES: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];

export function BoardRoom({
  members,
  frictions,
  debateThreads,
  synthesis,
  phase,
}: BoardRoomProps) {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Phase tracker */}
      <PhaseTracker phase={phase} data-testid="phase-tracker" />

      {/* Board members grid - RPG battle formation style */}
      <div>
        <div className="stat-label mb-2 text-center text-[var(--color-dbz-gold)]">
          BOARDROOM AI MEMBERS
        </div>
        <div data-testid="member-grid" className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ROLES.map((role) => (
            <MemberCard key={role} role={role} state={members[role]} />
          ))}
        </div>
      </div>

      {/* Friction Points - Battle encounter style */}
      {frictions.length > 0 && (
        <div className="pixel-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="friction-spark text-[var(--color-dbz-red)] text-sm">⚡</span>
            <span className="text-[10px] text-[var(--color-dbz-red)] font-bold tracking-wider">
              FRICTION DETECTED
            </span>
            <span className="friction-spark text-[var(--color-dbz-red)] text-sm">⚡</span>
          </div>
          <div className="space-y-3">
            {frictions.map((f, i) => (
              <div key={i} className="dialogue-box p-3">
                <div className="text-[10px] text-[var(--color-dbz-gold)] font-bold mb-2">
                  {f.description}
                </div>
                {Object.entries(f.positions).map(([role, pos]) => (
                  <div
                    key={role}
                    className="text-gray-400 pl-3 border-l-2 border-gray-700 mb-1 font-[family-name:var(--font-terminal)] text-base"
                  >
                    <span className="text-white">
                      {BOARD_MEMBER_NAMES[role as BoardMemberRole]}
                    </span>
                    : {pos}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debate transition indicator */}
      {phase === "round2" && debateThreads.length === 0 && frictions.length > 0 && (
        <div className="pixel-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[var(--color-dbz-gold)] rounded-sm animate-pulse" />
            <div>
              <span className="text-[10px] font-bold text-[var(--color-dbz-gold)] tracking-wider">
                MODERATOR
              </span>
              <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500 animate-pulse">
                Analyzing friction points...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-turn Debate */}
      {debateThreads.length > 0 && (
        <div className="pixel-border p-4">
          <div className="stat-label mb-3 text-[var(--color-dbz-purple)]">MULTI-TURN DEBATE</div>
          {debateThreads.map((thread) => (
            <DebateThread
              key={thread.frictionIndex}
              thread={thread}
              frictionDescription={
                frictions[thread.frictionIndex]?.description ??
                `Friction #${thread.frictionIndex + 1}`
              }
            />
          ))}
        </div>
      )}

      {/* Synthesis - Final results */}
      {synthesis && (
        <div className="pixel-border p-4">
          <div className="stat-label mb-3 text-[var(--color-dbz-gold)]">
            SYNTHESIS — FINAL JUDGMENT
          </div>

          {/* Collective Verdict - Big center display */}
          <div data-testid="synthesis-section" className="text-center mb-4 py-4">
            <div className="stat-label mb-2">COLLECTIVE VERDICT</div>
            <VerdictBadge
              verdict={synthesis.collectiveVerdict}
              animated={true}
              size="lg"
              data-testid="collective-verdict"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {synthesis.consensus.length > 0 && (
              <div className="dialogue-box p-3">
                <div className="stat-label mb-2 text-[var(--color-dbz-green)]">CONSENSUS</div>
                {synthesis.consensus.map((c, i) => (
                  <p
                    key={i}
                    className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
                  >
                    {c}
                  </p>
                ))}
              </div>
            )}

            {synthesis.compromises.length > 0 && (
              <div className="dialogue-box p-3">
                <div className="stat-label mb-2 text-[var(--color-dbz-gold)]">COMPROMISES</div>
                {synthesis.compromises.map((c, i) => (
                  <p
                    key={i}
                    className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
                  >
                    {c}
                  </p>
                ))}
              </div>
            )}

            {synthesis.impasses.length > 0 && (
              <div className="dialogue-box p-3">
                <div className="stat-label mb-2 text-[var(--color-dbz-red)]">IMPASSES</div>
                {synthesis.impasses.map((c, i) => (
                  <p
                    key={i}
                    className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
                  >
                    {c}
                  </p>
                ))}
              </div>
            )}

            {synthesis.unresolvedConcerns && synthesis.unresolvedConcerns.length > 0 && (
              <div className="dialogue-box p-3">
                <div className="stat-label mb-2 text-[var(--color-dbz-orange)]">
                  UNRESOLVED CONCERNS
                </div>
                {synthesis.unresolvedConcerns.map((c, i) => (
                  <p
                    key={i}
                    className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
                  >
                    {c}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseTracker({ phase, ...rest }: { phase: string; "data-testid"?: string }) {
  const phases = [
    { key: "round1", label: "RND 1", icon: "I" },
    { key: "frictions", label: "SCAN", icon: "II" },
    { key: "round2", label: "RND 2", icon: "III" },
    { key: "synthesis", label: "SYNTH", icon: "IV" },
    { key: "complete", label: "DONE", icon: "V" },
  ];

  const currentIndex = phases.findIndex((p) => p.key === phase);

  return (
    <div className="pixel-border p-3" {...rest}>
      <div className="stat-label mb-2 text-center">BATTLE PHASE</div>
      <div className="flex items-center justify-between gap-1">
        {phases.map((p, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <div key={p.key} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 flex items-center justify-center text-[7px] font-bold ${
                  isDone
                    ? "bg-[var(--color-dbz-green)] text-black"
                    : isActive
                      ? "bg-[var(--color-dbz-orange)] text-black animate-pulse"
                      : "bg-[#1a1a3a] text-gray-600"
                }`}
                style={{
                  boxShadow: isActive ? `0 0 10px var(--color-dbz-orange)` : undefined,
                }}
              >
                {p.icon}
              </div>
              <span
                className={`text-[6px] tracking-wider ${
                  isDone || isActive ? "text-white" : "text-gray-700"
                }`}
              >
                {p.label}
              </span>
              {i < phases.length - 1 && (
                <div
                  className={`absolute h-[2px] ${
                    isDone ? "bg-[var(--color-dbz-green)]" : "bg-[#1a1a3a]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
