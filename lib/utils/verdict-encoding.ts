import type { BoardroomReport, ViabilityScore } from "@boardroom/engine";

/**
 * Compact verdict data for URL encoding.
 * Kept minimal to produce short URLs (~200-300 chars base64).
 */
export interface CompactVerdict {
  /** Viability score (0-10) */
  s: number;
  /** Idea preview (max 80 chars) */
  i: string;
  /** Individual verdicts (6 strings) */
  v: string[];
  /** Collective verdict */
  c: string;
}

const TIER_THRESHOLDS: Array<{ min: number; tier: ViabilityScore["tier"] }> = [
  { min: 8, tier: "green" },
  { min: 6, tier: "yellow" },
  { min: 4, tier: "orange" },
  { min: 0, tier: "red" },
];

const CEO_ONE_LINERS: Record<ViabilityScore["tier"], string> = {
  green: "Ship it. The board is behind you.",
  yellow: "Promising, but the CFO has questions.",
  orange: "Pivot territory. Listen to the CTO.",
  red: "Back to the whiteboard. The board says no.",
};

export function getTierFromScore(score: number): ViabilityScore["tier"] {
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier;
  }
  return "red";
}

export function getOneLinerFromScore(score: number): string {
  return CEO_ONE_LINERS[getTierFromScore(score)];
}

function toBase64Url(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return decodeURIComponent(escape(atob(base64)));
}

export function encodeVerdict(report: BoardroomReport): string {
  const ideaPreview = (report.content || report.ceoVision || "BoardRoom AI Analysis").slice(0, 80);
  const compact: CompactVerdict = {
    s: report.viabilityScore?.score ?? 0,
    i: ideaPreview,
    v: report.round1.map((r) => r.output.verdict),
    c: report.synthesis.collectiveVerdict,
  };
  return toBase64Url(JSON.stringify(compact));
}

export function decodeVerdict(encoded: string): CompactVerdict | null {
  try {
    const json = fromBase64Url(encoded);
    const data = JSON.parse(json);
    if (typeof data.s !== "number" || typeof data.i !== "string" || !Array.isArray(data.v)) {
      return null;
    }
    return data as CompactVerdict;
  } catch {
    return null;
  }
}
