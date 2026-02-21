"use client";

import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";
import { useT } from "@/lib/i18n/LanguageContext";

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onSave }: ApiKeyInputProps) {
  const { t } = useT();
  const [editing, setEditing] = useState(!apiKey);
  const [value, setValue] = useState(apiKey);

  if (!editing && apiKey) {
    return (
      <div className="flex items-center gap-3">
        <span data-testid="api-key-display" className="stat-label text-[var(--color-dbz-green)]">
          {t("apiKey.active", { lastFour: apiKey.slice(-4) })}
        </span>
        <button
          data-testid="api-key-change"
          onClick={() => setEditing(true)}
          className="stat-label text-gray-500 hover:text-[var(--color-dbz-gold)] transition-colors"
        >
          {t("apiKey.change")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="stat-label text-[var(--color-dbz-gold)]">{t("apiKey.label")}</label>
      <div className="flex gap-2">
        <div className="pixel-border-sm flex-1">
          <input
            data-testid="api-key-input"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("apiKey.placeholder")}
            className="w-full bg-transparent text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600"
          />
        </div>
        <RetroButton
          data-testid="api-key-save"
          onClick={() => {
            onSave(value);
            setEditing(false);
          }}
          variant="secondary"
        >
          {t("apiKey.save")}
        </RetroButton>
      </div>
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="stat-label text-[var(--color-dbz-cyan)] hover:text-[var(--color-dbz-blue)] transition-colors"
      >
        {t("apiKey.getKey")}
      </a>
    </div>
  );
}
