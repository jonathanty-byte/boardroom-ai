import { runAnalysis } from "@/lib/engine/engine-streaming";
import type { SSEEvent } from "@/lib/engine/types";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, ceoVision, apiKey, model } = body as {
    content?: string;
    ceoVision?: string;
    apiKey?: string;
    model?: string;
  };

  if (!content || !apiKey) {
    return new Response(JSON.stringify({ error: "content and apiKey are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      await runAnalysis({ content, ceoVision, apiKey, model }, send);
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
