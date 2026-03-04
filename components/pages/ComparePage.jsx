"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { VehicleSearch } from "@/components/ui/VehicleSearch";
import { VEHICLES, POPULAR_EV_IDS, POPULAR_ICE_IDS, POWER_STATIONS } from "@/lib/data";

// ── Scoring data (kept here to avoid bloating vehicles.js) ────────────────

const RELIABILITY = {
  // EVs (industry/JD Power approximations)
  model3rwd: 75, model3lr: 75, model3perf: 73, modelyrwd: 74, modely: 74, modelyperf: 72,
  models: 71, modelx: 70, ioniq5rwd: 80, ioniq5: 79, ioniq6rwd: 82, ioniq6awd: 81,
  konael: 79, ev6rwd: 79, ev6awd: 77, ev6gt: 75, ev9: 76, bolt: 76, blazerev: 73,
  mache: 68, f150lightning: 70, id4: 74, bmwi4: 72, polestar2: 71,
  rivianr1t: 70, rivianr1s: 70, nisanariya: 74, subarosolt: 75, toyotabz4x: 76,
  hondaprologue: 74, cadillaclyriq: 72, mercedeseqb: 69,
  // ICE
  camry: 93, corolla: 94, rav4: 91, rav4hybrid: 89, prius: 90, tacoma: 88,
  highlander: 87, civic: 92, crv: 89, accord: 90, f150gas: 78, silverado: 77,
  gmcsierra: 77, altima: 80, cx5: 86, tucson: 82, sorento: 81, bmw330i: 72,
};

const EV_RANGE = {
  model3rwd: 272, model3lr: 358, model3perf: 315, modelyrwd: 260, modely: 330, modelyperf: 303,
  models: 405, modelx: 348, ioniq5rwd: 266, ioniq5: 266, ioniq6rwd: 361, ioniq6awd: 316,
  konael: 261, ev6rwd: 310, ev6awd: 274, ev6gt: 206, ev9: 304, bolt: 319, blazerev: 279,
  mache: 247, f150lightning: 320, id4: 260, bmwi4: 300, polestar2: 270,
  rivianr1t: 410, rivianr1s: 376, nisanariya: 216, subarosolt: 222, toyotabz4x: 252,
  hondaprologue: 296, cadillaclyriq: 314, mercedeseqb: 245,
};

// National averages used for scoring (independent of user's location)
const AVG = { elec: 16, gas: 3.50, miles: 12000, years: 5 };

function computeMetrics(v, vtype) {
  const annualFuel = vtype === "ev"
    ? (v.kwh / 100) * AVG.miles * (AVG.elec / 100)
    : (AVG.miles / v.mpg) * AVG.gas;
  const annualMaint = vtype === "ev" ? 800 : 1500;
  const tco5 = v.msrp + (annualFuel + annualMaint) * AVG.years;
  const reliability = RELIABILITY[v.id] ?? (vtype === "ev" ? 74 : 84);
  const range = EV_RANGE[v.id] ?? 250;
  const roadTrip = vtype === "ice" ? 95
    : range >= 380 ? 82 : range >= 300 ? 72 : range >= 240 ? 60 : 46;
  const env = vtype === "ev" ? 84 : Math.min(44, Math.round((v.mpg / 60) * 44 + 4));
  return { annualFuel, annualMaint, tco5, reliability, roadTrip, env };
}

/** Score a cost metric: cheaper = 100, other gets 60–100 proportionally */
function costScore(mine, theirs) {
  const min = Math.min(mine, theirs);
  const max = Math.max(mine, theirs);
  if (max === min) return 100;
  return Math.round(100 - ((mine - min) / (max - min)) * 40);
}

function buildScoreRows(v1, t1, v2, t2) {
  const m1 = computeMetrics(v1, t1);
  const m2 = computeMetrics(v2, t2);
  return [
    { label: "5-Year Total Cost",   weight: 20, s1: costScore(m1.tco5, m2.tco5),             s2: costScore(m2.tco5, m1.tco5),             r1: `$${Math.round(m1.tco5 / 1000)}k`,          r2: `$${Math.round(m2.tco5 / 1000)}k` },
    { label: "Annual Energy Cost",  weight: 20, s1: costScore(m1.annualFuel, m2.annualFuel),  s2: costScore(m2.annualFuel, m1.annualFuel),  r1: `$${Math.round(m1.annualFuel)}/yr`,          r2: `$${Math.round(m2.annualFuel)}/yr` },
    { label: "Annual Maintenance",  weight: 15, s1: costScore(m1.annualMaint, m2.annualMaint),s2: costScore(m2.annualMaint, m1.annualMaint),r1: `$${m1.annualMaint}/yr`,                     r2: `$${m2.annualMaint}/yr` },
    { label: "Reliability",         weight: 15, s1: m1.reliability,                           s2: m2.reliability,                           r1: `${m1.reliability}/100`,                     r2: `${m2.reliability}/100` },
    { label: "Road Trip Ease",      weight: 15, s1: m1.roadTrip,                              s2: m2.roadTrip,                              r1: `${m1.roadTrip}/100`,                        r2: `${m2.roadTrip}/100` },
    { label: "Environmental",       weight: 15, s1: m1.env,                                   s2: m2.env,                                   r1: `${m1.env}/100`,                             r2: `${m2.env}/100` },
  ];
}

function totalScore(rows, side) {
  return Math.round(rows.reduce((acc, r) => acc + r[side] * (r.weight / 100), 0));
}

// ── Sub-components ────────────────────────────────────────────────────────

function ScoreBadge({ score, label, color, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 12px rgba(0,0,0,.12)` }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{score}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.textMid, textAlign: "center", maxWidth: 100 }}>{label}</span>
    </div>
  );
}

function ScoreTable({ rows, name1, name2, t }) {
  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden", marginTop: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: t.card }}>
            <th style={{ padding: "10px 14px", textAlign: "left", color: t.textLight, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Category</th>
            <th style={{ padding: "10px 10px", textAlign: "center", color: t.text, fontWeight: 700, width: "22%" }}>{name1}</th>
            <th style={{ padding: "10px 10px", textAlign: "center", color: t.text, fontWeight: 700, width: "22%" }}>{name2}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const win1 = row.s1 >= row.s2;
            const win2 = row.s2 > row.s1;
            return (
              <tr key={row.label} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontWeight: 600, color: t.text }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: t.textLight, marginTop: 2 }}>Weight: {row.weight}%</div>
                </td>
                <td style={{ padding: "10px 10px", textAlign: "center", background: win1 ? t.greenLight + "55" : "transparent" }}>
                  <div style={{ fontWeight: win1 ? 700 : 400, color: win1 ? t.green : t.textMid }}>{row.r1}</div>
                  <div style={{ fontSize: 11, color: win1 ? t.green : t.textLight, marginTop: 2 }}>
                    {row.s1}/100{win1 && row.s1 > row.s2 ? " ✓" : ""}
                  </div>
                </td>
                <td style={{ padding: "10px 10px", textAlign: "center", background: win2 ? t.greenLight + "55" : "transparent" }}>
                  <div style={{ fontWeight: win2 ? 700 : 400, color: win2 ? t.green : t.textMid }}>{row.r2}</div>
                  <div style={{ fontSize: 11, color: win2 ? t.green : t.textLight, marginTop: 2 }}>
                    {row.s2}/100{win2 ? " ✓" : ""}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VehicleComparePanel({ v1, t1, v2, t2, t }) {
  if (!v1 || !v2) return null;
  const rows = buildScoreRows(v1, t1, v2, t2);
  const ts1 = totalScore(rows, "s1");
  const ts2 = totalScore(rows, "s2");
  const winner = ts1 > ts2 ? v1.name : ts2 > ts1 ? v2.name : null;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Score badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, padding: "20px 0" }}>
        <ScoreBadge score={ts1} label={v1.name} color={ts1 >= ts2 ? t.green : t.textLight} t={t} />
        <div style={{ fontSize: 20, fontWeight: 800, color: t.textLight }}>vs</div>
        <ScoreBadge score={ts2} label={v2.name} color={ts2 > ts1 ? t.green : t.textLight} t={t} />
      </div>

      {winner && (
        <div style={{ textAlign: "center", padding: "8px 16px", background: t.greenLight, borderRadius: 10, fontSize: 14, fontWeight: 700, color: t.greenDark, marginBottom: 4 }}>
          🏆 {winner} wins overall
        </div>
      )}
      {!winner && (
        <div style={{ textAlign: "center", padding: "8px 16px", background: t.card, borderRadius: 10, fontSize: 14, fontWeight: 600, color: t.textMid, marginBottom: 4 }}>
          🤝 It's a tie
        </div>
      )}

      <div style={{ fontSize: 11, color: t.textLight, textAlign: "center", marginBottom: 8 }}>
        Scored using national avg rates: 16¢/kWh · $3.50/gal · 12,000 mi/yr · 5-yr horizon
      </div>

      <ScoreTable rows={rows} name1={v1.name} name2={v2.name} t={t} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function ComparePage() {
  const { t } = useTheme();
  const [tab, setTab] = useState("evev");

  // EV vs EV
  const [evev1, setEvev1] = useState("model3lr");
  const [evev2, setEvev2] = useState("ioniq5");
  // EV vs Gas
  const [evgas_ev, setEvgasEv] = useState("model3lr");
  const [evgas_ice, setEvgasIce] = useState("camry");
  // Gas vs Gas
  const [gg1, setGg1] = useState("camry");
  const [gg2, setGg2] = useState("civic");
  // Stations
  const [pSel1, setPSel1] = useState(1);
  const [pSel2, setPSel2] = useState(4);

  const TABS = [
    { id: "evev",     label: "⚡ EV vs EV" },
    { id: "evgas",    label: "⚡↔⛽ EV vs Gas" },
    { id: "gasgas",   label: "⛽ Gas vs Gas" },
    { id: "stations", label: "🔋 Stations" },
  ];

  const TabBar = () => (
    <div style={{ display: "flex", gap: 4, padding: 4, background: t.card, borderRadius: 12, marginTop: 16, marginBottom: 24, flexWrap: "wrap" }}>
      {TABS.map((tb) => (
        <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: "10px 18px", borderRadius: 9, fontSize: 13, fontWeight: tab === tb.id ? 700 : 500, background: tab === tb.id ? t.white : "transparent", color: tab === tb.id ? t.text : t.textMid, border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: tab === tb.id ? `0 1px 4px rgba(0,0,0,.08)` : "none" }}>
          {tb.label}
        </button>
      ))}
    </div>
  );

  if (tab === "evev") {
    const a = VEHICLES.ev.find((v) => v.id === evev1);
    const b = VEHICLES.ev.find((v) => v.id === evev2);
    return (
      <div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
        <TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ev} value={evev1} onChange={setEvev1} popularIds={POPULAR_EV_IDS} label="Vehicle A" />
          <VehicleSearch vehicles={VEHICLES.ev} value={evev2} onChange={setEvev2} popularIds={POPULAR_EV_IDS} label="Vehicle B" />
        </div>
        <VehicleComparePanel v1={a} t1="ev" v2={b} t2="ev" t={t} />
        {a && b && (
          <div style={{ marginTop: 12, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: t.card }}>
                  <th style={{ padding: 12, textAlign: "left", color: t.textLight, fontSize: 12 }}>Spec</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{a.name}</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{b.name}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { l: "Efficiency",                 av: `${a.kwh} kWh/100mi`,        bv: `${b.kwh} kWh/100mi`,        better: a.kwh < b.kwh ? "a" : b.kwh < a.kwh ? "b" : "tie" },
                  { l: "Range (est.)",               av: `${EV_RANGE[a.id] ?? "—"} mi`, bv: `${EV_RANGE[b.id] ?? "—"} mi`, better: (EV_RANGE[a.id] ?? 0) > (EV_RANGE[b.id] ?? 0) ? "a" : "b" },
                  { l: "MSRP",                       av: `$${a.msrp.toLocaleString()}`,  bv: `$${b.msrp.toLocaleString()}`,  better: a.msrp < b.msrp ? "a" : "b" },
                  { l: "Max Federal Credit*",        av: `$${a.fc.toLocaleString()}`,    bv: `$${b.fc.toLocaleString()}`,    better: a.fc > b.fc ? "a" : "b" },
                  { l: "Net Price (w/ max credit)*", av: `$${(a.msrp - a.fc).toLocaleString()}`, bv: `$${(b.msrp - b.fc).toLocaleString()}`, better: (a.msrp - a.fc) < (b.msrp - b.fc) ? "a" : "b" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                    <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? t.green : t.textMid, background: row.better === "a" ? t.greenLight + "44" : "transparent" }}>{row.av}{row.better === "a" ? " ✓" : ""}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? t.green : t.textMid, background: row.better === "b" ? t.greenLight + "44" : "transparent" }}>{row.bv}{row.better === "b" ? " ✓" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {a && b && (
          <p style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
            * Federal credit eligibility depends on buyer income, vehicle MSRP, and assembly location. Credits are not automatic — verify at fueleconomy.gov.
          </p>
        )}
      </div>
    );
  }

  if (tab === "evgas") {
    const ev = VEHICLES.ev.find((v) => v.id === evgas_ev);
    const ice = VEHICLES.ice.find((v) => v.id === evgas_ice);
    return (
      <div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
        <TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ev}  value={evgas_ev}  onChange={setEvgasEv}  popularIds={POPULAR_EV_IDS}  label="⚡ EV" />
          <VehicleSearch vehicles={VEHICLES.ice} value={evgas_ice} onChange={setEvgasIce} popularIds={POPULAR_ICE_IDS} label="⛽ Gas Vehicle" />
        </div>
        <VehicleComparePanel v1={ev} t1="ev" v2={ice} t2="ice" t={t} />
      </div>
    );
  }

  if (tab === "gasgas") {
    const a = VEHICLES.ice.find((v) => v.id === gg1);
    const b = VEHICLES.ice.find((v) => v.id === gg2);
    return (
      <div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
        <TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ice} value={gg1} onChange={setGg1} popularIds={POPULAR_ICE_IDS} label="Gas Vehicle A" />
          <VehicleSearch vehicles={VEHICLES.ice} value={gg2} onChange={setGg2} popularIds={POPULAR_ICE_IDS} label="Gas Vehicle B" />
        </div>
        <VehicleComparePanel v1={a} t1="ice" v2={b} t2="ice" t={t} />
        {a && b && (
          <div style={{ marginTop: 12, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: t.card }}>
                  <th style={{ padding: 12, textAlign: "left", color: t.textLight, fontSize: 12 }}>Spec</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{a.name}</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{b.name}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { l: "MPG (combined)", av: `${a.mpg}`, bv: `${b.mpg}`, better: a.mpg > b.mpg ? "a" : "b" },
                  { l: "MSRP",          av: `$${a.msrp.toLocaleString()}`, bv: `$${b.msrp.toLocaleString()}`, better: a.msrp < b.msrp ? "a" : "b" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                    <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? t.green : t.textMid, background: row.better === "a" ? t.greenLight + "44" : "transparent" }}>{row.av}{row.better === "a" ? " ✓" : ""}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? t.green : t.textMid, background: row.better === "b" ? t.greenLight + "44" : "transparent" }}>{row.bv}{row.better === "b" ? " ✓" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Stations tab ──────────────────────────────────────────────────────────
  const sa = POWER_STATIONS.find((s) => s.id === pSel1);
  const sb = POWER_STATIONS.find((s) => s.id === pSel2);
  const stationRows = sa && sb ? [
    { l: "Capacity", a: sa.capacity, b: sb.capacity, better: parseFloat(sa.capacity.replace(/,/g, "")) > parseFloat(sb.capacity.replace(/,/g, "")) ? "a" : "b" },
    { l: "Output",   a: sa.output,   b: sb.output,   better: parseFloat(sa.output) > parseFloat(sb.output) ? "a" : "b" },
    { l: "Price",    a: `$${sa.price}`, b: `$${sb.price}`, better: sa.price < sb.price ? "a" : "b" },
    { l: "Weight",   a: sa.weight,   b: sb.weight },
    { l: "Battery",  a: sa.battery,  b: sb.battery },
    { l: "Cycles",   a: sa.cycles,   b: sb.cycles },
    { l: "Warranty", a: sa.warranty, b: sb.warranty },
  ] : [];

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
      <TabBar />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <select value={pSel1} onChange={(e) => setPSel1(Number(e.target.value))} style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, background: t.bg, color: t.text }}>
          {POWER_STATIONS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={pSel2} onChange={(e) => setPSel2(Number(e.target.value))} style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, background: t.bg, color: t.text }}>
          {POWER_STATIONS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {sa && sb && (
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: t.card }}>
                <th style={{ padding: 12, textAlign: "left", color: t.textLight, fontSize: 12 }}>Spec</th>
                <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{sa.name}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{sb.name}</th>
              </tr>
            </thead>
            <tbody>
              {stationRows.map((row, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                  <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? t.green : t.text, background: row.better === "a" ? t.greenLight + "44" : "transparent" }}>{row.a}{row.better === "a" ? " ✓" : ""}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? t.green : t.text, background: row.better === "b" ? t.greenLight + "44" : "transparent" }}>{row.b}{row.better === "b" ? " ✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
