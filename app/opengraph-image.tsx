import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BoardRoom AI — Multi-Agent Decision Engine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MEMBERS = [
  { name: "Vegeta", role: "CPO", color: "#E94560" },
  { name: "Bulma", role: "CMO", color: "#9B59B6" },
  { name: "Piccolo", role: "CFO", color: "#2ECC71" },
  { name: "Whis", role: "CRO", color: "#3498DB" },
  { name: "Gohan", role: "CCO", color: "#F39C12" },
  { name: "Trunks", role: "CTO", color: "#00D2FF" },
];

export default function OGImage() {
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
          <div
            style={{
              fontSize: 42,
              fontWeight: "bold",
              color: "#FF6B00",
              letterSpacing: 6,
            }}
          >
            BOARDROOM AI
          </div>
          <div style={{ fontSize: 16, color: "#8888aa", letterSpacing: 3, marginTop: 8 }}>
            MULTI-AGENT AI DECISION ENGINE
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#4a4a8a",
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ color: "#FFD700", fontSize: 18 }}>boardroomai.app</span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#e0e0f0",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          6 AI executives analyze your project.
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#e0e0f0",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Real friction. Real debate. One structured decision.
        </div>
      </div>

      {/* Members row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {MEMBERS.map((m) => (
          <div
            key={m.name}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px 8px",
              border: `2px solid ${m.color}`,
              background: "rgba(26, 26, 56, 0.8)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", color: m.color }}>{m.name}</div>
            <div style={{ fontSize: 12, color: "#8888aa", letterSpacing: 2, marginTop: 4 }}>
              {m.role}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 14, color: "#4a4a8a" }}>Try it free — no account needed</div>
        <div style={{ fontSize: 14, color: "#4a4a8a" }}>
          Built by evolved monkey — x.com/evolved_monkey_
        </div>
      </div>
    </div>,
    { ...size },
  );
}
