import { NextRequest, NextResponse } from "next/server";
import { db, electricityRates, dataStatus } from "@/lib/db/index";
import { eq } from "drizzle-orm";

/**
 * GET /api/ingest/electricity
 * Called by Vercel Cron (weekly, Monday 6am UTC).
 * Auth: Authorization: Bearer ${CRON_SECRET}
 *
 * Fetches EIA API v2 residential electricity prices by state,
 * upserts into electricity_rates table, updates data_status.
 */
export async function GET(req: NextRequest) {
  // ── Auth ──
  const cronSecret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = "electricity_rates";
  const sourceUrl = "https://api.eia.gov/v2/electricity/retail-sales/data/";
  const now = new Date();

  // Update last_attempt
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
    // EIA v2: residential electricity prices by state (monthly, most recent)
    const params = new URLSearchParams({
      api_key: apiKey,
      frequency: "monthly",
      "data[]": "price",
      "facets[sectorName][]": "residential",
      "sort[0][column]": "period",
      "sort[0][direction]": "desc",
      length: "60", // last 60 state×month rows
    });
    const res = await fetch(`${sourceUrl}?${params}`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`EIA responded ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const rows: Array<{ stateid: string; period: string; price: number }> =
      json?.response?.data ?? [];

    if (!rows.length) throw new Error("EIA returned empty data array");

    // Keep only most recent row per state
    const latestByState = new Map<string, { period: string; price: number }>();
    for (const row of rows) {
      const state = row.stateid?.toUpperCase();
      if (!state || state === "US") continue;
      const existing = latestByState.get(state);
      if (!existing || row.period > existing.period) {
        latestByState.set(state, { period: row.period, price: row.price });
      }
    }

    let upsertCount = 0;
    for (const [state, { period, price }] of latestByState) {
      await db
        .insert(electricityRates)
        .values({
          state,
          centsPerkwh: price,
          effectiveDate: period,
          source: "EIA API v2",
        })
        .onConflictDoNothing(); // simple append; dedupe by state+date if needed
      upsertCount++;
    }

    // Mark success
    await db
      .update(dataStatus)
      .set({
        lastSuccessAt: now,
        lastError: null,
        rowCount: upsertCount,
      })
      .where(eq(dataStatus.datasetName, dataset));

    return NextResponse.json({ ok: true, upserted: upsertCount });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    await db
      .update(dataStatus)
      .set({ lastError: msg.slice(0, 500) })
      .where(eq(dataStatus.datasetName, dataset));
    // Return 200 so Vercel doesn't retry aggressively; error is logged in data_status
    return NextResponse.json({ ok: false, error: msg.slice(0, 200) });
  }
}
