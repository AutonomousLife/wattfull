import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, vehicles } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { calculateComparison } from "@/lib/core/calc";

export const revalidate = 86400; // 24 hours

interface Props { params: { zip: string; comparison: string } }

const ZIP3_STATE: Record<string, string> = {
  "941": "CA", "900": "CA", "100": "NY", "600": "IL", "770": "TX",
  "331": "FL", "480": "MI", "550": "MN", "800": "CO", "020": "MA",
  "190": "PA", "301": "GA", "700": "LA", "850": "AZ", "971": "OR",
  "980": "WA",
};
function inferState(zip: string): string | undefined {
  return ZIP3_STATE[zip.substring(0, 3)];
}

async function resolveVehicles(comparison: string) {
  // Format: "tesla-model-3-long-range-vs-toyota-camry"
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
  const { zip, comparison } = params;
  const result = await resolveVehicles(comparison);
  if (!result?.v1 || !result?.v2) return { title: "Comparison not found — Wattfull" };

  const title = `${result.v1.name} vs ${result.v2.name} in ZIP ${zip} — Wattfull`;
  const description = `5-year cost comparison: ${result.v1.name} vs ${result.v2.name} for ZIP ${zip}. Real rates from EIA. All assumptions shown.`;
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
  const { zip, comparison } = params;

  if (!/^\d{5}$/.test(zip)) notFound();

  const resolved = await resolveVehicles(comparison);
  if (!resolved?.v1 || !resolved?.v2) notFound();

  const { v1, v2 } = resolved;
  const state = inferState(zip);

  let calcResult = null;
  let calcError = null;
  try {
    // Determine which is EV and which is ICE for calc input
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
      } as any);
    }
  } catch (e) {
    calcError = String(e);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${v1.name} vs ${v2.name} in ZIP ${zip}`,
    description: `Cost comparison for ZIP ${zip}: ${v1.name} vs ${v2.name} over 5 years.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: v1.name },
        { "@type": "ListItem", position: 2, name: v2.name },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> › EV vs Gas › ZIP {zip}
        </div>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          {v1.name} vs {v2.name}
        </h1>
        <p style={{ fontSize: 15, color: "#475569" }}>
          5-year total cost comparison for ZIP {zip}{state ? ` (${state})` : ""}. Using {calcResult?.confidenceLevel === "high" ? "ZIP-level" : calcResult?.confidenceLevel === "medium" ? "state-level" : "national average"} energy rates.
        </p>
      </div>

      {calcResult ? (
        <>
          {/* Score Banner */}
          <div style={{
            background: calcResult.totalCostEv < calcResult.totalCostIce ? "#ecfdf5" : "#f8fafc",
            border: `2px solid ${calcResult.totalCostEv < calcResult.totalCostIce ? "#10b981" : "#e2e8f0"}`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>5-Year Total Savings</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#10b981" }}>
              ${Math.abs(calcResult.totalCostIce - calcResult.totalCostEv).toLocaleString()}
            </div>
            <div style={{ fontSize: 15, color: "#475569", marginTop: 8 }}>{calcResult.verdict}</div>
          </div>

          {/* Side-by-side cost table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              { v: v1, total: v1.type === "ev" ? calcResult.totalCostEv : calcResult.totalCostIce, isWinner: v1.type === "ev" ? calcResult.totalCostEv < calcResult.totalCostIce : calcResult.totalCostIce < calcResult.totalCostEv },
              { v: v2, total: v2.type === "ev" ? calcResult.totalCostEv : calcResult.totalCostIce, isWinner: v2.type === "ev" ? calcResult.totalCostEv < calcResult.totalCostIce : calcResult.totalCostIce < calcResult.totalCostEv },
            ].map(({ v, total, isWinner }) => (
              <div
                key={v.id}
                style={{
                  background: isWinner ? "#ecfdf5" : "#fff",
                  border: `2px solid ${isWinner ? "#10b981" : "#e2e8f0"}`,
                  borderRadius: 14,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                {isWinner && <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 8, letterSpacing: 1 }}>✓ LOWER COST</div>}
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 8 }}>{v.name}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: isWinner ? "#10b981" : "#0f172a" }}>
                  ${total.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>5-year total cost</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                  MSRP: ${v.msrp?.toLocaleString() ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Rates Used */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Rates Used for ZIP {zip}</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14 }}>
              <div>⚡ Electricity: <strong>{calcResult.ratesUsed.electricityCentsPerKwh}¢/kWh</strong></div>
              <div>⛽ Gas: <strong>${calcResult.ratesUsed.gasDollarsPerGallon}/gal</strong></div>
              <div>Confidence: <strong style={{ color: calcResult.confidenceLevel === "high" ? "#10b981" : calcResult.confidenceLevel === "medium" ? "#f59e0b" : "#94a3b8" }}>
                {calcResult.confidenceLevel}
              </strong></div>
            </div>
          </div>

          {/* Incentives */}
          {calcResult.incentiveLineItems.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13 }}>
              <strong style={{ color: "#92400e" }}>Incentives (not applied to totals)</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {calcResult.incentiveLineItems.map((item: any, i: number) => (
                  <li key={i} style={{ color: "#78350f", marginBottom: 4 }}>
                    {item.label}: {item.amount > 0 ? `up to $${item.amount.toLocaleString()}` : "N/A"} — {item.eligibilityFlag || "included"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, fontSize: 13, color: "#64748b" }}>
            <strong style={{ color: "#0f172a" }}>Assumptions Used</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
              {calcResult.assumptionsUsed.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
            <div style={{ marginTop: 8, color: "#94a3b8" }}>Sources: {calcResult.sources.join(", ")}</div>
          </div>
        </>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#94a3b8" }}>
            {calcError ? "Calculation unavailable — one or both vehicles may be ICE-only (EV vs ICE comparison requires one of each)." : "Loading comparison data..."}
          </p>
          <a href="/" style={{ color: "#10b981", marginTop: 12, display: "inline-block" }}>Use the full comparison tool →</a>
        </div>
      )}

      {/* Internal links */}
      <div style={{ marginTop: 32, fontSize: 13, color: "#94a3b8" }}>
        <div style={{ marginBottom: 8 }}>Also compare:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <a href={`${siteUrl}/cost-to-own/${v1.slug}`} style={{ color: "#10b981", textDecoration: "none" }}>{v1.name} cost to own</a>
          <span>·</span>
          <a href={`${siteUrl}/cost-to-own/${v2.slug}`} style={{ color: "#10b981", textDecoration: "none" }}>{v2.name} cost to own</a>
          <span>·</span>
          <a href={`${siteUrl}/ev-charging-cost/${zip}`} style={{ color: "#10b981", textDecoration: "none" }}>Charging costs in ZIP {zip}</a>
        </div>
      </div>
    </>
  );
}
