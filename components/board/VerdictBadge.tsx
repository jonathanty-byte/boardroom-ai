"use client";

import { getVerdictCategory, getVerdictColor } from "@/lib/utils/constants";

interface VerdictBadgeProps {
  verdict: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  "data-testid"?: string;
}

export function VerdictBadge({
  verdict,
  animated = true,
  size = "md",
  ...rest
}: VerdictBadgeProps) {
  const color = getVerdictColor(verdict);
  const category = getVerdictCategory(verdict);

  const sizeClasses = {
    sm: "text-[7px] px-2 py-0.5",
    md: "text-[9px] px-3 py-1",
    lg: "text-[11px] px-4 py-2",
  };

  return (
    <span
      {...rest}
      className={`inline-block font-bold tracking-wider ${sizeClasses[size]} ${animated ? "verdict-appear" : ""}`}
      style={{
        color: "#000",
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}60, 0 2px 0 0 rgba(0,0,0,0.4)`,
        textShadow: `0 1px 0 ${color}80`,
        clipPath:
          category === "negative"
            ? "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)"
            : undefined,
      }}
    >
      {verdict.replace(/_/g, " ")}
    </span>
  );
}
