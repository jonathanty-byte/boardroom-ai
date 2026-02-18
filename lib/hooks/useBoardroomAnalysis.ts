"use client";

import type { BoardroomReport, SSEEvent } from "@boardroom/engine";
import { useCallback } from "react";
import { useAnalysisState } from "./useAnalysisState";

export function useBoardroomAnalysis() {
  const { state, start, reset, startFinalize, handleEvent } = useAnalysisState();

  const streamSSE = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        handleEvent({
          type: "error",
          message: err.error ?? `HTTP ${response.status}`,
        });
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const event: SSEEvent = JSON.parse(trimmed.slice(6));
              handleEvent(event);
            } catch {
              // skip malformed events
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith("data: ")) {
        try {
          const event: SSEEvent = JSON.parse(buffer.trim().slice(6));
          handleEvent(event);
        } catch {
          // skip
        }
      }
    },
    [handleEvent],
  );

  const analyze = useCallback(
    async (content: string, apiKey: string, ceoVision?: string, model?: string) => {
      start();
      try {
        await streamSSE("/api/analyze", { content, ceoVision, apiKey, model });
      } catch (err) {
        handleEvent({
          type: "error",
          message: err instanceof Error ? err.message : "Connection failed",
        });
      }
    },
    [start, handleEvent, streamSSE],
  );

  const finalize = useCallback(
    async (report: BoardroomReport, ceoAnswers: string, apiKey: string, model?: string) => {
      startFinalize(ceoAnswers);
      try {
        await streamSSE("/api/finalize", { report, ceoAnswers, apiKey, model });
      } catch (err) {
        handleEvent({
          type: "error",
          message: err instanceof Error ? err.message : "Connection failed",
        });
      }
    },
    [startFinalize, handleEvent, streamSSE],
  );

  return { state, analyze, finalize, reset };
}
