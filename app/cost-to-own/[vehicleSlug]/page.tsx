import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, vehicles, incentives } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getTCO } from "@/lib/core/calc";

export const revalidate = 86400; // 24 hours

interface Props { params: { vehicleSlug: string } }

async function getVehicle(slug: string) {
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicle(params.vehicleSlug);
  if (!vehicle) return { title: "Vehicle not found — Wattfull" };

  const title = `${vehicle.name} Total Cost of Ownership — Wattfull`;
  const description = `See the full 5-year cost of owning a ${vehicle.name}: purchase price, fuel, maintenance, and incentives. Data-driven, with all assumptions shown.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com"}/cost-to-own/${vehicle.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Wattfull" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CostToOwnPage({ params }: Props) {
  const vehicle = await getVehicle(params.vehicleSlug);
  if (!vehicle) notFound();

  const tco = await getTCO(vehicle.id, { milesPerYear: 12000, ownershipYears: 5 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";
  const isEv = vehicle.type === "ev";

  // Get similar vehicles for internal links
  const similar = await db
    .select({ id: vehicles.id, name: vehicles.name, slug: vehicles.slug, msrp: vehicles.msrp })
    .from(vehicles)
    .where(eq(vehicles.type, vehicle.type))
    .limit(6);
  const others = similar.filter((v) => v.id !== vehicle.id).slice(0, 4);

  // Federal incentive info
  let federalCredit = null;
  if (isEv && vehicle.federalCredit && vehicle.federalCredit > 0) {
    federalCredit = vehicle.federalCredit;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    description: `${vehicle.name} — ${isEv ? `${vehicle.kwhPer100mi} kWh/100mi EV` : `${vehicle.mpgCombined} MPG ICE`}`,
    offers: vehicle.msrp ? {
      "@type": "Offer",
      price: vehicle.msrp,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> › Cost to Own › {vehicle.name}
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          {vehicle.name} — Total Cost of Ownership
        </h1>
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7 }}>
          5-year ownership cost breakdown: MSRP, fuel, maintenance, and incentives.
          All assumptions are shown explicitly — no hidden optimism.
        </p>
      </div>

      {/* Key Numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Base MSRP", value: vehicle.msrp ? `$${vehicle.msrp.toLocaleString()}` : "—", highlight: false },
          { label: "5-Year Total Cost", value: tco ? `$${tco.total.toLocaleString()}` : "—", highlight: true },
          { label: "Annual Fuel Cost", value: tco ? `$${Math.round(tco.annualFuel).toLocaleString()}` : "—", highlight: false },
          {
            label: isEv ? "Efficiency" : "Fuel Economy",
            value: isEv ? `${vehicle.kwhPer100mi} kWh/100mi` : `${vehicle.mpgCombined} MPG`,
            highlight: false,
          },
        ].map((s) => (
          <div key={s.label} style={{ background: s.highlight ? "#ecfdf5" : "#fff", border: `1px solid ${s.highlight ? "#a7f3d0" : "#e2e8f0"}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.highlight ? "#10b981" : "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>5-Year Cost Breakdown</h2>
        {tco ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                { label: "Purchase Price (MSRP)", value: `$${vehicle.msrp?.toLocaleString() ?? "—"}` },
                { label: `Fuel over 5 years (${isEv ? `${tco.rateUsed.toFixed(1)}¢/kWh` : `$${tco.rateUsed.toFixed(2)}/gal`})`, value: `$${Math.round(tco.annualFuel * 5).toLocaleString()}` },
                { label: "Maintenance over 5 years", value: `$${Math.round(tco.annualMaint * 5).toLocaleString()}` },
                {
                  label: federalCredit ? `Federal EV Credit (up to — verify eligibility)` : null,
                  value: federalCredit ? `−$${federalCredit.toLocaleString()} (not applied)` : null,
                  note: true,
                },
                { label: "Total 5-Year Cost of Ownership", value: `$${tco.total.toLocaleString()}`, bold: true },
              ].filter((r) => r.label !== null).map((row) => (
                <tr key={row.label} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 0", color: row.note ? "#f59e0b" : "#475569", fontSize: row.bold ? 15 : 14, fontWeight: row.bold ? 700 : 400 }}>
                    {row.label}
                    {row.note && <span style={{ fontSize: 11, marginLeft: 6, color: "#94a3b8" }}>(eligibility requires verification)</span>}
                  </td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontWeight: row.bold ? 800 : 500, color: row.bold ? "#10b981" : "#0f172a", fontSize: row.bold ? 18 : 14 }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#94a3b8" }}>Cost data unavailable</p>
        )}
      </div>

      {/* Incentives Note */}
      {isEv && federalCredit && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: "#92400e" }}>
          <strong>Federal EV Tax Credit:</strong> The {vehicle.name} may be eligible for up to ${federalCredit.toLocaleString()} under IRA §30D.
          This credit is <strong>not included</strong> in the totals above because eligibility depends on your income, MSRP, and vehicle final assembly location.
          Consult a tax professional to determine if you qualify.
        </div>
      )}

      {/* Compare Link */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 28, textAlign: "center" }}>
        <p style={{ color: "#475569", marginBottom: 12 }}>
          Want to compare the {vehicle.name} against a specific vehicle?
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#10b981",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ⚡ Open Full Comparison Tool →
        </a>
      </div>

      {/* Internal Links */}
      {others.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
            Compare Other {isEv ? "EVs" : "Gas Vehicles"}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {others.map((v) => (
              <a
                key={v.id}
                href={`${siteUrl}/cost-to-own/${v.slug}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {v.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions */}
      <div style={{ marginTop: 32, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, fontSize: 13, color: "#64748b" }}>
        <strong style={{ color: "#0f172a" }}>Assumptions</strong>
        <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Annual mileage: 12,000 miles</li>
          <li>Ownership period: 5 years</li>
          <li>{isEv ? "EV maintenance: $800/yr (national avg)" : "ICE maintenance: $1,500/yr (national avg)"}</li>
          <li>{isEv ? `Electricity rate: ${tco?.rateUsed.toFixed(1) ?? "16.0"}¢/kWh (state avg or national fallback)` : `Gas price: $${tco?.rateUsed.toFixed(2) ?? "3.50"}/gal (state avg or national fallback)`}</li>
          <li>No climate adjustment applied</li>
          <li>Federal/state incentives NOT included in totals (eligibility unverified)</li>
          <li>Source: Wattfull vehicle database, EIA.gov</li>
        </ul>
      </div>
    </>
  );
}
