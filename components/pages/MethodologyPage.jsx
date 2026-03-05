"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

// ── Data Sources Table ──────────────────────────────────────────────────────
const DATA_SOURCES = [
  {
    source: "EIA Electric Power Monthly",
    provides: "State-level residential electricity rates (¢/kWh)",
    url: "eia.gov/electricity/monthly",
    freq: "Monthly",
    lastUpdate: "Feb 2025",
    confidence: "high",
  },
  {
    source: "AAA Gas Prices",
    provides: "State & national average gas prices ($/gal)",
    url: "gasprices.aaa.com",
    freq: "Daily",
    lastUpdate: "Feb 2025",
    confidence: "high",
  },
  {
    source: "EPA fueleconomy.gov",
    provides: "EV efficiency (kWh/100mi) and ICE MPG ratings",
    url: "fueleconomy.gov",
    freq: "Annually (model year)",
    lastUpdate: "2025 MY",
    confidence: "high",
  },
  {
    source: "NREL PVWatts / NSRDB",
    provides: "Peak sun-hours by location (hrs/day)",
    url: "pvwatts.nrel.gov",
    freq: "Annual average",
    lastUpdate: "2023",
    confidence: "high",
  },
  {
    source: "DSIRE Database",
    provides: "State EV and solar incentives, net metering policies",
    url: "dsireusa.org",
    freq: "Quarterly",
    lastUpdate: "Q4 2024",
    confidence: "medium",
  },
  {
    source: "ASHRAE Climate Zones",
    provides: "State climate zone classification (cold/mild/warm/hot)",
    url: "ashrae.org",
    freq: "5-year cycle",
    lastUpdate: "2021",
    confidence: "high",
  },
  {
    source: "EPA eGRID",
    provides: "Grid emission factors by state (kg CO₂/kWh)",
    url: "epa.gov/egrid",
    freq: "Biannual",
    lastUpdate: "2023",
    confidence: "high",
  },
  {
    source: "IRS / Inflation Reduction Act",
    provides: "Federal EV tax credit ($7,500) and solar ITC (30%)",
    url: "irs.gov",
    freq: "Legislation-based",
    lastUpdate: "2024",
    confidence: "high",
  },
];

// ── Formula Sections ────────────────────────────────────────────────────────
const FORMULAS = [
  {
    id: "ev",
    icon: "⚡",
    title: "EV Savings Calculator",
    desc: "Estimates annual fuel cost savings by comparing electricity costs to gasoline costs, adjusted for real-world driving conditions.",
    steps: [
      {
        name: "Step 1 — Blended Charging Rate",
        formula: "blend = (hc/100)×(er/100)×1.12 + (pc/100)×(er/100+0.18)×1.06 + (dc/100)×0.35",
        vars: [
          { v: "hc", def: "Home charging % (default 80%)" },
          { v: "pc", def: "Public L2 charging % (default 15%)" },
          { v: "dc", def: "DC fast charging % (default 5%)" },
          { v: "er", def: "Local electricity rate in ¢/kWh from EIA" },
          { v: "1.12", def: "Level 2 home charger efficiency loss (12%)" },
          { v: "1.06", def: "Public L2 charger efficiency + session fee factor" },
          { v: "0.35", def: "DC fast charge blended rate in $/kWh (market average)" },
        ],
      },
      {
        name: "Step 2 — EV Energy Consumption per Mile",
        formula: "kwhMi = (ev.kwh/100) × (1 + climatePenalty) × driveMultiplier",
        vars: [
          { v: "ev.kwh", def: "EPA-rated kWh per 100 miles for selected vehicle" },
          { v: "climatePenalty", def: "Cold: +22%, Mild: +5%, Warm: +3%, Hot: +4%" },
          { v: "driveMultiplier", def: "Efficient: ×0.88, Normal: ×1.00, Spirited: ×1.17" },
        ],
      },
      {
        name: "Step 3 — Annual Fuel Costs",
        formula: "evFuelAnnual = kwhMi × miles × blend\niceFuelAnnual = (miles ÷ ice.mpg) × gasPrice",
        vars: [
          { v: "miles", def: "Annual miles driven (user input, default 12,000)" },
          { v: "ice.mpg", def: "EPA combined MPG for selected ICE vehicle" },
          { v: "gasPrice", def: "State average gas price in $/gal from AAA" },
        ],
      },
      {
        name: "Step 4 — Electricity Break-Even Threshold",
        formula: "erBreakEven = (iceFuelAnnual/(kwhMi×miles) − blendConst) ÷ blendErCoeff",
        vars: [
          { v: "blendConst", def: "Charging cost component independent of local rate (DC charging share)" },
          { v: "blendErCoeff", def: "Fraction of blend that scales with local electricity rate" },
        ],
        note: "This tells you: 'At what electricity rate does EV stop making financial sense?' Derived by decomposing blend into rate-dependent and rate-independent parts, then solving for the EV/ICE cost crossover.",
      },
    ],
  },
  {
    id: "solar",
    icon: "☀️",
    title: "Solar ROI Calculator",
    desc: "Models a rooftop solar system sized to your consumption, estimates 25-year cash flows including incentives, degradation, and utility rate escalation.",
    steps: [
      {
        name: "Step 1 — System Sizing",
        formula: "sysKw = min(annUse ÷ (sunHrs×365×shade×orient×0.82), roofCapacity)",
        vars: [
          { v: "annUse", def: "Annual kWh usage = monthlyKwh × 12" },
          { v: "sunHrs", def: "NREL peak sun-hours per day for state" },
          { v: "shade", def: "None: 1.0, Light: 0.90, Moderate: 0.75, Heavy: 0.55" },
          { v: "orient", def: "South: 1.0, SW/SE: 0.92, E/W: 0.82, North: 0.65" },
          { v: "0.82", def: "System efficiency (inverter losses ~13%, wiring ~5%)" },
          { v: "roofCapacity", def: "Roof sqft ÷ 18 sqft/panel × 0.4 kW/panel" },
        ],
      },
      {
        name: "Step 2 — Annual Production & Incentives",
        formula: "prod = sysKw × sunHrs × 365 × shade × orient × 0.82\nnetCost = sysCost − fedITC − stateCredit",
        vars: [
          { v: "sysCost", def: "System size (kW) × 1000 × costPerWatt ($/W)" },
          { v: "fedITC", def: "30% of gross cost (Inflation Reduction Act, through 2032)" },
          { v: "stateCredit", def: "State-specific solar incentive from DSIRE" },
        ],
      },
      {
        name: "Step 3 — Year-by-Year Cash Flow (25 years)",
        formula: "annSavings[y] = prod × (1 − y×0.005) × rate[y]\nrate[y] = (er/100) × (1 + rateEsc/100)^y\ncumSavings = Σ annSavings\nlifetimeNet = cumSavings − netCost",
        vars: [
          { v: "0.005", def: "Panel degradation rate: 0.5% per year (industry standard)" },
          { v: "rateEsc", def: "Electricity rate escalation %/yr (user input, historically ~3%)" },
          { v: "payback", def: "First year where cumSavings > netCost" },
        ],
      },
    ],
  },
  {
    id: "state",
    icon: "🗺️",
    title: "State EV Score",
    desc: "A composite score (0–100) ranking states for EV ownership suitability, combining grid cleanliness, incentives, and solar potential.",
    steps: [
      {
        name: "EV Score Formula",
        formula: "evScore = gc + (ec>0 ? 20 : 0) + (sc>0 ? 10 : 0) + nmScore",
        vars: [
          { v: "gc", def: "Grid renewable % (0–100) from EPA eGRID" },
          { v: "ec", def: "State EV credit > $0 → +20 points (DSIRE)" },
          { v: "sc", def: "State solar credit > $0 → +10 points (DSIRE)" },
          { v: "nmScore", def: "Net metering: Full → +15, Partial → +8, None → 0" },
        ],
      },
    ],
  },
];

const LIMITATIONS = [
  {
    icon: "📍",
    title: "ZIP-to-State Mapping",
    desc: "Electricity rates and incentives use state averages. Rates can vary 20–40% within a state by utility. Contact your local utility for precise rates.",
  },
  {
    icon: "🚗",
    title: "Vehicle Efficiency",
    desc: "EPA efficiency ratings are tested under standardized lab conditions. Real-world efficiency typically runs 10–20% lower, especially in cold weather. Our climate and drive-style adjustments partially correct for this.",
  },
  {
    icon: "☀️",
    title: "Solar Production",
    desc: "NREL sun-hour averages represent typical years. Local factors like microclimate, roof pitch, horizon obstructions, and bird droppings can cause ±15% variance. Get a site assessment from a local installer.",
  },
  {
    icon: "💰",
    title: "Incentive Eligibility",
    desc: "Federal EV and solar credits have income limits and vehicle eligibility requirements. State incentives change frequently. Always verify current eligibility at fueleconomy.gov, IRS.gov, and DSIRE before making a purchase decision.",
  },
  {
    icon: "🔋",
    title: "Battery Degradation",
    desc: "EV battery capacity degrades ~1–2% per year. Our model does not currently adjust long-term EV efficiency for battery aging. Most modern EVs retain 80%+ capacity after 8 years.",
  },
  {
    icon: "📈",
    title: "Price Forecasts",
    desc: "Gas and electricity price projections are not guaranteed. We model flat prices by default. Use the rate escalation slider (Solar) to explore scenarios. Historical electricity rate growth: ~2–3%/yr.",
  },
];

const CONFIDENCE = {
  high: { label: "High", bg: "#d1fae5", color: "#065f46" },
  medium: { label: "Medium", bg: "#fef3c7", color: "#92400e" },
  low: { label: "Low", bg: "#fee2e2", color: "#7f1d1d" },
};

export function MethodologyPage() {
  const { t } = useTheme();
  const [openFormula, setOpenFormula] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [showLimitations, setShowLimitations] = useState(true);

  return (
    <div style={{ maxWidth: 800 }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text, marginBottom: 8 }}>
        How Wattfull Works
      </h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.7, marginBottom: 8, maxWidth: 640 }}>
        Every number on Wattfull is computed from publicly available data using defined, auditable formulas.
        No black boxes. No affiliate-biased estimates.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        {[
          { icon: "📊", text: "Real government data" },
          { icon: "🔢", text: "Open formulas" },
          { icon: "🔄", text: "Updated regularly" },
          { icon: "💾", text: "No account required" },
        ].map(b => (
          <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 6, background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, color: t.textMid }}>
            <span>{b.icon}</span> {b.text}
          </div>
        ))}
      </div>

      {/* ── Calculation Formulas ────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 16 }}>
          Calculation Formulas
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FORMULAS.map(f => (
            <div key={f.id} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
              <button
                onClick={() => setOpenFormula(openFormula === f.id ? null : f.id)}
                style={{
                  width: "100%", padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: t.textLight, marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: t.textLight, whiteSpace: "nowrap", marginLeft: 12 }}>
                  {openFormula === f.id ? "▲ Hide" : "▼ Details"}
                </span>
              </button>

              {openFormula === f.id && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${t.borderLight}` }}>
                  {f.steps.map((step, si) => (
                    <div key={si} style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 8 }}>
                        {step.name}
                      </div>
                      {/* Formula block */}
                      <div style={{
                        background: "#0f172a", borderRadius: 10, padding: "14px 16px",
                        fontFamily: "monospace", fontSize: 12, color: "#86efac",
                        lineHeight: 1.8, marginBottom: 12, overflowX: "auto",
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                      }}>
                        {step.formula}
                      </div>
                      {/* Variables */}
                      <div style={{ display: "grid", gap: 6 }}>
                        {step.vars.map(v => (
                          <div key={v.v} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <code style={{
                              fontSize: 11, fontWeight: 700, color: "#7c3aed",
                              background: "#f3e8ff", borderRadius: 4, padding: "2px 6px",
                              whiteSpace: "nowrap", flexShrink: 0,
                            }}>
                              {v.v}
                            </code>
                            <span style={{ fontSize: 12, color: t.textMid, lineHeight: 1.5 }}>{v.def}</span>
                          </div>
                        ))}
                      </div>
                      {step.note && (
                        <div style={{
                          marginTop: 10, padding: "10px 14px",
                          background: "#eff6ff", border: "1px solid #bfdbfe",
                          borderRadius: 8, fontSize: 12, color: "#1e40af", lineHeight: 1.6,
                        }}>
                          💡 {step.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Data Sources Table ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => setShowSources(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "none", border: "none", cursor: "pointer",
            textAlign: "left", padding: 0, marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, margin: 0 }}>
            Data Sources &amp; Update Frequency
          </h2>
          <span style={{ fontSize: 13, color: t.textLight }}>{showSources ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showSources && (
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 3fr 1fr 1fr 80px",
              padding: "10px 16px", background: t.card,
              borderBottom: `1px solid ${t.borderLight}`,
            }}>
              {["Source", "Provides", "Frequency", "Last Updated", "Confidence"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {h}
                </div>
              ))}
            </div>
            {DATA_SOURCES.map((s, i) => {
              const c = CONFIDENCE[s.confidence];
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "2fr 3fr 1fr 1fr 80px",
                  padding: "12px 16px", alignItems: "center",
                  borderBottom: i < DATA_SOURCES.length - 1 ? `1px solid ${t.borderLight}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{s.source}</div>
                    <div style={{ fontSize: 10, color: t.textLight }}>{s.url}</div>
                  </div>
                  <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.5 }}>{s.provides}</div>
                  <div style={{ fontSize: 12, color: t.textMid }}>{s.freq}</div>
                  <div style={{ fontSize: 12, color: t.textMid }}>{s.lastUpdate}</div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: c.bg, color: c.color, borderRadius: 4, padding: "2px 8px" }}>
                      {c.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Limitations & Caveats ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => setShowLimitations(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "none", border: "none", cursor: "pointer",
            textAlign: "left", padding: 0, marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, margin: 0 }}>
            Limitations &amp; Caveats
          </h2>
          <span style={{ fontSize: 13, color: t.textLight }}>{showLimitations ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showLimitations && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px,1fr))", gap: 12 }}>
            {LIMITATIONS.map((l, i) => (
              <div key={i} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>{l.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Update Cadence ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 16 }}>
          Update Cadence
        </h2>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
            {[
              { freq: "Daily", items: ["Gas prices (AAA)", "Spot electricity rates"] },
              { freq: "Monthly", items: ["State electricity rates (EIA)", "Federal incentive rules"] },
              { freq: "Quarterly", items: ["State EV incentives (DSIRE)", "Solar state credits"] },
              { freq: "Annually", items: ["Vehicle efficiency data (EPA)", "Solar sun-hour data (NREL)", "Grid emission factors (EPA eGRID)"] },
            ].map(u => (
              <div key={u.freq} style={{ background: t.card, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: t.green, marginBottom: 8 }}>{u.freq}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {u.items.map(item => (
                    <li key={item} style={{ fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Confidence Model ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 16 }}>
          Confidence Levels
        </h2>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, marginBottom: 16 }}>
            Wattfull uses three confidence tiers for data inputs. Higher confidence means the number comes directly
            from authoritative government or industry sources with frequent updates.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { level: "High", bg: "#d1fae5", color: "#065f46", desc: "Direct government or authoritative industry data (EIA, EPA, NREL, IRS). Updated at least annually. Used directly in calculations." },
              { level: "Medium", bg: "#fef3c7", color: "#92400e", desc: "Derived estimates or third-party aggregated data (DSIRE, state agencies). May lag real-world changes by 1–3 months. Used with caution flags." },
              { level: "Low", bg: "#fee2e2", color: "#7f1d1d", desc: "Market estimates or survey data. High variance. Not used in primary calculations — shown as context only." },
            ].map(c => (
              <div key={c.level} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, borderRadius: 4, padding: "3px 10px", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>
                  {c.level}
                </span>
                <span style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer Note ───────────────────────────────────────────────────── */}
      <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>
          🔬 Wattfull is a decision-support tool, not financial advice.
        </div>
        <p style={{ fontSize: 12, color: t.textMid, lineHeight: 1.7, margin: 0 }}>
          Results are estimates based on averages. Your actual costs and savings will vary based on your specific
          utility rates, driving patterns, vehicle condition, roof characteristics, and tax situation. Always consult
          a qualified tax advisor for incentive eligibility and a certified installer for solar quotes.
          Wattfull has no financial relationship with any EV manufacturer, solar company, or utility.
        </p>
      </div>
    </div>
  );
}
