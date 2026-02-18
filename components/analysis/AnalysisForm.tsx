"use client";

import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { RECOMMENDED_MODELS } from "@/lib/utils/constants";

interface AnalysisFormProps {
  onSubmit: (content: string, ceoVision: string, model: string) => void;
  disabled: boolean;
}

export function AnalysisForm({ onSubmit, disabled }: AnalysisFormProps) {
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
        <label className="stat-label block mb-2">
          CEO VISION (OPTIONAL)
        </label>
        <div className="pixel-border-sm">
          <input
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
        <label className="stat-label block mb-2">
          AI MODEL
        </label>
        <div className="pixel-border-sm">
          <select
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
      </div>

      {/* Submit */}
      <RetroButton type="submit" disabled={disabled || !content.trim()}>
        ⚔ LAUNCH BOARDROOM ANALYSIS ⚔
      </RetroButton>
    </form>
  );
}
