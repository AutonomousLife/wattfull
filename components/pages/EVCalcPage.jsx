"use client";
import { useState, useEffect, useTransition, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Collapsible, Badge, ChartTip } from "@/components/ui";
import { VehicleSearch } from "@/components/ui/VehicleSearch";
import { VEHICLES, POPULAR_EV_IDS, POPULAR_ICE_IDS, STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";
import { fmt } from "@/lib/helpers";
import { ShareBadge } from "@/components/widgets/ShareBadge";
import { runCalc } from "@/app/actions/calc";
import DataFreshness from "@/components/ui/DataFreshness";
import { STORAGE_KEYS, pushStoredHistory } from "@/lib/profileStore";

const LS_KEY = "wattfull_ev_calc_v2";

const VERDICT_CFG = {
  favorable:   { color: "#10b981", bg: "#d1fae5", darkBg: "#064e3b", label: "EV Financially Favorable",   icon: "✅" },
  neutral:     { color: "#f59e0b", bg: "#fef3c7", darkBg: "#451a03", label: "Roughly Neutral",            icon: "⚖️" },
  unfavorable: { color: "#ef4444", bg: "#fee2e2", darkBg: "#450a0a", label: "EV Financially Unfavorable", icon: "⚠️" },
};

/* ─── helpers ────────────────────────────────────────────────────── */
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

function ARow({ label, value, t }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${t.borderLight}` }}>
      <span style={{ color: t.textMid }}>{label}</span>
      <span style={{ color: t.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ─── Wattfull Verdict Card ──────────────────────────────────────── */
function WattfullVerdict({ res, ev, ice, yr, mi, t }) {
  const vc = VERDICT_CFG[res.verdictType];
  return (
    <div style={{
      border: `2px solid ${vc.color}`,
      borderRadius: 14,
      padding: 22,
      marginBottom: 16,
      background: t.white,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textLight, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Wattfull Verdict</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{vc.icon}</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: vc.color }}>{vc.label}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: t.textLight }}>{yr}-yr total savings</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: res.total >= 0 ? "#10b981" : "#ef4444" }}>
            {res.total >= 0 ? "+" : ""}${Math.abs(res.total).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Annual Savings", value: `${res.annualSavings >= 0 ? "+" : ""}$${Math.abs(res.annualSavings).toLocaleString()}` },
          { label: "5-Year Savings", value: `${res.fiveYearSavings >= 0 ? "+" : ""}$${Math.abs(res.fiveYearSavings).toLocaleString()}` },
          { label: "Break-even", value: res.be ? `Year ${res.be}` : "No break-even" },
          { label: "EV ¢/mi", value: `${(res.evCpm * 100).toFixed(1)}¢` },
          { label: "Gas ¢/mi", value: `${(res.iceCpm * 100).toFixed(1)}¢` },
        ].map((m, i) => (
          <div key={i} style={{ background: t.card, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: t.textLight, marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Reasons */}
      <div style={{ borderTop: `1px solid ${t.borderLight}`, paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, marginBottom: 8, letterSpacing: ".06em", textTransform: "uppercase" }}>Why this verdict</div>
        {res.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: t.textMid, display: "flex", gap: 6, marginBottom: 5 }}>
            <span style={{ color: vc.color, flexShrink: 0 }}>•</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── What Would Change This Result ─────────────────────────────── */
function WhatWouldChange({ res, t }) {
  const rows = [];

  if (res.breakEvenElec !== null && res.breakEvenElec > 0 && res.breakEvenElec < 80) {
    if (res.breakEvenElec > res.er) {
      rows.push({
        icon: "⚡",
        text: `EV savings disappear if electricity exceeds `,
        highlight: `${res.breakEvenElec}¢/kWh`,
        sub: `(currently ${res.er}¢ — you have ${(res.breakEvenElec - res.er).toFixed(1)}¢ of headroom)`,
      });
    } else {
      rows.push({
        icon: "⚡",
        text: `High electricity already hurts — break-even rate was `,
        highlight: `${res.breakEvenElec}¢/kWh`,
        sub: `(you're paying ${res.er}¢)`,
      });
    }
  }

  if (res.savingsPer1kMi !== 0) {
    const dir = res.savingsPer1kMi > 0 ? "adds" : "costs";
    rows.push({
      icon: "🚗",
      text: `Each extra 1,000 miles/year `,
      highlight: `${dir} $${Math.abs(res.savingsPer1kMi)}`,
      sub: "in annual savings",
    });
  }

  if (res.savingsPerGas10c > 0) {
    rows.push({
      icon: "⛽",
      text: `Each $0.10 rise in gas prices adds `,
      highlight: `+$${res.savingsPerGas10c}`,
      sub: "to annual EV savings",
    });
  }

  if (!res.incI && res.potentialCredits > 0) {
    rows.push({
      icon: "💰",
      text: `Enabling tax credits would improve total savings by `,
      highlight: `$${res.potentialCredits.toLocaleString()}`,
      sub: "eligibility not verified",
    });
  }

  if (rows.length === 0) return null;

  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 12 }}>What Would Change This Verdict?</div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{row.icon}</span>
          <div>
            <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>
              {row.text}
              <span style={{ fontWeight: 700, color: t.text }}>{row.highlight}</span>
              {" "}
              <span style={{ color: t.textLight }}>{row.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Energy Equivalencies ───────────────────────────────────────── */
function Equivalencies({ annualSavings, t }) {
  if (Math.abs(annualSavings) < 100) return null;
  const abs = Math.abs(annualSavings);
  const sign = annualSavings >= 0 ? "saves" : "costs extra";
  const items = [
    { icon: "☕", label: "months of coffee", val: Math.round(abs / 5 / 30) },
    { icon: "✈️", label: "domestic flights", val: Math.round(abs / 250) },
    { icon: "📱", label: "phone charges", val: Math.round(abs / 0.04).toLocaleString() },
    { icon: "🛒", label: "weeks of groceries", val: Math.round(abs / 100) },
  ].filter(i => parseFloat(String(i.val).replace(/,/g, "")) > 0);

  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>Your Annual Savings in Context</div>
      <div style={{ fontSize: 12, color: t.textLight, marginBottom: 12 }}>
        This calculator {sign} roughly <b style={{ color: t.text }}>${abs.toLocaleString()}/year</b>, which equals…
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{item.val}</div>
            <div style={{ fontSize: 11, color: t.textLight }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Vehicle Rankings ───────────────────────────────────────────── */
function VehicleRanking({ rankings, ice, mi, evId, onSelectEv, t }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rankings : rankings.slice(0, 5);

  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 2 }}>Best EVs For Your Situation</div>
      <div style={{ fontSize: 12, color: t.textLight, marginBottom: 12 }}>
        vs {ice?.name} · {mi.toLocaleString()} mi/yr · ranked by annual savings
      </div>
      {shown.map((v, i) => {
        const isSelected = v.id === evId;
        const isBest = i === 0;
        return (
          <div
            key={v.id}
            onClick={() => onSelectEv(v.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 8,
              marginBottom: 4,
              cursor: "pointer",
              background: isSelected ? "#d1fae5" : isBest ? t.white : "transparent",
              border: isSelected ? "1.5px solid #10b981" : isBest ? `1px solid ${t.borderLight}` : "1px solid transparent",
              transition: "background .15s",
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: isBest ? "#10b981" : t.borderLight,
              color: isBest ? "#fff" : t.textMid,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                {isSelected && <span style={{ fontSize: 10, background: "#10b981", color: "#fff", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>Selected</span>}
                {isBest && !isSelected && <span style={{ fontSize: 10, background: "#fef08a", color: "#713f12", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>Best pick</span>}
              </div>
              <div style={{ fontSize: 11, color: t.textLight }}>{v.kwh} kWh/100mi</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: v.annSavings >= 0 ? "#10b981" : "#ef4444", flexShrink: 0 }}>
              {v.annSavings >= 0 ? "+" : ""}${Math.abs(v.annSavings).toLocaleString()}/yr
            </div>
          </div>
        );
      })}
      {rankings.length > 5 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ fontSize: 12, color: t.green, background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: "4px 0" }}
        >
          {expanded ? "Show less ↑" : `Show ${rankings.length - 5} more EVs ↓`}
        </button>
      )}
    </div>
  );
}

/* ─── Data Sources Strip ─────────────────────────────────────────── */
function DataSourcesStrip({ t }) {
  return (
    <div style={{ borderTop: `1px solid ${t.borderLight}`, paddingTop: 12, marginTop: 4 }}>
      <div style={{ fontSize: 10, color: t.textLight, lineHeight: 1.8 }}>
        <b style={{ color: t.textMid }}>Data sources:</b>{" "}
        Vehicle efficiency: EPA · Electricity prices: EIA (state avg or ZIP-level) · Gas prices: state datasets · Incentives: IRS / DSIRE ·{" "}
        <b style={{ color: t.textMid }}>Last updated:</b> new Date().toISOString().slice(0, 7) ·{" "}
        <b style={{ color: t.textMid }}>Note:</b> Estimates only — actual results vary.
      </div>
    </div>
  );
}

function mapCalcResult(result) {
  if (!result?.operating || !result?.analysis) return null;

  return {
    yd: result.operating.byYear.map((row) => ({
      year: row.year,
      ev: row.evCum,
      ice: row.iceCum,
      savings: row.savings,
    })),
    be: result.operating.breakEvenYear,
    total: result.operating.totalSavings,
    annualSavings: result.operating.annualSavings,
    fiveYearSavings: result.operating.fiveYearSavings,
    verdictType: result.analysis.verdictType,
    evCpm: result.operating.evCostPerMile,
    iceCpm: result.operating.iceCostPerMile,
    evFuel: result.operating.evFuelAnnual,
    iceFuel: result.operating.iceFuelAnnual,
    evM: result.operating.evMaintAnnual,
    iceM: result.operating.iceMaintAnnual,
    inc: result.operating.incentivesApplied,
    incI: result.inputs?.includeIncentives ?? false,
    kwhMi: result.analysis.kwhPerMile.toFixed(3),
    blend: result.analysis.blendedRatePerKwh.toFixed(3),
    er: result.ratesUsed.electricityCentsPerKwh,
    gp: result.ratesUsed.gasDollarsPerGallon,
    cp: `${result.analysis.climatePenaltyPct}%`,
    breakEvenElec: result.analysis.breakEvenElec,
    savingsPer1kMi: result.analysis.savingsPer1kMi,
    savingsPerGas10c: result.analysis.savingsPerGas10c,
    potentialCredits: result.analysis.potentialCredits,
    rankings: result.analysis.rankings,
    reasons: result.analysis.reasons,
  };
}

/* ─── EVCalcInner ────────────────────────────────────────────────── */
function EVCalcInner() {
  const { t } = useTheme();
  const searchParams = useSearchParams();
  const urlZip = searchParams.get("zip") || "";

  const [zip, setZip] = useState(urlZip);
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
  const [incI, setIncI] = useState(false);
  const [incC, setIncC] = useState(true);
  const [evMaint, setEvMaint] = useState(800);
  const [iceMaint, setIceMaint] = useState(1500);
  const [driveStyle, setDriveStyle] = useState("normal");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [serverRates, setServerRates] = useState(null);
  const [isPending, startTransition] = useTransition();
  const calcCacheRef = useRef(new Map());

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (!urlZip && saved.zip) setZip(saved.zip);
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
      if (saved.driveStyle) setDriveStyle(saved.driveStyle);
      // Also check energy profile for zip + miles
      try {
        const profile = JSON.parse(localStorage.getItem("wattfull_profile") || "{}");
        if (!urlZip && !saved.zip && profile.zip) setZip(profile.zip);
        if (!saved.mi && profile.mi) setMi(profile.mi);
        if (!saved.driveStyle && profile.driveStyle) setDriveStyle(profile.driveStyle);
      } catch (_) {}
    } catch (_) {}
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ zip, evId, iceId, mi, yr, hc, pc, dc, eo, go, incI, incC, evMaint, iceMaint, driveStyle }));
    } catch (_) {}
  }, [loaded, zip, evId, iceId, mi, yr, hc, pc, dc, eo, go, incI, incC, evMaint, iceMaint, driveStyle]);

  useEffect(() => {
    if (zip.length === 5) {
      const s = resolveStateFromZip(zip);
      setSt(s);
      setSd2(s ? STATE_DATA[s] : null);
    } else {
      setSt(null);
      setSd2(null);
    }
  }, [zip]);

  const ev = VEHICLES.ev.find((v) => v.id === evId);
  const ice = VEHICLES.ice.find((v) => v.id === iceId);

  const requestCalculation = async (updateResults = true) => {
    const e = {};
    if (!/^\d{5}$/.test(zip) || !st) e.zip = "Valid 5-digit ZIP";
    if (mi < 1000 || mi > 50000) e.mi = "1k–50k";
    if (hc + pc + dc !== 100) e.ch = "Must total 100%";
    setErr(e);
    if (Object.keys(e).length) return;

    const cacheKey = JSON.stringify({
      zip,
      evId,
      iceId,
      mi,
      yr,
      eo,
      go,
      hc,
      pc,
      dc,
      evMaint,
      iceMaint,
      incI,
      incC,
      driveStyle,
    });

    const cached = calcCacheRef.current.get(cacheKey);
    if (cached) {
      setServerRates(cached?.ratesUsed ?? null);
      if (updateResults) setRes(mapCalcResult(cached));
      return;
    }

    const result = await runCalc({
      zip,
      evId,
      iceId,
      milesPerYear: mi,
      ownershipYears: yr,
      electricityRateOverride: eo !== "" ? Number(eo) : undefined,
      gasPriceOverride: go !== "" ? Number(go) : undefined,
      homePct: hc,
      publicPct: pc,
      dcfcPct: dc,
      evMaintPerYear: Number(evMaint) || 800,
      iceMaintPerYear: Number(iceMaint) || 1500,
      includeIncentives: incI,
      driveStyle,
      applyClimateAdjustment: incC,
    });

    calcCacheRef.current.set(cacheKey, result);
    setServerRates(result?.ratesUsed ?? null);
    if (updateResults) {
      const mapped = mapCalcResult(result);
      setRes(mapped);
      if (ev && ice) {
        pushStoredHistory(STORAGE_KEYS.evHistory, {
          zip,
          state: st,
          evName: ev.name,
          iceName: ice.name,
          annualSavings: mapped.annualSavings,
          breakEven: mapped.be,
          fiveYearSavings: mapped.fiveYearSavings,
        });
      }
    }
  };

  const calc = () => {
    startTransition(() => {
      void requestCalculation(true);
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>EV Savings Calculator</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Compare total costs using your location's actual energy prices and your maintenance estimates.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, marginTop: 28 }}>

        {/* ── Input Panel ── */}
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 22 }}>
          <Input label="ZIP Code" value={zip} onChange={setZip} error={err.zip} placeholder="e.g. 90210" />
          {st && sd && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
              <Badge type="real">{st}</Badge>
              <Badge type={serverRates ? "real" : "estimated"}>
                {serverRates ? serverRates.electricityCentsPerKwh.toFixed(1) : (eo || sd.e)}¢/kWh
              </Badge>
              <Badge type={serverRates ? "real" : "estimated"}>
                ${serverRates ? serverRates.gasDollarsPerGallon.toFixed(2) : (go || sd.g)}/gal
              </Badge>
              {serverRates && <Badge type="real">EIA verified</Badge>}
            </div>
          )}
          {st && !serverRates && (
            <button
              onClick={() => {
                startTransition(async () => {
                  try {
                    await requestCalculation(false);
                  } catch (_) {}
                });
              }}
              disabled={isPending}
              style={{
                fontSize: 12, color: t.green, background: "transparent", border: `1px solid ${t.green}`,
                borderRadius: 8, padding: "4px 10px", cursor: "pointer", marginBottom: 12, opacity: isPending ? 0.6 : 1,
              }}
            >
              {isPending ? "Loading…" : "📍 Load real rates for my ZIP"}
            </button>
          )}
          <DataFreshness />

          <VehicleSearch label="EV to evaluate" vehicles={VEHICLES.ev} value={evId} onChange={setEvId} popularIds={POPULAR_EV_IDS} />
          <VehicleSearch label="Gas vehicle to compare" vehicles={VEHICLES.ice} value={iceId} onChange={setIceId} popularIds={POPULAR_ICE_IDS} />

          <Slider label="Annual Miles" value={mi} onChange={setMi} min={3000} max={40000} step={1000} />
          <Slider label="Ownership Years" value={yr} onChange={setYr} min={1} max={15} suffix=" yrs" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            <Input label="Home%" type="number" value={hc} onChange={setHc} suffix="%" />
            <Input label="Public%" type="number" value={pc} onChange={setPc} suffix="%" />
            <Input label="DCFC%" type="number" value={dc} onChange={setDc} suffix="%" />
          </div>
          {hc + pc + dc !== 100 && (
            <div style={{ fontSize: 12, color: t.err, marginBottom: 8 }}>Total: {hc + pc + dc}% (need 100%)</div>
          )}

          {/* Drive Style */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMid, marginBottom: 6 }}>Driving Style</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[
                { id: "efficient", label: "Efficient", icon: "🐢", sub: "−12%" },
                { id: "normal",    label: "Normal",    icon: "🚗", sub: "EPA" },
                { id: "aggressive",label: "Spirited",  icon: "🦅", sub: "+17%" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDriveStyle(opt.id)}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: `1.5px solid ${driveStyle === opt.id ? t.green : t.borderLight}`,
                    background: driveStyle === opt.id ? "#d1fae5" : t.card,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ fontSize: 16 }}>{opt.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: driveStyle === opt.id ? "#065f46" : t.text }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: t.textLight }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <Toggle label="Include federal/state credits (if eligible)" value={incI} onChange={setIncI} />
          {incI && ev && (
            <div style={{ fontSize: 11, color: t.textLight, marginBottom: 8, marginTop: -8, paddingLeft: 2 }}>
              Assumes max ${ev.fc.toLocaleString()} federal credit — eligibility not verified
            </div>
          )}
          <Toggle label="Climate efficiency adjustment" value={incC} onChange={setIncC} />

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
              transition: "transform .1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Calculate Savings →
          </button>
        </div>

        {/* ── Results Panel ── */}
        <div>
          {!res ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter details & calculate</h3>
              <p style={{ fontSize: 14, color: t.textMid, marginTop: 8 }}>Verdict, chart, assumptions, and ranked alternatives — all based on your inputs.</p>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {["📍 Enter your ZIP code", "🚗 Pick an EV and gas vehicle", "📏 Set your annual mileage", "✅ Hit Calculate"].map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: t.textMid, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* 1. Wattfull Verdict */}
              <WattfullVerdict res={res} ev={ev} ice={ice} yr={yr} mi={mi} t={t} />

              {/* 2. Cumulative cost chart */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>Cumulative Costs Over Time</div>
                <div style={{ fontSize: 12, color: t.textLight, marginBottom: 12 }}>
                  {ev?.name} vs {ice?.name} · gap = your total savings
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={res.yd}>
                    <defs>
                      <linearGradient id="evG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="iceG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
                    <Tooltip content={(p) => <ChartTip {...p} prefix="$" />} />
                    {res.be && <ReferenceLine x={res.be} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Break-even", fill: "#10b981", fontSize: 10, position: "insideTopLeft" }} />}
                    <Area type="monotone" dataKey="ice" stroke="#94a3b8" strokeWidth={2} fill="url(#iceG)" name="Gas Vehicle" />
                    <Area type="monotone" dataKey="ev" stroke="#10b981" strokeWidth={2.5} fill="url(#evG)" name="EV" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 3. What Would Change */}
              <WhatWouldChange res={res} t={t} />

              {/* 4. Annual cost bars */}
              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>Annual Cost Breakdown</div>
                {(() => {
                  const maxVal = Math.max(res.evFuel + res.evM, res.iceFuel + res.iceM) * 1.1;
                  return (
                    <>
                      <CostBar label={ev?.name || "EV"} fuel={res.evFuel} maint={res.evM} color="#10b981" maxVal={maxVal} t={t} />
                      <CostBar label={ice?.name || "Gas"} fuel={res.iceFuel} maint={res.iceM} color="#94a3b8" maxVal={maxVal} t={t} />
                    </>
                  );
                })()}
              </div>

              {/* 5. Detailed cost grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 16, background: "#d1fae5", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>EV Annual Costs</div>
                  <div style={{ fontSize: 13, color: t.textMid, marginTop: 6 }}>Fuel: <b>${res.evFuel.toLocaleString()}</b></div>
                  <div style={{ fontSize: 13, color: t.textMid }}>Maint: <b>${res.evM.toLocaleString()}/yr</b></div>
                  <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>
                    5-yr: ${(res.evM * 5).toLocaleString()} · 10-yr: ${(res.evM * 10).toLocaleString()}
                  </div>
                  {res.inc > 0 && (
                    <div style={{ fontSize: 13, color: "#065f46", marginTop: 4 }}>Credits: <b>−${res.inc.toLocaleString()}</b></div>
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

              {/* 6. Equivalencies */}
              <Equivalencies annualSavings={res.annualSavings} t={t} />

              {/* 7. Vehicle ranking */}
              <VehicleRanking
                rankings={res.rankings}
                ice={ice}
                mi={mi}
                evId={evId}
                onSelectEv={(id) => { setEvId(id); setRes(null); }}
                t={t}
              />

              {/* 8. Assumptions */}
              <div style={{ marginBottom: 16 }}>
                <Collapsible title="📋 Calculation Assumptions">
                  <div style={{ paddingTop: 4 }}>
                    <ARow label="Location" value={`${st} (ZIP ${zip})`} t={t} />
                    <ARow label="Electricity rate" value={`${res.er}¢/kWh${eo ? " (overridden)" : " (state avg)"}`} t={t} />
                    <ARow label="Gas price" value={`$${res.gp}/gal${go ? " (overridden)" : " (state avg)"}`} t={t} />
                    <ARow label="Annual miles" value={mi.toLocaleString()} t={t} />
                    <ARow label="Driving style" value={driveStyle === "efficient" ? "Efficient (−12%)" : driveStyle === "aggressive" ? "Spirited (+17%)" : "Normal (EPA rated)"} t={t} />
                    <ARow label="Climate efficiency penalty" value={incC ? res.cp : "Not applied"} t={t} />
                    <ARow label="Charging mix" value={`${hc}% home / ${pc}% L2 / ${dc}% DCFC`} t={t} />
                    <ARow label="EV maintenance" value={`$${res.evM.toLocaleString()}/yr`} t={t} />
                    <ARow label="Gas maintenance" value={`$${res.iceM.toLocaleString()}/yr`} t={t} />
                    <ARow label="Federal/state credits" value={incI ? `$${res.inc.toLocaleString()} (eligibility not verified)` : "Not included"} t={t} />
                    <div style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
                      EV efficiency: {res.kwhMi} kWh/mile (including adjustments). Blended charging rate: ${res.blend}/kWh.
                    </div>
                  </div>
                </Collapsible>
              </div>

              <ShareBadge
                title={`${yr}-Year EV Savings`}
                value={`$${res.total.toLocaleString()}`}
                subtitle={`${ev?.name} vs ${ice?.name}`}
                details={[
                  { label: "Verdict", value: VERDICT_CFG[res.verdictType]?.label },
                  { label: "Annual savings", value: `$${res.annualSavings.toLocaleString()}` },
                  { label: "Break-even", value: `Year ${res.be || "—"}` },
                ]}
              />

              <DataSourcesStrip t={t} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EVCalcPage() {
  return (
    <Suspense fallback={null}>
      <EVCalcInner />
    </Suspense>
  );
}



