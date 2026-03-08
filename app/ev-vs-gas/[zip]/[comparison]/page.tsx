import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, vehicles } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { calculateComparison } from "@/lib/core/calc";
import { resolveStateFromZip } from "@/lib/geo";

export const revalidate = 86400;

interface Props { params: Promise<{ zip: string; comparison: string }> }

async function resolveVehicles(comparison: string) {
  const parts = comparison.split("-vs-");
  if (parts.length !== 2) return null;
  const [slug1, slug2] = parts;

  const [v1Rows, v2Rows] = await Promise.all([
    db.select().from(vehicles).where(eq(vehicles.slug, slug1)).limit(1),
    db.select().from(vehicles).where(eq(vehicles.slug, slug2)).limit(1),
  ]);

  return { v1: v1Rows[0], v2: v2Rows[0] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zip, comparison } = await params;
  const result = await resolveVehicles(comparison);
  if (!result?.v1 || !result?.v2) return { title: "Comparison not found - Wattfull" };

  const title = `${result.v1.name} vs ${result.v2.name} in ZIP ${zip} - Wattfull`;
  const description = `5-year cost comparison for ${result.v1.name} and ${result.v2.name} in ZIP ${zip}. Includes rates, assumptions, and verdict context.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com"}/ev-vs-gas/${zip}/${comparison}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Wattfull" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EvVsGasPage({ params }: Props) {
  const { zip, comparison } = await params;
  if (!/^\d{5}$/.test(zip)) notFound();

  const resolved = await resolveVehicles(comparison);
  if (!resolved?.v1 || !resolved?.v2) notFound();

  const { v1, v2 } = resolved;
  const state = resolveStateFromZip(zip) ?? undefined;

  let calcResult = null;
  let calcError = null;
  try {
    const ev = v1.type === "ev" ? v1 : v2.type === "ev" ? v2 : null;
    const ice = v1.type === "ice" ? v1 : v2.type === "ice" ? v2 : null;
    if (ev && ice) {
      calcResult = await calculateComparison({
        zip,
        state,
        evId: ev.id,
        iceId: ice.id,
        milesPerYear: 12000,
        ownershipYears: 5,
      });
    }
  } catch (error) {
    calcError = String(error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> &rsaquo; EV vs Gas &rsaquo; ZIP {zip}
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          {v1.name} vs {v2.name}
        </h1>
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, maxWidth: 820 }}>
          Programmatic ownership comparison for ZIP {zip}{state ? ` (${state})` : ""}. This page uses the canonical Wattfull calculator engine rather than separate SEO-only math.
        </p>
      </section>

      {calcResult ? (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
            <div style={{ background: calcResult.totalCostEv < calcResult.totalCostIce ? "#ecfdf5" : "#fff7ed", border: `2px solid ${calcResult.totalCostEv < calcResult.totalCostIce ? "#10b981" : "#f59e0b"}`, borderRadius: 16, padding: 26 }}>
              <div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>Wattfull verdict</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: calcResult.totalCostEv < calcResult.totalCostIce ? "#10b981" : "#b45309", marginBottom: 8 }}>
                ${Math.abs(calcResult.totalCostIce - calcResult.totalCostEv).toLocaleString()} over 5 years
              </div>
              <div style={{ fontSize: 15, color: "#475569", lineHeight: 1.7 }}>{calcResult.verdict}</div>
            </div>

            <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Trust and freshness</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>
                Electricity: {calcResult.ratesUsed.electricityCentsPerKwh} cents/kWh<br />
                Gas: ${calcResult.ratesUsed.gasDollarsPerGallon}/gal<br />
                Confidence: {calcResult.confidenceLevel}<br />
                Sources: {calcResult.sources.join(", ")}
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { v: v1, total: v1.type === "ev" ? calcResult.totalCostEv : calcResult.totalCostIce, winner: v1.type === "ev" ? calcResult.totalCostEv < calcResult.totalCostIce : calcResult.totalCostIce < calcResult.totalCostEv },
              { v: v2, total: v2.type === "ev" ? calcResult.totalCostEv : calcResult.totalCostIce, winner: v2.type === "ev" ? calcResult.totalCostEv < calcResult.totalCostIce : calcResult.totalCostIce < calcResult.totalCostEv },
            ].map(({ v, total, winner }) => (
              <div key={v.id} style={{ background: "#fff", border: `2px solid ${winner ? "#10b981" : "#e2e8f0"}`, borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: winner ? "#10b981" : "#94a3b8", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>{winner ? "Lower cost path" : "Comparison path"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{v.name}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: winner ? "#10b981" : "#0f172a", marginTop: 8 }}>${total.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>5-year ownership cost</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>MSRP: ${v.msrp?.toLocaleString() ?? "-"}</div>
              </div>
            ))}
          </section>

          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>What drives the result</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", lineHeight: 1.8, fontSize: 13 }}>
              {calcResult.assumptionsUsed.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
            {calcResult.incentiveLineItems.length ? (
              <div style={{ marginTop: 14, fontSize: 13, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 14 }}>
                Incentive context: {calcResult.incentiveLineItems.map((item: any) => `${item.label} (${item.amount > 0 ? `up to $${item.amount.toLocaleString()}` : "N/A"})`).join(", ")}
              </div>
            ) : null}
          </section>

          <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Next best actions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <a href={`${siteUrl}/compare`} style={{ textDecoration: "none", background: "#10b981", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>Open interactive compare</a>
              <a href={`${siteUrl}/cost-to-own/${v1.slug}`} style={{ textDecoration: "none", background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontWeight: 700 }}>{v1.name} cost to own</a>
              <a href={`${siteUrl}/cost-to-own/${v2.slug}`} style={{ textDecoration: "none", background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontWeight: 700 }}>{v2.name} cost to own</a>
              <a href={`${siteUrl}/ev-charging-cost/${zip}`} style={{ textDecoration: "none", background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontWeight: 700 }}>Charging cost in {zip}</a>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
              This page is useful for discovery and search, but the interactive compare tool is still the best place to change mileage, rates, and ownership assumptions live.
            </div>
          </section>
        </>
      ) : (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ color: "#94a3b8", marginBottom: 12 }}>{calcError ? "Comparison unavailable for this pairing." : "Loading comparison data..."}</div>
          <a href={`${siteUrl}/compare`} style={{ color: "#10b981", textDecoration: "none", fontWeight: 700 }}>Use the full comparison tool</a>
        </section>
      )}
    </div>
  );
}
