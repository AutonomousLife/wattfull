"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ChartTip({ active, payload, label, prefix = "", suffix = "" }) {
  const { t } = useTheme();

  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: t.white,
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: `0 2px 12px ${t.shadow}`,
        fontSize: 13,
      }}
    >
      <div style={{ color: t.textLight, fontSize: 11, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || t.text, fontWeight: 600 }}>
          {p.name}: {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {suffix}
        </div>
      ))}
    </div>
  );
}
