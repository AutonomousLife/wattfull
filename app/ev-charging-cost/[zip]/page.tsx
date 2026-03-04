import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, electricityRates, dataStatus, vehicles } from "@/lib/db/index";
import { eq, desc } from "drizzle-orm";

export const revalidate = 86400; // 24 hours

// Zip prefix → state (simplified; full map in lib/data/zipToState.js)
const ZIP3_STATE: Record<string, string> = {
  "941": "CA", "900": "CA", "945": "CA", "946": "CA", "948": "CA",
  "100": "NY", "104": "NY", "110": "NY", "112": "NY",
  "600": "IL", "606": "IL",
  "770": "TX", "787": "TX", "750": "TX",
  "331": "FL", "320": "FL", "346": "FL",
  "480": "MI", "550": "MN",
  "800": "CO", "802": "CO",
  "020": "MA", "021": "MA", "022": "MA",
  "190": "PA", "191": "PA",
  "301": "GA", "303": "GA",
  "700": "LA", "701": "LA",
  "850": "AZ", "852": "AZ",
  "971": "OR", "972": "OR",
  "980": "WA", "981": "WA", "982": "WA",
};

function inferState(zip: string): string | null {
  return ZIP3_STATE[zip.substring(0, 3)] ?? null;
}

interface Props { params: { zip: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zip } = params;
  const state = inferState(zip);
  const title = `EV Charging Cost in ZIP ${zip}${state ? ` (${state})` : ""} — Wattfull`;
  const description = `See the exact electricity rate and EV charging cost for ZIP code ${zip}. Updated weekly from EIA data.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com"}/ev-charging-cost/${zip}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Wattfull" },
    twitter: { card: "summary", title, description },
  };
}

export default async function EVChargingCostPage({ params }: Props) {
  const { zip } = params;
  if (!/^\d{5}$/.test(zip)) notFound();

  const state = inferState(zip);

  // Get electricity rate — zip level → state level → null
  let rateRow = null;
  if (zip) {
    const zipRows = await db
      .select()
      .from(electricityRates)
      .where(eq(electricityRates.zip, zip))
      .orderBy(desc(electricityRates.createdAt))
      .limit(1);
    rateRow = zipRows[0] ?? null;
  }
  if (!rateRow && state) {
    const stateRows = await db
      .select()
      .from(electricityRates)
      .where(eq(electricityRates.state, state))
      .orderBy(desc(electricityRates.createdAt))
      .limit(1);
    rateRow = stateRows[0] ?? null;
  }

  const rate = rateRow?.centsPerkwh ?? 16.0;
  const source = rateRow ? (rateRow.source ?? "EIA") : "National average fallback";
  const updatedDate = rateRow?.createdAt ? new Date(rateRow.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) : "Not available";
  const isApprox = !rateRow;

  // Calculate charging costs for common EVs
  const topEvs = await db
    .select({ id: vehicles.id, name: vehicles.name, kwhPer100mi: vehicles.kwhPer100mi, msrp: vehicles.msrp, slug: vehicles.slug })
    .from(vehicles)
    .where(eq(vehicles.type, "ev"))
    .limit(10);

  const annualMiles = 12000;
  const evCosts = topEvs
    .filter((v) => v.kwhPer100mi)
    .map((v) => {
      const kwhPerMile = (v.kwhPer100mi! / 100);
      const annualKwh = annualMiles * kwhPerMile;
      const annualCost = annualKwh * (rate / 100);
      const costPerMile = annualCost / annualMiles;
      return { ...v, annualKwh: Math.round(annualKwh), annualCost: Math.round(annualCost), costPerMile };
    })
    .sort((a, b) => a.annualCost - b.annualCost);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the electricity rate for ZIP code ${zip}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The residential electricity rate for ZIP ${zip}${state ? ` (${state})` : ""} is approximately ${rate.toFixed(1)} cents per kWh${isApprox ? " (national average)" : ""}, sourced from ${source}.`,
        },
      },
      {
        "@type": "Question",
        name: `How much does it cost to charge an EV in ZIP ${zip}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `At ${rate.toFixed(1)}¢/kWh, charging a typical EV (30 kWh/100mi) costs approximately $${((rate / 100) * 0.30).toFixed(2)} per mile, or about $${Math.round(annualMiles * 0.30 * (rate / 100))}/year for ${annualMiles.toLocaleString()} miles.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> › EV Charging Cost › ZIP {zip}
        </div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          EV Charging Cost — ZIP {zip}{state ? ` (${state})` : ""}
        </h1>
        <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
          Residential electricity rate and estimated EV charging costs for ZIP code {zip}.{" "}
          {isApprox ? "Showing national average (ZIP-specific data not yet available)." : `Data from ${source}.`}
        </p>
      </div>

      {/* Rate Card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Residential Electricity Rate</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#10b981" }}>{rate.toFixed(1)}¢<span style={{ fontSize: 20, fontWeight: 400, color: "#94a3b8" }}>/kWh</span></div>
            {isApprox && <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>⚠ Using national average (ZIP data not available)</div>}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "right" }}>
            <div>Source: {source}</div>
            <div>Updated: {updatedDate}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Cost per kWh", value: `${rate.toFixed(1)}¢` },
          { label: "Cost per 100 miles (avg EV)", value: `$${((rate / 100) * 30).toFixed(2)}` },
          { label: "Monthly charging (1,000 mi)", value: `$${Math.round((rate / 100) * 300)}` },
          { label: "Annual charging (12k mi)", value: `$${Math.round((rate / 100) * 3600)}` },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* EV Comparison Table */}
      {evCosts.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
            Annual Charging Cost by EV Model at {rate.toFixed(1)}¢/kWh
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {["Vehicle", "Efficiency", "Annual kWh", "Annual Cost", "Cost/Mile"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evCosts.map((ev, i) => (
                <tr key={ev.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                    <a href={`${siteUrl}/cost-to-own/${ev.slug}`} style={{ color: "#0f172a", textDecoration: "none" }}>
                      {ev.name}
                    </a>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>{ev.kwhPer100mi} kWh/100mi</td>
                  <td style={{ padding: "10px 12px" }}>{ev.annualKwh.toLocaleString()} kWh</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10b981" }}>${ev.annualCost.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>${ev.costPerMile.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assumptions */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
        <strong style={{ color: "#0f172a" }}>Assumptions & Sources</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>Annual mileage: {annualMiles.toLocaleString()} miles</li>
          <li>Charging assumed 100% at home at residential rate</li>
          <li>Electricity rate: {isApprox ? "National average from EIA" : `${source} — data from ${updatedDate}`}</li>
          <li>EV efficiency from EPA / manufacturer data, no climate adjustment applied</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          For a full comparison including gas vehicles, maintenance, and incentives, use the{" "}
          <a href="/" style={{ color: "#10b981" }}>Wattfull EV Calculator</a>.
        </div>
      </div>
    </>
  );
}
