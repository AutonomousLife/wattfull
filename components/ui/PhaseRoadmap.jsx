"use client";
import { useTheme } from "@/lib/ThemeContext";

const DEFAULT_PHASES = [
  {
    id: "1",
    title: "Phase 1 | Decision Engine",
    body: "Finish the shared verdict, assumptions, and next-action system across EV, compare, solar, states, and the dashboard.",
  },
  {
    id: "2",
    title: "Phase 2 | Home Energy Suite",
    body: "Deepen charging, battery, solar, and backup-power tools so the platform can advise on infrastructure, not just vehicle ownership.",
  },
  {
    id: "3",
    title: "Phase 3 | Live Intelligence",
    body: "Add richer ingestion, alerts, saved scenarios, watched products, and state or utility monitoring so Wattfull becomes a return-worthy product.",
  },
];

export function PhaseRoadmap({ title = "Product roadmap", phases = DEFAULT_PHASES }) {
  const { t } = useTheme();

  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {phases.map((phase) => (
          <div key={phase.id} style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: t.green, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{phase.title}</div>
            <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.65 }}>{phase.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

