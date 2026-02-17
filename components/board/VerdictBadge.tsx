"use client";

import { getVerdictColor, getVerdictCategory } from "@/lib/utils/constants";

interface VerdictBadgeProps {
  verdict: string;
  animated?: boolean;
}

export function VerdictBadge({ verdict, animated = true }: VerdictBadgeProps) {
  const color = getVerdictColor(verdict);
  const category = getVerdictCategory(verdict);
  const bgClass =
    category === "positive"
      ? "bg-green-900/50"
      : category === "negative"
        ? "bg-red-900/50"
        : "bg-amber-900/50";

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-[family-name:var(--font-retro)] font-bold ${bgClass} ${animated ? "verdict-appear" : ""}`}
      style={{ color, borderLeft: `3px solid ${color}` }}
    >
      {verdict}
    </span>
  );
}
