import Link from "next/link";
import { notFound } from "next/navigation";
import { STATE_DATA } from "@/lib/data";
import { VerdictPanel, TrustStrip, AssumptionGrid } from "@/components/ui";

type StateDatum = (typeof STATE_DATA)[keyof typeof STATE_DATA];
type TrustItem = { label: string; value: string; note?: string; tone?: "positive" | "caution" | "neutral" | "low" };
type AssumptionItem = { label: string; value: string; note?: string };
type VerdictProps = {
  label: string;
  tone: "favorable" | "marginal" | "lowConfidence";
  summary: string;
  reasons: string[];
  caveats: string[];
  changes: string[];
  confidence: string;
  nextAction: string;
};

const LABELS = {
  al: "AL", ak: "AK", az: "AZ", ar: "AR", ca: "CA", co: "CO", ct: "CT", de: "DE", fl: "FL", ga: "GA", hi: "HI", id: "ID", il: "IL", in: "IN", ia: "IA", ks: "KS", ky: "KY", la: "LA", me: "ME", md: "MD", ma: "MA", mi: "MI", mn: "MN", ms: "MS", mo: "MO", mt: "MT", ne: "NE", nv: "NV", nh: "NH", nj: "NJ", nm: "NM", ny: "NY", nc: "NC", nd: "ND", oh: "OH", ok: "OK", or: "OR", pa: "PA", ri: "RI", sc: "SC", sd: "SD", tn: "TN", tx: "TX", ut: "UT", vt: "VT", va: "VA", wa: "WA", wv: "WV", wi: "WI", wy: "WY"
} as const;

function scoreState(data: StateDatum) {
  return Math.max(0, Math.min(100, Math.round(data.gc + (data.ec > 0 ? 18 : 0) + (data.sc > 0 ? 10 : 0) + (data.nm === "full" ? 14 : data.nm === "partial" ? 7 : 0))));
}

function annualEvSavings(data: StateDatum) {
  const annualMiles = 12000;
  const gasAnnual = (annualMiles / 30) * data.g;
  const evAnnual = annualMiles * 0.27 * (data.e / 100);
  return Math.round(gasAnnual - evAnnual);
}

function solarSignal(data: StateDatum) {
  return data.s >= 5.5 ? "Strong" : data.s >= 4.5 ? "Moderate" : "Mixed";
}

export async function generateStaticParams() {
  return Object.keys(STATE_DATA).map((abbr) => ({ state: abbr.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateParam } = await params;
  const state = LABELS[stateParam as keyof typeof LABELS];
  if (!state || !STATE_DATA[state]) return { title: "State not found - Wattfull" };
  return {
    title: `${state} Energy Economics - Wattfull`,
    description: `State-specific EV, solar, and energy-context summary for ${state}. Includes electricity, gas, incentives, and recommendation context.`,
  };
}

export default async function StateDetailPage({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateParam } = await params;
  const state = LABELS[stateParam as keyof typeof LABELS];
  if (!state || !STATE_DATA[state]) notFound();

  const data = STATE_DATA[state];
  const score = scoreState(data);
  const savings = annualEvSavings(data);
  const trustItems: TrustItem[] = [
    { label: "Rates", value: "Estimated state seed", note: "Directional, not utility-bill precision.", tone: "neutral" },
    { label: "Policy", value: data.ec ? "Incentive present" : "No EV credit", note: "Policy timing can change quickly.", tone: data.ec ? "positive" : "caution" },
    { label: "Solar", value: `${solarSignal(data)} potential`, note: "Static state benchmark.", tone: data.s >= 5.5 ? "positive" : "neutral" },
  ];
  const assumptionItems: AssumptionItem[] = [
    { label: "Electricity", value: `${data.e.toFixed(2)} cents/kWh` },
    { label: "Gas", value: `$${data.g.toFixed(2)}/gal` },
    { label: "Solar hours", value: `${data.s.toFixed(1)} / day` },
    { label: "Climate zone", value: data.z },
    { label: "Grid renewables", value: `${data.gc}%` },
    { label: "Net metering", value: data.nm },
  ];
  const verdictProps: VerdictProps = {
    label: score >= 68 ? `${state} is a strong candidate for EV-first analysis` : score >= 46 ? `${state} is viable but assumption-sensitive` : `${state} needs a stronger personalized case`,
    tone: score >= 68 ? "favorable" : score >= 46 ? "marginal" : "lowConfidence",
    summary: score >= 68
      ? "This state has enough support on rates, policy, or grid context to justify a serious EV and solar evaluation."
      : score >= 46
      ? "The state backdrop is neither weak nor decisive. Your actual utility, mileage, and charging setup matter more than the headline score."
      : "This state context is mixed enough that you should rely on the calculators with your exact assumptions before making a purchase decision.",
    reasons: [
      `Electricity is about ${data.e.toFixed(2)} cents/kWh and gas is about $${data.g.toFixed(2)}/gal.`,
      data.ec ? `The state EV incentive snapshot includes about $${data.ec.toLocaleString()} of support.` : "There is no meaningful state EV incentive in this seed layer.",
      data.nm === "full" ? "Net metering remains supportive for solar-oriented households." : "Net metering is limited, which can weaken solar ROI.",
    ],
    caveats: [
      data.z === "cold" ? "Cold climate pressure matters more for EV range and winter charging." : "Climate pressure is moderate, but still not zero.",
      "This page is state-level context, not a utility-specific or roof-specific quote.",
    ],
    changes: [
      "Higher annual miles usually improve EV economics faster than the state score suggests.",
      "A utility rate materially above the state average can weaken the result.",
      "Policy updates can move the recommendation quickly.",
    ],
    confidence: "Estimated state layer",
    nextAction: "Next best action: run EV or Solar with your ZIP and household assumptions.",
  };

  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b" }}>State detail</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, lineHeight: 1.05, margin: "4px 0 0" }}>{state} Energy Economics</h1>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>Estimated state context | refresh before purchase</div>
      </div>

      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <TrustStrip {...({ title: "State detail trust layer", items: trustItems } as any)} />
      </div>

      <VerdictPanel {...(verdictProps as any)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
        <AssumptionGrid
          {...({ title: "State assumptions", items: assumptionItems } as any)}
          footer="These values are designed for screening and cross-state comparison, not final purchase-grade underwriting."
        />

        <div style={{ background: "#fff", border: "1px solid rgba(148,163,184,.18)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Recommended next actions</div>
          <div style={{ display: "grid", gap: 10 }}>
            <Link href="/ev" style={{ textDecoration: "none", padding: "12px 14px", borderRadius: 12, background: "#d1fae5", color: "#065f46", fontWeight: 700 }}>Run EV calculator</Link>
            <Link href="/solar" style={{ textDecoration: "none", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(148,163,184,.18)", color: "inherit" }}>Check solar ROI</Link>
            <Link href="/compare" style={{ textDecoration: "none", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(148,163,184,.18)", color: "inherit" }}>Compare ownership paths</Link>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, marginTop: 14 }}>
            Estimated EV operating savings in this state context: <b style={{ color: "inherit" }}>{savings >= 0 ? "+" : "-"}${Math.abs(savings).toLocaleString()}/yr</b> using a 12k-mile, 30 MPG baseline.
          </div>
        </div>
      </div>
    </div>
  );
}
