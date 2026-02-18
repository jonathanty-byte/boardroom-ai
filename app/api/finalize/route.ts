import type { BoardroomReport, SSEEvent } from "@boardroom/engine";
import { runFinalVerdictFlow } from "@boardroom/engine";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const { report, ceoAnswers, apiKey, model } = body as {
    report?: BoardroomReport;
    ceoAnswers?: string;
    apiKey?: string;
    model?: string;
  };

  if (!report || !ceoAnswers || !apiKey) {
    return new Response(
      JSON.stringify({ error: "report, ceoAnswers, and apiKey are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runFinalVerdictFlow(report, ceoAnswers, apiKey, model, send);
      } catch (error) {
        send({
          type: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
