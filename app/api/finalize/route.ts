import type { BoardroomReport, SSEEvent } from "@boardroom/engine";
import { runFinalVerdictFlow } from "@boardroom/engine";
import { checkDemoRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const { report, ceoAnswers, apiKey, model } = body as {
    report?: BoardroomReport;
    ceoAnswers?: string;
    apiKey?: string;
    model?: string;
  };

  const effectiveKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (!report || !ceoAnswers || !effectiveKey) {
    return new Response(
      JSON.stringify({ error: "report, ceoAnswers, and apiKey are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Rate limit demo mode
  if (!apiKey && effectiveKey) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { limited } = checkDemoRateLimit(ip);
    if (limited) {
      return new Response(
        JSON.stringify({
          error: "Demo limit reached for today. Come back tomorrow or use your own OpenRouter key!",
          demo_exhausted: true,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runFinalVerdictFlow(report, ceoAnswers, effectiveKey, model, send);
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
