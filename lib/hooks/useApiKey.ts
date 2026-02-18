"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "boardroom-openrouter-key";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
    setLoaded(true);
  }, []);

  const saveKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { apiKey, saveKey, loaded, hasKey: !!apiKey };
}
