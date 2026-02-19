"use client";

import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import { useEffect, useState } from "react";
import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { BoardRoom } from "@/components/board/BoardRoom";
import { CEOFollowUp } from "@/components/board/CEOFollowUp";
import { FinalVerdict } from "@/components/board/FinalVerdict";
import { ExportButton } from "@/components/report/ExportButton";
import { ShareImage } from "@/components/report/ShareImage";
import { ApiKeyInput } from "@/components/settings/ApiKeyInput";
import { RetroButton } from "@/components/ui/RetroButton";
import { useApiKey } from "@/lib/hooks/useApiKey";
import { useBoardroomAnalysis } from "@/lib/hooks/useBoardroomAnalysis";
import { MEMBER_AVATARS, MEMBER_COLORS } from "@/lib/utils/constants";

export default function Home() {
  const { apiKey, saveKey, loaded, hasKey } = useApiKey();
  const { state, analyze, finalize, reset } = useBoardroomAnalysis();
  const [finalizing, setFinalizing] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);

  // Check if demo mode is available (server has OPENROUTER_API_KEY)
  useEffect(() => {
    fetch("/api/demo-status")
      .then((r) => r.json())
      .then((data) => setDemoAvailable(data.available === true))
      .catch(() => {});
  }, []);

  const isRunning = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";
  const canSubmit = hasKey || demoAvailable;

  const handleSubmit = (content: string, ceoVision: string, model: string) => {
    if (!canSubmit) return;
    analyze(content, apiKey ?? "", ceoVision, model);
  };

  const handleFinalize = (ceoAnswers: string) => {
    if (!canSubmit || !state.report) return;
    setFinalizing(true);
    finalize(state.report, ceoAnswers, apiKey ?? "");
  };

  if (!loaded) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 star-bg">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div>
          <h1 className="rpg-title text-lg text-[var(--color-dbz-orange)]">BOARDROOM AI</h1>
          <p className="stat-label text-gray-500">AI EXECUTIVE DECISION ENGINE</p>
        </div>
        <div className="flex items-center gap-4">
          {state.phase !== "idle" && (
            <RetroButton
              data-testid="new-analysis-button"
              onClick={() => {
                reset();
                setFinalizing(false);
              }}
              variant="secondary"
            >
              NEW ANALYSIS
            </RetroButton>
          )}
        </div>
      </header>

      {/* API Key section — only show when no key AND no demo mode */}
      {!hasKey && !demoAvailable && (
        <div className="w-full max-w-2xl mb-8 pixel-border p-6">
          <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
        </div>
      )}

      {/* Main content - Idle state */}
      {state.phase === "idle" && (
        <div className="flex flex-col items-center gap-8">
          {/* Hero */}
          <div className="text-center max-w-2xl pixel-border p-6">
            <h2 className="rpg-title text-sm text-[var(--color-dbz-orange)] mb-4">
              SUBMIT YOUR DECISION TO THE BOARD
            </h2>
            <p className="font-[family-name:var(--font-terminal)] text-xl text-gray-300 leading-relaxed mb-3">
              6 AI executives debate your strategy.
              <br />
              Real friction. Real compromise.
              <br />
              One structured decision report.
            </p>
            <p className="font-[family-name:var(--font-terminal)] text-base text-gray-500">
              Built by{" "}
              <a
                href="https://x.com/evolved_monkey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-dbz-gold)] hover:text-[var(--color-dbz-orange)] transition-colors"
              >
                evolved monkey
              </a>
            </p>
          </div>

          {/* Demo mode banner */}
          {demoAvailable && !hasKey && (
            <div className="w-full max-w-2xl text-center pixel-border p-4">
              <div className="rpg-title text-[9px] text-[var(--color-dbz-green)] mb-2">
                DEMO MODE ACTIVE
              </div>
              <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-400">
                Try it now — no API key needed. Or{" "}
                <button
                  type="button"
                  className="text-[var(--color-dbz-gold)] hover:text-[var(--color-dbz-orange)] underline transition-colors"
                  onClick={() => {
                    const el = document.getElementById("api-key-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  bring your own key
                </button>{" "}
                for unlimited use.
              </p>
            </div>
          )}

          {/* API key inline — collapsible in demo mode */}
          {(hasKey || demoAvailable) && (
            <div id="api-key-section" className="w-full max-w-2xl">
              <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
            </div>
          )}

          {/* Form */}
          <AnalysisForm
            onSubmit={handleSubmit}
            disabled={!canSubmit || isRunning}
            demoMode={demoAvailable && !hasKey}
          />

          {/* Board member preview */}
          <div className="w-full max-w-3xl">
            <div className="stat-label text-center mb-3">THE BOARD</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {(["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const).map((role) => (
                <div
                  key={role}
                  className="char-card p-3 text-center opacity-60 hover:opacity-100 transition-opacity"
                >
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
          debateThreads={state.debateThreads}
          synthesis={state.synthesis}
          phase={state.phase}
        />
      )}

      {/* CEO Follow-Up Questions — always visible once they exist */}
      {state.phase === "complete" && state.ceoFollowUp.length > 0 && (
        <div className="w-full max-w-5xl mt-6">
          <CEOFollowUp
            questions={state.ceoFollowUp}
            onFinalize={handleFinalize}
            disabled={finalizing || !!state.finalVerdict}
          />
        </div>
      )}

      {/* Final Verdict (streaming or complete) */}
      {(state.finalVerdict || state.finalVerdictStreaming) && (
        <div className="w-full max-w-5xl mt-6">
          <FinalVerdict verdict={state.finalVerdict} streamedText={state.finalVerdictStreaming} />
        </div>
      )}

      {/* Complete state — wait for final verdict if follow-up questions exist */}
      {state.phase === "complete" &&
        state.report &&
        (state.ceoFollowUp.length === 0 || state.finalVerdict) && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div
              data-testid="analysis-complete"
              className="rpg-title text-[10px] text-[var(--color-dbz-green)]"
            >
              ANALYSIS COMPLETE — {(state.report.totalDurationMs / 1000).toFixed(1)}s
            </div>
            <div className="flex gap-3">
              <ExportButton report={state.report} />
              <ShareImage report={state.report} />
            </div>
          </div>
        )}

      {/* Error state */}
      {state.phase === "error" && (
        <div
          className="mt-6 pixel-border p-4 max-w-2xl"
          style={{ borderColor: "var(--color-dbz-red)" }}
        >
          <h3 className="rpg-title text-[10px] text-[var(--color-dbz-red)] mb-2">ERROR DETECTED</h3>
          <p
            data-testid="error-message"
            className="font-[family-name:var(--font-terminal)] text-base text-red-300"
          >
            {state.error}
          </p>
          {/* Show API key input on demo exhaustion errors */}
          {state.error?.includes("Demo limit") && (
            <div className="mt-4">
              <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
            </div>
          )}
          <RetroButton
            data-testid="retry-button"
            onClick={() => {
              reset();
              setFinalizing(false);
            }}
            variant="secondary"
            className="mt-4"
          >
            RETRY
          </RetroButton>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center">
        <div className="stat-label text-gray-600">
          BOARDROOM AI by{" "}
          <a
            href="https://x.com/evolved_monkey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[var(--color-dbz-orange)] transition-colors"
          >
            EVOLVED MONKEY
          </a>{" "}
          — POWERED BY OPENROUTER
        </div>
      </footer>
    </main>
  );
}
