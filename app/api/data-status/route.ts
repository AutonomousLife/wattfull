import { NextResponse } from "next/server";
import { db, dataStatus } from "@/lib/db/index";

function daysSince(value?: Date | null) {
  if (!value) return null;
  return Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * GET /api/data-status
 * Public endpoint - returns freshness info for key datasets.
 * Used by dashboard and trust/freshness UI components.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: dataStatus.id,
        datasetName: dataStatus.datasetName,
        lastSuccessAt: dataStatus.lastSuccessAt,
        lastAttemptAt: dataStatus.lastAttemptAt,
        rowCount: dataStatus.rowCount,
        lastError: dataStatus.lastError,
        lastSourceUrl: dataStatus.lastSourceUrl,
      })
      .from(dataStatus);

    const datasets = rows.map((row) => {
      const ageDays = daysSince(row.lastSuccessAt);
      const staleThreshold = row.datasetName === "gas_prices" ? 7 : 35;
      return {
        ...row,
        ageDays,
        freshness: ageDays === null ? "unknown" : ageDays > staleThreshold ? "stale" : "fresh",
      };
    });

    const summary = {
      trackedDatasets: datasets.length,
      freshDatasets: datasets.filter((item) => item.freshness === "fresh").length,
      staleDatasets: datasets.filter((item) => item.freshness === "stale").length,
      failingDatasets: datasets.filter((item) => item.lastError).length,
    };

    return NextResponse.json(
      { ok: true, summary, datasets },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false, summary: { trackedDatasets: 0, freshDatasets: 0, staleDatasets: 0, failingDatasets: 0 }, datasets: [] });
  }
}
