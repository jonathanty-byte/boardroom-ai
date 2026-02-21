"use client";

import { useEffect, useState } from "react";
import { getLocalStats } from "@/lib/utils/verdict-storage";

const TIER_COLORS: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
};

interface CounterData {
  totalIdeas: number;
  recentIdeas: Array<{ preview: string; score: number; tier: string }>;
}

export function LiveCounters() {
  const [data, setData] = useState<CounterData | null>(null);

  useEffect(() => {
    const stats = getLocalStats();
    if (stats.totalIdeas > 0) {
      setData(stats);
    }
  }, []);

  if (!data) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Counter */}
      <div className="text-center">
        <span className="rpg-title text-sm text-[var(--color-dbz-gold)]">{data.totalIdeas}</span>
        <span className="stat-label text-gray-500 ml-2">
          {data.totalIdeas === 1 ? "IDEA DEBATED" : "IDEAS DEBATED"}
        </span>
      </div>

      {/* Recent ideas horizontal scroll */}
      {data.recentIdeas.length > 0 && (
        <div className="w-full overflow-x-auto">
          <div className="flex gap-3 justify-center px-2">
            {data.recentIdeas.map((idea, i) => (
              <div
                key={`recent-${i}-${idea.score}`}
                className="pixel-border-sm p-3 min-w-[180px] max-w-[260px] shrink-0"
              >
                <div className="font-[family-name:var(--font-terminal)] text-sm text-gray-400 truncate">
                  {idea.preview || "Unnamed idea"}
                </div>
                <div
                  className="stat-label mt-1"
                  style={{ color: TIER_COLORS[idea.tier] ?? "#6b7280" }}
                >
                  {idea.score}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
