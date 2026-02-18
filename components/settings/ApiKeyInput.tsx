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
        <span className="stat-label text-[var(--color-dbz-green)]">
          KEY ACTIVE: ****{apiKey.slice(-4)}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="stat-label text-gray-500 hover:text-[var(--color-dbz-gold)] transition-colors"
        >
          [CHANGE]
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="stat-label text-[var(--color-dbz-gold)]">OPENROUTER API KEY</label>
      <div className="flex gap-2">
        <div className="pixel-border-sm flex-1">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-or-..."
            className="w-full bg-transparent text-gray-200 px-3 py-2 focus:outline-none placeholder:text-gray-600"
          />
        </div>
        <RetroButton
          onClick={() => {
            onSave(value);
            setEditing(false);
          }}
          variant="secondary"
        >
          SAVE
        </RetroButton>
      </div>
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="stat-label text-[var(--color-dbz-cyan)] hover:text-[var(--color-dbz-blue)] transition-colors"
      >
        GET AN OPENROUTER API KEY →
      </a>
    </div>
  );
}
