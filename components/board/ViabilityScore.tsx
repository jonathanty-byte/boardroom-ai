"use client";

import type { ViabilityScore } from "@boardroom/engine";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/LanguageContext";

const TIER_COLORS: Record<ViabilityScore["tier"], string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
};

const TIER_EMOJI: Record<ViabilityScore["tier"], string> = {
  green: "\u{1F7E2}",
  yellow: "\u{1F7E1}",
  orange: "\u{1F7E0}",
  red: "\u{1F534}",
};

interface ViabilityScoreProps {
  viabilityScore: ViabilityScore;
  animate?: boolean;
}

export function ViabilityScoreDisplay({ viabilityScore, animate = true }: ViabilityScoreProps) {
  const { t } = useT();
  const [displayScore, setDisplayScore] = useState(animate ? 0 : viabilityScore.score);
  const color = TIER_COLORS[viabilityScore.tier];
  const emoji = TIER_EMOJI[viabilityScore.tier];

  useEffect(() => {
    if (!animate) {
      setDisplayScore(viabilityScore.score);
      return;
    }

    const target = viabilityScore.score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const current = Math.min(target, increment * step);
      setDisplayScore(Math.round(current * 10) / 10);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [viabilityScore.score, animate]);

  const translatedOneLiner =
    t(`ceoOneLiner.${viabilityScore.ceoOneLiner}`) !== `ceoOneLiner.${viabilityScore.ceoOneLiner}`
      ? t(`ceoOneLiner.${viabilityScore.ceoOneLiner}`)
      : viabilityScore.ceoOneLiner;

  return (
    <div className="pixel-border p-6 text-center" data-testid="viability-score">
      <div className="stat-label mb-2">{t("viability.label")}</div>
      <div
        className="rpg-title text-4xl md:text-5xl mb-3 verdict-appear"
        style={{ color, textShadow: `0 0 20px ${color}40` }}
      >
        {displayScore.toFixed(1)}
        <span className="text-2xl text-gray-500">/10</span>
      </div>
      <div
        className="font-[family-name:var(--font-terminal)] text-xl md:text-2xl"
        style={{ color }}
      >
        {emoji} {translatedOneLiner}
      </div>
    </div>
  );
}
