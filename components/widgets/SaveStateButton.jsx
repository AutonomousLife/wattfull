"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { STORAGE_KEYS, getStoredJson, toggleStoredItem } from "@/lib/profileStore";

export function SaveStateButton({ stateCode }) {
  const { t } = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getStoredJson(STORAGE_KEYS.savedStates, []);
    setSaved(current.includes(stateCode));
  }, [stateCode]);

  function toggleState() {
    const next = toggleStoredItem(STORAGE_KEYS.savedStates, stateCode);
    setSaved(next.includes(stateCode));
  }

  return (
    <button
      onClick={toggleState}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${saved ? "#10b981" : t.borderLight}`,
        background: saved ? "#d1fae5" : t.card,
        color: saved ? "#065f46" : t.text,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {saved ? `Watching ${stateCode}` : `Watch ${stateCode}`}
    </button>
  );
}

