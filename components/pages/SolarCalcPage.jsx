"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Badge, ChartTip } from "@/components/ui";
import { STATE_DATA, zipToState } from "@/lib/data";
import { ShareBadge } from "@/components/widgets/ShareBadge";
import { STORAGE_KEYS, pushStoredHistory } from "@/lib/profileStore";

const VERDICT_CFG = {
  favorable: {
    label: "Favorable",
    icon: "GOOD",
    bg: "#d1fae5",
    border: "#10b981",
    titleColor: "#065f46",
    textColor: "#065f46",
    tagBg: "#10b981",
    tagText: "#fff",
  },
  neutral: {
    label: "Moderate",
    icon: "MIXED",
    bg: "#fef3c7",
    border: "#f59e0b",
    titleColor: "#92400e",
    textColor: "#92400e",
    tagBg: "#f59e0b",
    tagText: "#fff",
  },
  unfavorable: {
    label: "Challenging",
    icon: "WATCH",
    bg: "#fee2e2",
    border: "#ef4444",
    titleColor: "#7f1d1d",
    textColor: "#7f1d1d",
    tagBg: "#ef4444",
    tagText: "#fff",
  },
};

const SOURCES = [
  { label: "Solar Hours", src: "NREL National Solar Radiation Database", date: "2024" },
  { label: "Electricity Rates", src: "EIA Electric Power Monthly", date: "Feb 2025" },
  { label: "Federal ITC", src: "IRS Form 5695 / Inflation Reduction Act", date: "2025" },
  { label: "Panel Efficiency", src: "NREL Best Research-Cell Efficiency Chart", date: "2025" },
  { label: "State Incentives", src: "DSIRE Database", date: "Quarterly updated" },
];

const metricPillStyle = {
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
};

export function SolarCalcPage() {
  const { t } = useTheme();
  const [zip, setZip] = useState("");
  const [stateCode, setStateCode] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [monthlyKwh, setMonthlyKwh] = useState(900);
  const [roofSqft, setRoofSqft] = useState(400);
  const [shade, setShade] = useState("light");
  const [orientation, setOrientation] = useState("south");
  const [costPerWatt, setCostPerWatt] = useState(2.85);
  const [federalItc, setFederalItc] = useState(true);
  const [stateCredits, setStateCredits] = useState(true);
  const [rateEscalation, setRateEscalation] = useState(3);
  const [result, setResult] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    if (zip.length === 5) {
      const nextState = zipToState(zip);
      setStateCode(nextState);
      setStateData(nextState ? STATE_DATA[nextState] : null);
      return;
    }
    setStateCode(null);
    setStateData(null);
  }, [zip]);

  useEffect(() => {
    if (!result) return;
    pushStoredHistory(STORAGE_KEYS.solarHistory, {
      zip,
      state: stateCode,
      systemKw: result.systemKw,
      payback: result.paybackYears,
      lifetime: result.lifetimeSavings,
      annualSavings: result.annualSavings,
    });
  }, [result, zip, stateCode]);

  const calculate = () => {
    if (!/^\d{5}$/.test(zip) || !stateCode || !stateData) return;

    const shadeFactorMap = { none: 1, light: 0.9, moderate: 0.75, heavy: 0.55 };
    const orientationFactorMap = { south: 1, sw_se: 0.92, ew: 0.82, north: 0.65 };
    const shadeFactor = shadeFactorMap[shade];
    const orientationFactor = orientationFactorMap[orientation];
    const maxPanels = Math.floor(roofSqft / 18);
    const annualUsage = monthlyKwh * 12;
    const targetKw = Math.min(
      annualUsage / (stateData.s * 365 * shadeFactor * orientationFactor * 0.82),
      (maxPanels * 400) / 1000,
    );
    const systemKw = Math.round(targetKw * 10) / 10;
    const systemCost = systemKw * 1000 * costPerWatt;
    const annualProduction = systemKw * stateData.s * 365 * shadeFactor * orientationFactor * 0.82;

    let incentives = 0;
    if (federalItc) incentives += systemCost * 0.3;
    if (stateCredits) incentives += stateData.sc || 0;

    const netCost = systemCost - incentives;
    const yearlyData = [];
    let cumulativeSavings = 0;
    let paybackYears = null;

    for (let year = 0; year <= 25; year += 1) {
      const degradationFactor = 1 - year * 0.005;
      const ratePerKwh = (stateData.e * Math.pow(1 + rateEscalation / 100, year)) / 100;
      const yearProduction = annualProduction * degradationFactor;
      const yearSavings = year === 0 ? 0 : yearProduction * ratePerKwh;
      cumulativeSavings += yearSavings;
      if (!paybackYears && cumulativeSavings > netCost && year > 0) paybackYears = year;
      yearlyData.push({ year, savings: Math.round(cumulativeSavings), cost: Math.round(netCost) });
    }

    const lifetimeSavings = Math.round(cumulativeSavings - netCost);
    const billOffset = Math.min(100, Math.round((annualProduction / annualUsage) * 100));
    const annualSavings = Math.round(annualProduction * (stateData.e / 100));
    const noShadeProduction = systemKw * stateData.s * 365 * orientationFactor * 0.82;
    let noShadeCumulative = 0;
    let paybackNoShade = null;

    for (let year = 0; year <= 25; year += 1) {
      const degradationFactor = 1 - year * 0.005;
      const ratePerKwh = (stateData.e * Math.pow(1 + rateEscalation / 100, year)) / 100;
      const yearSavings = year === 0 ? 0 : noShadeProduction * degradationFactor * ratePerKwh;
      noShadeCumulative += yearSavings;
      if (!paybackNoShade && noShadeCumulative > netCost && year > 0) paybackNoShade = year;
    }

    const verdictType = !paybackYears
      ? "unfavorable"
      : paybackYears <= 8
        ? "favorable"
        : paybackYears <= 14
          ? "neutral"
          : "unfavorable";

    const verdictReasons = [];
    if (!paybackYears) verdictReasons.push("System does not reach payback within 25 years at current rates.");
    if (paybackYears && paybackYears <= 6) verdictReasons.push(`Exceptional ${paybackYears}-year payback, well below the 8-year benchmark.`);
    if (paybackYears && paybackYears > 6 && paybackYears <= 8) verdictReasons.push(`Strong ${paybackYears}-year payback within the favorable range.`);
    if (paybackYears && paybackYears > 8 && paybackYears <= 12) verdictReasons.push(`Moderate ${paybackYears}-year payback that still compares well with many long-term home upgrades.`);
    if (paybackYears && paybackYears > 12) verdictReasons.push(`${paybackYears}-year payback is longer than average. Reassess if equipment prices fall or utility rates rise.`);
    if (stateData.e >= 15) verdictReasons.push(`High electricity rates (${stateData.e} cents/kWh) accelerate savings.`);
    if (stateData.e < 10) verdictReasons.push(`Low electricity rates (${stateData.e} cents/kWh) reduce the financial case for solar.`);
    if (stateData.s >= 5.5) verdictReasons.push(`Excellent solar resource (${stateData.s} sun-hours/day) boosts output.`);
    if (stateData.s < 4) verdictReasons.push(`Limited sun hours (${stateData.s}/day) reduce production potential.`);
    if (shade !== "none") verdictReasons.push(`${shade.charAt(0).toUpperCase() + shade.slice(1)} shading reduces output. Reducing shade can materially improve production.`);
    if (federalItc) verdictReasons.push(`The 30% Federal ITC saves about $${Math.round(systemCost * 0.3).toLocaleString()} upfront.`);
    if (stateData.sc > 0 && stateCredits) verdictReasons.push(`State incentives reduce cost by about $${stateData.sc.toLocaleString()}.`);

    const favorableRateThreshold = Math.round((netCost / (annualProduction * 8)) * 10000) / 100;
    const acceptableRateThreshold = Math.round((netCost / (annualProduction * 14)) * 10000) / 100;
    const monthsOfBills = Math.round(annualSavings / ((monthlyKwh * stateData.e) / 100));
    const co2Avoided25yr = Math.round((annualProduction * 25 * 0.386) / 1000);
    const treeEquivalent = Math.round((co2Avoided25yr * 1000) / 21);
    const phoneCharges = Math.round((annualProduction * 1000) / 12);

    setResult({
      systemKw,
      systemCost: Math.round(systemCost),
      netCost: Math.round(netCost),
      incentives: Math.round(incentives),
      productionMedium: Math.round(annualProduction),
      paybackYears,
      lifetimeSavings,
      yearlyData,
      billOffset,
      verdictType,
      verdictReasons,
      favorableRateThreshold,
      acceptableRateThreshold,
      paybackNoShade,
      annualSavings,
      monthsOfBills,
      co2Avoided25yr,
      treeEquivalent,
      phoneCharges,
      assumptions: {
        state: stateCode,
        sunHours: stateData.s,
        electricityRate: stateData.e,
        shadeLabel: shade,
        shadeFactor: Math.round(shadeFactor * 100),
        orientationLabel: orientation,
        orientationFactor: Math.round(orientationFactor * 100),
        costPerWatt,
        rateEscalation,
        federalItc: federalItc ? Math.round(systemCost * 0.3) : 0,
        stateCredit: stateCredits ? (stateData.sc || 0) : 0,
        panelDegradation: "0.5%/yr",
        systemEfficiency: "82% (inverter + wiring losses)",
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
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 22 }}>
          <Input label="ZIP Code" value={zip} onChange={setZip} />
          {stateCode && stateData ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              <Badge type="real">{stateCode}</Badge>
              <Badge type="estimated">{stateData.s} sun-hours</Badge>
              <Badge type="estimated">{stateData.e} cents/kWh</Badge>
            </div>
          ) : null}
          <Slider label="Monthly kWh" value={monthlyKwh} onChange={setMonthlyKwh} min={200} max={3000} step={50} suffix=" kWh" />
          <Slider label="Usable Roof" value={roofSqft} onChange={setRoofSqft} min={100} max={1500} step={25} suffix=" sqft" />
          <Select label="Shading" value={shade} onChange={setShade} options={[
            { value: "none", label: "None" },
            { value: "light", label: "Light (-10%)" },
            { value: "moderate", label: "Moderate (-25%)" },
            { value: "heavy", label: "Heavy (-45%)" },
          ]} />
          <Select label="Orientation" value={orientation} onChange={setOrientation} options={[
            { value: "south", label: "South (optimal)" },
            { value: "sw_se", label: "SW/SE (-8%)" },
            { value: "ew", label: "E/W (-18%)" },
            { value: "north", label: "North (-35%)" },
          ]} />
          <Slider label="Cost per Watt" value={costPerWatt} onChange={setCostPerWatt} min={1.5} max={4.5} step={0.05} suffix="$/W" />
          <Toggle label="30% Federal ITC" value={federalItc} onChange={setFederalItc} />
          <Toggle label="State credits" value={stateCredits} onChange={setStateCredits} />
          <Slider label="Rate escalation" value={rateEscalation} onChange={setRateEscalation} min={0} max={6} step={0.5} suffix="%/yr" />
          <button onClick={calculate} style={{ width: "100%", background: t.green, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
            Calculate Solar ROI
          </button>
        </div>

        <div>
          {!result ? (
            <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 88, height: 46, borderRadius: 999, background: t.greenLight, color: t.green, fontSize: 13, fontWeight: 800, letterSpacing: ".12em", marginBottom: 12 }}>
                SOLAR
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Enter your details and calculate</h3>
              <p style={{ fontSize: 13, color: t.textLight, marginTop: 8, lineHeight: 1.6 }}>
                Wattfull will estimate system size, cost, payback period, and 25-year savings based on your location and current assumptions.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: t.green, borderRadius: 14, padding: 22, color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                  System Summary | {zip} ({result.assumptions.state})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>System Size</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{result.systemKw} kW</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Net Cost After Credits</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>${result.netCost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Estimated Payback</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{result.paybackYears ? `~${result.paybackYears} yrs` : "25+ yrs"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>25-Year Net Savings</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>${result.lifetimeSavings.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ ...metricPillStyle, background: "rgba(255,255,255,0.18)" }}>Annual production: {result.productionMedium.toLocaleString()} kWh</div>
                  <div style={{ ...metricPillStyle, background: "rgba(255,255,255,0.18)" }}>Bill offset: ~{result.billOffset}%</div>
                  <div style={{ ...metricPillStyle, background: "rgba(255,255,255,0.18)" }}>Credits: ${result.incentives.toLocaleString()}</div>
                </div>
              </div>

              {(() => {
                const verdict = VERDICT_CFG[result.verdictType];
                return (
                  <div style={{ background: verdict.bg, border: `2px solid ${verdict.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".12em", color: verdict.titleColor }}>{verdict.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: verdict.titleColor, textTransform: "uppercase", letterSpacing: ".06em" }}>Wattfull Verdict</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: verdict.titleColor }}>{verdict.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: verdict.tagBg, color: verdict.tagText, borderRadius: 4, padding: "2px 8px" }}>
                            {result.paybackYears ? `${result.paybackYears}-yr payback` : "25+ yr payback"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[
                        { label: "Annual Savings", value: `$${result.annualSavings.toLocaleString()}` },
                        { label: "25-Year Return", value: `$${result.lifetimeSavings.toLocaleString()}` },
                        { label: "ROI", value: result.netCost > 0 ? `${Math.round((result.lifetimeSavings / result.netCost) * 100)}%` : "-" },
                      ].map((metric) => (
                        <div key={metric.label} style={{ background: "rgba(255,255,255,0.5)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 90, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: verdict.titleColor, fontWeight: 600 }}>{metric.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: verdict.titleColor }}>{metric.value}</div>
                        </div>
                      ))}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.verdictReasons.slice(0, 4).map((reason, index) => (
                        <li key={index} style={{ fontSize: 12, color: verdict.textColor, lineHeight: 1.6, marginBottom: 3 }}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>Cumulative Savings vs Net Cost</div>
                <div style={{ fontSize: 12, color: t.textLight, marginBottom: 14 }}>Where the savings line crosses the cost line is your payback point.</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.yearlyData}>
                    <defs>
                      <linearGradient id="solarSavingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.green} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.borderLight} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(value) => `Yr ${value}`} />
                    <YAxis tick={{ fontSize: 11, fill: t.textLight }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip content={(props) => <ChartTip {...props} prefix="$" />} />
                    {result.paybackYears ? (
                      <ReferenceLine x={result.paybackYears} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={2} label={{ value: `Break-even Yr ${result.paybackYears}`, position: "top", fontSize: 10, fill: "#f59e0b" }} />
                    ) : null}
                    <Area type="monotone" dataKey="cost" stroke={t.textLight} strokeWidth={2} strokeDasharray="5 4" fill="none" name="Net Cost" />
                    <Area type="monotone" dataKey="savings" stroke={t.green} strokeWidth={2.5} fill="url(#solarSavingsGradient)" name="Cumulative Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 14 }}>What would change this result?</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                  <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: t.textLight }}>Current electricity rate</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{result.assumptions.electricityRate} cents/kWh</div>
                  </div>
                  <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: t.textLight }}>8-year favorable threshold</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{result.favorableRateThreshold} cents/kWh</div>
                  </div>
                  <div style={{ background: t.card, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: t.textLight }}>14-year acceptable threshold</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{result.acceptableRateThreshold} cents/kWh</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.7, marginTop: 12 }}>
                  {result.assumptions.electricityRate >= result.favorableRateThreshold
                    ? `Your rate (${result.assumptions.electricityRate} cents) already exceeds the threshold for a highly favorable payback.`
                    : `If rates rise to ${result.favorableRateThreshold} cents/kWh, payback drops to about 8 years.`}
                </div>
                {result.paybackYears && result.paybackNoShade && result.paybackNoShade < result.paybackYears ? (
                  <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.7, marginTop: 8 }}>
                    Removing shading obstacles could shorten payback by {result.paybackYears - result.paybackNoShade} year{result.paybackYears - result.paybackNoShade !== 1 ? "s" : ""}.
                  </div>
                ) : null}
              </div>

              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 12 }}>25-Year Environmental Impact</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                  {[
                    { icon: "BILL", label: "Annual bill savings", value: `~${result.monthsOfBills} months of electricity`, color: "#059669", bg: "#d1fae5" },
                    { icon: "CO2", label: "CO2 avoided", value: `${result.co2Avoided25yr} metric tons`, color: "#0284c7", bg: "#e0f2fe" },
                    { icon: "TREES", label: "Tree equivalent", value: `${result.treeEquivalent.toLocaleString()} trees planted`, color: "#16a34a", bg: "#dcfce7" },
                    { icon: "PHONE", label: "Phone charges", value: `${result.phoneCharges.toLocaleString()} charges/yr`, color: "#7c3aed", bg: "#ede9fe" },
                  ].map((item) => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", marginBottom: 6, color: item.color }}>{item.icon}</div>
                      <div style={{ fontSize: 11, color: item.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: item.color, marginTop: 6 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: t.textLight, marginTop: 10 }}>CO2 calculation uses a US average grid emission factor of 0.386 kg/kWh.</div>
              </div>

              <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
                <button onClick={() => setShowAssumptions((value) => !value)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Calculation Assumptions</div>
                  <span style={{ fontSize: 12, color: t.textLight }}>{showAssumptions ? "Hide" : "Show"}</span>
                </button>
                {showAssumptions ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginTop: 14 }}>
                    {[
                      { label: "Location", value: `${zip} -> ${result.assumptions.state}` },
                      { label: "Sun hours", value: `${result.assumptions.sunHours}/day` },
                      { label: "Electricity rate", value: `${result.assumptions.electricityRate} cents/kWh (EIA)` },
                      { label: "Shade factor", value: `${result.assumptions.shadeLabel} (${result.assumptions.shadeFactor}%)` },
                      { label: "Orientation factor", value: `${result.assumptions.orientationLabel} (${result.assumptions.orientationFactor}%)` },
                      { label: "Cost per watt", value: `$${result.assumptions.costPerWatt}/W` },
                      { label: "Rate escalation", value: `${result.assumptions.rateEscalation}%/yr` },
                      { label: "Federal ITC", value: `$${result.assumptions.federalItc.toLocaleString()}` },
                      { label: "State credit", value: `$${result.assumptions.stateCredit.toLocaleString()}` },
                      { label: "Panel degradation", value: result.assumptions.panelDegradation },
                      { label: "System efficiency", value: result.assumptions.systemEfficiency },
                    ].map((item) => (
                      <div key={item.label} style={{ background: t.card, borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 11, color: t.textLight }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginTop: 4 }}>{item.value}</div>
                      </div>
                    ))}
                    <div style={{ gridColumn: "1 / -1", fontSize: 12, color: t.textMid, lineHeight: 1.7, marginTop: 4 }}>
                      Results are estimates. Actual output varies by roughly 15% based on microclimate, panel tilt, inverter efficiency, and installer design.
                    </div>
                  </div>
                ) : null}
              </div>

              <ShareBadge title="Solar ROI result" subtitle={`${result.systemKw} kW system - ~${result.paybackYears || "25+"} year payback`} bullets={[
                `${result.billOffset}% estimated bill offset`,
                `$${result.lifetimeSavings.toLocaleString()} estimated 25-year net savings`,
                `${result.assumptions.electricityRate} cents/kWh electricity assumption`,
              ]} />

              <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Data sources</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SOURCES.map((source) => (
                    <div key={source.label} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 999, padding: "7px 10px", fontSize: 12, color: t.textMid }}>
                      <span style={{ fontWeight: 700, color: t.text }}>{source.label}</span>
                      <span style={{ color: t.textLight }}> | {source.date}</span>
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
