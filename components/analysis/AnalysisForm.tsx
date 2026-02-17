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
      <div>
        <label className="block text-xs font-[family-name:var(--font-retro)] text-[var(--color-dbz-orange)] mb-2">
          YOUR DECISION / PROJECT
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your project, business case, or decision to analyze...&#10;&#10;The more context you provide, the better the analysis."
          rows={8}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white px-4 py-3 text-base font-mono resize-y focus:border-[var(--color-dbz-orange)] focus:outline-none placeholder:text-gray-600"
        />
      </div>

      <div>
        <label className="block text-xs font-[family-name:var(--font-retro)] text-gray-400 mb-2">
          CEO VISION (OPTIONAL)
        </label>
        <input
          type="text"
          value={ceoVision}
          onChange={(e) => setCeoVision(e.target.value)}
          placeholder="Focus the analysis: e.g. 'Focus on unit economics' or 'Is this technically feasible?'"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white px-4 py-2 text-base font-mono focus:border-[var(--color-dbz-orange)] focus:outline-none placeholder:text-gray-600"
        />
      </div>

      <div>
        <label className="block text-xs font-[family-name:var(--font-retro)] text-gray-400 mb-2">
          MODEL
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white px-4 py-2 text-base font-mono focus:border-[var(--color-dbz-orange)] focus:outline-none"
        >
          {RECOMMENDED_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.description}
            </option>
          ))}
        </select>
      </div>

      <RetroButton type="submit" disabled={disabled || !content.trim()}>
        Launch COMEX Analysis
      </RetroButton>
    </form>
  );
}
