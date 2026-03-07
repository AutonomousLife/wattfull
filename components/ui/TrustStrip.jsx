"use client";
import { useTheme } from "@/lib/ThemeContext";

const TONES = {
  positive: { border: "#10b981", bg: "#d1fae5", text: "#065f46" },
  caution: { border: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  neutral: { border: "#94a3b8", bg: "#eef2ff", text: "#334155" },
  low: { border: "#64748b", bg: "#e2e8f0", text: "#334155" },
};

export function TrustStrip({ items = [], title = "Data trust", compact = false }) {
  const { t } = useTheme();

  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: compact ? "10px 12px" : "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {items.map((item) => {
          const tone = TONES[item.tone] || TONES.neutral;
          return (
            <div key={`${item.label}-${item.value}`} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: tone.text, background: tone.bg, border: `1px solid ${tone.border}44`, borderRadius: 999, padding: "2px 6px" }}>{item.value}</span>
              </div>
              {item.note ? <div style={{ fontSize: 11, color: t.textLight, lineHeight: 1.5 }}>{item.note}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
