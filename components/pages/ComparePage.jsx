"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine, Legend,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Slider, Toggle, Collapsible, ChartTip, TrustStrip } from "@/components/ui";
import { VehicleSearch } from "@/components/ui/VehicleSearch";
import { VEHICLES, POPULAR_EV_IDS, POPULAR_ICE_IDS, POWER_STATIONS, STATE_DATA } from "@/lib/data";
import { fmt } from "@/lib/helpers";
import { resolveStateFromZip } from "@/lib/geo";
import { STORAGE_KEYS, getStoredJson, pushStoredHistory } from "@/lib/profileStore";

// â"€â"€ Scoring data (used for EV vs EV / Gas vs Gas weighted scorecard) â"€â"€â"€â"€â"€â"€
const RELIABILITY = {
  model3rwd: 75, model3lr: 75, model3perf: 73, modelyrwd: 74, modely: 74, modelyperf: 72,
  models: 71, modelx: 70, ioniq5rwd: 80, ioniq5: 79, ioniq6rwd: 82, ioniq6awd: 81,
  konael: 79, ev6rwd: 79, ev6awd: 77, ev6gt: 75, ev9: 76, bolt: 76, blazerev: 73,
  mache: 68, f150lightning: 70, id4: 74, bmwi4: 72, polestar2: 71,
  rivianr1t: 70, rivianr1s: 70, nisanariya: 74, subarosolt: 75, toyotabz4x: 76,
  hondaprologue: 74, cadillaclyriq: 72, mercedeseqb: 69,
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

const AVG = { elec: 16, gas: 3.50, miles: 12000, years: 5 };
const DRIVE_MULTS = { efficient: 0.88, normal: 1.0, aggressive: 1.17 };
const VERDICT_CFG = {
  favorable:   { color: "#10b981", label: "EV Financially Favorable",   icon: "✅" },
  neutral:     { color: "#f59e0b", label: "Roughly Neutral",            icon: "⚖️" },
  unfavorable: { color: "#ef4444", label: "EV Financially Unfavorable", icon: "⚠️" },
};

// â"€â"€ Scorecard helpers (kept for EV vs EV / Gas vs Gas) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function computeMetrics(v, vtype, rates = {}) {
  const elec = rates.elec ?? AVG.elec;
  const gas = rates.gas ?? AVG.gas;
  const miles = rates.miles ?? AVG.miles;
  const annualFuel = vtype === "ev"
    ? (v.kwh / 100) * miles * (elec / 100)
    : (miles / v.mpg) * gas;
  const annualMaint = vtype === "ev" ? 800 : 1500;
  const tco5 = v.msrp + (annualFuel + annualMaint) * AVG.years;
  const reliability = RELIABILITY[v.id] ?? (vtype === "ev" ? 74 : 84);
  const range = EV_RANGE[v.id] ?? 250;
  const roadTrip = vtype === "ice" ? 95
    : range >= 380 ? 82 : range >= 300 ? 72 : range >= 240 ? 60 : 46;
  const env = vtype === "ev" ? 84 : Math.min(44, Math.round((v.mpg / 60) * 44 + 4));
  return { annualFuel, annualMaint, tco5, reliability, roadTrip, env };
}

function costScore(mine, theirs) {
  const min = Math.min(mine, theirs);
  const max = Math.max(mine, theirs);
  if (max === min) return 100;
  return Math.round(100 - ((mine - min) / (max - min)) * 40);
}

function buildScoreRows(v1, t1, v2, t2, rates = {}) {
  const m1 = computeMetrics(v1, t1, rates);
  const m2 = computeMetrics(v2, t2, rates);
  return [
    { label: "5-Year Total Cost",  weight: 20, s1: costScore(m1.tco5, m2.tco5),            s2: costScore(m2.tco5, m1.tco5),            r1: `$${Math.round(m1.tco5/1000)}k`,   r2: `$${Math.round(m2.tco5/1000)}k` },
    { label: "Annual Energy Cost", weight: 20, s1: costScore(m1.annualFuel, m2.annualFuel), s2: costScore(m2.annualFuel, m1.annualFuel), r1: `$${Math.round(m1.annualFuel)}/yr`, r2: `$${Math.round(m2.annualFuel)}/yr` },
    { label: "Annual Maintenance", weight: 15, s1: costScore(m1.annualMaint, m2.annualMaint),s2: costScore(m2.annualMaint, m1.annualMaint),r1: `$${m1.annualMaint}/yr`,           r2: `$${m2.annualMaint}/yr` },
    { label: "Reliability",        weight: 15, s1: m1.reliability,                          s2: m2.reliability,                          r1: `${m1.reliability}/100`,           r2: `${m2.reliability}/100` },
    { label: "Road Trip Ease",     weight: 15, s1: m1.roadTrip,                             s2: m2.roadTrip,                             r1: `${m1.roadTrip}/100`,              r2: `${m2.roadTrip}/100` },
    { label: "Environmental",      weight: 15, s1: m1.env,                                  s2: m2.env,                                  r1: `${m1.env}/100`,                   r2: `${m2.env}/100` },
  ];
}

function totalScore(rows, side) {
  return Math.round(rows.reduce((acc, r) => acc + r[side] * (r.weight / 100), 0));
}

function ScoreBadge({ score, label, color, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,.12)" }}>
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
                <td style={{ padding: "10px 10px", textAlign: "center", background: win1 ? "#d1fae566" : "transparent" }}>
                  <div style={{ fontWeight: win1 ? 700 : 400, color: win1 ? "#10b981" : t.textMid }}>{row.r1}</div>
                  <div style={{ fontSize: 11, color: win1 ? "#10b981" : t.textLight, marginTop: 2 }}>{row.s1}/100{win1 && row.s1 > row.s2 ? " ✓" : ""}</div>
                </td>
                <td style={{ padding: "10px 10px", textAlign: "center", background: win2 ? "#d1fae566" : "transparent" }}>
                  <div style={{ fontWeight: win2 ? 700 : 400, color: win2 ? "#10b981" : t.textMid }}>{row.r2}</div>
                  <div style={{ fontSize: 11, color: win2 ? "#10b981" : t.textLight, marginTop: 2 }}>{row.s2}/100{win2 ? " ✓" : ""}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VehicleComparePanel({ v1, t1, v2, t2, t, rates = {} }) {
  if (!v1 || !v2) return null;
  const rows = buildScoreRows(v1, t1, v2, t2, rates);
  const ts1 = totalScore(rows, "s1");
  const ts2 = totalScore(rows, "s2");
  const winner = ts1 > ts2 ? v1.name : ts2 > ts1 ? v2.name : null;
  const c1 = ts1 >= ts2 ? "#10b981" : "#64748b";
  const c2 = ts2 >  ts1 ? "#10b981" : "#64748b";
  return (
    <div style={{ marginTop: 12 }}>
      {/* Car standoff */}
      <div style={{
        position: "relative",
        background: t.featuredBg,
        border: `1.5px solid ${t.featuredBorder}`,
        borderRadius: "var(--r-xl)",
        padding: "24px 20px 16px",
        marginBottom: 14,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: "12%", top: "50%", transform: "translate(-50%,-50%)", width: 180, height: 180, borderRadius: "50%", background: c1, opacity: 0.07, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "12%", top: "50%", transform: "translate(50%,-50%)",  width: 180, height: 180, borderRadius: "50%", background: c2, opacity: 0.07, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "stretch", gap: 10 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <VehiclePhoto vehicleId={v1.id} name={v1.name} height={110} accentColor={c1} />
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: t.text }}>{v1.name}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c1, marginTop: 4 }}>{ts1}</div>
            <div style={{ fontSize: 10, color: t.textLight }}>score</div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.card, border: `2px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: t.text }}>VS</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <VehiclePhoto vehicleId={v2.id} name={v2.name} height={110} flip accentColor={c2} />
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: t.text }}>{v2.name}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c2, marginTop: 4 }}>{ts2}</div>
            <div style={{ fontSize: 10, color: t.textLight }}>score</div>
          </div>
        </div>
      </div>
      {winner
        ? <div style={{ textAlign: "center", padding: "8px 16px", background: "#d1fae5", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>🏆 {winner} wins overall</div>
        : <div style={{ textAlign: "center", padding: "8px 16px", background: t.card, borderRadius: 10, fontSize: 14, fontWeight: 600, color: t.textMid, marginBottom: 4 }}>🤝 It's a tie</div>
      }
      <div style={{ fontSize: 11, color: t.textLight, textAlign: "center", marginBottom: 8 }}>
        {rates.elec && rates.gas
          ? `Scored using ${rates.elec} cents/kWh | $${Number(rates.gas).toFixed(2)}/gal | ${(rates.miles ?? 12000).toLocaleString()} mi/yr | 5-year horizon`
          : "Scored using national average rates: 16 cents/kWh | $3.50/gal | 12,000 mi/yr | 5-year horizon"
        }
      </div>
      <ScoreTable rows={rows} name1={v1.name} name2={v2.name} t={t} />
      <div style={{ fontSize: 10, color: t.textLight, marginTop: 8, lineHeight: 1.6 }}>
        Reliability scores based on JD Power Vehicle Dependability Study 2024 and Consumer Reports owner satisfaction data. Road trip ease derived from EPA range. Environmental score reflects grid carbon intensity vs tailpipe emissions.
      </div>
    </div>
  );
}

// â"€â"€ Wikipedia article title map for each vehicle ID â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Titles must exactly match Wikipedia article names so pageimages API returns results.
const WIKI_ARTICLES = {
  // Tesla
  model3rwd: "Tesla Model 3", model3lr: "Tesla Model 3", model3perf: "Tesla Model 3",
  modelyrwd: "Tesla Model Y", modely: "Tesla Model Y", modelyperf: "Tesla Model Y",
  models: "Tesla Model S", modelx: "Tesla Model X",
  // Hyundai
  ioniq5rwd: "Hyundai Ioniq 5", ioniq5: "Hyundai Ioniq 5",
  ioniq6rwd: "Hyundai Ioniq 6", ioniq6awd: "Hyundai Ioniq 6",
  konael: "Hyundai Kona Electric",
  // Kia
  ev6rwd: "Kia EV6", ev6awd: "Kia EV6", ev6gt: "Kia EV6",
  ev9: "Kia EV9",
  // Chevy / Ford
  bolt: "Chevrolet Bolt EV",           // â† was wrongly "Chevrolet Equinox EV"
  blazerev: "Chevrolet Blazer EV",
  mache: "Ford Mustang Mach-E", f150lightning: "Ford F-150 Lightning",
  // VW / BMW / Polestar
  id4: "Volkswagen ID.4", bmwi4: "BMW i4", polestar2: "Polestar 2",
  // Rivian / Others
  rivianr1t: "Rivian R1T", rivianr1s: "Rivian R1S",
  nisanariya: "Nissan Ariya", subarosolt: "Subaru Solterra",
  toyotabz4x: "Toyota bZ4X", hondaprologue: "Honda Prologue",
  cadillaclyriq: "Cadillac Lyriq", mercedeseqb: "Mercedes-Benz EQB",
  // ICE â€" Toyota
  camry: "Toyota Camry", corolla: "Toyota Corolla",
  rav4: "Toyota RAV4", rav4hybrid: "Toyota RAV4 Hybrid",
  prius: "Toyota Prius", tacoma: "Toyota Tacoma", highlander: "Toyota Highlander",
  // ICE â€" Honda
  civic: "Honda Civic", crv: "Honda CR-V", accord: "Honda Accord",
  // ICE â€" American trucks
  f150gas: "Ford F-150", silverado: "Chevrolet Silverado", gmcsierra: "GMC Sierra",
  // ICE â€" Others
  altima: "Nissan Altima", cx5: "Mazda CX-5",
  tucson: "Hyundai Tucson", sorento: "Kia Sorento", bmw330i: "BMW 3 Series",
};

// Module-level cache â€" survives re-renders, cleared on page refresh
const _photoCache = {};

// Fetch car photo via MediaWiki action API (more reliable than REST summary).
// Uses prop=pageimages which explicitly returns the article's designated lead
// image at a requested pixel width. Supports origin=* for browser CORS.
async function fetchWikiPhoto(title) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query` +
    `&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages&pithumbsize=640&piprop=thumbnail` +
    `&format=json&origin=*`;
  const res  = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page  = Object.values(pages)[0];
  return page?.thumbnail?.source ?? null;
}

// â"€â"€ VehiclePhoto â€" fetches real car photo from Wikipedia â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function VehiclePhoto({ vehicleId, name, height = 140, flip = false, accentColor }) {
  const { t } = useTheme();
  const [src, setSrc]         = useState(_photoCache[vehicleId] ?? null);
  const [loading, setLoading] = useState(_photoCache[vehicleId] === undefined);

  useEffect(() => {
    // Already cached (even if null = "no image found")
    if (_photoCache[vehicleId] !== undefined) {
      setSrc(_photoCache[vehicleId]);
      setLoading(false);
      return;
    }
    const article = WIKI_ARTICLES[vehicleId];
    if (!article) { _photoCache[vehicleId] = null; setLoading(false); return; }

    let cancelled = false;
    fetchWikiPhoto(article)
      .then((imgUrl) => {
        if (cancelled) return;
        _photoCache[vehicleId] = imgUrl;
        setSrc(imgUrl);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        _photoCache[vehicleId] = null;
        setLoading(false);
      });
    return () => { cancelled = true; }; // cleanup if vehicleId changes mid-fetch
  }, [vehicleId]);

  const frame = {
    width: "100%", height,
    borderRadius: 10,
    overflow: "hidden",
    background: t.card,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  };

  if (loading) {
    return (
      <div style={frame} className="wf-skeleton" />
    );
  }

  if (!src) {
    // Fallback: gradient with car name
    return (
      <div style={{
        ...frame,
        background: accentColor
          ? `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`
          : t.card,
        border: `1px solid ${t.borderLight}`,
        flexDirection: "column", gap: 6,
      }}>
        <span style={{ fontSize: 28 }}>🚗</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.textMid, textAlign: "center", padding: "0 12px" }}>{name}</span>
      </div>
    );
  }

  return (
    <div style={{ ...frame, background: t.card }}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        style={{
          width: "100%", height: "100%",
          objectFit: "contain",
          transform: flip ? "scaleX(-1)" : "none",
          padding: "8px 4px",
          display: "block",
        }}
        onError={() => { _photoCache[vehicleId] = null; setSrc(null); }}
      />
    </div>
  );
}

// â"€â"€ Car Standoff Banner â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function CarStandoff({ ev, ice, t }) {
  return (
    <div style={{
      position: "relative",
      background: t.featuredBg,
      border: `1.5px solid ${t.featuredBorder}`,
      borderRadius: "var(--r-xl)",
      padding: "24px 20px 20px",
      marginBottom: 20,
      overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", left: "14%", top: "40%", transform: "translate(-50%,-50%)", width: 240, height: 180, borderRadius: "50%", background: t.green, opacity: 0.08, filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "14%", top: "40%", transform: "translate(50%,-50%)", width: 240, height: 180, borderRadius: "50%", background: "#64748b", opacity: 0.07, filter: "blur(50px)", pointerEvents: "none" }} />

      {/* Road stripe */}
      <div style={{ position: "absolute", bottom: 14, left: "22%", right: "22%", height: 2, background: `repeating-linear-gradient(90deg, ${t.featuredBorder} 0, ${t.featuredBorder} 18px, transparent 18px, transparent 32px)`, opacity: 0.6 }} />

      <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
        {/* EV side */}
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: t.green, marginBottom: 8 }}>⚡ Electric</div>
          <VehiclePhoto vehicleId={ev.id} name={ev.name} height={150} accentColor={t.green} />
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-.01em" }}>{ev.name}</div>
            <div style={{ fontSize: 12, color: t.textMid, marginTop: 2 }}>${ev.msrp.toLocaleString()} MSRP</div>
          </div>
        </div>

        {/* VS badge */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: t.card, border: `2px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: t.text, boxShadow: t.shadowMd,
          }}>
            VS
          </div>
        </div>

        {/* Gas side */}
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>⛽ Gas</div>
          <VehiclePhoto vehicleId={ice.id} name={ice.name} height={150} flip accentColor="#64748b" />
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-.01em" }}>{ice.name}</div>
            <div style={{ fontSize: 12, color: t.textMid, marginTop: 2 }}>${ice.msrp.toLocaleString()} MSRP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// â"€â"€ Section header helper â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function SectionHdr({ num, title, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", background: t.greenLight,
        color: "#065f46", fontWeight: 800, fontSize: 12,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{num}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{title}</div>
    </div>
  );
}

// â"€â"€ Full EV vs Gas Financial Comparison â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function EVGasFullCompare({ ev, ice, mi, er, gp, driveStyle, incI, t }) {
  const dm = DRIVE_MULTS[driveStyle] || 1.0;

  // â"€â"€ Section 1: Purchase â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const evCredit = incI ? ev.fc : 0;
  const evEffective = ev.msrp - evCredit;
  const pricePremium = evEffective - ice.msrp;

  // â"€â"€ Section 2: Annual Operating â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const evFuelAnnual  = Math.round((ev.kwh / 100) * dm * mi * (er / 100));
  const iceFuelAnnual = Math.round((mi / ice.mpg) * gp);
  const evMaintAnnual  = 800;
  const iceMaintAnnual = 1500;
  const evInsEst  = 1350;
  const iceInsEst = 1150;
  const evAnnual  = evFuelAnnual  + evMaintAnnual  + evInsEst;
  const iceAnnual = iceFuelAnnual + iceMaintAnnual + iceInsEst;
  const annualSavings = iceAnnual - evAnnual;

  // â"€â"€ Section 3: Cost per mile â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const evCpm  = (evAnnual  / mi * 100).toFixed(1);  // cents
  const iceCpm = (iceAnnual / mi * 100).toFixed(1);

  // â"€â"€ Section 4: 5-Year TCO â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const ev5yr  = evEffective + evAnnual  * 5;
  const ice5yr = ice.msrp    + iceAnnual * 5;
  const tco5Diff = ice5yr - ev5yr;  // positive = EV saves

  // â"€â"€ Section 5: Payback â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const breakevenYrs = annualSavings > 0 ? pricePremium / annualSavings : null;
  const horizonYrs   = 12;
  const cumulativeData = Array.from({ length: horizonYrs + 1 }, (_, y) => ({
    year: y,
    ev:  Math.round(evEffective + evAnnual  * y),
    ice: Math.round(ice.msrp   + iceAnnual * y),
  }));

  // â"€â"€ Section 6: Verdict â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const verdictType = tco5Diff > 1500 ? "favorable" : tco5Diff < -1500 ? "unfavorable" : "neutral";
  const vc = VERDICT_CFG[verdictType];

  const reasons = [];
  if (er < 14.5) reasons.push(`Low electricity (${er} cents/kWh vs ~16 cents US avg) â€" charging is cheap`);
  else if (er > 18.5) reasons.push(`High electricity (${er} cents/kWh vs ~16 cents US avg) â€" reduces EV advantage`);
  if (mi > 15000) reasons.push(`High mileage (${mi.toLocaleString()} mi/yr) amplifies fuel savings`);
  if (gp > 3.75) reasons.push(`Above-average gas ($${gp}/gal) favors the EV`);
  if (evCredit > 0) reasons.push(`$${evCredit.toLocaleString()} federal credit reduces effective EV price`);
  if (pricePremium <= 0) reasons.push(`The EV is actually cheaper upfront after credits`);
  if (driveStyle === "efficient") reasons.push("Efficient driving style improves EV range by ~12%");
  if (driveStyle === "aggressive") reasons.push("Aggressive driving reduces EV efficiency by ~17%");
  if (reasons.length === 0) reasons.push("Typical rates and mileage for this comparison");

  // Sensitivity: electricity break-even rate
  const erBreakEven = Math.round(iceFuelAnnual / ((ev.kwh / 100) * dm * mi / 100) * 10) / 10;

  // Chart data for stacked annual cost bars
  const annualBarData = [
    {
      label: ev.name.split(" ").slice(-2).join(" "),
      Fuel: evFuelAnnual, Maintenance: evMaintAnnual, Insurance: evInsEst,
    },
    {
      label: ice.name.split(" ").slice(-2).join(" "),
      Fuel: iceFuelAnnual, Maintenance: iceMaintAnnual, Insurance: iceInsEst,
    },
  ];

  // Chart data for 5-yr TCO stacked bars
  const tcoBarData = [
    {
      label: ev.name.split(" ").slice(-2).join(" "),
      Purchase: evEffective, "Operating (5yr)": Math.round(evAnnual * 5),
    },
    {
      label: ice.name.split(" ").slice(-2).join(" "),
      Purchase: ice.msrp, "Operating (5yr)": Math.round(iceAnnual * 5),
    },
  ];

  const evShort  = ev.name.split(" ").slice(0, 2).join(" ");
  const iceShort = ice.name.split(" ").slice(0, 2).join(" ");

  const panel = (children, mb = 16) => (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 20, marginBottom: mb }}>
      {children}
    </div>
  );

  const twoCol = (left, right) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {left}{right}
    </div>
  );

  const metricCard = (label, value, sub, highlight, bg) => (
    <div style={{ background: bg || t.card, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: t.textLight, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: highlight || t.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.textLight, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ marginTop: 20 }}>

      {/* â"€â"€ Car Standoff â"€â"€ */}
      <CarStandoff ev={ev} ice={ice} t={t} />

      {/* â"€â"€ Section 1: Purchase Cost â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="1" title="Vehicle Purchase Cost" t={t} />
          {twoCol(
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>⚡ {ev.name}</div>
              <div style={{ fontSize: 13, color: t.textMid }}>MSRP: <b style={{ color: t.text }}>${ev.msrp.toLocaleString()}</b></div>
              {evCredit > 0 && <div style={{ fontSize: 13, color: "#10b981" }}>Fed. credit: <b>âˆ'${evCredit.toLocaleString()}</b></div>}
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginTop: 6 }}>
                Effective: ${evEffective.toLocaleString()}
              </div>
              {!incI && ev.fc > 0 && (
                <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>
                  Enable incentives above to apply ${ev.fc.toLocaleString()} credit
                </div>
              )}
            </div>,
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textMid, marginBottom: 8 }}>⛽ {ice.name}</div>
              <div style={{ fontSize: 13, color: t.textMid }}>MSRP: <b style={{ color: t.text }}>${ice.msrp.toLocaleString()}</b></div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginTop: 6 }}>
                Effective: ${ice.msrp.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>No purchase incentives</div>
            </div>
          )}
          <div style={{ marginTop: 12, padding: "10px 14px", background: pricePremium <= 0 ? "#d1fae5" : t.card, borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: t.textMid }}>Purchase price difference: </span>
            <span style={{ fontWeight: 700, color: pricePremium <= 0 ? "#059669" : t.text }}>
              {pricePremium > 0 ? `+$${pricePremium.toLocaleString()} EV premium` : `EV is $${Math.abs(pricePremium).toLocaleString()} less expensive`}
            </span>
          </div>
          <div style={{ fontSize: 11, color: t.textLight, marginTop: 6 }}>
            * Federal credit eligibility depends on income, MSRP cap, and assembly location. Verify at fueleconomy.gov.
          </div>
        </>
      )}

      {/* â"€â"€ Section 2: Annual Operating Costs â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="2" title="Annual Operating Cost" t={t} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={annualBarData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: t.textMid }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Fuel"        stackId="a" fill="#10b981" />
              <Bar dataKey="Maintenance" stackId="a" fill="#34d399" />
              <Bar dataKey="Insurance"   stackId="a" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={{ background: "#d1fae5", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>⚡ {evShort} / year</div>
              {[["Fuel/charging", evFuelAnnual], ["Maintenance", evMaintAnnual], ["Insurance est.", evInsEst]].map(([lbl, val]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#065f46", marginBottom: 3 }}>
                  <span>{lbl}</span><span><b>${val.toLocaleString()}</b></span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #a7f3d0", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#059669" }}>
                <span>Total</span><span>${evAnnual.toLocaleString()}/yr</span>
              </div>
            </div>
            <div style={{ background: t.card, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMid, marginBottom: 8 }}>⛽ {iceShort} / year</div>
              {[["Gasoline", iceFuelAnnual], ["Maintenance", iceMaintAnnual], ["Insurance est.", iceInsEst]].map(([lbl, val]) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: t.textMid, marginBottom: 3 }}>
                  <span>{lbl}</span><span><b>${val.toLocaleString()}</b></span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${t.borderLight}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: t.text }}>
                <span>Total</span><span>${iceAnnual.toLocaleString()}/yr</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "10px 14px", background: annualSavings > 0 ? "#d1fae5" : "#fee2e2", borderRadius: 8, fontSize: 14, fontWeight: 700, color: annualSavings > 0 ? "#059669" : "#dc2626", textAlign: "center" }}>
            {annualSavings > 0
              ? `⚡ EV saves $${annualSavings.toLocaleString()}/year in operating costs`
              : `⛽ Gas vehicle saves $${Math.abs(annualSavings).toLocaleString()}/year in operating costs`}
          </div>

          <div style={{ fontSize: 11, color: t.textLight, marginTop: 6 }}>
            Insurance estimates are national averages. Actual rates vary by driver, location, and coverage.
          </div>
        </>
      )}

      {/* â"€â"€ Section 3: Cost per Mile â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="3" title="Cost Per Mile" t={t} />
          {twoCol(
            <div style={{ textAlign: "center", background: "#d1fae5", borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 11, color: "#065f46", marginBottom: 4 }}>⚡ {evShort}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#059669" }}>{evCpm} cents</div>
              <div style={{ fontSize: 11, color: "#10b981" }}>per mile</div>
            </div>,
            <div style={{ textAlign: "center", background: t.card, borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 11, color: t.textLight, marginBottom: 4 }}>⛽ {iceShort}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: t.text }}>{iceCpm} cents</div>
              <div style={{ fontSize: 11, color: t.textLight }}>per mile</div>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 12, color: t.textLight, textAlign: "center" }}>
            Includes fuel + maintenance + insurance Ã· {mi.toLocaleString()} miles/yr
          </div>
        </>
      )}

      {/* â"€â"€ Section 4: 5-Year TCO â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="4" title="5-Year Total Ownership Cost" t={t} />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tcoBarData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: t.textMid }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Purchase"        stackId="b" fill="#6366f1" />
              <Bar dataKey="Operating (5yr)" stackId="b" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <div style={{ background: "#ede9fe", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#4c1d95", fontWeight: 600, marginBottom: 6 }}>⚡ {evShort} â€" 5 years</div>
              <div style={{ fontSize: 12, color: "#5b21b6" }}>Purchase: ${evEffective.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#5b21b6" }}>Operating: ${Math.round(evAnnual * 5).toLocaleString()}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#4c1d95", marginTop: 4 }}>Total: ${ev5yr.toLocaleString()}</div>
            </div>
            <div style={{ background: t.card, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textMid, fontWeight: 600, marginBottom: 6 }}>⛽ {iceShort} â€" 5 years</div>
              <div style={{ fontSize: 12, color: t.textMid }}>Purchase: ${ice.msrp.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: t.textMid }}>Operating: ${Math.round(iceAnnual * 5).toLocaleString()}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginTop: 4 }}>Total: ${ice5yr.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "10px 14px", background: tco5Diff > 0 ? "#d1fae5" : "#fee2e2", borderRadius: 8, fontSize: 14, fontWeight: 700, color: tco5Diff > 0 ? "#059669" : "#dc2626", textAlign: "center" }}>
            {tco5Diff > 0
              ? `EV saves $${tco5Diff.toLocaleString()} over 5 years`
              : `Gas vehicle saves $${Math.abs(tco5Diff).toLocaleString()} over 5 years`}
          </div>
        </>
      )}

      {/* â"€â"€ Section 5: Payback Timeline â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="5" title="Payback Timeline" t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Price premium", value: pricePremium > 0 ? `+$${pricePremium.toLocaleString()}` : `âˆ'$${Math.abs(pricePremium).toLocaleString()}`, color: t.text },
              { label: "Annual savings", value: `$${Math.abs(annualSavings).toLocaleString()}/yr`, color: annualSavings > 0 ? "#059669" : "#dc2626" },
              { label: "Break-even", value: breakevenYrs !== null ? (pricePremium <= 0 ? "Day 1" : `${breakevenYrs.toFixed(1)} yrs`) : "Never", color: "#3b82f6" },
            ].map((m, i) => (
              <div key={i} style={{ background: t.card, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: t.textLight, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>Cumulative ownership cost over {horizonYrs} years</div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={cumulativeData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="cevG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ciceG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={v => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
              {breakevenYrs !== null && breakevenYrs > 0 && breakevenYrs <= horizonYrs && (
                <ReferenceLine
                  x={Math.round(breakevenYrs)}
                  stroke="#10b981" strokeDasharray="4 4"
                  label={{ value: "Break-even", fill: "#10b981", fontSize: 10, position: "insideTopLeft" }}
                />
              )}
              <Area type="monotone" dataKey="ice" stroke="#94a3b8" strokeWidth={2} fill="url(#ciceG)" name={iceShort} />
              <Area type="monotone" dataKey="ev"  stroke="#10b981" strokeWidth={2.5} fill="url(#cevG)" name={evShort} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}

      {/* â"€â"€ Section 6: Wattfull Verdict â"€â"€ */}
      {panel(
        <>
          <SectionHdr num="6" title="Wattfull Verdict" t={t} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{vc.icon}</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: vc.color }}>{vc.label}</span>
          </div>
          {reasons.map((r, i) => (
            <div key={i} style={{ fontSize: 13, color: t.textMid, display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: vc.color, flexShrink: 0 }}>•</span>
              <span>{r}</span>
            </div>
          ))}

          {/* Sensitivity */}
          <div style={{ marginTop: 14, borderTop: `1px solid ${t.borderLight}`, paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>What would change this verdict?</div>
            {erBreakEven > 0 && erBreakEven < 60 && (
              <div style={{ fontSize: 12, color: t.textMid, marginBottom: 5, display: "flex", gap: 6 }}>
                <span style={{ color: "#f59e0b" }}>⚡</span>
                <span>EV fuel advantage disappears if electricity exceeds <b style={{ color: t.text }}>{erBreakEven} cents/kWh</b> (currently {er} cents)</span>
              </div>
            )}
            <div style={{ fontSize: 12, color: t.textMid, marginBottom: 5, display: "flex", gap: 6 }}>
              <span style={{ color: "#f59e0b" }}>⛽</span>
              <span>Each $0.10 rise in gas adds <b style={{ color: t.text }}>+${Math.round(mi / ice.mpg * 0.1)}</b> to annual EV savings</span>
            </div>
            <div style={{ fontSize: 12, color: t.textMid, display: "flex", gap: 6 }}>
              <span style={{ color: "#f59e0b" }}>🚗</span>
              <span>Each extra 1,000 mi/yr adds <b style={{ color: t.text }}>+${Math.round((gp/ice.mpg - (ev.kwh/100)*dm*(er/100)) * 1000)}</b> to annual EV savings</span>
            </div>
          </div>

          {/* Data source strip */}
          <div style={{ borderTop: `1px solid ${t.borderLight}`, paddingTop: 10, marginTop: 12 }}>
            <div style={{ fontSize: 10, color: t.textLight, lineHeight: 1.8 }}>
              <b style={{ color: t.textMid }}>Data:</b> Vehicle specs: EPA | Electricity: EIA | Gas: AAA/EIA | Insurance: national average estimates |
              <b style={{ color: t.textMid }}> Last updated:</b> Mar 2026
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// â"€â"€ Main ComparePage â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export function ComparePage() {
  const { t } = useTheme();
  const [tab, setTab] = useState("evgas");
  const [compareHistory, setCompareHistory] = useState([]);

  // Vehicle selections
  const [evev1, setEvev1] = useState("model3lr");
  const [evev2, setEvev2] = useState("ioniq5");
  const [evgas_ev, setEvgasEv] = useState("model3lr");
  const [evgas_ice, setEvgasIce] = useState("camry");
  const [gg1, setGg1] = useState("camry");
  const [gg2, setGg2] = useState("civic");
  const [pSel1, setPSel1] = useState(1);
  const [pSel2, setPSel2] = useState(4);

  // ZIP / location
  const [zip, setZip] = useState("");
  const [zipLocked, setZipLocked] = useState(false); // true once user manually edits sliders

  // EV vs Gas live-update inputs
  const [mi, setMi]       = useState(12000);
  const [er, setEr]       = useState(16);
  const [gp, setGp]       = useState(3.50);
  const [driveStyle, setDriveStyle] = useState("normal");
  const [incI, setIncI]   = useState(false);

  // Resolve state + auto-fill rates from ZIP
  const resolvedState = resolveStateFromZip(zip);
  useEffect(() => {
    if (!resolvedState || zipLocked) return;
    const sd = STATE_DATA[resolvedState];
    if (!sd) return;
    setEr(sd.e);
    setGp(sd.g);
  }, [resolvedState]);

  const sharedRates = { elec: er, gas: gp, miles: mi };

  const TABS = [
    { id: "evgas",    label: "⚡↔⛽ EV vs Gas" },
    { id: "evev",     label: "⚡ EV vs EV" },
    { id: "gasgas",   label: "⛽ Gas vs Gas" },
    { id: "stations", label: "🔋 Stations" },
  ];


  useEffect(() => {
    setCompareHistory(getStoredJson(STORAGE_KEYS.compareHistory, []));
  }, []);

  useEffect(() => {
    let entry = null;
    if (tab === "evgas") {
      const ev = VEHICLES.ev.find((v) => v.id === evgas_ev);
      const ice = VEHICLES.ice.find((v) => v.id === evgas_ice);
      if (ev && ice) entry = { title: `${ev.name} vs ${ice.name}`, summary: `${mi.toLocaleString()} mi/yr | ${er} cents/kWh | $${gp.toFixed(2)}/gal`, tab };
    } else if (tab === "evev") {
      const a = VEHICLES.ev.find((v) => v.id === evev1);
      const b = VEHICLES.ev.find((v) => v.id === evev2);
      if (a && b) entry = { title: `${a.name} vs ${b.name}`, summary: "EV vs EV scorecard", tab };
    } else if (tab === "gasgas") {
      const a = VEHICLES.ice.find((v) => v.id === gg1);
      const b = VEHICLES.ice.find((v) => v.id === gg2);
      if (a && b) entry = { title: `${a.name} vs ${b.name}`, summary: "Gas vs gas scorecard", tab };
    } else {
      const a = POWER_STATIONS.find((s) => s.id === pSel1);
      const b = POWER_STATIONS.find((s) => s.id === pSel2);
      if (a && b) entry = { title: `${a.name} vs ${b.name}`, summary: "Portable power comparison", tab };
    }
    if (!entry) return;
    setCompareHistory(pushStoredHistory(STORAGE_KEYS.compareHistory, entry));
  }, [tab, evev1, evev2, evgas_ev, evgas_ice, gg1, gg2, pSel1, pSel2, mi, er, gp]);
  const TabBar = () => (
    <div style={{ display: "flex", gap: 4, padding: 4, background: t.card, borderRadius: 12, marginTop: 16, marginBottom: 24, flexWrap: "wrap" }}>
      {TABS.map((tb) => (
        <button
          key={tb.id} onClick={() => setTab(tb.id)}
          style={{
            padding: "10px 18px", borderRadius: 9, fontSize: 13,
            fontWeight: tab === tb.id ? 700 : 500,
            background: tab === tb.id ? t.white : "transparent",
            color: tab === tb.id ? t.text : t.textMid,
            border: "none", cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: tab === tb.id ? "0 1px 4px rgba(0,0,0,.08)" : "none",
          }}
        >
          {tb.label}
        </button>
      ))}
    </div>
  );

  const h1 = (
    <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
  );

  // â"€â"€ EV vs Gas â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  if (tab === "evgas") {
    const ev  = VEHICLES.ev.find((v) => v.id === evgas_ev);
    const ice = VEHICLES.ice.find((v) => v.id === evgas_ice);
    return (
      <div>
        {h1}
        <p style={{ fontSize: 15, color: t.textMid, marginTop: 6, marginBottom: 0, maxWidth: 600 }}>
          Full financial breakdown: purchase, operating, cost per mile, 5-year TCO, payback curve, and verdict.
        </p>
        <div style={{ marginTop: 16 }}>
          <TrustStrip
            title="Compare trust layer"
            items={[
              { label: "Rates", value: "User-adjusted inputs", note: "Use your actual utility and gas assumptions where possible.", tone: "positive" },
              { label: "Ownership model", value: "Estimated TCO", note: "Insurance and maintenance remain benchmark-based.", tone: "neutral" },
              { label: "Recent comparisons", value: compareHistory.length ? `${compareHistory.length} saved locally` : "None yet", note: "Recent compare sessions feed the dashboard.", tone: compareHistory.length ? "positive" : "low" },
            ]}
          />
        </div>
        {compareHistory.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {compareHistory.slice(0, 3).map((item) => (
              <div key={`${item.title}-${item.summary}`} style={{ padding: "7px 10px", borderRadius: 999, background: t.card, border: `1px solid ${t.borderLight}`, fontSize: 11, color: t.textMid }}>
                {item.title}
              </div>
            ))}
          </div>
        ) : null}
        <TabBar />

        {/* Vehicle selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ev}  value={evgas_ev}  onChange={setEvgasEv}  popularIds={POPULAR_EV_IDS}  label="⚡ EV" />
          <VehicleSearch vehicles={VEHICLES.ice} value={evgas_ice} onChange={setEvgasIce} popularIds={POPULAR_ICE_IDS} label="⛽ Gas Vehicle" />
        </div>

        {/* Live-update controls */}
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: "16px 20px", marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textMid, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Personalize this comparison</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: t.textMid, display: "flex", flexDirection: "column", gap: 4 }}>
              ZIP code (auto-fills local rates)
              <input
                value={zip}
                onChange={(e) => { setZip(e.target.value.replace(/\D/g, "").slice(0, 5)); setZipLocked(false); }}
                placeholder="e.g. 94103"
                maxLength={5}
                style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text, fontSize: 13, width: 140 }}
              />
            </label>
            {resolvedState && (
              <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                <span style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>{resolvedState}</span>
                <span style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>{er}¢/kWh</span>
                <span style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>${Number(gp).toFixed(2)}/gal</span>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 24px" }}>
            <Slider label="Annual Miles" value={mi} onChange={setMi} min={3000} max={40000} step={500} editable inputModes={["year","week","day"]} suffix=" / year" />
            <Slider label="Electricity rate" value={er} onChange={(v) => { setEr(v); setZipLocked(true); }} min={8} max={35} step={0.5} suffix=" cents/kWh" />
            <Slider label="Gas price" value={gp} onChange={(v) => { setGp(Math.round(v * 100) / 100); setZipLocked(true); }} min={2.00} max={6.00} step={0.05} prefix="$" suffix="/gal" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textMid, marginBottom: 6 }}>Driving Style</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["efficient","🐢 Efficient"],["normal","🚗 Normal"],["aggressive","🦅 Spirited"]].map(([id, lbl]) => (
                  <button
                    key={id} onClick={() => setDriveStyle(id)}
                    style={{
                      padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${driveStyle === id ? "#10b981" : t.borderLight}`,
                      background: driveStyle === id ? "#d1fae5" : t.card,
                      color: driveStyle === id ? "#065f46" : t.textMid,
                    }}
                  >{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Toggle label="Include federal tax credit" value={incI} onChange={setIncI} />
            </div>
          </div>
        </div>

        {/* Full comparison */}
        {ev && ice
          ? <EVGasFullCompare ev={ev} ice={ice} mi={mi} er={er} gp={gp} driveStyle={driveStyle} incI={incI} t={t} />
          : <div style={{ textAlign: "center", padding: 32, color: t.textLight, marginTop: 16 }}>Select both vehicles above to see the full comparison</div>
        }
      </div>
    );
  }

  // â"€â"€ EV vs EV â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  if (tab === "evev") {
    const a = VEHICLES.ev.find((v) => v.id === evev1);
    const b = VEHICLES.ev.find((v) => v.id === evev2);
    return (
      <div>
        {h1}<TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ev} value={evev1} onChange={setEvev1} popularIds={POPULAR_EV_IDS} label="Vehicle A" />
          <VehicleSearch vehicles={VEHICLES.ev} value={evev2} onChange={setEvev2} popularIds={POPULAR_EV_IDS} label="Vehicle B" />
        </div>
        <VehicleComparePanel v1={a} t1="ev" v2={b} t2="ev" t={t} rates={sharedRates} />
        {a && b && (
          <>
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
                    { l: "Efficiency",     av: `${a.kwh} kWh/100mi`, bv: `${b.kwh} kWh/100mi`, better: a.kwh < b.kwh ? "a" : "b" },
                    { l: "EPA Range",      av: `${EV_RANGE[a.id] ?? "-"} mi`, bv: `${EV_RANGE[b.id] ?? "-"} mi`, better: (EV_RANGE[a.id]??0) > (EV_RANGE[b.id]??0) ? "a" : "b" },
                    { l: "MSRP",           av: `$${a.msrp.toLocaleString()}`, bv: `$${b.msrp.toLocaleString()}`, better: a.msrp < b.msrp ? "a" : "b" },
                    { l: "Federal Credit", av: `$${a.fc.toLocaleString()}`,   bv: `$${b.fc.toLocaleString()}`,   better: a.fc > b.fc ? "a" : "b" },
                    { l: "Net Price*",     av: `$${(a.msrp - a.fc).toLocaleString()}`, bv: `$${(b.msrp - b.fc).toLocaleString()}`, better: (a.msrp - a.fc) < (b.msrp - b.fc) ? "a" : "b" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                      <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                      <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? "#10b981" : t.textMid, background: row.better === "a" ? "#d1fae544" : "transparent" }}>{row.av}{row.better === "a" ? " ✓" : ""}</td>
                      <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? "#10b981" : t.textMid, background: row.better === "b" ? "#d1fae544" : "transparent" }}>{row.bv}{row.better === "b" ? " ✓" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
              * Federal credit eligibility depends on income, MSRP cap, and assembly location.
            </p>
          </>
        )}
      </div>
    );
  }

  // â"€â"€ Gas vs Gas â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  if (tab === "gasgas") {
    const a = VEHICLES.ice.find((v) => v.id === gg1);
    const b = VEHICLES.ice.find((v) => v.id === gg2);
    return (
      <div>
        {h1}<TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ice} value={gg1} onChange={setGg1} popularIds={POPULAR_ICE_IDS} label="Gas Vehicle A" />
          <VehicleSearch vehicles={VEHICLES.ice} value={gg2} onChange={setGg2} popularIds={POPULAR_ICE_IDS} label="Gas Vehicle B" />
        </div>
        <VehicleComparePanel v1={a} t1="ice" v2={b} t2="ice" t={t} rates={sharedRates} />
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
                  { l: "Annual Gas Cost", av: `$${Math.round((AVG.miles/a.mpg)*AVG.gas).toLocaleString()}/yr`, bv: `$${Math.round((AVG.miles/b.mpg)*AVG.gas).toLocaleString()}/yr`, better: a.mpg > b.mpg ? "a" : "b" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                    <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? "#10b981" : t.textMid, background: row.better === "a" ? "#d1fae544" : "transparent" }}>{row.av}{row.better === "a" ? " ✓" : ""}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? "#10b981" : t.textMid, background: row.better === "b" ? "#d1fae544" : "transparent" }}>{row.bv}{row.better === "b" ? " ✓" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // â"€â"€ Power Stations â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const sa = POWER_STATIONS.find((s) => s.id === pSel1);
  const sb = POWER_STATIONS.find((s) => s.id === pSel2);
  const stationRows = sa && sb ? [
    { l: "Capacity", a: sa.capacity, b: sb.capacity, better: parseFloat(sa.capacity.replace(/,/g,"")) > parseFloat(sb.capacity.replace(/,/g,"")) ? "a" : "b" },
    { l: "Output",   a: sa.output,   b: sb.output,   better: parseFloat(sa.output) > parseFloat(sb.output) ? "a" : "b" },
    { l: "Price",    a: `$${sa.price}`, b: `$${sb.price}`, better: sa.price < sb.price ? "a" : "b" },
    { l: "Weight",   a: sa.weight,   b: sb.weight },
    { l: "Battery",  a: sa.battery,  b: sb.battery },
    { l: "Cycles",   a: sa.cycles,   b: sb.cycles },
    { l: "Warranty", a: sa.warranty, b: sb.warranty },
  ] : [];

  return (
    <div>
      {h1}<TabBar />
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
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? "#10b981" : t.text, background: row.better === "a" ? "#d1fae544" : "transparent" }}>{row.a}{row.better === "a" ? " ✓" : ""}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? "#10b981" : t.text, background: row.better === "b" ? "#d1fae544" : "transparent" }}>{row.b}{row.better === "b" ? " ✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}





