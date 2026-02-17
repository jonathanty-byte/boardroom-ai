"use client";

import { useApiKey } from "@/lib/hooks/useApiKey";
import { useComexAnalysis } from "@/lib/hooks/useComexAnalysis";
import { ApiKeyInput } from "@/components/settings/ApiKeyInput";
import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { BoardRoom } from "@/components/board/BoardRoom";
import { ExportButton } from "@/components/report/ExportButton";
import { RetroButton } from "@/components/ui/RetroButton";

export default function Home() {
  const { apiKey, saveKey, loaded, hasKey } = useApiKey();
  const { state, analyze, reset } = useComexAnalysis();

  const isRunning = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";

  const handleSubmit = (content: string, ceoVision: string, model: string) => {
    if (!apiKey) return;
    analyze(content, apiKey, ceoVision, model);
  };

  if (!loaded) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-retro)] text-lg text-[var(--color-dbz-orange)]">
            COMEX BOARD
          </h1>
          <p className="text-sm text-gray-500">
            AI Executive Decision Engine
          </p>
        </div>
        <div className="flex items-center gap-4">
          {state.phase !== "idle" && (
            <RetroButton onClick={reset} variant="secondary">
              New Analysis
            </RetroButton>
          )}
        </div>
      </header>

      {/* API Key section */}
      {!hasKey && (
        <div className="w-full max-w-2xl mb-8 pixel-border p-6 bg-[var(--color-surface-card)]">
          <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
        </div>
      )}

      {/* Main content */}
      {state.phase === "idle" && (
        <div className="flex flex-col items-center gap-8">
          {/* Hero */}
          <div className="text-center max-w-2xl">
            <h2 className="font-[family-name:var(--font-retro)] text-sm text-white mb-4">
              SUBMIT YOUR DECISION TO THE BOARD
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              6 AI board members will analyze your project independently,
              detect disagreements, debate contradictions, and deliver a
              structured decision report.
            </p>
          </div>

          {/* API key inline if needed */}
          {hasKey && (
            <div className="w-full max-w-2xl">
              <ApiKeyInput apiKey={apiKey} onSave={saveKey} />
            </div>
          )}

          {/* Form */}
          <AnalysisForm onSubmit={handleSubmit} disabled={!hasKey || isRunning} />

          {/* Board member preview */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 w-full max-w-3xl opacity-40">
            {(["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const).map((role) => (
              <div key={role} className="text-center">
                <div className="w-12 h-12 mx-auto rounded bg-[var(--color-surface-card)] pixel-border flex items-center justify-center text-xs font-[family-name:var(--font-retro)] text-gray-500">
                  {role.toUpperCase()}
                </div>
              </div>
            ))}
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
          <div className="font-[family-name:var(--font-retro)] text-xs text-green-400">
            ANALYSIS COMPLETE — {(state.report.totalDurationMs / 1000).toFixed(1)}s
          </div>
          <ExportButton report={state.report} />
        </div>
      )}

      {/* Error state */}
      {state.phase === "error" && (
        <div className="mt-6 pixel-border p-4 bg-red-900/20 border-red-500 max-w-2xl">
          <h3 className="font-[family-name:var(--font-retro)] text-xs text-red-400 mb-2">
            ERROR
          </h3>
          <p className="text-sm text-red-300">{state.error}</p>
          <RetroButton onClick={reset} variant="secondary" className="mt-4">
            Try Again
          </RetroButton>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-xs text-gray-600">
        COMEX Board by{" "}
        <a
          href="https://github.com/jonathanty-byte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-[var(--color-dbz-orange)]"
        >
          Jonathan Ty
        </a>
        {" "}— Powered by OpenRouter
      </footer>
    </main>
  );
}
