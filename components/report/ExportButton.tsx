"use client";

import type { CostratReport } from "@/lib/engine/types";
import { formatCostrat } from "@/lib/utils/markdown-export";
import { RetroButton } from "@/components/ui/RetroButton";

interface ExportButtonProps {
  report: CostratReport;
}

export function ExportButton({ report }: ExportButtonProps) {
  const handleExport = () => {
    const markdown = formatCostrat(report);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `COSTRAT-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RetroButton onClick={handleExport} variant="secondary">
      Export COSTRAT.md
    </RetroButton>
  );
}
