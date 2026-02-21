"use client";

import type { BoardroomReport } from "@boardroom/engine";
import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { useT } from "@/lib/i18n/LanguageContext";
import { encodeVerdict } from "@/lib/utils/verdict-encoding";
import { generateVerdictId, saveVerdictLocal } from "@/lib/utils/verdict-storage";

interface ShareButtonProps {
  report: BoardroomReport;
}

export function ShareButton({ report }: ShareButtonProps) {
  const { t } = useT();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const encoded = encodeVerdict(report);
    const id = generateVerdictId();
    saveVerdictLocal(id, report);

    const fullUrl = `${window.location.origin}/verdict?d=${encoded}`;
    setShareUrl(fullUrl);

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard API not available
    }
  };

  const score = report.viabilityScore?.score ?? "?";
  const tweetText = encodeURIComponent(`My idea scored ${score}/10 on BoardRoom AI`);

  if (shareUrl) {
    const encodedUrl = encodeURIComponent(shareUrl);
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="stat-label text-[var(--color-dbz-green)]">
          {copied ? t("share.linkCopied") : t("share.shareVerdict")}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RetroButton variant="secondary">{t("share.shareX")}</RetroButton>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RetroButton variant="secondary">{t("share.shareLinkedIn")}</RetroButton>
          </a>
          <RetroButton
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              } catch {
                // ignore
              }
            }}
          >
            {copied ? t("share.copied") : t("share.copyLink")}
          </RetroButton>
        </div>
      </div>
    );
  }

  return (
    <RetroButton onClick={handleShare} variant="primary">
      {t("share.shareVerdict")}
    </RetroButton>
  );
}
