"use client";

import { useT } from "@/lib/i18n/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useT();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "fr" : "en")}
      className="stat-label text-gray-500 hover:text-[var(--color-dbz-gold)] transition-colors px-1"
      aria-label={locale === "en" ? "Passer en français" : "Switch to English"}
    >
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}
