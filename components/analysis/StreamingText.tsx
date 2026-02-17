"use client";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  maxLines?: number;
}

export function StreamingText({ text, isStreaming, maxLines = 4 }: StreamingTextProps) {
  // Show only last N lines during streaming for a cleaner look
  const lines = text.split("\n");
  const displayText =
    isStreaming && lines.length > maxLines
      ? "..." + lines.slice(-maxLines).join("\n")
      : text;

  return (
    <div className="text-sm text-gray-300 font-mono leading-relaxed overflow-hidden">
      <span className="whitespace-pre-wrap break-words">
        {displayText}
      </span>
      {isStreaming && <span className="cursor-blink" />}
    </div>
  );
}
