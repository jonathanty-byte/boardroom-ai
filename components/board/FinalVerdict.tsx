"use client";

import type { CEOFinalVerdict } from "@boardroom/engine";
import { VerdictBadge } from "./VerdictBadge";

interface FinalVerdictProps {
  verdict: CEOFinalVerdict | null;
  streamedText: string;
}

export function FinalVerdict({ verdict, streamedText }: FinalVerdictProps) {
  // Streaming state
  if (!verdict && streamedText) {
    return (
      <div className="pixel-border p-4">
        <div className="stat-label mb-3 text-[var(--color-dbz-gold)]">
          FINAL DELIBERATION
        </div>
        <div className="flex gap-3">
          <div className="w-1 flex-shrink-0 rounded-sm bg-[var(--color-dbz-gold)] animate-pulse" />
          <p className="font-[family-name:var(--font-terminal)] text-base text-gray-400">
            <span className="cursor-blink">{streamedText.slice(-400)}</span>
          </p>
        </div>
      </div>
    );
  }

  // Waiting state
  if (!verdict) {
    return (
      <div className="pixel-border p-4">
        <div className="stat-label mb-3 text-[var(--color-dbz-gold)]">
          FINAL DELIBERATION
        </div>
        <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500 animate-pulse text-center">
          The Final Arbiter is weighing all perspectives...
        </p>
      </div>
    );
  }

  // Complete state
  return (
    <div className="pixel-border p-4">
      <div className="stat-label mb-3 text-[var(--color-dbz-gold)]">
        FINAL VERDICT
      </div>

      {/* Big verdict badge */}
      <div className="text-center mb-4 py-3">
        <VerdictBadge verdict={verdict.collectiveVerdict} animated={true} size="lg" />
      </div>

      {/* Reasoning */}
      <div className="dialogue-box p-3 mb-3">
        <div className="stat-label mb-2 text-gray-400">REASONING</div>
        <p className="font-[family-name:var(--font-terminal)] text-base text-gray-300 whitespace-pre-line">
          {verdict.reasoning}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Key actions */}
        {verdict.keyActions.length > 0 && (
          <div className="dialogue-box p-3">
            <div className="stat-label mb-2 text-[var(--color-dbz-green)]">KEY ACTIONS</div>
            {verdict.keyActions.map((a, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
              >
                {a}
              </p>
            ))}
          </div>
        )}

        {/* Risks */}
        {verdict.risks.length > 0 && (
          <div className="dialogue-box p-3">
            <div className="stat-label mb-2 text-[var(--color-dbz-red)]">ACKNOWLEDGED RISKS</div>
            {verdict.risks.map((r, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
              >
                {r}
              </p>
            ))}
          </div>
        )}

        {/* Next steps */}
        {verdict.nextSteps.length > 0 && (
          <div className="dialogue-box p-3">
            <div className="stat-label mb-2 text-[var(--color-dbz-gold)]">NEXT STEPS</div>
            {verdict.nextSteps.map((s, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-1"
              >
                {s}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
