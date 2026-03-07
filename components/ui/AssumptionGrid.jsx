"use client";
import { useTheme } from "@/lib/ThemeContext";

export function AssumptionGrid({ title = "Calculation assumptions", items = [], footer }) {
  const { t } = useTheme();

  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginTop: 4 }}>{item.value}</div>
            {item.note ? <div style={{ fontSize: 11, color: t.textLight, marginTop: 5, lineHeight: 1.5 }}>{item.note}</div> : null}
          </div>
        ))}
      </div>
      {footer ? <div style={{ fontSize: 11, color: t.textLight, lineHeight: 1.6, marginTop: 10 }}>{footer}</div> : null}
    </div>
  );
}
