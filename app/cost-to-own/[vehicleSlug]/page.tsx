import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, vehicles } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { getTCO } from "@/lib/core/calc";

export const revalidate = 86400;

interface Props { params: Promise<{ vehicleSlug: string }> }

async function getVehicle(slug: string) {
  const rows = await db.select().from(vehicles).where(eq(vehicles.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleSlug } = await params;
  const vehicle = await getVehicle(vehicleSlug);
  if (!vehicle) return { title: "Vehicle not found - Wattfull" };

  const title = `${vehicle.name} Total Cost of Ownership - Wattfull`;
  const description = `See the 5-year cost of owning a ${vehicle.name}: purchase, fuel or charging, maintenance, assumptions, and recommendation context.`;
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
  const { vehicleSlug } = await params;
  const vehicle = await getVehicle(vehicleSlug);
  if (!vehicle) notFound();

  const tco = await getTCO(vehicle.id, { milesPerYear: 12000, ownershipYears: 5 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";
  const isEv = vehicle.type === "ev";
  const others = (await db
    .select({ id: vehicles.id, name: vehicles.name, slug: vehicles.slug, msrp: vehicles.msrp })
    .from(vehicles)
    .where(eq(vehicles.type, vehicle.type))
    .limit(6))
    .filter((entry) => entry.id !== vehicle.id)
    .slice(0, 4);

  const annualFuel = tco ? Math.round(tco.annualFuel) : 0;
  const annualMaint = tco ? Math.round(tco.annualMaint) : 0;
  const total = tco ? Math.round(tco.total) : 0;
  const verdict = tco
    ? total <= (vehicle.msrp ?? 0) + (isEv ? 12000 : 18000)
      ? "Strong candidate for your shortlist"
      : "Worth comparing directly before acting"
    : "Data unavailable";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> &rsaquo; Cost to Own &rsaquo; {vehicle.name}
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          {vehicle.name} Cost to Own
        </h1>
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, maxWidth: 820 }}>
          A decision-grade ownership screen for one vehicle: purchase cost, annual running cost, total cost over five years, and the assumptions behind the recommendation.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { label: "Base MSRP", value: vehicle.msrp ? `$${vehicle.msrp.toLocaleString()}` : "-" },
              { label: "5-year total cost", value: tco ? `$${total.toLocaleString()}` : "-" },
              { label: isEv ? "Annual charging" : "Annual fuel", value: tco ? `$${annualFuel.toLocaleString()}` : "-" },
              { label: "Annual maintenance", value: tco ? `$${annualMaint.toLocaleString()}` : "-" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Wattfull verdict</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{verdict}</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>
            {isEv
              ? "This page is best used as a single-vehicle baseline before you compare that EV against a gas or EV alternative."
              : "Use this baseline to understand the ownership burden before putting it next to an EV or more efficient gas vehicle."}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>Ownership breakdown</div>
        {tco ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                { label: "Purchase price", value: vehicle.msrp ? `$${vehicle.msrp.toLocaleString()}` : "-" },
                { label: `Energy over 5 years (${isEv ? `${tco.rateUsed.toFixed(1)} cents/kWh` : `$${tco.rateUsed.toFixed(2)}/gal`})`, value: `$${Math.round(tco.annualFuel * 5).toLocaleString()}` },
                { label: "Maintenance over 5 years", value: `$${Math.round(tco.annualMaint * 5).toLocaleString()}` },
                { label: "Total 5-year ownership cost", value: `$${total.toLocaleString()}` },
              ].map((row, index) => (
                <tr key={row.label} style={{ borderTop: index === 0 ? "none" : "1px solid #f1f5f9" }}>
                  <td style={{ padding: "13px 0", color: "#475569" }}>{row.label}</td>
                  <td style={{ padding: "13px 0", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: "#94a3b8" }}>Cost data unavailable.</div>
        )}
      </section>

      <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Assumptions and trust notes</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", lineHeight: 1.8, fontSize: 13 }}>
          <li>Annual mileage: 12,000 miles</li>
          <li>Ownership horizon: 5 years</li>
          <li>{isEv ? "EV maintenance benchmark: $800/yr" : "Gas maintenance benchmark: $1,500/yr"}</li>
          <li>{isEv ? `Electricity benchmark: ${tco?.rateUsed?.toFixed(1) ?? "16.0"} cents/kWh` : `Gas benchmark: $${tco?.rateUsed?.toFixed(2) ?? "3.50"}/gal`}</li>
          <li>Insurance, financing, and depreciation are not personalized here yet.</li>
          <li>Use the main compare flow if you want break-even and side-by-side verdicts.</li>
        </ul>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Next best actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <a href={`${siteUrl}/compare`} style={{ textDecoration: "none", background: "#10b981", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>Open full comparison</a>
          <a href={`${siteUrl}/ev`} style={{ textDecoration: "none", background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontWeight: 700 }}>Run EV calculator</a>
          <a href={`${siteUrl}/methodology`} style={{ textDecoration: "none", background: "#fff", color: "#0f172a", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontWeight: 700 }}>Read methodology</a>
        </div>
        {others.length ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {others.map((entry) => (
              <a key={entry.id} href={`${siteUrl}/cost-to-own/${entry.slug}`} style={{ textDecoration: "none", padding: "8px 12px", borderRadius: 999, border: "1px solid #e2e8f0", color: "#0f172a", fontSize: 13 }}>
                {entry.name}
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
