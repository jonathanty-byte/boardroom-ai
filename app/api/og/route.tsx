import { ImageResponse } from "next/og";
import {
  decodeVerdict,
  getOneLinerFromScore,
  getTierFromScore,
} from "@/lib/utils/verdict-encoding";

export const runtime = "edge";

const TIER_COLORS: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
};

const TIER_EMOJI: Record<string, string> = {
  green: "\u{1F7E2}",
  yellow: "\u{1F7E1}",
  orange: "\u{1F7E0}",
  red: "\u{1F534}",
};

function fallbackImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0a0a18 0%, #0d0d25 50%, #0a0a18 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
        fontFamily: "monospace",
        color: "#d0d0e8",
        border: "4px solid #4a4a8a",
      }}
    >
      <div style={{ fontSize: 42, fontWeight: "bold", color: "#FF6B00", letterSpacing: 6 }}>
        BOARDROOM AI
      </div>
      <div style={{ fontSize: 24, color: "#8888aa", marginTop: 16, textAlign: "center" }}>
        6 AI executives debate your idea live.
      </div>
      <div style={{ fontSize: 18, color: "#FFD700", marginTop: 32 }}>boardroomai.app</div>
    </div>,
    { width: 1200, height: 630 },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("d");

  if (!encoded) return fallbackImage();

  const verdict = decodeVerdict(encoded);
  if (!verdict) return fallbackImage();

  const tier = getTierFromScore(verdict.s);
  const oneLiner = getOneLinerFromScore(verdict.s);
  const scoreColor = TIER_COLORS[tier];
  const emoji = TIER_EMOJI[tier];
  const ideaText = verdict.i.slice(0, 80);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0a0a18 0%, #0d0d25 50%, #0a0a18 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48,
        fontFamily: "monospace",
        color: "#d0d0e8",
        border: "4px solid #4a4a8a",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, fontWeight: "bold", color: "#FF6B00", letterSpacing: 4 }}>
            BOARDROOM AI
          </div>
          <div style={{ fontSize: 14, color: "#8888aa", letterSpacing: 3, marginTop: 4 }}>
            MULTI-AGENT AI DECISION ENGINE
          </div>
        </div>
        <div style={{ fontSize: 18, color: "#FFD700" }}>boardroomai.app</div>
      </div>

      {/* Center: Score + one-liner */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 120, fontWeight: "bold", color: scoreColor, lineHeight: 1 }}>
            {verdict.s.toFixed(1)}
          </div>
          <div style={{ fontSize: 40, color: "#4a4a6a" }}>/10</div>
        </div>
        <div style={{ fontSize: 24, color: scoreColor, textAlign: "center", marginTop: 8 }}>
          {emoji} {oneLiner}
        </div>
      </div>

      {/* Bottom: idea + footer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontSize: 18,
            color: "#d0d0e8",
            textAlign: "center",
            padding: "12px 24px",
            border: "2px solid #2a2a5a",
            background: "rgba(26, 26, 56, 0.8)",
          }}
        >
          {ideaText}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#4a4a8a",
          }}
        >
          <span>Try it free — no account needed</span>
          <span>Built by evolved monkey</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}
