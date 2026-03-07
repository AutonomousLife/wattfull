"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { AssumptionGrid, TrustStrip, VerdictPanel } from "@/components/ui";

const TILE_GRID = [
  ["ME", 11, 0],
  ["AK", 0, 1], ["MT", 3, 1], ["ND", 4, 1], ["MN", 5, 1], ["WI", 6, 1], ["VT", 10, 1], ["NH", 11, 1],
  ["WA", 1, 2], ["ID", 2, 2], ["WY", 3, 2], ["SD", 4, 2], ["NE", 5, 2], ["IA", 6, 2], ["MI", 7, 2], ["NY", 9, 2], ["MA", 10, 2],
  ["OR", 1, 3], ["NV", 2, 3], ["CO", 3, 3], ["KS", 4, 3], ["MO", 5, 3], ["IL", 6, 3], ["IN", 7, 3], ["OH", 8, 3], ["PA", 9, 3], ["NJ", 10, 3], ["CT", 11, 3],
  ["CA", 1, 4], ["UT", 2, 4], ["NM", 3, 4], ["OK", 4, 4], ["AR", 5, 4], ["KY", 6, 4], ["WV", 7, 4], ["VA", 8, 4], ["MD", 9, 4], ["DE", 10, 4], ["RI", 11, 4],
  ["AZ", 2, 5], ["TX", 4, 5], ["LA", 5, 5], ["TN", 6, 5], ["NC", 7, 5], ["SC", 8, 5],
  ["HI", 0, 6], ["MS", 5, 6], ["AL", 6, 6], ["GA", 7, 6], ["FL", 8, 6],
];

const COLS = 12;
const ROWS = 7;
const CELL = 42;

function scoreState(data) {
  return Math.max(0, Math.min(100, Math.round(data.gc + (data.ec > 0 ? 18 : 0) + (data.sc > 0 ? 10 : 0) + (data.nm === "full" ? 14 : data.nm === "partial" ? 7 : 0))));
}

function grade(score) {
  if (score >= 80) return "A";
  if (score >= 68) return "A-";
  if (score >= 56) return "B+";
  if (score >= 46) return "B";
  if (score >= 36) return "C+";
  if (score >= 28) return "C";
  return "D";
}

function tone(score) {
  if (score >= 70) return "#059669";
  if (score >= 52) return "#10b981";
  if (score >= 36) return "#f59e0b";
  return "#ef4444";
}

function electricityRank(rate) {
  return Math.max(0, Math.min(100, Math.round(100 - (rate - 10) * 5)));
}

function solarRank(hours) {
  return Math.max(0, Math.min(100, Math.round(hours * 14)));
}

function annualEvSavings(data) {
  const annualMiles = 12000;
  const gasAnnual = (annualMiles / 30) * data.g;
  const evAnnual = annualMiles * 0.27 * (data.e / 100);
  return Math.round(gasAnnual - evAnnual);
}

function paybackEstimate(data) {
  const yearly = annualEvSavings(data) + (data.ec > 0 ? 250 : 0);
  return yearly > 0 ? (7500 / yearly).toFixed(1) : null;
}

function StateTile({ abbr, selected, onClick, color }) {
  const [_, col, row] = TILE_GRID.find((entry) => entry[0] === abbr) || [abbr, 0, 0];
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        left: col * CELL,
        top: row * CELL,
        width: CELL - 4,
        height: CELL - 4,
        borderRadius: 8,
        border: selected ? "2px solid #f8fafc" : "1px solid rgba(255,255,255,0.22)",
        background: color,
        color: "#fff",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: selected ? "0 0 0 3px rgba(16,185,129,0.35)" : "none",
      }}
    >
      {abbr}
    </button>
  );
}

export function StatesPageV2() {
  const { t } = useTheme();
  const [selected, setSelected] = useState("CA");
  const [mode, setMode] = useState("ev");
  const [compare, setCompare] = useState(["CA", "TX"]);

  const stateList = useMemo(() => {
    return Object.entries(STATE_DATA)
      .map(([abbr, data]) => {
        const score = scoreState(data);
        return {
          abbr,
          ...data,
          score,
          grade: grade(score),
          savings: annualEvSavings(data),
          payback: paybackEstimate(data),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, []);

  const current = stateList.find((item) => item.abbr === selected) || stateList[0];
  const compareStates = compare.map((abbr) => stateList.find((item) => item.abbr === abbr)).filter(Boolean);

  function tileColor(abbr) {
    const data = STATE_DATA[abbr];
    if (!data) return "#334155";
    const score = mode === "grid" ? data.gc : mode === "solar" ? solarRank(data.s) : mode === "electricity" ? electricityRank(data.e) : scoreState(data);
    return tone(score);
  }

  const verdictTone = current.score >= 68 ? "favorable" : current.score >= 46 ? "marginal" : "lowConfidence";
  const verdictLabel = current.score >= 68
    ? `${current.abbr} is a strong EV context`
    : current.score >= 46
    ? `${current.abbr} is workable but assumption-sensitive`
    : `${current.abbr} is a mixed economics state`;

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>State Energy Report Cards</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        Browse every state as a decision context, not just a rank. Wattfull separates electricity cost, gas pressure, incentives, grid mix, and solar practicality so you can see why one state looks better than another.
      </p>

      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <TrustStrip
          title="State intelligence status"
          items={[
            { label: "Electricity", value: "Estimated state seed", note: "Directional state layer, not utility-bill precision.", tone: "neutral" },
            { label: "Incentives", value: "Policy snapshot", note: "Verify before purchase; changes can outpace the snapshot.", tone: "caution" },
            { label: "Solar context", value: "Static benchmark", note: "Useful for screening, not installer-grade design.", tone: "low" },
          ]}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18, marginBottom: 18 }}>
        {[
          ["ev", "EV readiness"],
          ["grid", "Grid cleanliness"],
          ["solar", "Solar potential"],
          ["electricity", "Low electricity cost"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            style={{
              padding: "7px 13px",
              borderRadius: 999,
              border: `1.5px solid ${mode === key ? t.green : t.borderLight}`,
              background: mode === key ? t.greenGlass : t.white,
              color: mode === key ? t.green : t.textMid,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 22, alignItems: "start" }}>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: "18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Interactive state layer</div>
              <div style={{ fontSize: 12, color: t.textLight, marginTop: 3 }}>Color mode: {mode === "ev" ? "EV readiness" : mode === "grid" ? "Grid cleanliness" : mode === "solar" ? "Solar potential" : "Low electricity cost"}</div>
            </div>
            <div style={{ fontSize: 11, color: t.textLight }}>Static state snapshot | last reviewed March 2026</div>
          </div>

          <div style={{ position: "relative", width: COLS * CELL, height: ROWS * CELL, maxWidth: "100%", overflowX: "auto", margin: "0 auto" }}>
            <div style={{ position: "relative", width: COLS * CELL, height: ROWS * CELL }}>
              {TILE_GRID.map(([abbr]) => (
                <StateTile key={abbr} abbr={abbr} selected={selected === abbr} onClick={() => setSelected(abbr)} color={tileColor(abbr)} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, position: "sticky", top: 78 }}>
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: t.textLight }}>Selected state</div>
                <h2 style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 800, color: t.text }}>{current.abbr}</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 36, lineHeight: 1, fontWeight: 900, color: tone(current.score) }}>{current.grade}</div>
                <div style={{ fontSize: 11, color: t.textLight }}>EV score {current.score}/100</div>
              </div>
            </div>

            <VerdictPanel
              label={verdictLabel}
              tone={verdictTone}
              summary={current.score >= 68
                ? "This state combines decent operating economics with policy or grid support strong enough to justify a serious EV evaluation."
                : current.score >= 46
                ? "The state context is usable, but your utility, charging access, and mileage matter more than the headline score."
                : "This state does not automatically rule EVs out, but the state backdrop is weak enough that you should require a stronger personalized case before acting."}
              reasons={[
                `Electricity is about ${current.e.toFixed(2)} cents/kWh and gas is about $${current.g.toFixed(2)}/gal.`,
                current.ec ? `State EV incentives can add about $${current.ec.toLocaleString()} of support.` : "There is no meaningful state EV credit in this snapshot.",
                current.nm === "full" ? "Net metering remains supportive for solar-first households." : "Net metering is limited, which softens solar economics.",
              ]}
              caveats={[
                current.z === "cold" ? "Cold-climate penalties matter more here for range and charging behavior." : "Climate penalties are moderate, but still not zero.",
                "This is a state layer, not a utility-specific quote.",
              ]}
              changes={[
                "A higher-mileage household improves the EV case faster than the state score alone suggests.",
                "A worse-than-average utility rate can weaken the result even in a good state.",
                "Policy and rebate changes can move the recommendation quickly.",
              ]}
              confidence="Estimated state context"
              nextAction="Next best action: run EV or Solar with your ZIP and household assumptions."
            />
          </div>

          <AssumptionGrid
            title="State assumptions behind this card"
            items={[
              { label: "Electricity", value: `${current.e.toFixed(2)} cents/kWh`, note: "State seed" },
              { label: "Gas", value: `$${current.g.toFixed(2)}/gal`, note: "State seed" },
              { label: "Grid renewable", value: `${current.gc}%`, note: "Directional cleanliness input" },
              { label: "Solar", value: `${current.s.toFixed(1)} sun-hours`, note: "Static benchmark" },
              { label: "Net metering", value: current.nm },
              { label: "Climate zone", value: current.z },
            ]}
            footer="Use state cards to shortlist, then validate on the main calculators before making a purchase decision."
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/ev?state=${current.abbr}`} style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, background: t.green, color: "#fff", fontSize: 13, fontWeight: 700 }}>Run EV calculator</Link>
            <Link href="/solar" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 700 }}>Check solar ROI</Link>
            <Link href="/methodology" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.white, color: t.text, fontSize: 13, fontWeight: 700 }}>How scoring works</Link>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 24, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.borderLight}`, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Compare states side-by-side</div>
            <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>Useful when you want to compare utility friendliness, incentives, and expected EV operating pressure.</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[0, 1].map((index) => (
              <select
                key={index}
                value={compare[index]}
                onChange={(event) => setCompare((prev) => prev.map((value, idx) => idx === index ? event.target.value : value))}
                style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }}
              >
                {stateList.map((item) => <option key={item.abbr} value={item.abbr}>{item.abbr}</option>)}
              </select>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.card }}>
                <th style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Metric</th>
                {compareStates.map((item) => <th key={item.abbr} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.abbr}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["EV score", (item) => `${item.score}/100`],
                ["Electricity", (item) => `${item.e.toFixed(2)}c/kWh`],
                ["Gas", (item) => `$${item.g.toFixed(2)}/gal`],
                ["Grid renewable", (item) => `${item.gc}%`],
                ["State EV credit", (item) => item.ec ? `$${item.ec.toLocaleString()}` : "None"],
                ["Net metering", (item) => item.nm],
                ["Estimated EV savings", (item) => `${item.savings >= 0 ? "+" : "-"}$${Math.abs(item.savings).toLocaleString()}/yr`],
              ].map(([label, getter]) => (
                <tr key={label} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: t.text }}>{label}</td>
                  {compareStates.map((item) => <td key={`${label}-${item.abbr}`} style={{ padding: "13px 18px", fontSize: 13, color: t.textMid }}>{getter(item)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
