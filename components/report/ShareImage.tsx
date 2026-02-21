"use client";

import type { BoardMemberRole, BoardroomReport } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES } from "@boardroom/engine";
import html2canvas from "html2canvas";
import { useCallback, useRef } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { useT } from "@/lib/i18n/LanguageContext";
import { getVerdictColor, MEMBER_COLORS } from "@/lib/utils/constants";

interface ShareImageProps {
  report: BoardroomReport;
}

export function ShareImage({ report }: ShareImageProps) {
  const { t } = useT();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCapture = useCallback(async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#0a0a12",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = `boardroom-${report.projectName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [report.projectName]);

  const date = new Date(report.timestamp).toISOString().slice(0, 10);
  const roles: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];

  return (
    <>
      {/* Hidden render target for html2canvas */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: 1200,
            height: 630,
            background: "linear-gradient(180deg, #0a0a18 0%, #0d0d25 50%, #0a0a18 100%)",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "monospace",
            color: "#d0d0e8",
            border: "4px solid #4a4a8a",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#FF6B00",
                  letterSpacing: 4,
                  textShadow: "2px 2px 0 #000",
                }}
              >
                BOARDROOM AI
              </div>
              <div style={{ fontSize: 14, color: "#8888aa", letterSpacing: 2, marginTop: 4 }}>
                {t("shareImage.subtitle")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, color: "#FFD700", fontWeight: "bold" }}>
                {report.projectName}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{date}</div>
            </div>
          </div>

          {/* Board members row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              margin: "24px 0",
            }}
          >
            {roles.map((role) => {
              const member = report.round1.find((r) => r.output.role === role);
              if (!member) return null;
              const verdict = member.output.verdict;
              const verdictColor = getVerdictColor(verdict);

              return (
                <div
                  key={role}
                  style={{
                    flex: 1,
                    background: "linear-gradient(180deg, #1a1a38 0%, #0e0e22 100%)",
                    border: `3px solid ${MEMBER_COLORS[role]}`,
                    padding: 16,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: MEMBER_COLORS[role],
                      marginBottom: 4,
                    }}
                  >
                    {BOARD_MEMBER_NAMES[role]}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#8888aa",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {t(`role.${role}`)
                      .replace(/^(Chief |Directeur )/, "")
                      .toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: verdictColor,
                      padding: "4px 8px",
                      background: `${verdictColor}15`,
                      border: `1px solid ${verdictColor}40`,
                    }}
                  >
                    {verdict}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collective verdict */}
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              borderTop: "2px solid #2a2a5a",
              borderBottom: "2px solid #2a2a5a",
            }}
          >
            <div style={{ fontSize: 14, color: "#8888aa", letterSpacing: 3, marginBottom: 8 }}>
              {t("shareImage.collectiveVerdict")}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: "bold",
                color: getVerdictColor(report.synthesis.collectiveVerdict),
                textShadow: `0 0 20px ${getVerdictColor(report.synthesis.collectiveVerdict)}40`,
                letterSpacing: 6,
              }}
            >
              {report.synthesis.collectiveVerdict}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 14, color: "#4a4a8a" }}>boardroomai.app</div>
            <div style={{ fontSize: 14, color: "#4a4a8a" }}>{t("shareImage.footer")}</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <RetroButton data-testid="share-image-button" onClick={handleCapture} variant="secondary">
        {t("shareImage.button")}
      </RetroButton>
    </>
  );
}
