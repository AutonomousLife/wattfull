"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Collapsible, Badge, ChartTip } from "@/components/ui";
import { VEHICLES, CLIMATE_PENALTIES, STATE_DATA, zipToState } from "@/lib/data";
import { fmt } from "@/lib/helpers";
import { ShareBadge } from "@/components/widgets/ShareBadge";

export function EVCalcPage() {
  const { t } = useTheme();
  const [zip, setZip] = useState("");
  const [st, setSt] = useState(null);
  const [sd, setSd2] = useState(null);
  const [evId, setEvId] = useState("model3lr");
  const [iceId, setIceId] = useState("camry");
  const [mi, setMi] = useState(12000);
  const [yr, setYr] = useState(8);
  const [hc, setHc] = useState(85);
  const [pc, setPc] = useState(10);
  const [dc, setDc] = useState(5);
  const [eo, setEo] = useState("");
  const [go, setGo] = useState("");
  const [incI, setIncI] = useState(true);
  const [incC, setIncC] = useState(true);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState({});

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

  const ev = VEHICLES.ev.find((v) => v.id === evId);
  const ice = VEHICLES.ice.find((v) => v.id === iceId);

  const calc = () => {
    const e = {};
    if (!/^\d{5}$/.test(zip) || !st) e.zip = "Valid 5-digit ZIP";
    if (mi < 1000 || mi > 50000) e.mi = "1k–50k";
    if (hc + pc + dc !== 100) e.ch = "Must total 100%";
    setErr(e);
    if (Object.keys(e).length) return;

    const er = eo !== "" ? Number(eo) : sd.e;
    const gp = go !== "" ? Number(go) : sd.g;
    const cp = CLIMATE_PENALTIES[sd.z] || 0.1;
    const kwhMi = (ev.kwh / 100) * (incC ? 1 + cp : 1);
    const blend = (hc / 100) * (er / 100) * 1.12 + (pc / 100) * (er / 100 + 0.18) * 1.06 + (dc / 100) * 0.35;
    const evF = kwhMi * mi * blend;
    const iceF = (mi / ice.mpg) * gp;
    const evM = 0.065 * mi;
    const iceM = 0.1 * mi;
    let inc = 0;
    if (incI) inc = ev.fc + (sd.ec || 0);

    const yd = [];
    let ec2 = 0, ic = 0, be = null;
    for (let y = 1; y <= yr; y++) {
      ec2 += evF + evM - (y === 1 ? inc : 0);
      ic += iceF + iceM;
      if (!be && ic - ec2 > 0) be = y;
      yd.push({ year: y, ev: Math.round(ec2), ice: Math.round(ic), savings: Math.round(ic - ec2) });
    }

    setRes({
      yd,
      total: Math.round(ic - ec2),
      be,
      evCpm: (ec2 / (mi * yr)).toFixed(3),
      iceCpm: (ic / (mi * yr)).toFixed(3),
      evF: Math.round(evF),
      iceF: Math.round(iceF),
      evM: Math.round(evM),
      iceM: Math.round(iceM),
      inc,
      kwhMi: kwhMi.toFixed(3),
      blend: blend.toFixed(3),
      sensBest: Math.round((ic - ec2) * 1.25),
      sensWorst: Math.round((ic - ec2) * 0.7),
      er,
      gp,
      cp: `${(cp * 100).toFixed(0)}%`,
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>EV Savings Calculator</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Compare total costs using your location's actual energy prices, incentives, and climate.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, marginTop: 28 }}>
        {/* Input Panel */}
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 22 }}>
          <Input label="ZIP Code" value={zip} onChange={setZip} error={err.zip} placeholder="e.g. 90210" />
          {st && sd && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <Badge type="real">{st}</Badge>
              <Badge type="estimated">{eo || sd.e}¢/kWh</Badge>
              <Badge type="estimated">${go || sd.g}/gal</Badge>
            </div>
          )}
          <Select label="EV" value={evId} onChange={setEvId} options={VEHICLES.ev.map((v) => ({ value: v.id, label: `${v.name} — ${v.kwh} kWh/100mi` }))} />
          <Select label="Gas Vehicle" value={iceId} onChange={setIceId} options={VEHICLES.ice.map((v) => ({ value: v.id, label: `${v.name} — ${v.mpg} MPG` }))} />
          <Slider label="Annual Miles" value={mi} onChange={setMi} min={3000} max={40000} step={1000} />
          <Slider label="Years" value={yr} onChange={setYr} min={1} max={15} suffix=" yrs" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            <Input label="Home%" type="number" value={hc} onChange={setHc} suffix="%" />
            <Input label="Public%" type="number" value={pc} onChange={setPc} suffix="%" />
            <Input label="DCFC%" type="number" value={dc} onChange={setDc} suffix="%" />
          </div>
          {hc + pc + dc !== 100 && (
            <div style={{ fontSize: 12, color: t.err, marginBottom: 8 }}>Total: {hc + pc + dc}% (need 100%)</div>
          )}

          <Toggle label="Include incentives" value={incI} onChange={setIncI} />
          <Toggle label="Climate adjustment" value={incC} onChange={setIncC} />

          <Collapsible title="Override Rates">
            <Input label="Electricity" type="number" value={eo} onChange={setEo} suffix="¢/kWh" />
            <Input label="Gas" type="number" value={go} onChange={setGo} prefix="$" suffix="/gal" />
          </Collapsible>

          <button onClick={calc} style={{ width: "100%", background: t.green, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8, opacity: zip.length === 5 ? 1 : 0.5 }}>
            Calculate Savings
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!res ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter details & calculate</h3>
              <p style={{ fontSize: 14, color: t.textMid, marginTop: 8 }}>Full breakdown with charts and assumptions.</p>
            </div>
          ) : (
            <div>
              {/* Summary Card */}
              <div style={{ background: t.green, borderRadius: 14, padding: 22, color: "#fff", marginBottom: 16 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{yr}-Year Total Savings</div>
                <div style={{ fontSize: "clamp(30px,5vw,42px)", fontWeight: 800 }}>${res.total.toLocaleString()}</div>
                <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", fontSize: 14 }}>
                  <div><span style={{ opacity: 0.6 }}>Break-even:</span> <b>Year {res.be || "—"}</b></div>
                  <div><span style={{ opacity: 0.6 }}>EV:</span> <b>${res.evCpm}/mi</b></div>
                  <div><span style={{ opacity: 0.6 }}>ICE:</span> <b>${res.iceCpm}/mi</b></div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>Cumulative Costs</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={res.yd}>
                    <defs>
                      <linearGradient id="evG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.green} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="iceG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.textLight} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={t.textLight} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                    <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
                    <Area type="monotone" dataKey="ice" stroke={t.textLight} strokeWidth={2} fill="url(#iceG)" name="ICE" />
                    <Area type="monotone" dataKey="ev" stroke={t.green} strokeWidth={2.5} fill="url(#evG)" name="EV" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 16, background: t.greenLight, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.greenDark }}>EV Annual</div>
                  <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>Fuel: <b>${res.evF.toLocaleString()}</b></div>
                  <div style={{ fontSize: 13, color: t.textMid }}>Maint: <b>${res.evM.toLocaleString()}</b></div>
                  {res.inc > 0 && <div style={{ fontSize: 13, color: t.greenDark }}>Credits: <b>−${res.inc.toLocaleString()}</b></div>}
                </div>
                <div style={{ padding: 16, background: t.card, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.textMid }}>ICE Annual</div>
                  <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>Fuel: <b>${res.iceF.toLocaleString()}</b></div>
                  <div style={{ fontSize: 13, color: t.textMid }}>Maint: <b>${res.iceM.toLocaleString()}</b></div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <ShareBadge
                  title={`${yr}-Year EV Savings`}
                  value={`$${res.total.toLocaleString()}`}
                  subtitle={`${ev.name} vs ${ice.name}`}
                  details={[
                    { label: "Break-even", value: `Year ${res.be || "—"}` },
                    { label: "EV cost/mi", value: `$${res.evCpm}` },
                    { label: "ICE cost/mi", value: `$${res.iceCpm}` },
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
