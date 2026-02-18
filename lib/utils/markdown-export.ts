import type { BoardMemberRole, BoardroomReport } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@boardroom/engine";

export function formatBoardroomReport(report: BoardroomReport): string {
  const lines: string[] = [];
  const date = new Date(report.timestamp);
  const dateStr = date.toISOString().slice(0, 10);

  lines.push(`# BoardRoom Report — ${report.projectName} — ${dateStr}`);
  lines.push("");

  // CEO Vision
  lines.push("## CEO Vision");
  lines.push(report.ceoVision || "(Not specified)");
  lines.push("");

  // Individual verdicts summary
  lines.push("## Individual Verdicts");
  lines.push("");
  for (const r of report.round1) {
    const details = Object.values(r.output.verdictDetails).filter(Boolean).join(" | ");
    lines.push(
      `- **${r.output.name}** (${BOARD_MEMBER_TITLES[r.output.role]}): **${r.output.verdict}** — ${details.slice(0, 150)}`,
    );
  }
  lines.push("");

  // Collective verdict
  lines.push(`## Collective Verdict: **${report.synthesis.collectiveVerdict}**`);
  lines.push("");

  // Full analyses
  lines.push("---");
  lines.push("");
  lines.push("## Round 1 — Independent Analyses");
  lines.push("");

  for (const r of report.round1) {
    lines.push(`### [${r.output.name} — ${BOARD_MEMBER_TITLES[r.output.role]}]`);
    lines.push(`**Verdict: ${r.output.verdict}**`);
    lines.push("");
    lines.push(r.output.analysis);
    lines.push("");

    if (r.output.challenges.length > 0) {
      lines.push("**Challenges for the CEO:**");
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
    lines.push("## Friction Points");
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
    lines.push("## Multi-Turn Debate");
    lines.push("");

    for (const debate of report.debates) {
      lines.push(`### ${debate.friction.description}`);
      lines.push(`*Outcome: ${debate.outcome} (${debate.totalTurns} turns)*`);
      lines.push("");
      lines.push(`**Moderator:** ${debate.moderatorOpening}`);
      lines.push("");

      for (const turn of debate.turns) {
        const name = BOARD_MEMBER_NAMES[turn.speaker];
        const addressedNames = turn.addressedTo
          .map((r) => BOARD_MEMBER_NAMES[r] ?? r.toUpperCase())
          .filter(Boolean);
        const addressed =
          addressedNames.length > 0 ? ` → ${addressedNames.join(", ")}` : "";
        lines.push(`**${name}** [${turn.type}${addressed}]:`);
        if (turn.quotedFrom) {
          lines.push(`> ${turn.quotedFrom}`);
        }
        lines.push(turn.content);
        if (turn.positionShift !== "UNCHANGED") {
          lines.push(`*Position: ${turn.positionShift}*`);
        }
        lines.push("");
      }

      lines.push(`**Resolution:** ${debate.outcomeSummary}`);
      lines.push("");
    }
  } else if (report.round2.length > 0) {
    // Legacy Round 2 format
    lines.push("---");
    lines.push("");
    lines.push("## Round 2 — Contradictory Debate");
    lines.push("");
    for (const r of report.round2) {
      const name = BOARD_MEMBER_NAMES[r.output.role];
      lines.push(`- **${name}**: **${r.output.position}** — ${r.output.argument}`);
      if (r.output.condition) {
        lines.push(`  - *Condition:* ${r.output.condition}`);
      }
    }
    lines.push("");
  }

  // Synthesis
  lines.push("---");
  lines.push("");
  lines.push("## Synthesis");
  lines.push("");

  if (report.synthesis.consensus.length > 0) {
    lines.push("### Consensus");
    report.synthesis.consensus.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (report.synthesis.compromises.length > 0) {
    lines.push("### Compromises Found");
    report.synthesis.compromises.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  if (report.synthesis.impasses.length > 0) {
    lines.push("### Impasses (CEO must decide)");
    report.synthesis.impasses.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  // CEO Follow-Up Questions & Answers
  if (report.ceoFollowUp && report.ceoFollowUp.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## CEO Follow-Up Questions");
    lines.push("");
    for (const q of report.ceoFollowUp) {
      const name = BOARD_MEMBER_NAMES[q.fromMember as BoardMemberRole] ?? q.fromMember;
      lines.push(`${q.id}. **${name}** (${q.source === "challenge" ? "Round 1" : "Debate"}): ${q.question}`);
    }
    lines.push("");

    if (report.ceoAnswers) {
      lines.push("### CEO Answers");
      lines.push("");
      lines.push(report.ceoAnswers);
      lines.push("");
    }
  }

  // Final Verdict (after CEO input)
  if (report.finalVerdict) {
    lines.push("---");
    lines.push("");
    lines.push(`## Final Verdict: **${report.finalVerdict.collectiveVerdict}**`);
    lines.push("");
    lines.push(report.finalVerdict.reasoning);
    lines.push("");

    if (report.finalVerdict.keyActions.length > 0) {
      lines.push("### Key Actions");
      report.finalVerdict.keyActions.forEach((a) => lines.push(`- ${a}`));
      lines.push("");
    }

    if (report.finalVerdict.risks.length > 0) {
      lines.push("### Acknowledged Risks");
      report.finalVerdict.risks.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }

    if (report.finalVerdict.nextSteps.length > 0) {
      lines.push("### Next Steps");
      report.finalVerdict.nextSteps.forEach((s) => lines.push(`- ${s}`));
      lines.push("");
    }
  }

  lines.push("");
  lines.push(
    `*Generated by BoardRoom AI — ${report.totalDurationMs ? `${(report.totalDurationMs / 1000).toFixed(1)}s` : ""}*`,
  );

  return lines.join("\n");
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
