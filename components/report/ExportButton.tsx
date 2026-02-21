"use client";

import type { BoardroomReport } from "@boardroom/engine";
import { RetroButton } from "@/components/ui/RetroButton";
import { useT } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";
import { formatBoardroomReport } from "@/lib/utils/markdown-export";

interface ExportButtonProps {
  report: BoardroomReport;
}

export function ExportButton({ report }: ExportButtonProps) {
  const { t, locale } = useT();

  const handleExport = () => {
    const markdown = formatBoardroomReport(report, locale as Locale);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boardroom-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RetroButton data-testid="export-button" onClick={handleExport} variant="primary">
      {t("export.download")}
    </RetroButton>
  );
}
