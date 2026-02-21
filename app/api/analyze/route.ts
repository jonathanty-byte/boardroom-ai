import type { SSEEvent } from "@boardroom/engine";
import { runAnalysis } from "@boardroom/engine";
import { checkDemoRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, ceoVision, apiKey, model, locale } = body as {
    content?: string;
    ceoVision?: string;
    apiKey?: string;
    model?: string;
    locale?: string;
  };

  const effectiveKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (!content || !effectiveKey) {
    return new Response(JSON.stringify({ error: "content and apiKey are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limit demo mode (no client key, using server key)
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

      // Force default model in demo mode to control costs
      const effectiveModel = !apiKey && effectiveKey ? undefined : model;
      await runAnalysis(
        { content, ceoVision, apiKey: effectiveKey, model: effectiveModel, locale },
        send,
      );
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
