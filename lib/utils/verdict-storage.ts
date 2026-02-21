import type { BoardroomReport } from "@boardroom/engine";

const VERDICT_PREFIX = "verdict:";
const COUNTER_KEY = "boardroom:total_ideas";
const RECENT_KEY = "boardroom:recent_ideas";
const MAX_RECENT = 20;

export function generateVerdictId(): string {
  return crypto.randomUUID().slice(0, 10);
}

export function saveVerdictLocal(id: string, report: BoardroomReport): void {
  try {
    localStorage.setItem(`${VERDICT_PREFIX}${id}`, JSON.stringify(report));
    incrementCounter();
    addRecentIdea(report);
  } catch {
    // localStorage full or unavailable
  }
}

export function getVerdictLocal(id: string): BoardroomReport | null {
  try {
    const raw = localStorage.getItem(`${VERDICT_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function incrementCounter(): void {
  try {
    const current = Number.parseInt(localStorage.getItem(COUNTER_KEY) ?? "0", 10);
    localStorage.setItem(COUNTER_KEY, String(current + 1));
  } catch {
    // ignore
  }
}

function addRecentIdea(report: BoardroomReport): void {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const recent: Array<{ preview: string; score: number; tier: string }> = raw
      ? JSON.parse(raw)
      : [];

    const preview = (report.content || report.ceoVision || "").slice(0, 60);
    recent.unshift({
      preview,
      score: report.viabilityScore?.score ?? 0,
      tier: report.viabilityScore?.tier ?? "red",
    });

    // Keep only last N
    if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

export function getLocalStats(): {
  totalIdeas: number;
  recentIdeas: Array<{ preview: string; score: number; tier: string }>;
} {
  try {
    const total = Number.parseInt(localStorage.getItem(COUNTER_KEY) ?? "0", 10);
    const raw = localStorage.getItem(RECENT_KEY);
    const recent = raw ? JSON.parse(raw) : [];
    return { totalIdeas: total, recentIdeas: recent.slice(0, 3) };
  } catch {
    return { totalIdeas: 0, recentIdeas: [] };
  }
}
