"use client";
import { useTheme } from "@/lib/ThemeContext";

const TONES = {
  favorable: { border: "#10b981", bg: "#d1fae5", text: "#065f46" },
  marginal: { border: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  unfavorable: { border: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
  lowConfidence: { border: "#64748b", bg: "#e2e8f0", text: "#334155" },
  neutral: { border: "#94a3b8", bg: "#eef2ff", text: "#334155" },
};

export function VerdictPanel({
  eyebrow = "Wattfull Verdict",
  label,
  summary,
  tone = "neutral",
  reasons = [],
  caveats = [],
  changes = [],
  confidence,
  nextAction,
}) {
  const { t } = useTheme();
  const palette = TONES[tone] || TONES.neutral;

  return (
    <div style={{ background: t.white, border: `1.5px solid ${palette.border}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: t.textLight, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{eyebrow}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {label ? <span style={{ fontSize: 16, fontWeight: 800, color: palette.text }}>{label}</span> : null}
            {confidence ? <span style={{ fontSize: 10, fontWeight: 700, color: palette.text, background: palette.bg, borderRadius: 999, padding: "3px 8px" }}>{confidence}</span> : null}
          </div>
        </div>
        {nextAction ? <div style={{ fontSize: 11, color: t.textLight, maxWidth: 220, textAlign: "right" }}>{nextAction}</div> : null}
      </div>

      {summary ? <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, marginBottom: 14 }}>{summary}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {reasons.length ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Why</div>
            {reasons.map((item) => <div key={item} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, marginBottom: 6 }}>- {item}</div>)}
          </div>
        ) : null}
        {caveats.length ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Caveats</div>
            {caveats.map((item) => <div key={item} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, marginBottom: 6 }}>- {item}</div>)}
          </div>
        ) : null}
        {changes.length ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>What would change this</div>
            {changes.map((item) => <div key={item} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, marginBottom: 6 }}>- {item}</div>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
