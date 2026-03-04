"use client";
import { useTheme } from "@/lib/ThemeContext";

export function MethodologyPage() {
  const { t } = useTheme();
  const sections = [
    {
      title: "EV Savings",
      items: [
        "EV fuel = (kWh/mi × miles) × blended cost × (1 + loss)",
        "ICE fuel = (miles ÷ MPG) × gas price",
        "Climate penalty: cold +22%, mild +5%, warm +3%, hot +4%",
      ],
    },
    {
      title: "Solar ROI",
      items: [
        "Production = kW × sun-hrs × 365 × shade × orientation × 0.82",
        "Federal ITC: 30% through 2032",
        "Degradation: 0.5%/year",
      ],
    },
    {
      title: "Sources",
      items: [
        "EIA State Profiles · AAA gas averages · EPA fueleconomy.gov",
        "NREL PVWatts · DSIRE incentives · ASHRAE climate zones",
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text, marginBottom: 20 }}>How It Works</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.7, marginBottom: 28 }}>
        Every number computed from defined formulas with stated inputs.
      </p>
      {sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 10 }}>{sec.title}</h2>
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
            {sec.items.map((line, j) => (
              <p key={j} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.7, marginBottom: j < sec.items.length - 1 ? 10 : 0 }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
