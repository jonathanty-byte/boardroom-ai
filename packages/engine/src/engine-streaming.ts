import { boardMembers } from "./board-members";
import { extractCEOFollowUp } from "./ceo-followup";
import { flattenDebatesToRound2, runDebateForFriction } from "./debate-engine";
import { identifyFrictions } from "./friction";
import { StreamingAgentRunner } from "./runner-streaming";
import { synthesize } from "./synthesis";
import type {
  AnalysisInput,
  BoardroomReport,
  DebateHistory,
  Round1Result,
  SSEEvent,
} from "./types";

/**
 * Streaming BoardRoom AI Decision Engine.
 * Orchestrates the full analysis pipeline and emits SSE events for each step.
 */
export async function runAnalysis(
  input: AnalysisInput,
  send: (event: SSEEvent) => void,
): Promise<void> {
  const startTime = performance.now();
  const runner = new StreamingAgentRunner(input.apiKey, input.model);

  try {
    // Build briefing
    const briefing = buildBriefing(input);

    // Round 1: 6 parallel analyses with streaming
    send({ type: "state_change", state: "ROUND1_RUNNING" });

    const round1Promises = boardMembers.map((member) =>
      runner.runRound1Streaming(member, briefing, (role, chunk) => {
        send({ type: "member_chunk", role, chunk });
      }),
    );

    const round1Results: Round1Result[] = await Promise.all(round1Promises);

    // Emit all completed results
    for (const r of round1Results) {
      send({ type: "member_complete", role: r.output.role, result: r.output });
    }

    // Friction detection
    send({ type: "state_change", state: "IDENTIFYING_FRICTIONS" });
    const frictions = identifyFrictions(round1Results);
    send({ type: "frictions_detected", frictions });

    // Debate phase: multi-turn moderated debate per friction
    const debateHistories: DebateHistory[] = [];

    if (frictions.length > 0) {
      send({ type: "state_change", state: "DEBATE_RUNNING" });

      for (let i = 0; i < frictions.length; i++) {
        const history = await runDebateForFriction(
          runner,
          frictions[i],
          i,
          round1Results,
          boardMembers,
          send,
        );
        debateHistories.push(history);
      }
    }

    // Convert to legacy Round2Result[] for synthesis backward compat
    const round2Results = flattenDebatesToRound2(debateHistories);

    // Synthesis
    send({ type: "state_change", state: "SYNTHESIZING" });
    const synthesis = synthesize(round1Results, round2Results, frictions, debateHistories);
    send({ type: "synthesis_complete", synthesis });

    // CEO follow-up questions (only if debates were unresolved)
    const ceoFollowUp = extractCEOFollowUp(round1Results, debateHistories);
    if (ceoFollowUp.length > 0) {
      send({ type: "ceo_followup", questions: ceoFollowUp });
    }

    // Build final report
    const totalDurationMs = Math.round(performance.now() - startTime);
    const report: BoardroomReport = {
      projectName: "BoardRoom AI Analysis",
      timestamp: new Date().toISOString(),
      ceoVision: input.ceoVision ?? "",
      round1: round1Results,
      frictions,
      round2: round2Results,
      synthesis,
      totalDurationMs,
      debates: debateHistories.length > 0 ? debateHistories : undefined,
      ceoFollowUp: ceoFollowUp.length > 0 ? ceoFollowUp : undefined,
    };

    send({ type: "analysis_complete", report });
  } catch (error) {
    send({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function buildBriefing(input: AnalysisInput): string {
  const parts = ["# Project Briefing", "", input.content];

  if (input.ceoVision) {
    parts.push("", "# CEO Vision for this session", "", input.ceoVision);
  }

  return parts.join("\n");
}
