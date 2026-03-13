"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { Input, Select, Slider, Toggle, Collapsible } from "@/components/ui";
import { POPULAR_EV_IDS, POPULAR_ICE_IDS, VEHICLES, VEHICLE_YEARS } from "@/lib/data";
import {
  TeslaModel3, TeslaModelY,
  HyundaiIoniq5, HyundaiIoniq6, HyundaiTucson,
  ChevyEquinoxEV, ChevySilverado,
  FordMachE, F150Lightning, F150Gas,
  VWID4, BMWI4, Polestar2,
  KiaEV6, KiaEV9, KiaSorento,
  NissanAriya, NissanAltima,
  HondaPrologue, HondaAccord, HondaCivic, HondaCRV,
  CadillacLyriq,
  ToyotaCamry, ToyotaRAV4, ToyotaCorolla, ToyotaPrius, ToyotaHighlander, ToyotaTacoma,
  MazdaCX5,
  vehicleIllustrations,
} from "@/components/illustrations/vehicles";
import { ShareBadge } from "@/components/widgets/ShareBadge";

const ILLUS_COMPONENTS = {
  TeslaModel3, TeslaModelY,
  HyundaiIoniq5, HyundaiIoniq6, HyundaiTucson,
  ChevyEquinoxEV, ChevySilverado,
  FordMachE, F150Lightning, F150Gas,
  VWID4, BMWI4, Polestar2,
  KiaEV6, KiaEV9, KiaSorento,
  NissanAriya, NissanAltima,
  HondaPrologue, HondaAccord, HondaCivic, HondaCRV,
  CadillacLyriq,
  ToyotaCamry, ToyotaRAV4, ToyotaCorolla, ToyotaPrius, ToyotaHighlander, ToyotaTacoma,
  MazdaCX5,
};

function VehicleIllus({ vehicleId, size = 48 }) {
  const baseId = vehicleId.replace(/-\d{4}$/, "");
  const name = vehicleIllustrations[baseId];
  const Comp = name ? ILLUS_COMPONENTS[name] : null;
  return Comp ? <Comp size={size} /> : null;
}
import { runCalc } from "@/app/actions/calc";
import DataFreshness from "@/components/ui/DataFreshness";
import { STORAGE_KEYS, getStoredJson, pushStoredHistory, setStoredJson } from "@/lib/profileStore";

const LS_KEY = STORAGE_KEYS.evCalc;
const DEFAULT_FORM = {
  zip: "",
  modelYear: "all",
  evId: POPULAR_EV_IDS[0] ?? VEHICLES.ev[0]?.id ?? "",
  iceId: POPULAR_ICE_IDS[0] ?? VEHICLES.ice[0]?.id ?? "",
  milesPerYear: 12000,
  ownershipYears: 8,
  homePct: 85,
  publicPct: 10,
  dcfcPct: 5,
  driveStyle: "normal",
  includeIncentives: false,
  applyClimateAdjustment: true,
  evMaintPerYear: 800,
  iceMaintPerYear: 1500,
  scenario: "operating",
  // TOU
  touEnabled: false,
  touOffPeakRate: 9,
  touOffPeakHomePct: 80,
  // Buying-mode extras
  insuranceEnabled: false,
  evInsurancePerYear: 2200,
  iceInsurancePerYear: 1800,
  batteryReplacementEnabled: false,
  batteryReplacementCost: 10000,
  batteryReplacementYear: 10,
  depreciationEnabled: false,
  evResidualPct: 35,
  iceResidualPct: 40,
};

const SCENARIO_OPTIONS = [
  { value: "operating", label: "Operating cost only", desc: "Best for keep-vs-keep fuel and maintenance comparisons." },
  { value: "buying", label: "Buying both today", desc: "Includes MSRP, incentives, and long-term ownership cost." },
];

const DRIVE_STYLE_OPTIONS = [
  { value: "efficient", label: "Efficient (-12%)" },
  { value: "normal", label: "Normal (EPA)" },
  { value: "aggressive", label: "Spirited (+17%)" },
];

const VERDICT_STYLES = {
  favorable: { color: "#10b981", label: "EV Financially Favorable" },
  neutral: { color: "#f59e0b", label: "Roughly Neutral" },
  unfavorable: { color: "#ef4444", label: "EV Financially Unfavorable" },
};

const YEAR_OPTIONS = [
  { value: "all", label: "All years" },
  ...VEHICLE_YEARS.map((y) => ({ value: String(y), label: String(y) })),
];

function evOptionsForYear(year) {
  const list = year === "all" ? VEHICLES.ev : VEHICLES.ev.filter((v) => v.year === Number(year));
  return (list.length ? list : VEHICLES.ev).map((v) => ({ value: v.id, label: `${v.name} — ${v.kwh} kWh/100mi` }));
}

function iceOptionsForYear(year) {
  const list = year === "all" ? VEHICLES.ice : VEHICLES.ice.filter((v) => v.year === Number(year));
  return (list.length ? list : VEHICLES.ice).map((v) => ({ value: v.id, label: `${v.name} — ${v.mpg} MPG` }));
}

function formatMoney(value) {
  return `$${Math.round(value ?? 0).toLocaleString()}`;
}

function formatSignedMoney(value) {
  const rounded = Math.round(value ?? 0);
  return `${rounded >= 0 ? "+" : "-"}${formatMoney(Math.abs(rounded))}`;
}

function formatCostPerMile(value) {
  return `${((value ?? 0) * 100).toFixed(1)}c/mi`;
}

function CostMetric({ label, value, sublabel, t }) {
  return (
    <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: t.textLight, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{value}</div>
      {sublabel ? <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{sublabel}</div> : null}
    </div>
  );
}

function SectionCard({ title, subtitle, children, t }) {
  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 18, padding: 20 }}>
      {title ? <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>{title}</div> : null}
      {subtitle ? <div style={{ fontSize: 13, color: t.textLight, marginBottom: 16 }}>{subtitle}</div> : null}
      {children}
    </div>
  );
}

function ScenarioToggle({ value, onChange, t }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 14 }}>
      {SCENARIO_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              textAlign: "left",
              borderRadius: 14,
              padding: "12px 14px",
              border: `1.5px solid ${active ? t.green : t.border}`,
              background: active ? "rgba(16,185,129,0.08)" : t.card,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: active ? t.green : t.text, marginBottom: 4 }}>{option.label}</div>
            <div style={{ fontSize: 12, color: t.textLight, lineHeight: 1.45 }}>{option.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function VerdictPanel({ result, scenario, t }) {
  const activeVerdictType = scenario === "buying" ? result.analysis.ownershipVerdictType : result.analysis.verdictType;
  const style = VERDICT_STYLES[activeVerdictType] ?? VERDICT_STYLES.neutral;
  const headline = scenario === "buying"
    ? result.verdict
    : result.operating.totalSavings >= 0
      ? `${result.vehicles.ev.name} costs less to run than ${result.vehicles.ice.name} in your current setup.`
      : `${result.vehicles.ice.name} is cheaper to run than ${result.vehicles.ev.name} in your current setup.`;
  const reasons = scenario === "buying" ? result.reasons : result.analysis.reasons;
  const primarySavings = scenario === "buying" ? result.totalCostIce - result.totalCostEv : result.operating.totalSavings;
  const breakEven = scenario === "buying" ? result.breakevenYear : result.operating.breakEvenYear;

  return (
    <div style={{ border: `2px solid ${style.color}`, borderRadius: 18, padding: 22, background: t.white }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: t.textLight, marginBottom: 6 }}>Wattfull verdict</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: style.color, marginBottom: 6 }}>{style.label}</div>
          <div style={{ fontSize: 14, color: t.textMid, maxWidth: 640, lineHeight: 1.55 }}>{headline}</div>
        </div>
        <div style={{ minWidth: 190, textAlign: "right" }}>
          <div style={{ fontSize: 12, color: t.textLight }}>{scenario === "buying" ? `${result.inputs.ownershipYears}-year ownership gap` : `${result.inputs.ownershipYears}-year operating gap`}</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: primarySavings >= 0 ? "#10b981" : "#ef4444" }}>{formatSignedMoney(primarySavings)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 18 }}>
        <CostMetric label="Annual savings" value={formatSignedMoney(result.operating.annualSavings)} t={t} />
        <CostMetric label="5-year savings" value={formatSignedMoney(result.operating.fiveYearSavings)} t={t} />
        <CostMetric label="Break-even" value={breakEven === null ? "None" : breakEven === 0 ? "Upfront" : `Year ${breakEven}`} t={t} />
        <CostMetric label="EV cost per mile" value={formatCostPerMile(scenario === "buying" ? result.costPerMileEv : result.operating.evCostPerMile)} t={t} />
        <CostMetric label="Gas cost per mile" value={formatCostPerMile(scenario === "buying" ? result.costPerMileIce : result.operating.iceCostPerMile)} t={t} />
      </div>

      <div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: t.textLight, marginBottom: 8 }}>Why this verdict</div>
        <div style={{ display: "grid", gap: 8 }}>
          {reasons.slice(0, 5).map((reason) => (
            <div key={reason} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: t.textMid }}>
              <span style={{ color: style.color, fontWeight: 900, lineHeight: 1 }}>•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OwnershipBreakout({ result, t }) {
  const bd = result.breakdown;
  return (
    <SectionCard
      title="Purchase vs operating cost"
      subtitle="Use this mode when you are choosing what to buy, not just what is cheaper to operate."
      t={t}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        <CostMetric label={`${result.vehicles.ev.name} MSRP`} value={formatMoney(result.vehicles.ev.msrp)} sublabel="Seeded vehicle MSRP" t={t} />
        <CostMetric label={`${result.vehicles.ice.name} MSRP`} value={formatMoney(result.vehicles.ice.msrp)} sublabel="Seeded vehicle MSRP" t={t} />
        <CostMetric label="EV total ownership" value={formatMoney(result.totalCostEv)} sublabel={`${result.inputs.ownershipYears} years`} t={t} />
        <CostMetric label="Gas total ownership" value={formatMoney(result.totalCostIce)} sublabel={`${result.inputs.ownershipYears} years`} t={t} />
        <CostMetric label="Credits applied" value={formatMoney(result.operating.incentivesApplied)} sublabel={result.inputs.includeIncentives ? "Included in EV total" : "Toggle on if eligible"} t={t} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 16 }}>
        <CostMetric label="EV fuel total" value={formatMoney(bd.evFuelTotal)} t={t} />
        <CostMetric label="Gas fuel total" value={formatMoney(bd.iceFuelTotal)} t={t} />
        <CostMetric label="EV maintenance total" value={formatMoney(bd.evMaintTotal)} t={t} />
        <CostMetric label="Gas maintenance total" value={formatMoney(bd.iceMaintTotal)} t={t} />
        {(bd.evInsuranceTotal > 0 || bd.iceInsuranceTotal > 0) && (
          <>
            <CostMetric label="EV insurance total" value={formatMoney(bd.evInsuranceTotal)} t={t} />
            <CostMetric label="Gas insurance total" value={formatMoney(bd.iceInsuranceTotal)} t={t} />
          </>
        )}
        {bd.batteryReplacementCost > 0 && (
          <CostMetric label="Battery replacement" value={formatMoney(bd.batteryReplacementCost)} sublabel="One-time EV cost" t={t} />
        )}
        {(bd.evResidual > 0 || bd.iceResidual > 0) && (
          <>
            <CostMetric label="EV resale value" value={`-${formatMoney(bd.evResidual)}`} sublabel="Reduces net cost" t={t} />
            <CostMetric label="Gas resale value" value={`-${formatMoney(bd.iceResidual)}`} sublabel="Reduces net cost" t={t} />
          </>
        )}
      </div>
    </SectionCard>
  );
}

function CostChart({ result, scenario, t }) {
  const chartData = scenario === "buying"
    ? result.breakdown.byYear.map((row) => ({ year: `Yr ${row.year}`, ev: row.evCum, gas: row.iceCum, gap: row.iceCum - row.evCum }))
    : result.operating.byYear.map((row) => ({ year: `Yr ${row.year}`, ev: row.evCum, gas: row.iceCum, gap: row.savings }));
  const breakEvenYear = scenario === "buying" ? result.breakevenYear : result.operating.breakEvenYear;

  return (
    <SectionCard
      title="Cumulative costs over time"
      subtitle={scenario === "buying" ? "Purchase price, incentives, energy, and maintenance over the full horizon." : "Fuel and maintenance only. Use buying mode when purchase price should matter."}
      t={t}
    >
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={t.borderLight} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={t.textLight} tick={{ fontSize: 12 }} />
            <YAxis stroke={t.textLight} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
            <Tooltip
              formatter={(value) => formatMoney(value)}
              contentStyle={{ background: t.white, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text }}
            />
            {breakEvenYear !== null ? <ReferenceLine x={`Yr ${breakEvenYear}`} stroke={t.green} strokeDasharray="4 4" /> : null}
            <Area type="monotone" dataKey="ev" stroke="#10b981" fill="rgba(16,185,129,0.18)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="gas" stroke="#94a3b8" fill="rgba(148,163,184,0.12)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

function Thresholds({ result, t }) {
  const rows = [];
  if (result.analysis.breakEvenElec) {
    rows.push(`EV savings disappear if electricity rises above ${result.analysis.breakEvenElec}c/kWh.`);
  }
  rows.push(`Each extra 1,000 miles per year changes annual EV savings by ${formatMoney(Math.abs(result.analysis.savingsPer1kMi))}.`);
  if (!result.inputs.includeIncentives && result.analysis.potentialCredits > 0) {
    rows.push(`Eligible credits would improve the EV side by about ${formatMoney(result.analysis.potentialCredits)}.`);
  }
  if (result.analysis.savingsPerGas10c) {
    rows.push(`Every $0.10 increase in gas price changes annual EV savings by ${formatMoney(result.analysis.savingsPerGas10c)}.`);
  }

  return (
    <SectionCard title="What would change this result?" subtitle="These thresholds help explain how stable the recommendation really is." t={t}>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((row) => (
          <div key={row} style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>
            {row}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function IncentivesPanel({ result, t }) {
  const items = result.incentiveLineItems ?? [];
  if (!items.length) return null;
  const appliedTotal = items.reduce((sum, item) => sum + (item.applied ? item.amount : 0), 0);
  const availableTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SectionCard
      title="Available EV credits"
      subtitle={result.inputs.includeIncentives
        ? `${formatMoney(appliedTotal)} applied to this calculation. Verify eligibility before filing.`
        : `${formatMoney(availableTotal)} in potential credits not yet applied. Toggle "Include credits" to see the impact.`}
      t={t}
    >
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div
            key={`${item.label}-${item.amount}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              background: item.applied ? t.greenLight : t.card,
              border: `1px solid ${item.applied ? t.green : t.borderLight}`,
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{item.label}</div>
              <div style={{ fontSize: 12, color: t.textMid, marginTop: 3, lineHeight: 1.5 }}>{item.eligibilityFlag}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: item.applied ? "#065f46" : t.textMid, flexShrink: 0 }}>
              {formatMoney(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AssumptionPanel({ result, t }) {
  return (
    <Collapsible title="Calculation assumptions" defaultOpen={false}>
      <div style={{ display: "grid", gap: 8 }}>
        {result.assumptionsUsed.map((item) => (
          <div key={item} style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5, padding: "8px 0", borderBottom: `1px solid ${t.borderLight}` }}>{item}</div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: t.textLight }}>
        Confidence: {result.confidenceLevel}. Sources: {result.sources.join(", ")}
      </div>
    </Collapsible>
  );
}

function Rankings({ result, form, setForm, t }) {
  const top = result.analysis.rankings.slice(0, 5);
  if (!top.length) return null;

  return (
    <SectionCard title="Best EVs for this setup" subtitle="Static fleet ranking based on your ZIP, mileage, charging mix, and maintenance assumptions." t={t}>
      <div style={{ display: "grid", gap: 8 }}>
        {top.map((vehicle, index) => {
          const selected = vehicle.id === form.evId;
          const hasIllus = vehicleIllustrations[vehicle.id.replace(/-\d{4}$/, "")];
          return (
            <button
              key={vehicle.id}
              onClick={() => setForm((current) => ({ ...current, evId: vehicle.id }))}
              style={{
                display: "grid",
                gridTemplateColumns: hasIllus ? "56px 1fr auto" : "36px 1fr auto",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1.5px solid ${selected ? t.green : t.borderLight}`,
                background: selected ? "rgba(16,185,129,0.08)" : t.card,
                cursor: "pointer",
              }}
            >
              {hasIllus
                ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: selected ? 1 : 0.7 }}><VehicleIllus vehicleId={vehicle.id} size={52} /></div>
                : <div style={{ width: 28, height: 28, borderRadius: 14, background: selected ? t.green : t.border, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{index + 1}</div>
              }
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{vehicle.name}</div>
                <div style={{ fontSize: 12, color: t.textLight }}>{vehicle.kwh} kWh/100mi · #{index + 1} pick</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: vehicle.annSavings >= 0 ? "#10b981" : "#ef4444" }}>{formatSignedMoney(vehicle.annSavings)}/yr</div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function EmptyState({ t }) {
  return (
    <SectionCard title="Enter your details and calculate" subtitle="Wattfull will separate operating cost from purchase cost so you can answer the right decision question." t={t}>
      <div style={{ display: "grid", gap: 10 }}>
        {[
          "Add a ZIP code to pull local energy rates.",
          "Choose an EV and gas vehicle to compare.",
          "Set annual miles and ownership years.",
          "Pick whether you want operating cost only or a buy-today view.",
        ].map((line) => (
          <div key={line} style={{ fontSize: 13, color: t.textMid }}>{line}</div>
        ))}
      </div>
    </SectionCard>
  );
}

function EVCalcInner() {
  const { t } = useTheme();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const stored = getStoredJson(LS_KEY, null);
    const zip = params.get("zip");
    const next = { ...DEFAULT_FORM, ...(stored ?? {}) };
    if (zip) next.zip = zip;
    setForm(next);
  }, [params]);

  useEffect(() => {
    setStoredJson(LS_KEY, form);
  }, [form]);

  // Auto-scroll to results when they first arrive
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Mark dirty when form changes after a calculation has been run
  useEffect(() => {
    if (result) setIsDirty(true);
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEv = useMemo(() => VEHICLES.ev.find((vehicle) => vehicle.id === form.evId), [form.evId]);
  const selectedIce = useMemo(() => VEHICLES.ice.find((vehicle) => vehicle.id === form.iceId), [form.iceId]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleCalculate() {
    setError("");
    setIsDirty(false);

    const chargingSum = (form.homePct || 0) + (form.publicPct || 0) + (form.dcfcPct || 0);
    if (Math.abs(chargingSum - 100) > 1) {
      setError(`Charging mix must sum to 100% (currently ${chargingSum}%). Adjust Home, Public, and DC Fast percentages.`);
      return;
    }
    if ((form.milesPerYear || 0) <= 0) {
      setError("Annual miles must be greater than 0.");
      return;
    }
    if ((form.ownershipYears || 0) <= 0) {
      setError("Ownership years must be greater than 0.");
      return;
    }

    startTransition(async () => {
      try {
        const isBuying = form.scenario === "buying";
        const payload = {
          zip: form.zip?.trim() || undefined,
          evId: form.evId,
          iceId: form.iceId,
          milesPerYear: form.milesPerYear,
          ownershipYears: form.ownershipYears,
          homePct: form.homePct,
          publicPct: form.publicPct,
          dcfcPct: form.dcfcPct,
          driveStyle: form.driveStyle,
          includeIncentives: form.includeIncentives,
          applyClimateAdjustment: form.applyClimateAdjustment,
          evMaintPerYear: form.evMaintPerYear,
          iceMaintPerYear: form.iceMaintPerYear,
          // TOU
          touOffPeakRate: form.touEnabled ? form.touOffPeakRate : undefined,
          touOffPeakHomePct: form.touEnabled ? form.touOffPeakHomePct / 100 : undefined,
          // Buying-mode extras
          evInsurancePerYear: isBuying && form.insuranceEnabled ? form.evInsurancePerYear : 0,
          iceInsurancePerYear: isBuying && form.insuranceEnabled ? form.iceInsurancePerYear : 0,
          batteryReplacementCost: isBuying && form.batteryReplacementEnabled ? form.batteryReplacementCost : 0,
          batteryReplacementYear: isBuying && form.batteryReplacementEnabled ? form.batteryReplacementYear : null,
          evResidualPct: isBuying && form.depreciationEnabled ? form.evResidualPct / 100 : 0,
          iceResidualPct: isBuying && form.depreciationEnabled ? form.iceResidualPct / 100 : 0,
        };
        const next = await runCalc(payload);
        setResult(next);
        pushStoredHistory(STORAGE_KEYS.evHistory, {
          zip: next.location.zip,
          state: next.location.state,
          scenario: form.scenario,
          ev: next.vehicles.ev.name,
          gas: next.vehicles.ice.name,
          annualSavings: next.operating.annualSavings,
          totalSavings: form.scenario === "buying" ? next.totalCostIce - next.totalCostEv : next.operating.totalSavings,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err?.message || "Unable to calculate right now.");
      }
    });
  }

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 20px 52px" }}>
      <style>{`
        .ev-calc-grid{display:grid;grid-template-columns:minmax(320px,480px) minmax(360px,1fr);gap:20px;align-items:start}
        .ev-input-col{position:sticky;top:72px;max-height:calc(100vh - 88px);overflow-y:auto;scrollbar-width:thin;border-radius:18px}
        @media(max-width:820px){
          .ev-calc-grid{grid-template-columns:1fr!important}
          .ev-input-col{position:static!important;max-height:none!important;overflow-y:visible!important}
        }
      `}</style>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: 0, color: t.text }}>EV Savings Calculator</h1>
        <p style={{ fontSize: 15, color: t.textMid, marginTop: 12, maxWidth: 760 }}>
          Compare local EV and gas costs, then switch between an operating-cost view and a buy-today ownership view.
        </p>
      </div>

      <div className="ev-calc-grid">
        <div className="ev-input-col">
        <SectionCard title="Inputs" subtitle="Set up your location, charging mix, and vehicle pair." t={t}>
          <ScenarioToggle value={form.scenario} onChange={(value) => updateField("scenario", value)} t={t} />

          <Input label="ZIP code" value={form.zip} onChange={(value) => updateField("zip", value)} placeholder="72712" maxLength={5} />
          {!form.zip && (
            <div style={{ marginTop: -8, marginBottom: 8, fontSize: 11, color: t.textLight, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: t.green, fontWeight: 700 }}>⚡</span> Enter ZIP for local electricity &amp; gas rates
            </div>
          )}

          {result ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: -2, marginBottom: 12 }}>
              <div style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>{result.location.state || "--"}</div>
              <div style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>{result.ratesUsed.electricityCentsPerKwh}c/kWh</div>
              <div style={{ background: "rgba(16,185,129,0.12)", color: t.green, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>${result.ratesUsed.gasDollarsPerGallon}/gal</div>
            </div>
          ) : null}

          <DataFreshness />

          <Select
            label="Model year"
            value={String(form.modelYear)}
            onChange={(value) => {
              const yr = Number(value);
              const evOpts = evOptionsForYear(yr);
              const iceOpts = iceOptionsForYear(yr);
              updateField("modelYear", yr);
              updateField("evId", evOpts[0]?.value ?? form.evId);
              updateField("iceId", iceOpts[0]?.value ?? form.iceId);
            }}
            options={YEAR_OPTIONS}
          />
          <Select label="EV to evaluate" value={form.evId} onChange={(value) => updateField("evId", value)} options={evOptionsForYear(form.modelYear)} />
          <Select label="Gas vehicle to compare" value={form.iceId} onChange={(value) => updateField("iceId", value)} options={iceOptionsForYear(form.modelYear)} />

          <Slider label="Annual miles" value={form.milesPerYear} onChange={(value) => updateField("milesPerYear", value)} min={2000} max={40000} step={500} suffix=" /year" editable inputModes={["year", "week", "day"]} />
          <Slider label="Ownership years" value={form.ownershipYears} onChange={(value) => updateField("ownershipYears", value)} min={1} max={15} step={1} suffix=" years" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
            <Input label="Home %" type="number" value={form.homePct} onChange={(value) => updateField("homePct", Number(value || 0))} suffix="%" min={0} max={100} />
            <Input label="Public %" type="number" value={form.publicPct} onChange={(value) => updateField("publicPct", Number(value || 0))} suffix="%" min={0} max={100} />
            <Input label="DC fast %" type="number" value={form.dcfcPct} onChange={(value) => updateField("dcfcPct", Number(value || 0))} suffix="%" min={0} max={100} />
          </div>

          <Select label="Driving style" value={form.driveStyle} onChange={(value) => updateField("driveStyle", value)} options={DRIVE_STYLE_OPTIONS} />
          <Toggle label="Include federal and state credits" value={form.includeIncentives} onChange={(value) => updateField("includeIncentives", value)} />
          <Toggle label="Apply climate efficiency adjustment" value={form.applyClimateAdjustment} onChange={(value) => updateField("applyClimateAdjustment", value)} />

          <Collapsible title="Maintenance cost estimates" defaultOpen={false}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
              <Input label="EV maintenance" type="number" value={form.evMaintPerYear} onChange={(value) => updateField("evMaintPerYear", Number(value || 0))} prefix="$" suffix="/yr" min={0} />
              <Input label="Gas maintenance" type="number" value={form.iceMaintPerYear} onChange={(value) => updateField("iceMaintPerYear", Number(value || 0))} prefix="$" suffix="/yr" min={0} />
            </div>
          </Collapsible>

          <Collapsible title="Time-of-use (TOU) plan" defaultOpen={false}>
            <Toggle label="I charge on an off-peak rate" value={form.touEnabled} onChange={(value) => updateField("touEnabled", value)} />
            {form.touEnabled && (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                <Input label="Off-peak rate" type="number" value={form.touOffPeakRate} onChange={(value) => updateField("touOffPeakRate", Number(value || 0))} suffix="¢/kWh" min={0} />
                <Slider label="Home charging that's off-peak" value={form.touOffPeakHomePct} onChange={(value) => updateField("touOffPeakHomePct", value)} min={0} max={100} step={5} suffix="%" />
                <div style={{ fontSize: 11, color: t.textLight, lineHeight: 1.5 }}>
                  Most EV owners charge overnight. Off-peak rates can significantly reduce your effective home charging cost.
                </div>
              </div>
            )}
          </Collapsible>

          {form.scenario === "buying" && (
            <Collapsible title="Full ownership costs" defaultOpen={false}>
              <div style={{ display: "grid", gap: 12 }}>
                <Toggle label="Include insurance estimates" value={form.insuranceEnabled} onChange={(value) => updateField("insuranceEnabled", value)} />
                {form.insuranceEnabled && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                    <Input label="EV insurance" type="number" value={form.evInsurancePerYear} onChange={(value) => updateField("evInsurancePerYear", Number(value || 0))} prefix="$" suffix="/yr" min={0} />
                    <Input label="Gas insurance" type="number" value={form.iceInsurancePerYear} onChange={(value) => updateField("iceInsurancePerYear", Number(value || 0))} prefix="$" suffix="/yr" min={0} />
                  </div>
                )}
                <Toggle label="Include battery replacement estimate" value={form.batteryReplacementEnabled} onChange={(value) => updateField("batteryReplacementEnabled", value)} />
                {form.batteryReplacementEnabled && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                    <Input label="Replacement cost" type="number" value={form.batteryReplacementCost} onChange={(value) => updateField("batteryReplacementCost", Number(value || 0))} prefix="$" min={0} />
                    <Input label="At year" type="number" value={form.batteryReplacementYear} onChange={(value) => updateField("batteryReplacementYear", Math.min(15, Math.max(1, Number(value || 1))))} suffix=" yr" min={1} max={15} />
                  </div>
                )}
                <Toggle label="Include resale value" value={form.depreciationEnabled} onChange={(value) => updateField("depreciationEnabled", value)} />
                {form.depreciationEnabled && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                    <Input label="EV residual" type="number" value={form.evResidualPct} onChange={(value) => updateField("evResidualPct", Math.min(80, Math.max(0, Number(value || 0))))} suffix="% of MSRP" min={0} max={80} />
                    <Input label="Gas residual" type="number" value={form.iceResidualPct} onChange={(value) => updateField("iceResidualPct", Math.min(80, Math.max(0, Number(value || 0))))} suffix="% of MSRP" min={0} max={80} />
                  </div>
                )}
                <div style={{ fontSize: 11, color: t.textLight, lineHeight: 1.5 }}>
                  These inputs make buying-mode results more complete. Insurance, battery replacement, and resale value all affect true total cost.
                </div>
              </div>
            </Collapsible>
          )}

          {error ? <div style={{ marginTop: 12, fontSize: 13, color: t.err }}>{error}</div> : null}
          {result && isDirty && (
            <div style={{ marginBottom: 8, fontSize: 12, color: t.textMid, textAlign: "center", padding: "6px 10px", background: t.card, borderRadius: 8, border: `1px dashed ${t.border}` }}>
              Inputs changed — recalculate to update
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={isPending}
            style={{
              marginTop: 14,
              width: "100%",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              background: t.green,
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              opacity: isPending ? 0.75 : 1,
            }}
          >
            {isPending ? "Calculating..." : form.scenario === "buying" ? "Calculate ownership cost" : "Calculate EV savings"}
          </button>
        </SectionCard>
        </div>

        <div ref={resultRef} style={{ display: "grid", gap: 16 }}>
          {result ? (
            <>
              <VerdictPanel result={result} scenario={form.scenario} t={t} />
              <IncentivesPanel result={result} t={t} />
              {form.scenario === "buying" ? <OwnershipBreakout result={result} t={t} /> : null}
              <CostChart result={result} scenario={form.scenario} t={t} />
              <Thresholds result={result} t={t} />
              <Rankings result={result} form={form} setForm={setForm} t={t} />
              <SectionCard title="Share this result" subtitle="Save or copy a summary card with the exact scenario you ran." t={t}>
                <ShareBadge
                  title={form.scenario === "buying" ? "Buy-today EV ownership result" : "EV operating-cost result"}
                  value={form.scenario === "buying" ? formatSignedMoney(result.totalCostIce - result.totalCostEv) : formatSignedMoney(result.operating.totalSavings)}
                  subtitle={`${selectedEv?.name || result.vehicles.ev.name} vs ${selectedIce?.name || result.vehicles.ice.name}`}
                  details={[
                    { label: "ZIP", value: result.location.zip || result.location.state || "n/a" },
                    { label: "Miles", value: `${result.inputs.milesPerYear.toLocaleString()}/yr` },
                    { label: "Scenario", value: form.scenario === "buying" ? "Buying today" : "Operating only" },
                  ]}
                />
              </SectionCard>
              <SectionCard title="How Wattfull calculated this" subtitle="Transparent assumptions and source notes for this run." t={t}>
                <AssumptionPanel result={result} t={t} />
              </SectionCard>
            </>
          ) : (
            <EmptyState t={t} />
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


export default EVCalcPage;
