"use client";
import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Collapsible, Badge, ChartTip } from "@/components/ui";
import { VehicleSearch } from "@/components/ui/VehicleSearch";
import { VEHICLES, POPULAR_EV_IDS, POPULAR_ICE_IDS, CLIMATE_PENALTIES, STATE_DATA, zipToState } from "@/lib/data";
import { fmt } from "@/lib/helpers";
import { ShareBadge } from "@/components/widgets/ShareBadge";

const LS_KEY = "wattfull_ev_calc_v1";

// Simple horizontal cost bar for visual comparison (Task 5)
function CostBar({ label, fuel, maint, color, maxVal, t }) {
  const total = fuel + maint;
  const barPct = Math.min((total / maxVal) * 100, 100);
  const fuelPct = (fuel / total) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: t.text }}>{label}</span>
        <span style={{ color: t.textMid }}>${total.toLocaleString()}/yr</span>
      </div>
      <div style={{ height: 22, background: t.borderLight, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: `${barPct}%`, height: "100%", display: "flex", borderRadius: 6 }}>
          <div style={{ width: `${fuelPct}%`, background: color, opacity: 0.9 }} />
          <div style={{ flex: 1, background: color, opacity: 0.5 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: t.textLight, marginTop: 3 }}>
        <span>⛽ Fuel: ${fuel.toLocaleString()}</span>
        <span>🔧 Maint: ${maint.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Assumptions row helper
function ARow({ label, value, t }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${t.borderLight}` }}>
      <span style={{ color: t.textMid }}>{label}</span>
      <span style={{ color: t.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function EVCalcPage() {
  const { t } = useTheme();

  // All calculator inputs (with localStorage defaults)
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
  const [incI, setIncI] = useState(false);   // T2: default OFF
  const [incC, setIncC] = useState(true);
  const [evMaint, setEvMaint] = useState(800);   // T3: EV annual maintenance
  const [iceMaint, setIceMaint] = useState(1500); // T3: ICE annual maintenance
  const [res, setRes] = useState(null);
  const [err, setErr] = useState({});
  const [loaded, setLoaded] = useState(false);

  // T7: Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (saved.zip)      setZip(saved.zip);
      if (saved.evId)     setEvId(saved.evId);
      if (saved.iceId)    setIceId(saved.iceId);
      if (saved.mi)       setMi(saved.mi);
      if (saved.yr)       setYr(saved.yr);
      if (saved.hc != null) setHc(saved.hc);
      if (saved.pc != null) setPc(saved.pc);
      if (saved.dc != null) setDc(saved.dc);
      if (saved.eo != null) setEo(saved.eo);
      if (saved.go != null) setGo(saved.go);
      if (saved.incI != null) setIncI(saved.incI);
      if (saved.incC != null) setIncC(saved.incC);
      if (saved.evMaint)  setEvMaint(saved.evMaint);
      if (saved.iceMaint) setIceMaint(saved.iceMaint);
    } catch (_) {}
    setLoaded(true);
  }, []);

  // T7: Save to localStorage whenever inputs change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ zip, evId, iceId, mi, yr, hc, pc, dc, eo, go, incI, incC, evMaint, iceMaint }));
    } catch (_) {}
  }, [loaded, zip, evId, iceId, mi, yr, hc, pc, dc, eo, go, incI, incC, evMaint, iceMaint]);

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
    const evFuel = kwhMi * mi * blend;
    const iceFuel = (mi / ice.mpg) * gp;

    // T3: Use user-provided annual maintenance values
    const evM = Number(evMaint) || 800;
    const iceM = Number(iceMaint) || 1500;

    // T2: incentives default OFF — only apply if user explicitly toggles on
    let inc = 0;
    if (incI) inc = ev.fc + (sd.ec || 0);

    const yd = [];
    let ec2 = 0, ic = 0, be = null;
    for (let y = 1; y <= yr; y++) {
      ec2 += evFuel + evM - (y === 1 ? inc : 0);
      ic += iceFuel + iceM;
      if (!be && ic - ec2 > 0) be = y;
      yd.push({ year: y, ev: Math.round(ec2), ice: Math.round(ic), savings: Math.round(ic - ec2) });
    }

    setRes({
      yd,
      total: Math.round(ic - ec2),
      be,
      evCpm: (ec2 / (mi * yr)).toFixed(3),
      iceCpm: (ic / (mi * yr)).toFixed(3),
      evFuel: Math.round(evFuel),
      iceFuel: Math.round(iceFuel),
      evM,
      iceM,
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
        Compare total costs using your location's actual energy prices and your maintenance estimates.
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

          {/* T1: VehicleSearch replaces plain Select */}
          <VehicleSearch
            label="EV to evaluate"
            vehicles={VEHICLES.ev}
            value={evId}
            onChange={setEvId}
            popularIds={POPULAR_EV_IDS}
          />
          <VehicleSearch
            label="Gas vehicle to compare against"
            vehicles={VEHICLES.ice}
            value={iceId}
            onChange={setIceId}
            popularIds={POPULAR_ICE_IDS}
          />

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

          {/* T2: label clarified; default is false */}
          <Toggle label="Include federal/state credits (if eligible)" value={incI} onChange={setIncI} />
          {incI && ev && (
            <div style={{ fontSize: 11, color: t.textLight, marginBottom: 8, marginTop: -8, paddingLeft: 2 }}>
              Assumes max ${ev.fc.toLocaleString()} federal credit — eligibility not verified
            </div>
          )}
          <Toggle label="Climate efficiency adjustment" value={incC} onChange={setIncC} />

          {/* T3: Maintenance cost inputs */}
          <Collapsible title="Maintenance Cost Estimates">
            <div style={{ fontSize: 12, color: t.textLight, marginBottom: 10, lineHeight: 1.5 }}>
              Conservative defaults shown. Adjust based on your situation.
            </div>
            <Input label="EV Annual Maintenance" type="number" value={evMaint} onChange={setEvMaint} prefix="$" suffix="/yr" />
            <Input label="Gas Vehicle Annual Maintenance" type="number" value={iceMaint} onChange={setIceMaint} prefix="$" suffix="/yr" />
          </Collapsible>

          <Collapsible title="Override Energy Rates">
            <Input label="Electricity" type="number" value={eo} onChange={setEo} suffix="¢/kWh" />
            <Input label="Gas" type="number" value={go} onChange={setGo} prefix="$" suffix="/gal" />
          </Collapsible>

          <button
            onClick={calc}
            style={{
              width: "100%",
              background: t.green,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 0",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 8,
              opacity: zip.length === 5 ? 1 : 0.5,
            }}
          >
            Calculate Savings
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!res ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter details & calculate</h3>
              <p style={{ fontSize: 14, color: t.textMid, marginTop: 8 }}>Full breakdown with charts, maintenance costs, and all assumptions.</p>
            </div>
          ) : (
            <div>
              {/* Summary Card */}
              <div style={{ background: t.green, borderRadius: 14, padding: 22, color: "#fff", marginBottom: 16 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{yr}-Year Total Savings (EV vs Gas)</div>
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

              {/* T5: Annual cost comparison bars */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>Annual Cost Comparison</div>
                {(() => {
                  const maxVal = Math.max(res.evFuel + res.evM, res.iceFuel + res.iceM) * 1.1;
                  return (
                    <>
                      <CostBar label={ev?.name || "EV"} fuel={res.evFuel} maint={res.evM} color={t.green} maxVal={maxVal} t={t} />
                      <CostBar label={ice?.name || "ICE"} fuel={res.iceFuel} maint={res.iceM} color={t.textLight} maxVal={maxVal} t={t} />
                    </>
                  );
                })()}
              </div>

              {/* T3: Cost breakdown with maintenance detail */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 16, background: t.greenLight, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.greenDark }}>EV Annual Costs</div>
                  <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>Fuel: <b>${res.evFuel.toLocaleString()}</b></div>
                  <div style={{ fontSize: 13, color: t.textMid }}>Maint: <b>${res.evM.toLocaleString()}/yr</b></div>
                  <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>
                    5-yr: ${(res.evM * 5).toLocaleString()} · 10-yr: ${(res.evM * 10).toLocaleString()}
                  </div>
                  {res.inc > 0 && (
                    <div style={{ fontSize: 13, color: t.greenDark, marginTop: 4 }}>Credits: <b>−${res.inc.toLocaleString()}</b></div>
                  )}
                </div>
                <div style={{ padding: 16, background: t.card, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.textMid }}>Gas Vehicle Annual Costs</div>
                  <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>Fuel: <b>${res.iceFuel.toLocaleString()}</b></div>
                  <div style={{ fontSize: 13, color: t.textMid }}>Maint: <b>${res.iceM.toLocaleString()}/yr</b></div>
                  <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>
                    5-yr: ${(res.iceM * 5).toLocaleString()} · 10-yr: ${(res.iceM * 10).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* T6: Assumptions panel */}
              <div style={{ marginBottom: 16 }}>
                <Collapsible title="📋 Calculation Assumptions">
                  <div style={{ paddingTop: 4 }}>
                    <ARow label="Location" value={`${st} (ZIP ${zip})`} t={t} />
                    <ARow label="Electricity rate" value={`${res.er}¢/kWh${eo ? " (overridden)" : " (state avg)"}`} t={t} />
                    <ARow label="Gas price" value={`$${res.gp}/gal${go ? " (overridden)" : " (state avg)"}`} t={t} />
                    <ARow label="Annual miles" value={mi.toLocaleString()} t={t} />
                    <ARow label="Climate efficiency loss" value={incC ? res.cp : "Not applied"} t={t} />
                    <ARow label="Charging mix" value={`${hc}% home / ${pc}% L2 / ${dc}% DCFC`} t={t} />
                    <ARow label="EV maintenance" value={`$${res.evM.toLocaleString()}/yr (user estimate)`} t={t} />
                    <ARow label="ICE maintenance" value={`$${res.iceM.toLocaleString()}/yr (user estimate)`} t={t} />
                    <ARow
                      label="Federal/state credits"
                      value={incI ? `$${res.inc.toLocaleString()} (eligibility not verified)` : "Not included"}
                      t={t}
                    />
                    <div style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
                      Maintenance defaults: EV $800/yr, Gas $1,500/yr. Adjust in "Maintenance Cost Estimates" above.
                    </div>
                  </div>
                </Collapsible>
              </div>

              <ShareBadge
                title={`${yr}-Year EV Savings`}
                value={`$${res.total.toLocaleString()}`}
                subtitle={`${ev?.name} vs ${ice?.name}`}
                details={[
                  { label: "Break-even", value: `Year ${res.be || "—"}` },
                  { label: "EV cost/mi", value: `$${res.evCpm}` },
                  { label: "ICE cost/mi", value: `$${res.iceCpm}` },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
