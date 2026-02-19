import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Color palette (matches the app's DBZ theme) ──────────────
const COLORS = {
  bg: "#0a0a1a",
  orange: "#FF6B00",
  gold: "#FFD700",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#9C27B0",
  cyan: "#00BCD4",
  blue: "#2196F3",
  surface: "#12122a",
  text: "#e5e5e5",
  muted: "#6b7280",
};

const MEMBERS = [
  { role: "CPO", name: "VEGETA", color: COLORS.orange, verdict: "GO_WITH_CHANGES" },
  { role: "CMO", name: "BULMA", color: COLORS.blue, verdict: "GO" },
  { role: "CFO", name: "PICCOLO", color: COLORS.green, verdict: "RETHINK" },
  { role: "CRO", name: "WHIS", color: COLORS.purple, verdict: "GO_WITH_CHANGES" },
  { role: "CCO", name: "GOHAN", color: COLORS.red, verdict: "NEEDS_RESEARCH" },
  { role: "CTO", name: "TRUNKS", color: COLORS.cyan, verdict: "GO" },
];

// ── Typewriter effect ────────────────────────────────────────
const Typewriter: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 1.5, style }) => {
  const frame = useCurrentFrame();
  const charsToShow = Math.floor((frame - startFrame) * speed);
  const displayed = text.slice(0, Math.max(0, charsToShow));
  const showCursor = frame > startFrame && charsToShow < text.length + 10;

  return (
    <span style={{ fontFamily: "'Courier New', monospace", ...style }}>
      {displayed}
      {showCursor && (
        <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0 }}>▌</span>
      )}
    </span>
  );
};

// ── Fade in/out wrapper ──────────────────────────────────────
const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 10 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity }}>{children}</div>;
};

// ── Slide up wrapper ─────────────────────────────────────────
const SlideUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 15 } });
  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return <div style={{ transform: `translateY(${y}px)`, opacity }}>{children}</div>;
};

// ── Scene 1: Logo + Tagline (0s - 4s = frames 0-120) ────────
const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const glowOpacity = interpolate(frame, [30, 60], [0, 0.8], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: COLORS.orange,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 8,
            textShadow: `0 0 ${30 * glowOpacity}px ${COLORS.orange}`,
          }}
        >
          BOARDROOM AI
        </div>
        <FadeIn delay={20} duration={15}>
          <div
            style={{
              fontSize: 20,
              color: COLORS.muted,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 4,
              marginTop: 16,
            }}
          >
            6 AI executives. Real debates. Sharper decisions.
          </div>
        </FadeIn>
        <FadeIn delay={50} duration={15}>
          <div
            style={{
              fontSize: 14,
              color: COLORS.gold,
              fontFamily: "'Courier New', monospace",
              marginTop: 24,
              letterSpacing: 2,
            }}
          >
            by evolved monkey
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: The Brief (4s - 10s = frames 120-300) ──────────
const SceneBrief: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ maxWidth: 900, width: "100%" }}>
        {/* Header */}
        <FadeIn duration={8}>
          <div
            style={{
              fontSize: 11,
              color: COLORS.gold,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 4,
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            PROJECT / DECISION BRIEFING
          </div>
        </FadeIn>

        {/* Briefing box */}
        <div
          style={{
            border: `1px solid ${COLORS.gold}33`,
            backgroundColor: COLORS.surface,
            padding: 24,
            borderRadius: 2,
          }}
        >
          <Typewriter
            text="Should we launch our SaaS product in the US market in Q1, or focus on consolidating our existing European base first?"
            startFrame={10}
            speed={2}
            style={{ fontSize: 22, color: COLORS.text, lineHeight: 1.6 }}
          />
        </div>

        {/* CEO Vision */}
        <FadeIn delay={70} duration={10}>
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 10,
                color: COLORS.muted,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              CEO VISION
            </div>
            <div
              style={{
                border: `1px solid ${COLORS.orange}33`,
                backgroundColor: COLORS.surface,
                padding: 16,
                borderRadius: 2,
              }}
            >
              <Typewriter
                text="I want to move fast and capture the US before our competitors do."
                startFrame={80}
                speed={2.5}
                style={{ fontSize: 18, color: COLORS.orange }}
              />
            </div>
          </div>
        </FadeIn>

        {/* Submit button animation */}
        <FadeIn delay={140} duration={8}>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                backgroundColor: COLORS.orange,
                color: "#000",
                padding: "10px 32px",
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 3,
                boxShadow: `0 0 20px ${COLORS.orange}66`,
              }}
            >
              LAUNCH BOARDROOM ANALYSIS
            </div>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Round 1 — Member Grid (10s - 20s = frames 300-600) ─
const SceneRound1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: 40,
        justifyContent: "center",
      }}
    >
      {/* Phase indicator */}
      <FadeIn duration={8}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span
            style={{
              fontSize: 10,
              color: COLORS.orange,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 4,
              fontWeight: 700,
              padding: "4px 12px",
              border: `1px solid ${COLORS.orange}`,
              boxShadow: `0 0 10px ${COLORS.orange}44`,
            }}
          >
            ROUND 1 — INDEPENDENT ANALYSIS
          </span>
        </div>
      </FadeIn>

      {/* Member grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {MEMBERS.map((m, i) => {
          const memberDelay = i * 12;
          const progress = spring({
            frame: frame - memberDelay,
            fps,
            config: { damping: 14 },
          });
          const verdictDelay = 90 + i * 8;
          const showVerdict = frame > verdictDelay;
          const verdictOpacity = interpolate(
            frame,
            [verdictDelay, verdictDelay + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={m.role}
              style={{
                width: 180,
                backgroundColor: COLORS.surface,
                border: `1px solid ${m.color}44`,
                padding: 16,
                textAlign: "center",
                opacity: progress,
                transform: `translateY(${(1 - progress) * 30}px)`,
              }}
            >
              {/* Avatar placeholder */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  border: `2px solid ${m.color}`,
                  margin: "0 auto 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  color: m.color,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {m.name[0]}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: m.color,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {m.name}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: COLORS.muted,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 2,
                }}
              >
                {m.role}
              </div>

              {/* Streaming indicator */}
              {frame > memberDelay + 15 && !showVerdict && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 10,
                    color: COLORS.muted,
                    fontFamily: "'Courier New', monospace",
                    opacity: Math.sin(frame * 0.15) * 0.5 + 0.5,
                  }}
                >
                  analyzing...
                </div>
              )}

              {/* Verdict badge */}
              {showVerdict && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "3px 8px",
                    fontSize: 9,
                    fontWeight: 800,
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 1,
                    backgroundColor:
                      m.verdict === "GO"
                        ? COLORS.green
                        : m.verdict === "RETHINK"
                          ? COLORS.red
                          : COLORS.gold,
                    color: "#000",
                    opacity: verdictOpacity,
                  }}
                >
                  {m.verdict.replace(/_/g, " ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overlay text */}
      <FadeIn delay={60} duration={10}>
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: COLORS.muted,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 2,
          }}
        >
          Real-time streaming — each executive thinks independently
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

// ── Scene 4: Friction Detection (20s - 24s = frames 600-720) ──
const SceneFriction: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <FadeIn duration={8}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ fontSize: 28, opacity: Math.sin(frame * 0.2) * 0.5 + 0.5 }}>⚡</span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: COLORS.red,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 4,
              }}
            >
              FRICTION DETECTED
            </span>
            <span style={{ fontSize: 28, opacity: Math.sin(frame * 0.2 + Math.PI) * 0.5 + 0.5 }}>⚡</span>
          </div>
        </FadeIn>

        <FadeIn delay={15} duration={10}>
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                border: `1px solid ${COLORS.red}44`,
                backgroundColor: COLORS.surface,
                padding: 16,
                margin: "8px 0",
                maxWidth: 600,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.gold, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                US Market Entry Risk
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Courier New', monospace", marginTop: 4 }}>
                PICCOLO (CFO) vs VEGETA (CPO) — opposing positions on runway burn
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${COLORS.red}44`,
                backgroundColor: COLORS.surface,
                padding: 16,
                margin: "8px 0",
                maxWidth: 600,
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.gold, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                Team Readiness
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Courier New', monospace", marginTop: 4 }}>
                GOHAN (CCO) vs TRUNKS (CTO) — CS capacity vs infrastructure readiness
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={40} duration={10}>
          <div
            style={{
              marginTop: 20,
              fontSize: 11,
              color: COLORS.purple,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 3,
              opacity: Math.sin(frame * 0.12) * 0.3 + 0.7,
            }}
          >
            INITIATING DEBATE PROTOCOL...
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Debates (24s - 38s = frames 720-1140) ──────────
const SceneDebates: React.FC = () => {
  const frame = useCurrentFrame();

  const debateLines = [
    { name: "PICCOLO", role: "CFO", color: COLORS.green, text: "Burn rate at current ARR makes Q1 US entry high-risk. We need 18 months runway." },
    { name: "VEGETA", role: "CPO", color: COLORS.orange, text: "Waiting 18 months means handing the market to competitors. First-mover premium is real." },
    { name: "PICCOLO", role: "CFO", color: COLORS.green, text: "First-mover means nothing without localization budget. US sales cycles are 3x longer." },
    { name: "VEGETA", role: "CPO", color: COLORS.orange, text: "Scale down scope — seed 3 cities, prove traction. Low burn, high upside." },
  ];

  const debate2Lines = [
    { name: "GOHAN", role: "CCO", color: COLORS.red, text: "CS team isn't scaled for US timezone coverage. Churn risk damages the brand." },
    { name: "TRUNKS", role: "CTO", color: COLORS.cyan, text: "Infrastructure is cloud-native, region switch is 2 sprints. Technical readiness is not the constraint." },
    { name: "GOHAN", role: "CCO", color: COLORS.red, text: "Agreed on infra. Constraint is human capital — we need 2 CS hires minimum." },
    { name: "TRUNKS", role: "CTO", color: COLORS.cyan, text: "That's a Q1 HR action, not a reason to delay. Hire concurrent with ramp-up." },
  ];

  const showDebate2 = frame > 200;
  const currentDebate = showDebate2 ? debate2Lines : debateLines;
  const debateFrame = showDebate2 ? frame - 200 : frame;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: "40px 60px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span
          style={{
            fontSize: 10,
            color: COLORS.purple,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 4,
            fontWeight: 700,
          }}
        >
          MULTI-TURN DEBATE {showDebate2 ? "2 of 2" : "1 of 2"}
        </span>
        <span
          style={{
            fontSize: 10,
            color: showDebate2 ? COLORS.red : COLORS.green,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 2,
            padding: "2px 8px",
            border: `1px solid ${showDebate2 ? COLORS.red : COLORS.green}`,
          }}
        >
          {showDebate2 ? "IMPASSE" : "CONVERGING"}
        </span>
      </div>

      <div style={{ fontSize: 13, color: COLORS.gold, fontFamily: "'Courier New', monospace", marginBottom: 16, fontWeight: 700 }}>
        {showDebate2 ? "Team Readiness" : "US Market Entry Risk"}
      </div>

      {/* Debate messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {currentDebate.map((line, i) => {
          const lineDelay = i * 40;
          const visible = debateFrame > lineDelay;
          const opacity = interpolate(
            debateFrame,
            [lineDelay, lineDelay + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          if (!visible) return null;

          return (
            <div
              key={`${line.name}-${i}`}
              style={{
                borderLeft: `3px solid ${line.color}`,
                padding: "8px 16px",
                opacity,
                backgroundColor: `${line.color}08`,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: line.color,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {line.name} ({line.role})
              </span>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.text,
                  fontFamily: "'Courier New', monospace",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation flash for debate 2 */}
      {showDebate2 && debateFrame > 160 && (
        <FadeIn delay={0} duration={5}>
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 12,
              color: COLORS.red,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 3,
              fontWeight: 700,
              opacity: Math.sin(frame * 0.15) * 0.3 + 0.7,
            }}
          >
            UNRESOLVED — ESCALATING TO CEO
          </div>
        </FadeIn>
      )}
    </AbsoluteFill>
  );
};

// ── Scene 6: Synthesis (38s - 44s = frames 1140-1320) ────────
const SceneSynthesis: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
        <FadeIn duration={8}>
          <div
            style={{
              fontSize: 10,
              color: COLORS.gold,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 4,
              marginBottom: 20,
            }}
          >
            SYNTHESIS — FINAL JUDGMENT
          </div>
        </FadeIn>

        {/* Collective verdict */}
        <SlideUp delay={10}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#000",
              backgroundColor: COLORS.gold,
              padding: "12px 40px",
              display: "inline-block",
              fontFamily: "'Courier New', monospace",
              letterSpacing: 4,
              boxShadow: `0 0 30px ${COLORS.gold}44`,
            }}
          >
            GO WITH CHANGES
          </div>
        </SlideUp>

        {/* Three columns */}
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          <FadeIn delay={30} duration={10}>
            <div style={{ flex: 1, border: `1px solid ${COLORS.green}33`, backgroundColor: COLORS.surface, padding: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 8 }}>
                CONSENSUS
              </div>
              <div style={{ fontSize: 11, color: COLORS.text, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>
                Infrastructure ready for US deployment. Limited pilot approach agreed.
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={45} duration={10}>
            <div style={{ flex: 1, border: `1px solid ${COLORS.gold}33`, backgroundColor: COLORS.surface, padding: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: COLORS.gold, fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 8 }}>
                COMPROMISES
              </div>
              <div style={{ fontSize: 11, color: COLORS.text, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>
                Seed 3 cities only. 1 CS hire pre-launch, second tied to traction.
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={60} duration={10}>
            <div style={{ flex: 1, border: `1px solid ${COLORS.red}33`, backgroundColor: COLORS.surface, padding: 16, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: COLORS.red, fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 8 }}>
                IMPASSES
              </div>
              <div style={{ fontSize: 11, color: COLORS.text, fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}>
                CS headcount timing unresolved. Escalated to CEO.
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 7: CEO Q&A + Final Verdict (44s - 54s = frames 1320-1620) ─
const SceneFinalVerdict: React.FC = () => {
  const frame = useCurrentFrame();

  const showVerdict = frame > 120;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        padding: "40px 60px",
      }}
    >
      {!showVerdict ? (
        /* CEO Q&A Phase */
        <div>
          <FadeIn duration={8}>
            <div style={{ fontSize: 10, color: COLORS.orange, fontFamily: "'Courier New', monospace", letterSpacing: 4, marginBottom: 20 }}>
              CEO FOLLOW-UP — CLARIFICATION NEEDED
            </div>
          </FadeIn>
          <FadeIn delay={10} duration={10}>
            <div style={{ border: `1px solid ${COLORS.gold}33`, backgroundColor: COLORS.surface, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: COLORS.gold, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>Q1</div>
              <div style={{ fontSize: 13, color: COLORS.text, fontFamily: "'Courier New', monospace", marginTop: 4, lineHeight: 1.5 }}>
                What is your actual Q1 runway, and is bridge financing available?
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={30} duration={10}>
            <div style={{ border: `1px solid ${COLORS.gold}33`, backgroundColor: COLORS.surface, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.gold, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>Q2</div>
              <div style={{ fontSize: 13, color: COLORS.text, fontFamily: "'Courier New', monospace", marginTop: 4, lineHeight: 1.5 }}>
                Are you prepared to authorize 2 CS hires before US launch?
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={60} duration={10}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  backgroundColor: COLORS.orange,
                  color: "#000",
                  padding: "8px 24px",
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 3,
                  display: "inline-block",
                }}
              >
                SUBMIT TO FINAL ARBITER
              </div>
            </div>
          </FadeIn>
        </div>
      ) : (
        /* Final Verdict */
        <div>
          <FadeIn duration={8}>
            <div
              style={{
                textAlign: "center",
                fontSize: 10,
                color: COLORS.gold,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 6,
                marginBottom: 24,
              }}
            >
              FINAL VERDICT — THE ARBITER
            </div>
          </FadeIn>

          <SlideUp delay={8}>
            <div
              style={{
                border: `2px solid ${COLORS.gold}`,
                padding: 32,
                backgroundColor: COLORS.surface,
                boxShadow: `0 0 40px ${COLORS.gold}22`,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#000",
                    backgroundColor: COLORS.green,
                    padding: "8px 24px",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 3,
                  }}
                >
                  CONDITIONAL APPROVE
                </span>
              </div>

              <Typewriter
                text="Launch in US market Q1 — under structured constraints. Seed 3 pilot cities (NYC, SF, Austin). 1 CS hire pre-launch, second tied to first contract. Track US burn weekly. Institute 30-day NPS gates per account."
                startFrame={20}
                speed={3}
                style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.7 }}
              />
            </div>
          </SlideUp>

          <FadeIn delay={80} duration={10}>
            <div
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 12,
                color: COLORS.gold,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 3,
              }}
            >
              One verdict. No ambiguity.
            </div>
          </FadeIn>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Scene 8: Closing Card (54s - 60s = frames 1620-1800) ─────
const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const glowIntensity = interpolate(frame, [0, 60, 120, 180], [0, 1, 0.6, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.orange,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 6,
            textShadow: `0 0 ${40 * glowIntensity}px ${COLORS.orange}`,
          }}
        >
          BOARDROOM AI
        </div>
        <FadeIn delay={15} duration={12}>
          <div
            style={{
              fontSize: 16,
              color: COLORS.text,
              fontFamily: "'Courier New', monospace",
              marginTop: 16,
              letterSpacing: 2,
            }}
          >
            Your executive team. Always available. Never vague.
          </div>
        </FadeIn>
        <FadeIn delay={35} duration={12}>
          <div
            style={{
              fontSize: 14,
              color: COLORS.gold,
              fontFamily: "'Courier New', monospace",
              marginTop: 24,
              letterSpacing: 3,
            }}
          >
            Try demo mode — no account needed
          </div>
        </FadeIn>
        <FadeIn delay={55} duration={12}>
          <div
            style={{
              fontSize: 12,
              color: COLORS.muted,
              fontFamily: "'Courier New', monospace",
              marginTop: 12,
            }}
          >
            by evolved monkey
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ─────────────────────────────────────────
export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Scene 1: Logo (0s - 4s) */}
      <Sequence from={0} durationInFrames={120}>
        <SceneLogo />
      </Sequence>

      {/* Scene 2: Brief (4s - 10s) */}
      <Sequence from={120} durationInFrames={180}>
        <SceneBrief />
      </Sequence>

      {/* Scene 3: Round 1 (10s - 20s) */}
      <Sequence from={300} durationInFrames={300}>
        <SceneRound1 />
      </Sequence>

      {/* Scene 4: Friction (20s - 24s) */}
      <Sequence from={600} durationInFrames={120}>
        <SceneFriction />
      </Sequence>

      {/* Scene 5: Debates (24s - 38s) */}
      <Sequence from={720} durationInFrames={420}>
        <SceneDebates />
      </Sequence>

      {/* Scene 6: Synthesis (38s - 44s) */}
      <Sequence from={1140} durationInFrames={180}>
        <SceneSynthesis />
      </Sequence>

      {/* Scene 7: CEO + Final Verdict (44s - 54s) */}
      <Sequence from={1320} durationInFrames={300}>
        <SceneFinalVerdict />
      </Sequence>

      {/* Scene 8: Closing (54s - 60s) */}
      <Sequence from={1620} durationInFrames={180}>
        <SceneClosing />
      </Sequence>
    </AbsoluteFill>
  );
};
