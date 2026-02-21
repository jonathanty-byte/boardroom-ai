import type { BoardMemberRole, BoardroomReport } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@boardroom/engine";
import { type Locale, translations } from "@/lib/i18n/translations";

function mt(key: string, locale: Locale, params?: Record<string, string | number>): string {
  let value = translations[locale][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

export function formatBoardroomReport(report: BoardroomReport, locale: Locale = "en"): string {
  const lines: string[] = [];
  const date = new Date(report.timestamp);
  const dateStr = date.toISOString().slice(0, 10);

  lines.push(`# ${mt("md.title", locale, { projectName: report.projectName, date: dateStr })}`);
  lines.push("");

  // CEO Vision
  lines.push(`## ${mt("md.ceoVision", locale)}`);
  lines.push(report.ceoVision || mt("md.ceoVisionDefault", locale));
  lines.push("");

  // Viability Score
  if (report.viabilityScore) {
    lines.push(`## ${mt("md.viabilityScore", locale, { score: report.viabilityScore.score })}`);
    lines.push(report.viabilityScore.ceoOneLiner);
    lines.push("");
  }

  // Individual verdicts summary
  lines.push(`## ${mt("md.individualVerdicts", locale)}`);
  lines.push("");
  for (const r of report.round1) {
    const details = Object.values(r.output.verdictDetails).filter(Boolean).join(" | ");
    lines.push(
      `- **${r.output.name}** (${BOARD_MEMBER_TITLES[r.output.role]}): **${r.output.verdict}** — ${details.slice(0, 150)}`,
    );
  }
  lines.push("");

  // Collective verdict
  lines.push(
    `## ${mt("md.collectiveVerdict", locale, { verdict: report.synthesis.collectiveVerdict })}`,
  );
  lines.push("");

  // Full analyses
  lines.push("---");
  lines.push("");
  lines.push(`## ${mt("md.round1", locale)}`);
  lines.push("");

  for (const r of report.round1) {
    lines.push(`### [${r.output.name} — ${BOARD_MEMBER_TITLES[r.output.role]}]`);
    lines.push(`**Verdict: ${r.output.verdict}**`);
    lines.push("");
    lines.push(r.output.analysis);
    lines.push("");

    if (r.output.challenges.length > 0) {
      lines.push(`**${mt("md.challengesCeo", locale)}**`);
      r.output.challenges.forEach((c) => lines.push(`- ${c}`));
      lines.push("");
    }

    for (const [key, value] of Object.entries(r.output.verdictDetails)) {
      if (value) {
        lines.push(`**${formatKey(key)}:** ${value}`);
      }
    }
    lines.push("");
  }

  // Frictions
  if (report.frictions.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`## ${mt("md.frictionPoints", locale)}`);
    lines.push("");
    for (const f of report.frictions) {
      lines.push(`### ${f.description}`);
      for (const [role, position] of Object.entries(f.positions)) {
        lines.push(
          `- **${BOARD_MEMBER_NAMES[role as keyof typeof BOARD_MEMBER_NAMES]}**: ${position}`,
        );
      }
      lines.push("");
    }
  }

  // Multi-turn debates (V0.2)
  if (report.debates && report.debates.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`## ${mt("md.multiTurnDebate", locale)}`);
    lines.push("");

    for (const debate of report.debates) {
      lines.push(`### ${debate.friction.description}`);
      lines.push(
        `*${mt("md.outcome", locale, { outcome: debate.outcome, turns: debate.totalTurns })}*`,
      );
      lines.push("");
      lines.push(`**${mt("md.moderator", locale)}** ${debate.moderatorOpening}`);
      lines.push("");

      for (const turn of debate.turns) {
        const name = BOARD_MEMBER_NAMES[turn.speaker];
        const addressedNames = turn.addressedTo
          .map((r) => BOARD_MEMBER_NAMES[r] ?? r.toUpperCase())
          .filter(Boolean);
        const addressed = addressedNames.length > 0 ? ` → ${addressedNames.join(", ")}` : "";
        lines.push(`**${name}** [${turn.type}${addressed}]:`);
        if (turn.quotedFrom) {
          lines.push(`> ${turn.quotedFrom}`);
        }
        lines.push(turn.content);
        if (turn.positionShift !== "UNCHANGED") {
          lines.push(`*${mt("md.position", locale, { shift: turn.positionShift })}*`);
        }
        lines.push("");
      }

      lines.push(`**${mt("md.resolution", locale)}** ${debate.outcomeSummary}`);
      lines.push("");
    }
  }

  // Synthesis
  lines.push("---");
  lines.push("");
  lines.push(`## ${mt("md.synthesis", locale)}`);
  lines.push("");

  if (report.synthesis.consensus.length > 0) {
    lines.push(`### ${mt("md.consensus", locale)}`);
    report.synthesis.consensus.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (report.synthesis.compromises.length > 0) {
    lines.push(`### ${mt("md.compromises", locale)}`);
    report.synthesis.compromises.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (report.synthesis.impasses.length > 0) {
    lines.push(`### ${mt("md.impasses", locale)}`);
    report.synthesis.impasses.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (report.synthesis.unresolvedConcerns && report.synthesis.unresolvedConcerns.length > 0) {
    lines.push(`### ${mt("md.unresolvedConcerns", locale)}`);
    report.synthesis.unresolvedConcerns.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  // CEO Follow-Up Questions & Answers
  if (report.ceoFollowUp && report.ceoFollowUp.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push(`## ${mt("md.ceoFollowUp", locale)}`);
    lines.push("");
    for (const q of report.ceoFollowUp) {
      const name = BOARD_MEMBER_NAMES[q.fromMember as BoardMemberRole] ?? q.fromMember;
      lines.push(
        `${q.id}. **${name}** (${q.source === "challenge" ? mt("md.sourceChallenge", locale) : mt("md.sourceDebate", locale)}): ${q.question}`,
      );
    }
    lines.push("");

    if (report.ceoAnswers) {
      lines.push(`### ${mt("md.ceoAnswers", locale)}`);
      lines.push("");
      lines.push(report.ceoAnswers);
      lines.push("");
    }
  }

  // Final Verdict (after CEO input)
  if (report.finalVerdict) {
    lines.push("---");
    lines.push("");
    lines.push(
      `## ${mt("md.finalVerdict", locale, { verdict: report.finalVerdict.collectiveVerdict })}`,
    );
    lines.push("");
    lines.push(report.finalVerdict.reasoning);
    lines.push("");

    if (report.finalVerdict.keyActions.length > 0) {
      lines.push(`### ${mt("md.keyActions", locale)}`);
      report.finalVerdict.keyActions.forEach((a) => lines.push(`- ${a}`));
      lines.push("");
    }

    if (report.finalVerdict.risks.length > 0) {
      lines.push(`### ${mt("md.acknowledgedRisks", locale)}`);
      report.finalVerdict.risks.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }

    if (report.finalVerdict.nextSteps.length > 0) {
      lines.push(`### ${mt("md.nextSteps", locale)}`);
      report.finalVerdict.nextSteps.forEach((s) => lines.push(`- ${s}`));
      lines.push("");
    }
  }

  lines.push("");
  lines.push(
    `*${mt("md.generatedBy", locale, { duration: report.totalDurationMs ? `${(report.totalDurationMs / 1000).toFixed(1)}s` : "" })}*`,
  );

  return lines.join("\n");
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
