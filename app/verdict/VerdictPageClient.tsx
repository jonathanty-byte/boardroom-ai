"use client";

import type { BoardMemberRole, ViabilityScore } from "@boardroom/engine";
import { BOARD_MEMBER_NAMES, BOARD_MEMBER_TITLES } from "@boardroom/engine";
import Link from "next/link";
import { VerdictBadge } from "@/components/board/VerdictBadge";
import { ViabilityScoreDisplay } from "@/components/board/ViabilityScore";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { RetroButton } from "@/components/ui/RetroButton";
import { LanguageProvider, useT } from "@/lib/i18n/LanguageContext";
import { MEMBER_COLORS } from "@/lib/utils/constants";
import {
  decodeVerdict,
  getOneLinerFromScore,
  getTierFromScore,
} from "@/lib/utils/verdict-encoding";

const ROLES: BoardMemberRole[] = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];

interface VerdictPageClientProps {
  encodedData: string;
}

export function VerdictPageClient({ encodedData }: VerdictPageClientProps) {
  return (
    <LanguageProvider>
      <VerdictPageContent encodedData={encodedData} />
    </LanguageProvider>
  );
}

function VerdictPageContent({ encodedData }: VerdictPageClientProps) {
  const { t } = useT();
  const verdict = decodeVerdict(encodedData);

  if (!verdict) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 star-bg">
        <div className="pixel-border p-8 text-center">
          <h1 className="rpg-title text-sm text-[var(--color-dbz-red)] mb-4">
            {t("verdict.notFound")}
          </h1>
          <p className="font-[family-name:var(--font-terminal)] text-gray-400">
            {t("verdict.invalidLink")}
          </p>
          <Link href="/">
            <RetroButton className="mt-4">{t("verdict.goHome")}</RetroButton>
          </Link>
        </div>
      </main>
    );
  }

  const tier = getTierFromScore(verdict.s);
  const oneLiner = getOneLinerFromScore(verdict.s);
  const viabilityScore: ViabilityScore = {
    score: verdict.s,
    tier,
    ceoOneLiner: oneLiner,
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 star-bg">
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between mb-8">
        <Link href="/">
          <div>
            <h1 className="rpg-title text-lg text-[var(--color-dbz-orange)]">
              {t("header.title")}
            </h1>
            <p className="stat-label text-gray-500">{t("header.subtitle")}</p>
          </div>
        </Link>
        <LanguageToggle />
      </header>

      {/* Viability Score */}
      <div className="w-full max-w-3xl mb-6">
        <ViabilityScoreDisplay viabilityScore={viabilityScore} />
      </div>

      {/* Idea Preview */}
      <div className="w-full max-w-3xl mb-6 pixel-border p-4">
        <div className="stat-label mb-2">{t("verdict.theIdea")}</div>
        <p className="font-[family-name:var(--font-terminal)] text-lg text-gray-300">{verdict.i}</p>
      </div>

      {/* Individual Verdicts */}
      <div className="w-full max-w-3xl mb-6">
        <div className="stat-label text-center mb-3">{t("verdict.boardVerdicts")}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ROLES.map((role, idx) => {
            const memberVerdict = verdict.v[idx];
            if (!memberVerdict) return null;
            return (
              <div key={role} className="char-card p-3 text-center">
                <div className="text-[9px] font-bold mb-1" style={{ color: MEMBER_COLORS[role] }}>
                  {BOARD_MEMBER_NAMES[role]}
                </div>
                <div className="stat-label mb-2">{BOARD_MEMBER_TITLES[role]}</div>
                <VerdictBadge verdict={memberVerdict} size="sm" animated={false} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Collective Verdict */}
      <div className="w-full max-w-3xl mb-8 pixel-border p-4 text-center">
        <div className="stat-label mb-2">{t("verdict.collectiveVerdict")}</div>
        <VerdictBadge verdict={verdict.c} size="lg" animated={false} />
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/">
          <RetroButton variant="primary">{t("verdict.faceTheBoard")}</RetroButton>
        </Link>
        <p className="font-[family-name:var(--font-terminal)] text-sm text-gray-500 mt-3">
          {t("verdict.cta")}
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center">
        <div className="stat-label text-gray-600">
          {t("footer.credit")}{" "}
          <a
            href="https://x.com/evolved_monkey_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[var(--color-dbz-orange)] transition-colors"
          >
            {t("footer.evolvedMonkey")}
          </a>
        </div>
      </footer>
    </main>
  );
}
