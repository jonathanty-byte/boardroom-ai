"use client";

import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { EXAMPLE_BRIEFING, EXAMPLE_CEO_VISION, RECOMMENDED_MODELS } from "@/lib/utils/constants";

interface AnalysisFormProps {
  onSubmit: (content: string, ceoVision: string, model: string) => void;
  disabled: boolean;
  demoMode?: boolean;
}

export function AnalysisForm({ onSubmit, disabled, demoMode }: AnalysisFormProps) {
  const [content, setContent] = useState("");
  const [ceoVision, setCeoVision] = useState("");
  const [model, setModel] = useState(RECOMMENDED_MODELS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, ceoVision, model);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-2xl">
      {/* Main input */}
      <div>
        <label className="stat-label block mb-2 text-[var(--color-dbz-gold)]">
          PROJECT / DECISION BRIEFING
        </label>
        <div className="dialogue-box">
          <textarea
            data-testid="briefing-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your project, business case, or decision..."
            rows={8}
            className="w-full bg-transparent text-gray-200 px-4 py-3 resize-y focus:outline-none placeholder:text-gray-600"
          />
        </div>
      </div>

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

      {/* Model selector — locked in demo mode */}
      <div>
        <label className="stat-label block mb-2">AI MODEL</label>
        {demoMode ? (
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

      {/* Try an example */}
      {!content.trim() && (
        <RetroButton
          variant="secondary"
          data-testid="example-button"
          onClick={() => {
            setContent(EXAMPLE_BRIEFING);
            setCeoVision(EXAMPLE_CEO_VISION);
          }}
        >
          TRY AN EXAMPLE
        </RetroButton>
      )}

      {/* Submit */}
      <RetroButton type="submit" disabled={disabled || !content.trim()} data-testid="launch-button">
        LAUNCH BOARDROOM ANALYSIS
      </RetroButton>
    </form>
  );
}
