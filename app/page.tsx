"use client";

import { useApiKey } from "@/lib/hooks/useApiKey";
import { useBoardroomAnalysis } from "@/lib/hooks/useBoardroomAnalysis";
import { ApiKeyInput } from "@/components/settings/ApiKeyInput";
import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { BoardRoom } from "@/components/board/BoardRoom";
import { ExportButton } from "@/components/report/ExportButton";
import { RetroButton } from "@/components/ui/RetroButton";
import { BOARD_MEMBER_NAMES } from "@/lib/engine/types";
import type { BoardMemberRole } from "@/lib/engine/types";

const MEMBER_COLORS: Record<BoardMemberRole, string> = {
  cpo: "#FF6B00",
  cmo: "#2196F3",
  cfo: "#4CAF50",
  cro: "#9C27B0",
  cco: "#F44336",
  cto: "#00BCD4",
};

const MEMBER_AVATARS: Record<BoardMemberRole, string> = {
  cpo: "/avatars/vegeta.svg",
  cmo: "/avatars/bulma.svg",
  cfo: "/avatars/piccolo.svg",
  cro: "/avatars/whis.svg",
  cco: "/avatars/gohan.svg",
  cto: "/avatars/trunks.svg",
};

export default function Home() {
  const { apiKey, saveKey, loaded, hasKey } = useApiKey();
  const { state, analyze, reset } = useBoardroomAnalysis();

  const isRunning = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";

  const handleSubmit = (content: string, ceoVision: string, model: string) => {
    if (!apiKey) return;
    analyze(content, apiKey, ceoVision, model);
  };

  if (!loaded) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 star-bg">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div>
          <h1 className="rpg-title text-lg text-[var(--color-dbz-orange)]">
            BOARDROOM AI
          </h1>
          <p className="stat-label text-gray-500">
            AI EXECUTIVE DECISION ENGINE
          </p>
        </div>
        <div className="flex items-center gap-4">
          {state.phase !== "idle" && (
            <RetroButton onClick={reset} variant="secondary">
              NEW ANALYSIS
            </RetroButton>
          )}
        </div>
      </header>

      {/* API Key section */}
      {!hasKey && (
        <div className="w-full max-w-2xl mb-8 pixel-border p-6">
          <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
        </div>
      )}

      {/* Main content - Idle state */}
      {state.phase === "idle" && (
        <div className="flex flex-col items-center gap-8">
          {/* Hero */}
          <div className="text-center max-w-2xl">
            <h2 className="rpg-title text-sm text-white mb-4">
              SUBMIT YOUR DECISION TO THE BOARD
            </h2>
            <p className="font-[family-name:var(--font-terminal)] text-lg text-gray-400 leading-relaxed">
              6 AI board members will analyze your project independently,
              detect disagreements, debate contradictions, and deliver a
              structured BoardRoom decision report.
            </p>
          </div>

          {/* API key inline if set */}
          {hasKey && (
            <div className="w-full max-w-2xl">
              <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
            </div>
          )}

          {/* Form */}
          <AnalysisForm onSubmit={handleSubmit} disabled={!hasKey || isRunning} />

          {/* Board member preview */}
          <div className="w-full max-w-3xl">
            <div className="stat-label text-center mb-3">THE BOARD</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {(["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const).map((role) => (
                <div key={role} className="char-card p-3 text-center opacity-60 hover:opacity-100 transition-opacity">
                  <div
                    className="w-16 h-16 mx-auto pixel-border-sm overflow-hidden mb-2"
                    style={{ borderColor: MEMBER_COLORS[role] }}
                  >
                    <img
                      src={MEMBER_AVATARS[role]}
                      alt={BOARD_MEMBER_NAMES[role]}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-[8px] font-bold" style={{ color: MEMBER_COLORS[role] }}>
                    {BOARD_MEMBER_NAMES[role]}
                  </div>
                  <div className="stat-label">{role.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active analysis */}
      {state.phase !== "idle" && (
        <BoardRoom
          members={state.members}
          frictions={state.frictions}
          debates={state.debates}
          synthesis={state.synthesis}
          phase={state.phase}
        />
      )}

      {/* Complete state */}
      {state.phase === "complete" && state.report && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="rpg-title text-[10px] text-[var(--color-dbz-green)]">
            ANALYSIS COMPLETE — {(state.report.totalDurationMs / 1000).toFixed(1)}s
          </div>
          <ExportButton report={state.report} />
        </div>
      )}

      {/* Error state */}
      {state.phase === "error" && (
        <div className="mt-6 pixel-border p-4 max-w-2xl" style={{ borderColor: "var(--color-dbz-red)" }}>
          <h3 className="rpg-title text-[10px] text-[var(--color-dbz-red)] mb-2">
            ERROR DETECTED
          </h3>
          <p className="font-[family-name:var(--font-terminal)] text-base text-red-300">
            {state.error}
          </p>
          <RetroButton onClick={reset} variant="secondary" className="mt-4">
            RETRY
          </RetroButton>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center">
        <div className="stat-label text-gray-600">
          BOARDROOM AI by{" "}
          <a
            href="https://github.com/jonathanty-byte"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[var(--color-dbz-orange)] transition-colors"
          >
            JONATHAN TY
          </a>
          {" "}— POWERED BY OPENROUTER
        </div>
      </footer>
    </main>
  );
}
