"use client";

import type { BoardroomReport } from "@/lib/engine/types";
import { formatBoardroomReport } from "@/lib/utils/markdown-export";
import { RetroButton } from "@/components/ui/RetroButton";

interface ExportButtonProps {
  report: BoardroomReport;
}

export function ExportButton({ report }: ExportButtonProps) {
  const handleExport = () => {
    const markdown = formatBoardroomReport(report);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boardroom-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RetroButton onClick={handleExport} variant="primary">
      ⬇ DOWNLOAD BOARDROOM REPORT ⬇
    </RetroButton>
  );
}
