"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";

// US tile-grid positions: [abbr, col, row]
const TILE_GRID = [
  ["ME", 11, 0],
  ["AK",  0, 1], ["MT",  3, 1], ["ND",  4, 1], ["MN",  5, 1], ["WI",  6, 1], ["VT", 10, 1], ["NH", 11, 1],
  ["WA",  1, 2], ["ID",  2, 2], ["WY",  3, 2], ["SD",  4, 2], ["NE",  5, 2], ["IA",  6, 2], ["MI",  7, 2], ["NY",  9, 2], ["MA", 10, 2],
  ["OR",  1, 3], ["NV",  2, 3], ["CO",  3, 3], ["KS",  4, 3], ["MO",  5, 3], ["IL",  6, 3], ["IN",  7, 3], ["OH",  8, 3], ["PA",  9, 3], ["NJ", 10, 3], ["CT", 11, 3],
  ["CA",  1, 4], ["UT",  2, 4], ["NM",  3, 4], ["OK",  4, 4], ["AR",  5, 4], ["KY",  6, 4], ["WV",  7, 4], ["VA",  8, 4], ["MD",  9, 4], ["DE", 10, 4], ["RI", 11, 4],
  ["AZ",  2, 5], ["TX",  4, 5], ["LA",  5, 5], ["TN",  6, 5], ["NC",  7, 5], ["SC",  8, 5],
  ["HI",  0, 6], ["MS",  5, 6], ["AL",  6, 6], ["GA",  7, 6], ["FL",  8, 6],
];

const COLS = 12;
const ROWS = 7;
const CELL = 42; // px per cell

function scoreColor(gc) {
  if (gc >= 70) return "#059669";
  if (gc >= 50) return "#10b981";
  if (gc >= 35) return "#34d399";
  if (gc >= 20) return "#fbbf24";
  return "#f87171";
}

function evScore(d) {
  return Math.round(
    d.gc +
    (d.ec > 0 ? 20 : 0) +
    (d.sc > 0 ? 10 : 0) +
    (d.nm === "full" ? 15 : d.nm === "partial" ? 8 : 0)
  );
}

function grade(s) {
  if (s >= 60) return "A";
  if (s >= 50) return "A−";
  if (s >= 40) return "B+";
  if (s >= 32) return "B";
  if (s >= 24) return "C+";
  if (s >= 16) return "C";
  return "D";
}

function gradeColor(g, t) {
  if (g.startsWith("A")) return "#059669";
  if (g.startsWith("B")) return "#3b82f6";
  return t.textMid;
}

// Single metric bar
function MetricBar({ label, value, max, color, t }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: t.textMid }}>{label}</span>
        <span style={{ fontWeight: 600, color: t.text }}>{value}</span>
      </div>
      <div style={{ height: 6, background: t.borderLight, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}

export function StatesPage() {
  const { t } = useTheme();
  const [sel, setSel] = useState(null);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [mode, setMode] = useState("ev"); // "ev" | "grid" | "solar" | "elec"
  const [tooltip, setTooltip] = useState(null); // { abbr, x, y }

  const stateList = Object.entries(STATE_DATA).map(([a, d]) => ({
    a, ...d, sc: evScore(d), grade: grade(evScore(d)),
  })).sort((a, b) => b.sc - a.sc);

  const d = sel ? stateList.find(s => s.a === sel) : null;

  // Map color function for current mode
  function tileColor(abbr) {
    const sd = STATE_DATA[abbr];
    if (!sd) return "#e2e8f0";
    if (mode === "ev") return scoreColor(evScore(sd));
    if (mode === "grid") return scoreColor(sd.gc);
    if (mode === "solar") return scoreColor(sd.s * 12); // 3.5–6.5 → 42–78
    if (mode === "elec") {
      // Lower is better for EV owners — invert
      const inverted = Math.max(0, 100 - (sd.e - 10) * 5);
      return scoreColor(inverted);
    }
    return "#e2e8f0";
  }

  const modeLabels = {
    ev: "EV Friendliness",
    grid: "Grid Renewable %",
    solar: "Solar Potential",
    elec: "Low Electricity Rate",
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>State Energy Report Cards</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        All 50 states graded on EV incentives, grid cleanliness, solar policy, and utility rates.
        Click any state to explore its profile.
      </p>

      {/* ── Mode Toggle ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20, marginBottom: 16 }}>
        {Object.entries(modeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 20,
              border: `1.5px solid ${mode === key ? t.green : t.borderLight}`,
              background: mode === key ? "#d1fae5" : t.white,
              color: mode === key ? "#065f46" : t.textMid,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: t.textLight }}>Legend:</span>
          {[["#059669","High"], ["#fbbf24","Mid"], ["#f87171","Low"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 10, color: t.textLight }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tile Map ── */}
      <div style={{
        background: t.white,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 14,
        padding: "20px 16px",
        marginBottom: 24,
        overflowX: "auto",
        position: "relative",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMid, marginBottom: 12 }}>
          {modeLabels[mode]} — hover for details, click to drill down
        </div>
        <div
          style={{
            position: "relative",
            width: COLS * CELL + "px",
            height: ROWS * CELL + "px",
            minWidth: COLS * CELL + "px",
          }}
        >
          {TILE_GRID.map(([abbr, col, row]) => {
            const isSelected = sel === abbr;
            const color = tileColor(abbr);
            return (
              <div
                key={abbr}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ abbr, x: col, y: row });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => setSel(sel === abbr ? null : abbr)}
                style={{
                  position: "absolute",
                  left: col * CELL,
                  top: row * CELL,
                  width: CELL - 3,
                  height: CELL - 3,
                  background: color,
                  borderRadius: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: isSelected ? "2.5px solid #1e293b" : "2px solid transparent",
                  boxShadow: isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1e293b" : "none",
                  transition: "transform .1s, box-shadow .1s",
                  zIndex: isSelected ? 2 : 1,
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.zIndex = "10"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = isSelected ? "2" : "1"; }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.4)", lineHeight: 1 }}>{abbr}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.85)", marginTop: 1 }}>
                  {mode === "ev" ? grade(evScore(STATE_DATA[abbr])) :
                   mode === "grid" ? `${STATE_DATA[abbr]?.gc}%` :
                   mode === "solar" ? `${STATE_DATA[abbr]?.s}☀` :
                   `${STATE_DATA[abbr]?.e}¢`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && STATE_DATA[tooltip.abbr] && (() => {
          const sd = STATE_DATA[tooltip.abbr];
          const sc = evScore(sd);
          const tipX = Math.min(tooltip.x * CELL + 50, COLS * CELL - 180);
          const tipY = tooltip.y * CELL + CELL + 4;
          return (
            <div style={{
              position: "absolute",
              left: tipX,
              top: tipY,
              background: "#1e293b",
              color: "#f1f5f9",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.7,
              pointerEvents: "none",
              zIndex: 20,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,.3)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{tooltip.abbr} — EV Grade: {grade(sc)}</div>
              <div>⚡ {sd.e}¢/kWh · ⛽ ${sd.g}/gal</div>
              <div>🌿 {sd.gc}% renewable · ☀️ {sd.s} sun-hrs</div>
              {sd.ec > 0 && <div>💰 ${sd.ec.toLocaleString()} EV incentive</div>}
            </div>
          );
        })()}
      </div>

      {/* ── State List + Detail ── */}
      <div style={{ display: "grid", gridTemplateColumns: d ? "1fr 1.2fr" : "1fr", gap: 24 }}>

        {/* Ranked table */}
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>All 50 States — Ranked</div>
            <div style={{ fontSize: 11, color: t.textLight }}>Click row for details</div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 480 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.card, position: "sticky", top: 0, zIndex: 1 }}>
                  <th style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: t.textLight }}>#</th>
                  <th style={{ padding: "8px 6px", textAlign: "left", fontSize: 11, fontWeight: 600, color: t.textLight }}>State</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 11, fontWeight: 600, color: t.textLight }}>⚡¢</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 11, fontWeight: 600, color: t.textLight }}>🌿%</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 11, fontWeight: 600, color: t.textLight }}>EV $</th>
                  <th style={{ padding: "8px 10px", textAlign: "center", fontSize: 11, fontWeight: 600, color: t.textLight }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {stateList.map((s, i) => (
                  <tr
                    key={s.a}
                    onClick={() => setSel(sel === s.a ? null : s.a)}
                    style={{
                      borderTop: `1px solid ${t.borderLight}`,
                      cursor: "pointer",
                      background: sel === s.a ? "#d1fae5" : "transparent",
                      transition: "background .12s",
                    }}
                    onMouseEnter={e => { if (sel !== s.a) e.currentTarget.style.background = t.card; }}
                    onMouseLeave={e => { if (sel !== s.a) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "8px 14px", color: t.textLight, fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: "8px 6px", fontWeight: 600, color: t.text }}>{s.a}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", color: t.textMid }}>{s.e}¢</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", color: t.textMid }}>{s.gc}%</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", color: t.textMid }}>{s.ec > 0 ? `$${s.ec.toLocaleString()}` : "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                      <span style={{
                        fontWeight: 700,
                        color: gradeColor(s.grade, t),
                        fontSize: 14,
                      }}>{s.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail card */}
        {d && (
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 24, position: "sticky", top: 80, alignSelf: "flex-start" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: t.textLight, marginBottom: 2 }}>State Report Card</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: t.text, margin: 0 }}>{d.a}</h2>
                <div style={{ fontSize: 12, color: t.textMid, marginTop: 2 }}>Climate: {d.z} · {d.nm} net metering</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor(d.grade, t), lineHeight: 1 }}>{d.grade}</div>
                <div style={{ fontSize: 10, color: t.textLight }}>EV Score: {d.sc}/100</div>
              </div>
            </div>

            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                { label: "Electricity Rate", value: `${d.e}¢/kWh`, icon: "⚡", good: d.e < 16 },
                { label: "Gas Price", value: `$${d.g}/gal`, icon: "⛽", good: d.g > 3.2 },
                { label: "Solar Hours/day", value: `${d.s} hrs`, icon: "☀️", good: d.s > 4.5 },
                { label: "Grid Renewable", value: `${d.gc}%`, icon: "🌿", good: d.gc > 40 },
                { label: "State EV Credit", value: d.ec > 0 ? `$${d.ec.toLocaleString()}` : "None", icon: "💰", good: d.ec > 0 },
                { label: "Net Metering", value: d.nm === "full" ? "Full" : d.nm === "partial" ? "Partial" : "None", icon: "🔄", good: d.nm === "full" },
              ].map((m, i) => (
                <div key={i} style={{ background: t.card, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: t.textLight, marginBottom: 2 }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.good ? "#059669" : t.text }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Metric bars */}
            <div style={{ marginBottom: 16 }}>
              <MetricBar label="Grid Cleanliness" value={d.gc} max={100} color="#10b981" t={t} />
              <MetricBar label="Solar Potential (hrs/day × 12)" value={d.s * 12} max={100} color="#f59e0b" t={t} />
              <MetricBar label="EV Incentive (÷100)" value={d.ec / 100} max={50} color="#3b82f6" t={t} />
              <MetricBar label="Electricity Cost (lower = better)" value={Math.max(0, 50 - d.e)} max={45} color="#6366f1" t={t} />
            </div>

            {/* EV savings estimate */}
            {(() => {
              const annualGasSpend = 12000 / 30 * d.g;
              const annualEvSpend = 0.26 * 12000 * d.e / 100;
              const annualSavings = Math.round(annualGasSpend - annualEvSpend);
              return (
                <div style={{ background: "#d1fae5", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#065f46", fontWeight: 600, marginBottom: 4 }}>
                    Estimated annual savings in {d.a}
                  </div>
                  <div style={{ fontSize: 11, color: "#065f46", lineHeight: 1.6 }}>
                    Avg sedan, 12k mi/yr, EPA efficiency vs 30 MPG gas car:
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: annualSavings > 0 ? "#059669" : "#dc2626", marginTop: 4 }}>
                    {annualSavings > 0 ? "+" : ""}${Math.abs(annualSavings).toLocaleString()}/yr
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href={`/ev?zip=`}
                style={{
                  fontSize: 12, fontWeight: 600, color: "#fff",
                  background: "#10b981", borderRadius: 8, padding: "8px 14px",
                  textDecoration: "none", cursor: "pointer",
                }}
              >
                Calculate for {d.a} →
              </Link>
              {(compareA === null || compareA === d.a) ? (
                <button
                  onClick={() => { setCompareA(d.a); }}
                  style={{ fontSize: 12, fontWeight: 600, color: t.text, background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}
                >
                  {compareA === d.a ? "✓ Compare A set" : "Compare with another state"}
                </button>
              ) : compareB === null ? (
                <button
                  onClick={() => { setCompareB(d.a); }}
                  style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#3b82f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}
                >
                  Set as Compare B
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* ── Side-by-side state comparison ── */}
      {compareA && compareB && (() => {
        const dA = stateList.find(s => s.a === compareA);
        const dB = stateList.find(s => s.a === compareB);
        if (!dA || !dB) return null;
        const rows = [
          { label: "Electricity Rate", a: `${dA.e}¢/kWh`, b: `${dB.e}¢/kWh`, better: dA.e < dB.e ? "A" : "B" },
          { label: "Gas Price", a: `$${dA.g}/gal`, b: `$${dB.g}/gal`, better: dA.g > dB.g ? "A" : "B" },
          { label: "Grid Renewable", a: `${dA.gc}%`, b: `${dB.gc}%`, better: dA.gc > dB.gc ? "A" : "B" },
          { label: "State EV Credit", a: dA.ec > 0 ? `$${dA.ec.toLocaleString()}` : "None", b: dB.ec > 0 ? `$${dB.ec.toLocaleString()}` : "None", better: dA.ec > dB.ec ? "A" : dB.ec > dA.ec ? "B" : "tie" },
          { label: "Solar Hours", a: `${dA.s} hrs/day`, b: `${dB.s} hrs/day`, better: dA.s > dB.s ? "A" : "B" },
          { label: "Net Metering", a: dA.nm, b: dB.nm, better: dA.nm === "full" && dB.nm !== "full" ? "A" : dB.nm === "full" ? "B" : "tie" },
          { label: "EV Grade", a: dA.grade, b: dB.grade, better: dA.sc > dB.sc ? "A" : "B" },
        ];
        return (
          <div style={{ marginTop: 24, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>State Comparison: {compareA} vs {compareB}</div>
              <button
                onClick={() => { setCompareA(null); setCompareB(null); }}
                style={{ fontSize: 12, color: t.textLight, background: "none", border: "none", cursor: "pointer" }}
              >
                Clear ✕
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.card }}>
                  <th style={{ padding: "10px 20px", textAlign: "left", color: t.textLight, fontSize: 11, fontWeight: 600 }}>Metric</th>
                  <th style={{ padding: "10px", textAlign: "center", color: "#059669", fontSize: 14, fontWeight: 800 }}>{compareA}</th>
                  <th style={{ padding: "10px", textAlign: "center", color: "#3b82f6", fontSize: 14, fontWeight: 800 }}>{compareB}</th>
                  <th style={{ padding: "10px 20px", textAlign: "center", color: t.textLight, fontSize: 11, fontWeight: 600 }}>Winner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                    <td style={{ padding: "10px 20px", color: t.textMid }}>{row.label}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: row.better === "A" ? 700 : 400, color: row.better === "A" ? "#059669" : t.text }}>{row.a}</td>
                    <td style={{ padding: "10px", textAlign: "center", fontWeight: row.better === "B" ? 700 : 400, color: row.better === "B" ? "#3b82f6" : t.text }}>{row.b}</td>
                    <td style={{ padding: "10px 20px", textAlign: "center", fontSize: 12, color: t.textLight }}>
                      {row.better === "A" ? <span style={{ color: "#059669", fontWeight: 700 }}>{compareA} ✓</span> :
                       row.better === "B" ? <span style={{ color: "#3b82f6", fontWeight: 700 }}>{compareB} ✓</span> :
                       <span style={{ color: t.textLight }}>Tie</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Instructions for compare */}
      {compareA && !compareB && (
        <div style={{ marginTop: 16, padding: "10px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13, color: "#1e40af" }}>
          ✓ <b>{compareA}</b> set as comparison A. Now click another state and press "Set as Compare B".
          <button onClick={() => setCompareA(null)} style={{ marginLeft: 12, fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
