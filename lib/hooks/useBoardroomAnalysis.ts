"use client";

import { useCallback } from "react";
import type { SSEEvent } from "@/lib/engine/types";
import { useAnalysisState } from "./useAnalysisState";

export function useBoardroomAnalysis() {
  const { state, start, reset, handleEvent } = useAnalysisState();

  const analyze = useCallback(
    async (content: string, apiKey: string, ceoVision?: string, model?: string) => {
      start();

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, ceoVision, apiKey, model }),
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
      } catch (err) {
        handleEvent({
          type: "error",
          message: err instanceof Error ? err.message : "Connection failed",
        });
      }
    },
    [start, handleEvent],
  );

  return { state, analyze, reset };
}
