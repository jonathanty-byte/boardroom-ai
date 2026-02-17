"use client";

import { useState } from "react";
import { RetroButton } from "@/components/ui/RetroButton";

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onSave }: ApiKeyInputProps) {
  const [editing, setEditing] = useState(!apiKey);
  const [value, setValue] = useState(apiKey);

  if (!editing && apiKey) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-green-400 text-sm">
          OpenRouter key: ****{apiKey.slice(-4)}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-white underline"
        >
          change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-[family-name:var(--font-retro)]">
        OPENROUTER API KEY
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-or-..."
          className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-white px-3 py-2 text-sm font-mono focus:border-[var(--color-dbz-orange)] focus:outline-none"
        />
        <RetroButton
          onClick={() => {
            onSave(value);
            setEditing(false);
          }}
          variant="secondary"
        >
          Save
        </RetroButton>
      </div>
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[var(--color-dbz-blue)] hover:underline"
      >
        Get an OpenRouter API key
      </a>
    </div>
  );
}
