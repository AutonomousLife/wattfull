"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Badge, ChartTip } from "@/components/ui";
import { STATE_DATA, zipToState } from "@/lib/data";
import { fmt } from "@/lib/helpers";
import { ShareBadge } from "@/components/widgets/ShareBadge";

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
    if (!/^\d{5}$/.test(zip) || !st) return;
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
    setRes({
      sysKw,
      sysCost: Math.round(sysCost),
      net: Math.round(net),
      itc: Math.round(itc),
      prodLow: Math.round(prod * 0.85),
      prodMed: Math.round(prod),
      prodHigh: Math.round(prod * 1.1),
      pb,
      lifetime: Math.round(cum - net),
      yd,
      offset: Math.min(100, Math.round((prod / annUse) * 100)),
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Solar ROI Calculator</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Payback and lifetime savings using your location's solar resource and incentives.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 28, marginTop: 28 }}>
        {/* Input Panel */}
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
            { value: "light", label: "Light" },
            { value: "moderate", label: "Moderate" },
            { value: "heavy", label: "Heavy" },
          ]} />
          <Select label="Orientation" value={orient} onChange={setOrient} options={[
            { value: "south", label: "South" },
            { value: "sw_se", label: "SW/SE" },
            { value: "ew", label: "E/W" },
            { value: "north", label: "North" },
          ]} />
          <Toggle label="30% Federal ITC" value={fed} onChange={setFed} />
          <Toggle label="State credits" value={stC} onChange={setStC} />
          <Slider label="Rate escalation" value={rateEsc} onChange={setRateEsc} min={0} max={6} step={0.5} suffix="%/yr" />
          <button onClick={calc} style={{ width: "100%", background: t.green, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
            Calculate Solar ROI
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!res ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>☀️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter details & calculate</h3>
            </div>
          ) : (
            <div>
              {/* Summary */}
              <div style={{ background: t.green, borderRadius: 14, padding: 22, color: "#fff", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>System</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{res.sysKw} kW</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Net Cost</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>${res.net.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Payback</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>~{res.pb || "—"} yrs</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>25-Yr Savings</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>${res.lifetime.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>Savings vs. Cost</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={res.yd}>
                    <defs>
                      <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.green} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                    <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
                    <Line type="monotone" dataKey="cost" stroke={t.textLight} strokeWidth={2} strokeDasharray="5 4" dot={false} name="Net Cost" />
                    <Area type="monotone" dataKey="savings" stroke={t.green} strokeWidth={2.5} fill="url(#sG)" name="Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 16 }}>
                <ShareBadge
                  title="Solar ROI Results"
                  value={`$${res.lifetime.toLocaleString()}`}
                  subtitle={`${res.sysKw} kW system — ~${res.pb || "—"} year payback`}
                  details={[
                    { label: "System cost", value: `$${res.sysCost.toLocaleString()}` },
                    { label: "Net cost", value: `$${res.net.toLocaleString()}` },
                    { label: "Offset", value: `${res.offset}%` },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
