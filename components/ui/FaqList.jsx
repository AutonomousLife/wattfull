"use client";
import { useTheme } from "@/lib/ThemeContext";

export function FaqList({ title = "Frequently asked questions", items = [] }) {
  const { t } = useTheme();

  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div key={item.q} style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{item.q}</div>
            <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.65, marginTop: 6 }}>{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

