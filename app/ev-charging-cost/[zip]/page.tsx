import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, electricityRates, vehicles } from "@/lib/db/index";
import { eq, desc } from "drizzle-orm";
import { resolveStateFromZip } from "@/lib/geo";

export const revalidate = 86400;

interface Props { params: Promise<{ zip: string }> }

function trustTone(isApprox: boolean) {
  return isApprox ? { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" } : { bg: "#d1fae5", border: "#10b981", text: "#065f46" };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zip } = await params;
  const state = resolveStateFromZip(zip);
  const title = `EV Charging Cost in ZIP ${zip}${state ? ` (${state})` : ""} - Wattfull`;
  const description = `See the electricity rate and estimated EV charging cost for ZIP code ${zip}. Includes trust labels, assumptions, and model-level charging costs.`;
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
  const { zip } = await params;
  if (!/^\d{5}$/.test(zip)) notFound();

  const state = resolveStateFromZip(zip);

  let rateRow = null;
  const zipRows = await db
    .select()
    .from(electricityRates)
    .where(eq(electricityRates.zip, zip))
    .orderBy(desc(electricityRates.createdAt))
    .limit(1);
  rateRow = zipRows[0] ?? null;

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
  const source = rateRow?.source ?? (state ? "State-level fallback" : "National average fallback");
  const updatedDate = rateRow?.createdAt ? new Date(rateRow.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) : "Not available";
  const isApprox = !rateRow;
  const utility = rateRow?.utility ?? null;
  const annualMiles = 12000;
  const avgEvCostPer100 = (rate / 100) * 30;
  const annualCharging = Math.round((rate / 100) * 3600);
  const costPerMile = avgEvCostPer100 / 100;
  const palette = trustTone(isApprox);

  const topEvs = await db
    .select({ id: vehicles.id, name: vehicles.name, kwhPer100mi: vehicles.kwhPer100mi, msrp: vehicles.msrp, slug: vehicles.slug })
    .from(vehicles)
    .where(eq(vehicles.type, "ev"))
    .limit(10);

  const evCosts = topEvs
    .filter((v) => v.kwhPer100mi)
    .map((v) => {
      const annualKwh = annualMiles * ((v.kwhPer100mi ?? 30) / 100);
      const annualCost = annualKwh * (rate / 100);
      return {
        ...v,
        annualKwh: Math.round(annualKwh),
        annualCost: Math.round(annualCost),
        costPerMile: annualCost / annualMiles,
      };
    })
    .sort((a, b) => a.annualCost - b.annualCost);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>Wattfull</a> &rsaquo; EV Charging Cost &rsaquo; ZIP {zip}
        </div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          EV Charging Cost in ZIP {zip}{state ? ` (${state})` : ""}
        </h1>
        <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7, maxWidth: 820 }}>
          Charging economics for this ZIP, with the rate source, freshness, fallback behavior, and model-specific examples shown explicitly.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Residential electricity rate</div>
              <div style={{ fontSize: 46, fontWeight: 800, color: "#10b981" }}>
                {rate.toFixed(1)}<span style={{ fontSize: 20, fontWeight: 500, color: "#64748b" }}> cents/kWh</span>
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                {utility ? `${utility} | ` : ""}{source}
              </div>
            </div>
            <div style={{ background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "10px 12px", minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{isApprox ? "Estimated" : "Live utility/state dataset"}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Updated: {updatedDate}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{isApprox ? "Using fallback rate because ZIP-level data was not found." : "Using the latest stored row for this ZIP or state."}</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#0f172a", color: "#f8fafc", borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Wattfull verdict</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{rate <= 18 ? "Charging looks favorable" : rate <= 28 ? "Charging is workable, but rate-sensitive" : "High-rate ZIP - validate carefully"}</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "#cbd5e1" }}>
            A typical EV at this rate costs about ${costPerMile.toFixed(2)} per mile to charge at home. The decision usually stays favorable until electricity gets materially higher or most charging shifts to public fast charging.
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {[
          { label: "Average EV cost / 100 miles", value: `$${avgEvCostPer100.toFixed(2)}` },
          { label: "Annual home charging (12k mi)", value: `$${annualCharging.toLocaleString()}` },
          { label: "Cost per mile", value: `$${costPerMile.toFixed(2)}` },
          { label: "Data confidence", value: isApprox ? "Estimated" : "Rate-backed" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </section>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>How we calculated this</div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 12 }}>
          Wattfull assumes {annualMiles.toLocaleString()} miles per year and 100% home charging for this screen. Public charging, winter losses, and time-of-use plans can materially change the result.
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", lineHeight: 1.8, fontSize: 13 }}>
          <li>Rate used: {rate.toFixed(1)} cents/kWh</li>
          <li>Source: {source}{utility ? ` (${utility})` : ""}</li>
          <li>Fallback mode: {isApprox ? "Yes" : "No"}</li>
          <li>Average EV benchmark: 30 kWh / 100 miles</li>
          <li>Use the main EV tool for charging mix, climate, and maintenance assumptions.</li>
        </ul>
      </section>

      {evCosts.length > 0 ? (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Model examples at this rate</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                {['Vehicle', 'Efficiency', 'Annual charging', 'Cost per mile'].map((heading) => (
                  <th key={heading} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600 }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evCosts.map((ev, index) => (
                <tr key={ev.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}><a href={`${siteUrl}/cost-to-own/${ev.slug}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>{ev.name}</a></td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{ev.kwhPer100mi} kWh/100mi</td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>${ev.annualCost.toLocaleString()}/yr</td>
                  <td style={{ padding: '12px', color: '#475569' }}>${ev.costPerMile.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Next best actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <a href={`${siteUrl}/ev`} style={{ textDecoration: 'none', background: '#10b981', color: '#fff', padding: '10px 14px', borderRadius: 10, fontWeight: 700 }}>Run the EV calculator</a>
          <a href={`${siteUrl}/compare`} style={{ textDecoration: 'none', background: '#fff', color: '#0f172a', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 700 }}>Compare ownership paths</a>
          <a href={`${siteUrl}/methodology`} style={{ textDecoration: 'none', background: '#fff', color: '#0f172a', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontWeight: 700 }}>How Wattfull works</a>
        </div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          Users usually follow this page into the full EV tool, then into a vehicle-specific cost-to-own page once they have a shortlist.
        </div>
      </section>
    </div>
  );
}
