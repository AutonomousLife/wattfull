"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

const DATA_SOURCES = [
  { source: "EIA", scope: "Residential electricity rates", cadence: "Monthly", status: "Estimated state seed", note: "Used for EV and solar assumptions when ZIP-specific live utility data is unavailable." },
  { source: "EPA / fueleconomy.gov", scope: "Vehicle efficiency and MPG", cadence: "Model year", status: "Live spec source", note: "Primary source for EV kWh/100mi and gas MPG assumptions." },
  { source: "NREL", scope: "Solar production and sun-hours", cadence: "Periodic", status: "Static sample", note: "Used for directional solar ROI, not a roof-specific engineering study." },
  { source: "DSIRE / policy snapshots", scope: "State incentives and net metering", cadence: "Quarterly-ish", status: "Estimated policy layer", note: "Policies can change faster than the current snapshot and should be verified before purchase." },
  { source: "AAA / fuel datasets", scope: "Gas price context", cadence: "Frequent", status: "Estimated state seed", note: "Used as a state-level operating-cost baseline." },
];

const SECTIONS = [
  {
    id: "verdicts",
    title: "How Wattfull generates verdicts",
    intro: "Verdicts are plain-language summaries generated from the same inputs shown in the calculator. They are meant to explain the math, not replace it.",
    bullets: [
      "We calculate the underlying economics first: purchase, annual operating cost, maintenance, incentives, and total cost over time.",
      "We classify the result as favorable, neutral, or unfavorable based on savings magnitude, payback timing, and sensitivity to key assumptions.",
      "We then explain what is driving the result and what assumptions would need to move for the conclusion to change.",
    ],
  },
  {
    id: "ev",
    title: "EV calculator flow",
    intro: "The EV tools all use one canonical engine so the calculator, SEO pages, and advisory answers stay aligned.",
    bullets: [
      "Resolve ZIP to state context, then load available energy-rate and incentive assumptions.",
      "Estimate EV energy cost from kWh/100mi, charging mix, climate pressure, and annual miles.",
      "Estimate gas cost from MPG, gas price, and annual miles.",
      "Separate upfront cost, annual operating cost, maintenance, total ownership cost, and cost per mile before generating a verdict.",
    ],
  },
  {
    id: "labels",
    title: "What the data labels mean",
    intro: "Wattfull uses labels so people can tell whether a number is real-time, estimated, static, or illustrative.",
    bullets: [
      "Live data: fetched from a current source at request time or through an active integration.",
      "Estimated: current calculator output based on your inputs plus a maintained state-level assumption set.",
      "Static sample: seeded content used for context, demos, or rankings when a live source is not wired in.",
      "Illustrative: simplified example math intended to explain a concept, not to make the final decision for you.",
    ],
  },
  {
    id: "limits",
    title: "Known limitations",
    intro: "The platform is honest about where precision drops.",
    bullets: [
      "ZIPs are currently resolved to state-level assumptions in several places, so utility-specific rates are not always available.",
      "Vehicle ownership costs such as insurance and depreciation remain partially estimated, not personalized quotes.",
      "Solar outputs are directional and should not be treated as a substitute for a roof-specific installer proposal.",
      "Policy incentives can change faster than any static or periodic snapshot, so verification is still required before purchase.",
    ],
  },
];

function ToggleSection({ title, intro, bullets, open, onToggle, t }) {
  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", border: "none", background: "none", cursor: "pointer", padding: "16px 18px", textAlign: "left", display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{title}</div>
          <div style={{ fontSize: 12, color: t.textLight, marginTop: 4, lineHeight: 1.5 }}>{intro}</div>
        </div>
        <div style={{ fontSize: 12, color: t.textLight }}>{open ? "Hide" : "Show"}</div>
      </button>
      {open ? (
        <div style={{ borderTop: `1px solid ${t.borderLight}`, padding: "0 18px 18px" }}>
          <ul style={{ margin: 0, padding: "12px 0 0 18px" }}>
            {bullets.map((bullet) => (
              <li key={bullet} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.7, marginBottom: 8 }}>{bullet}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MethodologyPageV2() {
  const { t } = useTheme();
  const [openSection, setOpenSection] = useState("ev");

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>How Wattfull Works</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.7, maxWidth: 760, marginTop: 8 }}>
        Wattfull is built to behave like a transparent advisor. The site should show what it knows, where the number came from, how fresh it is, and what would have to change for the recommendation to change.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 22, marginBottom: 24 }}>
        {[
          ["Canonical engine", "EV calculator, SEO pages, and advisory responses share the same core math."],
          ["Transparent assumptions", "Inputs, rates, incentives, and fallback values should be visible in the result context."],
          ["Trust labels", "Every major number should be marked as live, estimated, static, or illustrative."],
          ["Additive updates", "The product favors surgical improvements instead of broad rewrites that obscure behavior."],
        ].map(([title, body]) => (
          <div key={title} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: "15px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{title}</div>
            <div style={{ fontSize: 12, color: t.textLight, lineHeight: 1.6, marginTop: 6 }}>{body}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {SECTIONS.map((section) => (
          <ToggleSection
            key={section.id}
            title={section.title}
            intro={section.intro}
            bullets={section.bullets}
            open={openSection === section.id}
            onToggle={() => setOpenSection((current) => current === section.id ? "" : section.id)}
            t={t}
          />
        ))}
      </div>

      <section style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.borderLight}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Data sources and freshness</div>
          <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>The site mixes live integrations, maintained state seeds, and static reference data. This table is meant to make that visible.</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.card }}>
                {[
                  "Source",
                  "Used for",
                  "Refresh cadence",
                  "Current label",
                  "Trust note",
                ].map((label) => (
                  <th key={label} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((row) => (
                <tr key={row.source} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                  <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: t.text }}>{row.source}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: t.textMid }}>{row.scope}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: t.textMid }}>{row.cadence}</td>
                  <td style={{ padding: "13px 16px" }}><span style={{ fontSize: 11, fontWeight: 700, color: row.status === "Live spec source" ? "#065f46" : row.status === "Static sample" ? "#92400e" : "#1d4ed8", background: row.status === "Live spec source" ? "#d1fae5" : row.status === "Static sample" ? "#fef3c7" : "#eff6ff", borderRadius: 999, padding: "4px 8px" }}>{row.status}</span></td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: t.textLight, lineHeight: 1.6 }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 8 }}>Calculation architecture</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.7 }}>
            Wattfull now centralizes EV calculation logic in one engine, then adapts that output into the EV tool, SEO pages, and advisory responses. That reduces drift, keeps assumptions aligned, and makes future testing cheaper and safer.
          </div>
        </div>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 8 }}>What remains illustrative</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.7 }}>
            Some state scores, solar heuristics, and content-led comparisons are still illustrative or state-seed-based. They are useful for framing the decision, but they are not the same thing as a utility bill, tax ruling, installer quote, or insurance quote.
          </div>
        </div>
      </section>

      <section style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 8 }}>Methodology note</div>
        <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.7 }}>
          Wattfull is a decision-support platform, not tax, legal, or financial advice. Use the calculators to narrow the range, understand the drivers, and surface the right next question before making a large purchase decision.
        </div>
      </section>
    </div>
  );
}
