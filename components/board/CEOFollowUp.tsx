"use client";

import type { CEOFollowUpQuestion } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { MEMBER_COLORS } from "@/lib/utils/constants";

const SOURCE_LABELS: Record<CEOFollowUpQuestion["source"], string> = {
  challenge: "Round 1 challenge",
  debate_unresolved: "Unresolved debate",
};

interface CEOFollowUpProps {
  questions: CEOFollowUpQuestion[];
  onFinalize: (ceoAnswers: string) => void;
  disabled?: boolean;
}

export function CEOFollowUp({ questions, onFinalize, disabled }: CEOFollowUpProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const filledCount = Object.values(answers).filter((a) => a.trim().length > 0).length;

  const handleSubmit = () => {
    const parts: string[] = [];
    for (const q of questions) {
      const answer = answers[q.id]?.trim();
      if (answer) {
        parts.push(`Q: ${q.question}`);
        parts.push(`A: ${answer}\n`);
      }
    }
    onFinalize(parts.join("\n"));
  };

  return (
    <div data-testid="ceo-followup-section" className="pixel-border p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="stat-label text-[var(--color-dbz-gold)] mb-1">
          THE BOARD NEEDS YOUR INPUT
        </div>
        <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500">
          {questions.length} unresolved question{questions.length > 1 ? "s" : ""} from the debate
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => {
          const color = MEMBER_COLORS[q.fromMember] ?? "#6b7280";
          const name = BOARD_MEMBER_NAMES[q.fromMember] ?? q.fromMember;

          return (
            <div key={q.id} data-testid={`ceo-question-${q.id}`} className="dialogue-box p-3">
              {/* Member badge + source */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div
                  className="w-1 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-bold" style={{ color }}>
                  {name}
                </span>
                <span className="text-[7px] font-bold px-1.5 py-0.5 tracking-wider bg-[#2a2a4a] text-gray-400">
                  {SOURCE_LABELS[q.source]}
                </span>
              </div>

              {/* Question */}
              <p className="font-[family-name:var(--font-terminal)] text-base text-gray-300 mb-2">
                {q.question}
              </p>

              {/* Answer textarea */}
              <textarea
                data-testid={`ceo-answer-${q.id}`}
                className="w-full bg-[#0a0a1a] border border-[#3a3a6a] text-gray-200 font-[family-name:var(--font-terminal)] text-sm p-2 resize-none focus:border-[var(--color-dbz-gold)] focus:outline-none transition-colors"
                rows={2}
                placeholder="Your answer..."
                value={answers[q.id] ?? ""}
                disabled={disabled}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="mt-4 text-center">
        <RetroButton
          data-testid="ceo-submit"
          onClick={handleSubmit}
          disabled={filledCount === 0 || disabled}
          variant="primary"
        >
          GET FINAL VERDICT ({filledCount}/{questions.length})
        </RetroButton>
        <p className="font-[family-name:var(--font-terminal)] text-[10px] text-gray-600 mt-2">
          Answer at least 1 question — the board will deliver a definitive verdict
        </p>
      </div>
    </div>
  );
}
