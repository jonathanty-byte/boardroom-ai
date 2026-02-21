"use client";

import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import { useEffect, useState } from "react";
import { BoardRoom } from "@/components/board/BoardRoom";
import { CEOFollowUp } from "@/components/board/CEOFollowUp";
import { FinalVerdict } from "@/components/board/FinalVerdict";
import { ViabilityScoreDisplay } from "@/components/board/ViabilityScore";
import { ExportButton } from "@/components/report/ExportButton";
import { ShareButton } from "@/components/report/ShareButton";
import { ShareImage } from "@/components/report/ShareImage";
import { ApiKeyInput } from "@/components/settings/ApiKeyInput";
import { LiveCounters } from "@/components/ui/LiveCounters";
import { RetroButton } from "@/components/ui/RetroButton";
import { useApiKey } from "@/lib/hooks/useApiKey";
import { useBoardroomAnalysis } from "@/lib/hooks/useBoardroomAnalysis";
import {
  EXAMPLE_BRIEFING,
  EXAMPLE_CEO_VISION,
  MEMBER_AVATARS,
  MEMBER_COLORS,
  RECOMMENDED_MODELS,
} from "@/lib/utils/constants";

export default function Home() {
  const { apiKey, saveKey, loaded, hasKey } = useApiKey();
  const { state, analyze, finalize, reset } = useBoardroomAnalysis();
  const [finalizing, setFinalizing] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [heroContent, setHeroContent] = useState("");
  const [ceoVision, setCeoVision] = useState("");
  const [model, setModel] = useState(RECOMMENDED_MODELS[0].id);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check if demo mode is available (server has OPENROUTER_API_KEY)
  useEffect(() => {
    fetch("/api/demo-status")
      .then((r) => r.json())
      .then((data) => setDemoAvailable(data.available === true))
      .catch(() => {});
  }, []);

  const isRunning = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";
  const canSubmit = hasKey || demoAvailable;
  const isDemoMode = demoAvailable && !hasKey;

  const handleSubmit = () => {
    if (!canSubmit || !heroContent.trim()) return;
    analyze(heroContent, apiKey ?? "", ceoVision, model);
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
                setHeroContent("");
                setCeoVision("");
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

      {/* Main content - Idle state: NEW HERO */}
      {state.phase === "idle" && (
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
          {/* Hero headline */}
          <div className="text-center">
            <h2 className="rpg-title text-xs sm:text-sm md:text-base text-[var(--color-dbz-orange)] mb-4 leading-relaxed">
              YOUR IDEA JUST ENTERED THE BOARDROOM.
              <br />
              NOT EVERYONE SURVIVES.
            </h2>
            <p className="font-[family-name:var(--font-terminal)] text-lg sm:text-xl text-gray-400 leading-relaxed">
              Pitch your startup idea. 6 AI executives will debate it live.
              <br />
              Free. No signup.
            </p>
          </div>

          {/* Direct input */}
          <div className="w-full pixel-border p-5">
            <textarea
              data-testid="briefing-textarea"
              value={heroContent}
              onChange={(e) => setHeroContent(e.target.value)}
              placeholder="Describe your startup idea in 2-3 sentences..."
              rows={4}
              className="w-full bg-transparent text-gray-200 px-3 py-2 resize-none
                font-[family-name:var(--font-terminal)] text-lg
                focus:outline-none placeholder:text-gray-600"
            />
            <div className="flex items-center justify-between mt-4 gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-[9px] text-gray-500 hover:text-[var(--color-dbz-gold)]
                    tracking-wider transition-colors uppercase"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? "HIDE OPTIONS" : "ADVANCED OPTIONS"}
                </button>
                {!heroContent.trim() && (
                  <button
                    type="button"
                    data-testid="example-button"
                    className="text-[9px] text-gray-500 hover:text-[var(--color-dbz-gold)]
                      tracking-wider transition-colors uppercase"
                    onClick={() => {
                      setHeroContent(EXAMPLE_BRIEFING);
                      setCeoVision(EXAMPLE_CEO_VISION);
                    }}
                  >
                    TRY AN EXAMPLE
                  </button>
                )}
              </div>
              <RetroButton
                data-testid="launch-button"
                onClick={handleSubmit}
                disabled={!canSubmit || !heroContent.trim() || isRunning}
              >
                FACE THE BOARD &rarr;
              </RetroButton>
            </div>
          </div>

          {/* Collapsible advanced options */}
          {showAdvanced && (
            <div className="w-full flex flex-col gap-4">
              {/* CEO Vision */}
              <div>
                <label className="stat-label block mb-2">CEO VISION (OPTIONAL)</label>
                <div className="pixel-border-sm">
                  <input
                    data-testid="ceo-vision-input"
                    type="text"
                    value={ceoVision}
                    onChange={(e) => setCeoVision(e.target.value)}
                    placeholder="Focus: e.g. 'Unit economics' or 'Go-to-market strategy'"
                    className="w-full bg-transparent text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Model selector */}
              <div>
                <label className="stat-label block mb-2">AI MODEL</label>
                {isDemoMode ? (
                  <div>
                    <div className="pixel-border-sm px-3 py-2 text-gray-400 font-[family-name:var(--font-terminal)]">
                      {RECOMMENDED_MODELS[0].name} — {RECOMMENDED_MODELS[0].description}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1 tracking-wide">
                      DEMO MODE — Bring your own{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-dbz-gold)] hover:text-[var(--color-dbz-orange)] underline"
                      >
                        OpenRouter API key
                      </a>{" "}
                      to unlock Claude, GPT, Gemini and more.
                    </p>
                  </div>
                ) : (
                  <div className="pixel-border-sm">
                    <select
                      data-testid="model-select"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-[var(--color-surface)] text-gray-200 px-3 py-2 focus:outline-none"
                    >
                      {RECOMMENDED_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* API Key */}
              <div id="api-key-section">
                <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
              </div>
            </div>
          )}

          {/* Demo mode badge */}
          {isDemoMode && (
            <div className="text-center">
              <span className="stat-label text-[var(--color-dbz-green)]">DEMO MODE</span>
              <span className="stat-label text-gray-500 ml-2">— Free, no key needed</span>
            </div>
          )}

          {/* Live counters */}
          <LiveCounters />

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
          <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-5xl">
            {state.report.viabilityScore && (
              <ViabilityScoreDisplay viabilityScore={state.report.viabilityScore} />
            )}
            <div
              data-testid="analysis-complete"
              className="rpg-title text-[10px] text-[var(--color-dbz-green)]"
            >
              ANALYSIS COMPLETE — {(state.report.totalDurationMs / 1000).toFixed(1)}s
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <ExportButton report={state.report} />
              <ShareImage report={state.report} />
              <ShareButton report={state.report} />
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
      <footer className="mt-auto pt-12 text-center space-y-3">
        {/* Feedback CTA */}
        <div className="pixel-border-sm inline-block px-5 py-3 max-w-lg">
          <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-400 leading-relaxed">
            Built by a non-dev consultant learning to code in public.
            <br />
            Feedback, roasts, ideas — all welcome.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://x.com/evolved_monkey_"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-label text-[var(--color-dbz-gold)] hover:text-[var(--color-dbz-orange)] transition-colors"
            >
              DM ME ON X →
            </a>
            <a
              href="mailto:jonathan.jooty@gmail.com?subject=BoardRoom AI Feedback"
              className="stat-label text-gray-500 hover:text-[var(--color-dbz-orange)] transition-colors"
            >
              EMAIL ME →
            </a>
          </div>
        </div>

        <div className="stat-label text-gray-600">
          BOARDROOM AI by{" "}
          <a
            href="https://x.com/evolved_monkey_"
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
