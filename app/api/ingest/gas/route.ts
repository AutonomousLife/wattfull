import { NextRequest, NextResponse } from "next/server";
import { db, gasPrices, dataStatus } from "@/lib/db/index";
import { eq } from "drizzle-orm";

/**
 * GET /api/ingest/gas
 * Called by Vercel Cron (daily, 6am UTC).
 * Auth: Authorization: Bearer ${CRON_SECRET}
 *
 * Fetches EIA weekly retail gasoline prices by PADD region,
 * maps to states, upserts gas_prices table.
 */

// EIA PADD region → US states mapping
const PADD_STATES: Record<string, string[]> = {
  "PADD1A": ["CT", "ME", "MA", "NH", "RI", "VT"],
  "PADD1B": ["DE", "MD", "NJ", "NY", "PA"],
  "PADD1C": ["FL", "GA", "NC", "SC", "VA", "WV"],
  "PADD2":  ["IL", "IN", "IA", "KS", "KY", "MI", "MN", "MO", "NE", "ND", "OH", "OK", "SD", "TN", "WI"],
  "PADD3":  ["AL", "AR", "LA", "MS", "NM", "TX"],
  "PADD4":  ["CO", "ID", "MT", "UT", "WY"],
  "PADD5":  ["AK", "AZ", "CA", "HI", "NV", "OR", "WA"],
};

export async function GET(req: NextRequest) {
  // ── Auth ──
  const cronSecret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = "gas_prices";
  const sourceUrl = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";
  const now = new Date();

  await db
    .insert(dataStatus)
    .values({ datasetName: dataset, lastAttemptAt: now, lastSourceUrl: sourceUrl })
    .onConflictDoUpdate({
      target: dataStatus.datasetName,
      set: { lastAttemptAt: now, lastSourceUrl: sourceUrl },
    });

  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    const msg = "EIA_API_KEY not set — skipping ingest, existing data preserved";
    await db
      .update(dataStatus)
      .set({ lastError: msg })
      .where(eq(dataStatus.datasetName, dataset));
    return NextResponse.json({ ok: false, message: msg });
  }

  try {
    // EIA v2: weekly retail regular gasoline prices by PADD
    const params = new URLSearchParams({
      api_key: apiKey,
      frequency: "weekly",
      "data[]": "value",
      "facets[process][]": "EPM0", // regular gasoline
      "sort[0][column]": "period",
      "sort[0][direction]": "desc",
      length: "15",
    });
    const res = await fetch(`${sourceUrl}?${params}`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`EIA gas responded ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const rows: Array<{ duoarea: string; period: string; value: number }> =
      json?.response?.data ?? [];

    if (!rows.length) throw new Error("EIA gas returned empty data array");

    // Latest price per PADD region
    const latestByRegion = new Map<string, { period: string; price: number }>();
    for (const row of rows) {
      if (!row.duoarea || row.value == null) continue;
      const region = row.duoarea.toUpperCase();
      const existing = latestByRegion.get(region);
      if (!existing || row.period > existing.period) {
        latestByRegion.set(region, { period: row.period, price: row.value });
      }
    }

    let upsertCount = 0;
    for (const [region, { period, price }] of latestByRegion) {
      const states = PADD_STATES[region];
      if (!states) continue;
      for (const state of states) {
        await db
          .insert(gasPrices)
          .values({
            state,
            region,
            dollarsPerGallon: price,
            grade: "regular",
            effectiveDate: period,
            source: "EIA API v2",
          })
          .onConflictDoNothing();
        upsertCount++;
      }
    }

    await db
      .update(dataStatus)
      .set({ lastSuccessAt: now, lastError: null, rowCount: upsertCount })
      .where(eq(dataStatus.datasetName, dataset));

    return NextResponse.json({ ok: true, upserted: upsertCount });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    await db
      .update(dataStatus)
      .set({ lastError: msg.slice(0, 500) })
      .where(eq(dataStatus.datasetName, dataset));
    return NextResponse.json({ ok: false, error: msg.slice(0, 200) });
  }
}
