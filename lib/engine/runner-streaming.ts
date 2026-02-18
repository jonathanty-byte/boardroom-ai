import OpenAI from "openai";
import type {
  BoardMemberConfig,
  BoardMemberRole,
  Round1Output,
  Round1Result,
  Round2Response,
  Round2Result,
} from "./types";

const DEFAULT_MODEL = "deepseek/deepseek-v3.2";

export class StreamingAgentRunner {
  private model: string;

  constructor(
    private apiKey: string,
    model?: string,
  ) {
    this.model = model ?? DEFAULT_MODEL;
  }

  private createClient(): OpenAI {
    return new OpenAI({
      apiKey: this.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://boardroom-ai.vercel.app",
        "X-Title": "BoardRoom AI",
      },
    });
  }

  async runRound1Streaming(
    config: BoardMemberConfig,
    briefing: string,
    onChunk: (role: BoardMemberRole, chunk: string) => void,
  ): Promise<Round1Result> {
    const client = this.createClient();
    const start = performance.now();
    let fullText = "";

    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
      messages: [
        { role: "system", content: config.systemPrompt },
        {
          role: "user",
          content: `Here is the project briefing and CEO vision. Analyze it from your perspective.\n\n${briefing}`,
        },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(config.role, delta);
      }
    }

    const durationMs = Math.round(performance.now() - start);
    const output = this.parseRound1(fullText, config);
    return { output, durationMs };
  }

  async runRound2Streaming(
    config: BoardMemberConfig,
    ownVerdict: string,
    adversePositions: string,
    onChunk: (role: BoardMemberRole, chunk: string) => void,
  ): Promise<Round2Result> {
    const client = this.createClient();
    const start = performance.now();
    let fullText = "";

    const prompt = [
      "## Your Round 1 verdict",
      ownVerdict,
      "",
      "## Adverse positions from other board members",
      adversePositions,
      "",
      "React to the adverse positions. You can ATTACK, CONCEDE, or PROPOSE A COMPROMISE.",
      "Be direct, argue, don't be polite for nothing.",
      "",
      "Respond with valid JSON:",
      "{",
      `  "role": "${config.role}",`,
      '  "position": "MAINTAIN" | "CONCEDE" | "COMPROMISE",',
      '  "argument": "Why, in 2-3 sentences max",',
      '  "condition": "If I concede, under what condition. If I maintain, what risk I accept."',
      "}",
      "Respond ONLY with JSON.",
    ].join("\n");

    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      temperature: config.temperature,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are ${config.name}, ${config.title} of the BoardRoom AI board. You are in Round 2 of a contradictory debate. Defend or adjust your position.`,
        },
        { role: "user", content: prompt },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(config.role, delta);
      }
    }

    const durationMs = Math.round(performance.now() - start);
    const output = this.parseRound2(fullText, config);
    return { output, durationMs };
  }

  private extractJSON(raw: string): string {
    // Try to find JSON object in the response, handling various LLM quirks
    // 1. Remove markdown fences anywhere in the text
    let cleaned = raw.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    // 2. Try to find the first { ... } block
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }

  private parseRound1(raw: string, config: BoardMemberConfig): Round1Output {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        role: config.role,
        name: (parsed.name as string) ?? config.name,
        analysis: (parsed.analysis as string) ?? "",
        challenges: Array.isArray(parsed.challenges)
          ? (parsed.challenges as string[])
          : [],
        verdict: (parsed.verdict as Round1Output["verdict"]) ?? "RETHINK",
        verdictDetails:
          (parsed.verdictDetails as Record<string, string>) ?? {},
      };
    } catch {
      throw new Error(
        `${config.name} (${config.role}) returned invalid JSON.\nRaw:\n${raw.slice(0, 500)}`,
      );
    }
  }

  private parseRound2(
    raw: string,
    config: BoardMemberConfig,
  ): Round2Response {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        role: config.role,
        position:
          (parsed.position as Round2Response["position"]) ?? "MAINTAIN",
        argument: (parsed.argument as string) ?? "",
        condition: (parsed.condition as string) ?? "",
      };
    } catch {
      throw new Error(
        `${config.name} (${config.role}) Round 2 returned invalid JSON.\nRaw:\n${raw.slice(0, 500)}`,
      );
    }
  }
}
