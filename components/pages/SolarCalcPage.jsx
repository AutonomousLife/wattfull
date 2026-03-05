"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Badge, ChartTip } from "@/components/ui";
import { STATE_DATA, zipToState } from "@/lib/data";
import { fmt } from "@/lib/helpers";
import { ShareBadge } from "@/components/widgets/ShareBadge";

// ── Verdict config ─────────────────────────────────────────────────────────
const VERDICT_CFG = {
  favorable: {
    label: "Favorable", icon: "✅",
    bg: "#d1fae5", border: "#10b981", titleColor: "#065f46", textColor: "#065f46",
    tagBg: "#10b981", tagText: "#fff",
  },
  neutral: {
    label: "Moderate", icon: "⚖️",
    bg: "#fef3c7", border: "#f59e0b", titleColor: "#92400e", textColor: "#92400e",
    tagBg: "#f59e0b", tagText: "#fff",
  },
  unfavorable: {
    label: "Challenging", icon: "⚠️",
    bg: "#fee2e2", border: "#ef4444", titleColor: "#7f1d1d", textColor: "#7f1d1d",
    tagBg: "#ef4444", tagText: "#fff",
  },
};

// ── Data sources ────────────────────────────────────────────────────────────
const SOURCES = [
  { label: "Solar Hours", src: "NREL National Solar Radiation Database", date: "2024" },
  { label: "Electricity Rates", src: "EIA Electric Power Monthly", date: "Feb 2025" },
  { label: "Federal ITC", src: "IRS Form 5695 / Inflation Reduction Act", date: "2025" },
  { label: "Panel Efficiency", src: "NREL Best Research-Cell Efficiency Chart", date: "2025" },
  { label: "State Incentives", src: "DSIRE Database", date: "Quarterly updated" },
];

export function SolarCalcPage() {
  const { t } = useTheme();
  const [zip, setZip] = useState("");
  const [st, setSt] = useState(null);
  const [sd, setSd2] = useState(null);
  const [kwh, setKwh] = useState(900);
  const [roof, setRoof] = useState(400);
  const [shade, setShade] = useState("light");
  const [orient, setOrient] = useState("south");
  const [cpw, setCpw] = useState(2.85);
  const [fed, setFed] = useState(true);
  const [stC, setStC] = useState(true);
  const [rateEsc, setRateEsc] = useState(3);
  const [res, setRes] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    if (zip.length === 5) {
      const s = zipToState(zip);
      setSt(s);
      setSd2(s ? STATE_DATA[s] : null);
    } else {
      setSt(null);
      setSd2(null);
    }
  }, [zip]);

  const calc = () => {
    if (!/^\d{5}$/.test(zip) || !st || !sd) return;
    const d = sd;
    const sh = { none: 1, light: 0.9, moderate: 0.75, heavy: 0.55 }[shade];
    const or = { south: 1, sw_se: 0.92, ew: 0.82, north: 0.65 }[orient];
    const maxP = Math.floor(roof / 18);
    const annUse = kwh * 12;
    const tKw = Math.min(annUse / (d.s * 365 * sh * or * 0.82), (maxP * 400) / 1000);
    const sysKw = Math.round(tKw * 10) / 10;
    const sysCost = sysKw * 1000 * cpw;
    const prod = sysKw * d.s * 365 * sh * or * 0.82;
    let itc = 0;
    if (fed) itc += sysCost * 0.3;
    if (stC) itc += d.sc || 0;
    const net = sysCost - itc;
    const yd = [];
    let cum = 0, pb = null;
    for (let y = 0; y <= 25; y++) {
      const deg = 1 - y * 0.005;
      const rate = (d.e * Math.pow(1 + rateEsc / 100, y)) / 100;
      const yp = prod * deg;
      const ys = y === 0 ? 0 : yp * rate;
      cum += ys;
      if (!pb && cum > net && y > 0) pb = y;
      yd.push({ year: y, savings: Math.round(cum), cost: Math.round(net) });
    }
    const lifetime = Math.round(cum - net);
    const offset = Math.min(100, Math.round((prod / annUse) * 100));

    // Verdict
    const verdictType = !pb ? "unfavorable" : pb <= 8 ? "favorable" : pb <= 14 ? "neutral" : "unfavorable";
    const verdictReasons = [];
    if (!pb) verdictReasons.push("System does not reach payback within 25 years at current rates");
    if (pb && pb <= 6) verdictReasons.push(`Exceptional ${pb}-year payback — well below the 8-year benchmark`);
    if (pb && pb > 6 && pb <= 8) verdictReasons.push(`Strong ${pb}-year payback — within the favorable range`);
    if (pb && pb > 8 && pb <= 12) verdictReasons.push(`Moderate ${pb}-year payback — still beats most investments`);
    if (pb && pb > 12) verdictReasons.push(`${pb}-year payback is longer than average — reassess in 1–2 years`);
    if (d.e >= 15) verdictReasons.push(`High electricity rate (${d.e}¢/kWh) accelerates savings`);
    if (d.e < 10) verdictReasons.push(`Low electricity rate (${d.e}¢/kWh) reduces the financial case for solar`);
    if (d.s >= 5.5) verdictReasons.push(`Excellent solar resource (${d.s} sun-hrs/day) boosts output`);
    if (d.s < 4) verdictReasons.push(`Limited sun hours (${d.s}/day) reduces production potential`);
    if (shade !== "none") verdictReasons.push(`${shade.charAt(0).toUpperCase() + shade.slice(1)} shading reduces output — trimming trees adds ~5–10% production`);
    if (fed) verdictReasons.push(`30% Federal ITC saves $${Math.round(sysCost * 0.3).toLocaleString()} upfront`);
    if (d.sc > 0 && stC) verdictReasons.push(`State incentive reduces cost by $${d.sc.toLocaleString()}`);

    // Sensitivity: electricity rate needed for 8yr payback
    // net / (prod * rate_threshold) = 8 → rate_threshold = net / (prod * 8)
    const rateForFav = Math.round((net / (prod * 8)) * 10000) / 100; // in ¢/kWh
    const rateForOk = Math.round((net / (prod * 14)) * 10000) / 100; // for 14yr

    // Impact of removing shading
    const prodNoShade = sysKw * d.s * 365 * 1.0 * or * 0.82;
    const ydNoShade = [];
    let cumNS = 0, pbNoShade = null;
    for (let y = 0; y <= 25; y++) {
      const deg = 1 - y * 0.005;
      const rate = (d.e * Math.pow(1 + rateEsc / 100, y)) / 100;
      const ys = y === 0 ? 0 : prodNoShade * deg * rate;
      cumNS += ys;
      if (!pbNoShade && cumNS > net && y > 0) pbNoShade = y;
    }

    // Equivalencies
    const annualSavings = prod * (d.e / 100);
    const monthsElecBills = Math.round(annualSavings / ((kwh * d.e) / 100));
    const co2Avoided25yr = Math.round((prod * 25 * 0.386) / 1000); // metric tons (0.386 kg CO2/kWh US avg)
    const treesEquiv = Math.round(co2Avoided25yr * 1000 / 21); // 21 kg CO2/tree/yr
    const phonesCharged = Math.round(prod * 1000 / 12); // phone charge ≈ 0.012 kWh, per year

    setRes({
      sysKw,
      sysCost: Math.round(sysCost),
      net: Math.round(net),
      itc: Math.round(itc),
      prodLow: Math.round(prod * 0.85),
      prodMed: Math.round(prod),
      prodHigh: Math.round(prod * 1.1),
      pb,
      lifetime,
      yd,
      offset,
      // verdict
      verdictType,
      verdictReasons,
      // sensitivity
      rateForFav,
      rateForOk,
      pbNoShade,
      shade,
      // equivalencies
      annualSavings: Math.round(annualSavings),
      monthsElecBills,
      co2Avoided25yr,
      treesEquiv,
      phonesCharged,
      // assumptions
      assumptions: {
        state: st,
        sunHrs: d.s,
        elecRate: d.e,
        shadeLabel: shade,
        shadeFactor: Math.round(sh * 100),
        orientLabel: orient,
        orientFactor: Math.round(or * 100),
        cpw,
        rateEsc,
        fedItc: fed ? Math.round(sysCost * 0.3) : 0,
        stateCredit: stC ? (d.sc || 0) : 0,
        panelDeg: "0.5%/yr",
        systemEff: "82% (inverter + wiring losses)",
      },
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Solar ROI Calculator</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Payback and lifetime savings using your location's solar resource and incentives.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 28, marginTop: 28 }}>
        {/* ── Input Panel ───────────────────────────────────────────────────── */}
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 22 }}>
          <Input label="ZIP Code" value={zip} onChange={setZip} />
          {st && sd && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <Badge type="real">{st}</Badge>
              <Badge type="estimated">{sd.s} sun-hrs</Badge>
              <Badge type="estimated">{sd.e}¢/kWh</Badge>
            </div>
          )}
          <Slider label="Monthly kWh" value={kwh} onChange={setKwh} min={200} max={3000} step={50} suffix=" kWh" />
          <Slider label="Usable Roof" value={roof} onChange={setRoof} min={100} max={1500} step={25} suffix=" sqft" />
          <Select label="Shading" value={shade} onChange={setShade} options={[
            { value: "none", label: "None" },
            { value: "light", label: "Light (−10%)" },
            { value: "moderate", label: "Moderate (−25%)" },
            { value: "heavy", label: "Heavy (−45%)" },
          ]} />
          <Select label="Orientation" value={orient} onChange={setOrient} options={[
            { value: "south", label: "South (optimal)" },
            { value: "sw_se", label: "SW/SE (−8%)" },
            { value: "ew", label: "E/W (−18%)" },
            { value: "north", label: "North (−35%)" },
          ]} />
          <Slider label="Cost per Watt" value={cpw} onChange={setCpw} min={1.5} max={4.5} step={0.05} suffix="$/W" />
          <Toggle label="30% Federal ITC" value={fed} onChange={setFed} />
          <Toggle label="State credits" value={stC} onChange={setStC} />
          <Slider label="Rate escalation" value={rateEsc} onChange={setRateEsc} min={0} max={6} step={0.5} suffix="%/yr" />
          <button onClick={calc} style={{ width: "100%", background: t.green, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
            Calculate Solar ROI
          </button>
        </div>

        {/* ── Results Panel ─────────────────────────────────────────────────── */}
        <div>
          {!res ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>☀️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter your details and calculate</h3>
              <p style={{ fontSize: 13, color: t.textLight, marginTop: 8, lineHeight: 1.6 }}>
                Wattfull will estimate system size, costs, payback period, and 25-year savings based on real data for your location.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* ── 1. Result Summary ─────────────────────────────────────── */}
              <div style={{ background: t.green, borderRadius: 14, padding: 22, color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                  System Summary · {zip} ({res.assumptions.state})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>System Size</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{res.sysKw} kW</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Net Cost After Credits</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>${res.net.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Est. Payback</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{res.pb ? `~${res.pb} yrs` : "25+ yrs"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>25-Year Net Savings</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>${res.lifetime.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                    Annual production: {res.prodMed.toLocaleString()} kWh
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                    Bill offset: ~{res.offset}%
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                    Credits: ${res.itc.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* ── 2. Wattfull Verdict ───────────────────────────────────── */}
              {(() => {
                const v = VERDICT_CFG[res.verdictType];
                return (
                  <div style={{ background: v.bg, border: `2px solid ${v.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 24 }}>{v.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: v.titleColor, textTransform: "uppercase", letterSpacing: ".06em" }}>
                          Wattfull Verdict
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: v.titleColor }}>{v.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: v.tagBg, color: v.tagText, borderRadius: 4, padding: "2px 8px" }}>
                            {res.pb ? `${res.pb}-yr payback` : "25+ yr payback"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[
                        { label: "Annual Savings", val: `$${res.annualSavings.toLocaleString()}` },
                        { label: "25-Yr Return", val: `$${res.lifetime.toLocaleString()}` },
                        { label: "ROI", val: res.net > 0 ? `${Math.round((res.lifetime / res.net) * 100)}%` : "—" },
                      ].map(m => (
                        <div key={m.label} style={{ background: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 90, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: v.titleColor, fontWeight: 600 }}>{m.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: v.titleColor }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {res.verdictReasons.slice(0, 4).map((r, i) => (
                        <li key={i} style={{ fontSize: 12, color: v.textColor, lineHeight: 1.6, marginBottom: 3 }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* ── 3. Payback Chart ─────────────────────────────────────── */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>Cumulative Savings vs. Net Cost</div>
                <div style={{ fontSize: 12, color: t.textLight, marginBottom: 14 }}>
                  Where the savings line crosses the cost line = your payback point
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={res.yd}>
                    <defs>
                      <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.green} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                    <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
                    {res.pb && (
                      <ReferenceLine x={res.pb} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={2}
                        label={{ value: `Break-even Yr ${res.pb}`, position: "top", fontSize: 10, fill: "#f59e0b" }}
                      />
                    )}
                    <Area type="monotone" dataKey="cost" stroke={t.textLight} strokeWidth={2} strokeDasharray="5 4"
                      fill="none" name="Net Cost" />
                    <Area type="monotone" dataKey="savings" stroke={t.green} strokeWidth={2.5} fill="url(#sG)" name="Cum. Savings" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textLight }}>
                    <div style={{ width: 20, height: 2, background: t.green }} />
                    Cumulative Savings
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textLight }}>
                    <div style={{ width: 20, height: 2, background: t.textLight, borderTop: "2px dashed" }} />
                    Net System Cost
                  </div>
                  {res.pb && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#f59e0b" }}>
                      <div style={{ width: 20, height: 2, background: "#f59e0b" }} />
                      Break-even
                    </div>
                  )}
                </div>
              </div>

              {/* ── 4. What Would Change This Result ─────────────────────── */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>
                  💡 What Would Change This Result
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Electricity rate threshold */}
                  <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>Electricity Rate Sensitivity</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, textTransform: "uppercase" }}>Your Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{res.assumptions.elecRate}¢/kWh</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, textTransform: "uppercase" }}>Rate for 8-yr Payback</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: res.assumptions.elecRate >= res.rateForFav ? "#10b981" : "#ef4444" }}>
                          {res.rateForFav}¢/kWh
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: t.textMid, marginTop: 8, lineHeight: 1.5 }}>
                      {res.assumptions.elecRate >= res.rateForFav
                        ? `✅ Your rate (${res.assumptions.elecRate}¢) already exceeds the ${res.rateForFav}¢ threshold for a favorable payback.`
                        : `📈 If rates rise to ${res.rateForFav}¢/kWh, payback drops to 8 years. US rates have risen ~3%/year historically.`
                      }
                    </div>
                  </div>

                  {/* Shading impact */}
                  {res.shade !== "none" && res.pbNoShade && res.pb && res.pbNoShade < res.pb && (
                    <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>Shading Impact</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, textTransform: "uppercase" }}>With {res.shade} shading</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{res.pb} yr payback</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, textTransform: "uppercase" }}>With no shading</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{res.pbNoShade} yr payback</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: t.textMid, marginTop: 8, lineHeight: 1.5 }}>
                        🌳 Removing shading obstacles could shorten your payback by {res.pb - res.pbNoShade} year{res.pb - res.pbNoShade !== 1 ? "s" : ""}.
                        Tree trimming costs $300–$1,500 and typically pays for itself quickly.
                      </div>
                    </div>
                  )}

                  {/* Rate escalation impact */}
                  <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>Rate Escalation Impact on 25-Yr Savings</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { label: "0%/yr (flat)", val: (() => {
                          let c = 0;
                          for (let y = 1; y <= 25; y++) {
                            const deg = 1 - y * 0.005;
                            c += res.prodMed * deg * (res.assumptions.elecRate / 100);
                          }
                          return Math.round(c - res.net);
                        })()},
                        { label: `${res.assumptions.rateEsc}%/yr (your scenario)`, val: res.lifetime, current: true },
                        { label: "5%/yr (rapid rise)", val: (() => {
                          let c = 0;
                          for (let y = 1; y <= 25; y++) {
                            const deg = 1 - y * 0.005;
                            const rate = (res.assumptions.elecRate * Math.pow(1.05, y)) / 100;
                            c += res.prodMed * deg * rate;
                          }
                          return Math.round(c - res.net);
                        })()},
                      ].map(s => (
                        <div key={s.label} style={{
                          flex: 1, minWidth: 80, background: s.current ? "#d1fae5" : t.white,
                          border: `1.5px solid ${s.current ? "#10b981" : t.borderLight}`,
                          borderRadius: 8, padding: "10px 10px", textAlign: "center",
                        }}>
                          <div style={{ fontSize: 10, color: s.current ? "#065f46" : t.textLight, fontWeight: 600 }}>{s.label}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: s.current ? "#059669" : (s.val > 0 ? "#10b981" : "#ef4444") }}>
                            {s.val > 0 ? "+" : ""}${s.val.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 5. Energy Equivalencies ──────────────────────────────── */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>
                  🌍 25-Year Environmental Impact
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "⚡", label: "Annual Bill Savings", val: `~${res.monthsElecBills} months of electricity`, color: "#059669", bg: "#d1fae5" },
                    { icon: "🌡️", label: "CO₂ Avoided", val: `${res.co2Avoided25yr} metric tons`, color: "#0284c7", bg: "#e0f2fe" },
                    { icon: "🌳", label: "Tree Equivalent", val: `${res.treesEquiv.toLocaleString()} trees planted`, color: "#16a34a", bg: "#dcfce7" },
                    { icon: "📱", label: "Phone Charges", val: `${(res.phonesCharged).toLocaleString()} charges/yr`, color: "#7c3aed", bg: "#ede9fe" },
                  ].map(e => (
                    <div key={e.label} style={{ background: e.bg, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{e.icon}</div>
                      <div style={{ fontSize: 10, color: e.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{e.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: e.color, marginTop: 2 }}>{e.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: t.textLight, marginTop: 10, lineHeight: 1.5 }}>
                  CO₂ calculation uses US average grid emission factor of 0.386 kg/kWh (EPA eGRID 2023).
                  Environmental impact varies by local grid mix.
                </div>
              </div>

              {/* ── 6. Assumptions Panel ─────────────────────────────────── */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
                <button
                  onClick={() => setShowAssumptions(o => !o)}
                  style={{
                    width: "100%", padding: "14px 18px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>📋 Calculation Assumptions</div>
                  <span style={{ fontSize: 12, color: t.textLight }}>{showAssumptions ? "▲ Hide" : "▼ Show"}</span>
                </button>
                {showAssumptions && (
                  <div style={{ padding: "0 18px 18px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Location", val: `${zip} → ${res.assumptions.state}` },
                        { label: "Sun Hours/Day", val: `${res.assumptions.sunHrs} hrs (NREL)` },
                        { label: "Electricity Rate", val: `${res.assumptions.elecRate}¢/kWh (EIA)` },
                        { label: "System Cost", val: `$${res.assumptions.cpw.toFixed(2)}/W installed` },
                        { label: "Shading Factor", val: `${res.assumptions.shadeFactor}% (${res.assumptions.shadeLabel})` },
                        { label: "Orientation Factor", val: `${res.assumptions.orientFactor}% (${res.assumptions.orientLabel})` },
                        { label: "System Efficiency", val: res.assumptions.systemEff },
                        { label: "Panel Degradation", val: res.assumptions.panelDeg },
                        { label: "Rate Escalation", val: `${res.assumptions.rateEsc}%/yr` },
                        { label: "Federal ITC", val: res.assumptions.fedItc > 0 ? `$${res.assumptions.fedItc.toLocaleString()} (30%)` : "Not applied" },
                        { label: "State Credit", val: res.assumptions.stateCredit > 0 ? `$${res.assumptions.stateCredit.toLocaleString()}` : "Not applied" },
                        { label: "Analysis Period", val: "25 years" },
                      ].map(a => (
                        <div key={a.label} style={{ padding: "8px 10px", background: t.card, borderRadius: 8 }}>
                          <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, textTransform: "uppercase" }}>{a.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginTop: 2 }}>{a.val}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: t.textLight, lineHeight: 1.6, marginTop: 12 }}>
                      Results are estimates. Actual output varies ±15% based on microclimate, panel tilt, inverter efficiency,
                      and local utility net metering rules. Get 3+ installer quotes to validate system sizing.
                    </p>
                  </div>
                )}
              </div>

              {/* ── 7. Share Badge ───────────────────────────────────────── */}
              <ShareBadge
                title="Solar ROI Results"
                value={`$${res.lifetime.toLocaleString()}`}
                subtitle={`${res.sysKw} kW system — ~${res.pb || "25+"} year payback`}
                details={[
                  { label: "System cost", value: `$${res.sysCost.toLocaleString()}` },
                  { label: "Net cost", value: `$${res.net.toLocaleString()}` },
                  { label: "Offset", value: `${res.offset}%` },
                ]}
              />

              {/* ── 8. Data Sources Strip ────────────────────────────────── */}
              <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  Data Sources
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SOURCES.map(s => (
                    <div key={s.label} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 6, padding: "4px 10px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.text }}>{s.label}: </span>
                      <span style={{ fontSize: 10, color: t.textMid }}>{s.src}</span>
                      <span style={{ fontSize: 10, color: t.textLight }}> · {s.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
