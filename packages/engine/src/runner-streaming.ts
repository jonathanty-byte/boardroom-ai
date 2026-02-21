import OpenAI from "openai";
import { MODERATOR_CONFIG, MODERATOR_SYSTEM_PROMPT } from "./moderator";
import type {
  BoardMemberConfig,
  BoardMemberRole,
  CEOFinalVerdict,
  CollectiveVerdict,
  DebateTurn,
  ModeratorAction,
  Round1Output,
  Round1Result,
} from "./types";

const DEFAULT_MODEL = "deepseek/deepseek-v3.2";

export class StreamingAgentRunner {
  private model: string;
  private locale: string;

  constructor(
    private apiKey: string,
    model?: string,
    locale?: string,
  ) {
    this.model = model ?? DEFAULT_MODEL;
    this.locale = locale ?? "en";
  }

  /** Append a language instruction to system prompts when locale is not English. */
  private localizePrompt(systemPrompt: string): string {
    if (this.locale === "fr") {
      return `${systemPrompt}\n\nIMPORTANT: You MUST write ALL your analysis, reasoning, arguments, and text content in French. Keep JSON field names, verdict values (GO, GO_WITH_CHANGES, RETHINK, VIABLE, NOT_VIABLE, etc.), type values (CHALLENGE, RESPONSE, COUNTER, CONCESSION), positionShift values (UNCHANGED, SOFTENED, REVERSED), role codes (cpo, cmo, etc.), and character names (Vegeta, Bulma, Piccolo, Whis, Gohan, Trunks) in English. Only translate the natural language content within JSON string values.`;
    }
    return systemPrompt;
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
        { role: "system", content: this.localizePrompt(config.systemPrompt) },
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

  extractJSON(raw: string): string {
    // Try to find JSON object in the response, handling various LLM quirks
    // 1. Remove markdown fences anywhere in the text
    let cleaned = raw
      .replace(/```json?\s*/gi, "")
      .replace(/```/g, "")
      .trim();
    // 2. Try to find the first { ... } block
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }

  parseRound1(raw: string, config: BoardMemberConfig): Round1Output {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        role: config.role,
        name: (parsed.name as string) ?? config.name,
        analysis: (parsed.analysis as string) ?? "",
        challenges: Array.isArray(parsed.challenges) ? (parsed.challenges as string[]) : [],
        verdict: (parsed.verdict as Round1Output["verdict"]) ?? "RETHINK",
        verdictDetails: (parsed.verdictDetails as Record<string, string>) ?? {},
      };
    } catch {
      throw new Error(
        `${config.name} (${config.role}) returned invalid JSON.\nRaw:\n${raw.slice(0, 500)}`,
      );
    }
  }

  // === V0.2 DEBATE ENGINE METHODS ===

  async runModeratorStreaming(
    userPrompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<ModeratorAction> {
    const client = this.createClient();
    let fullText = "";

    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: MODERATOR_CONFIG.maxTokens,
      temperature: MODERATOR_CONFIG.temperature,
      stream: true,
      messages: [
        { role: "system", content: this.localizePrompt(MODERATOR_SYSTEM_PROMPT) },
        { role: "user", content: userPrompt },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(delta);
      }
    }

    return this.parseModeratorResponse(fullText);
  }

  async runDebateTurnStreaming(
    config: BoardMemberConfig,
    systemPrompt: string,
    userPrompt: string,
    turnNumber: number,
    onChunk: (role: BoardMemberRole, chunk: string) => void,
  ): Promise<DebateTurn> {
    const client = this.createClient();
    let fullText = "";

    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      temperature: config.temperature,
      stream: true,
      messages: [
        { role: "system", content: this.localizePrompt(systemPrompt) },
        { role: "user", content: userPrompt },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(config.role, delta);
      }
    }

    return this.parseDebateTurn(fullText, config, turnNumber);
  }

  parseModeratorResponse(raw: string): ModeratorAction {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        action: (parsed.action as ModeratorAction["action"]) ?? "DECLARE_IMPASSE",
        targetMember: parsed.targetMember
          ? this.normalizeRole(String(parsed.targetMember))
          : undefined,
        question: parsed.question as string | undefined,
        reasoning: (parsed.reasoning as string) ?? "",
        convergenceSummary: parsed.convergenceSummary as string | undefined,
      };
    } catch {
      // If parsing fails, default to impasse to avoid infinite loops
      return {
        action: "DECLARE_IMPASSE",
        reasoning: "Moderator response could not be parsed",
      };
    }
  }

  /** Normalize a role string from LLM output (handles "CFO", "Piccolo", "Trunks (CTO)", etc.) */
  normalizeRole(input: string): BoardMemberRole {
    // Strip parenthetical content and extra whitespace: "Trunks (CTO)" → "trunks"
    const lower = input
      .replace(/\s*\(.*?\)\s*/g, "")
      .toLowerCase()
      .trim();
    const VALID_ROLES: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
    // Direct match (e.g., "cfo", "CFO")
    if (VALID_ROLES.includes(lower as BoardMemberRole)) {
      return lower as BoardMemberRole;
    }
    // Name-to-role mapping
    const NAME_MAP: Record<string, BoardMemberRole> = {
      vegeta: "cpo",
      bulma: "cmo",
      piccolo: "cfo",
      whis: "cro",
      gohan: "cco",
      trunks: "cto",
      // Common title variations
      "chief product officer": "cpo",
      "chief marketing officer": "cmo",
      "chief financial officer": "cfo",
      "chief research officer": "cro",
      "chief creative officer": "cco",
      "chief technology officer": "cto",
    };
    if (NAME_MAP[lower]) {
      return NAME_MAP[lower];
    }
    // Substring match: check if any name is contained in the input
    for (const [name, role] of Object.entries(NAME_MAP)) {
      if (lower.includes(name)) {
        return role;
      }
    }
    // Fallback: return as-is (will fail lookup gracefully)
    return lower as BoardMemberRole;
  }

  async runFinalVerdictStreaming(
    contextPrompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<CEOFinalVerdict> {
    const client = this.createClient();
    let fullText = "";

    const systemPrompt = `You are the Final Arbiter of the BoardRoom AI board.
You have access to the full deliberation: Round 1 analyses, debate outcomes, and the CEO's answers to follow-up questions.

Your job is to DECIDE. No more debate. Be pragmatic and actionable.

You MUST respond with valid JSON:
{
  "collectiveVerdict": "GO" | "GO_WITH_CHANGES" | "RETHINK",
  "reasoning": "2-3 paragraphs explaining the final decision, weighing all perspectives and CEO input",
  "keyActions": ["Concrete action 1", "Concrete action 2", ...],
  "risks": ["Acknowledged risk 1", "Risk 2", ...],
  "nextSteps": ["Immediate next step 1", "Step 2", ...]
}
Respond ONLY with JSON. No markdown fences, no preamble.`;

    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: 2048,
      temperature: 0.6,
      stream: true,
      messages: [
        { role: "system", content: this.localizePrompt(systemPrompt) },
        { role: "user", content: contextPrompt },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(delta);
      }
    }

    return this.parseFinalVerdict(fullText);
  }

  parseFinalVerdict(raw: string): CEOFinalVerdict {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        collectiveVerdict: (parsed.collectiveVerdict as CollectiveVerdict) ?? "RETHINK",
        reasoning: (parsed.reasoning as string) ?? "",
        keyActions: Array.isArray(parsed.keyActions) ? (parsed.keyActions as string[]) : [],
        risks: Array.isArray(parsed.risks) ? (parsed.risks as string[]) : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? (parsed.nextSteps as string[]) : [],
      };
    } catch {
      return {
        collectiveVerdict: "RETHINK",
        reasoning: raw.slice(0, 500),
        keyActions: [],
        risks: ["Could not parse final verdict"],
        nextSteps: [],
      };
    }
  }

  parseDebateTurn(raw: string, config: BoardMemberConfig, turnNumber: number): DebateTurn {
    const cleaned = this.extractJSON(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      return {
        turnNumber,
        speaker: config.role,
        addressedTo: Array.isArray(parsed.addressedTo)
          ? (parsed.addressedTo as string[]).map((r) => this.normalizeRole(r))
          : [],
        type: (parsed.type as DebateTurn["type"]) ?? "RESPONSE",
        content: (parsed.content as string) ?? "",
        quotedFrom: (parsed.quotedFrom as string) ?? undefined,
        positionShift: (parsed.positionShift as DebateTurn["positionShift"]) ?? "UNCHANGED",
      };
    } catch {
      throw new Error(
        `${config.name} (${config.role}) debate turn returned invalid JSON.\nRaw:\n${raw.slice(0, 500)}`,
      );
    }
  }
}
