import { boardMembers } from "./board-members";
import { identifyFrictions } from "./friction";
import { StreamingAgentRunner } from "./runner-streaming";
import { synthesize } from "./synthesis";
import type { AnalysisInput, BoardroomReport, Round1Result, Round2Result, SSEEvent } from "./types";

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

    // Round 2: debate on frictions
    const round2Results: Round2Result[] = [];

    if (frictions.length > 0) {
      send({ type: "state_change", state: "ROUND2_RUNNING" });

      for (const friction of frictions) {
        const debatePromises = friction.members.map((role) => {
          const member = boardMembers.find((m) => m.role === role)!;
          const ownResult = round1Results.find((r) => r.output.role === role)!;

          const ownVerdict = [
            `Your verdict: ${ownResult.output.verdict}`,
            ownResult.output.analysis.slice(0, 500),
          ].join("\n");

          const adversaries = friction.members
            .filter((r) => r !== role)
            .map((advRole) => {
              const adv = round1Results.find((r) => r.output.role === advRole)!;
              return `[${adv.output.name} - ${adv.output.verdict}]\n${adv.output.analysis.slice(0, 500)}`;
            })
            .join("\n\n");

          return runner.runRound2Streaming(member, ownVerdict, adversaries, (role, chunk) => {
            send({ type: "debate_chunk", role, chunk });
          });
        });

        const results = await Promise.all(debatePromises);
        for (const r of results) {
          send({
            type: "debate_complete",
            role: r.output.role,
            result: r.output,
          });
        }
        round2Results.push(...results);
      }
    }

    // Synthesis
    send({ type: "state_change", state: "SYNTHESIZING" });
    const synthesis = synthesize(round1Results, round2Results, frictions);
    send({ type: "synthesis_complete", synthesis });

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
