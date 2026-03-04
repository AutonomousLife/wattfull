"use client";
import { useTheme } from "@/lib/ThemeContext";

export function Stars({ n }) {
  const { t } = useTheme();
  const full = Math.floor(n);
  const half = n % 1 >= 0.5;

  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            color: i < full || (i === full && half) ? t.star : t.border,
            fontSize: 14,
          }}
        >
          {i < full ? "\u2605" : i === full && half ? "\u2605" : "\u2606"}
        </span>
      ))}
    </span>
  );
}
