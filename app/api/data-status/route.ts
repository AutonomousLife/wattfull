import { NextResponse } from "next/server";
import { db, dataStatus } from "@/lib/db/index";

/**
 * GET /api/data-status
 * Public endpoint — returns freshness info for key datasets.
 * Used by DataFreshness UI component.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        datasetName: dataStatus.datasetName,
        lastSuccessAt: dataStatus.lastSuccessAt,
        lastAttemptAt: dataStatus.lastAttemptAt,
        rowCount: dataStatus.rowCount,
        lastError: dataStatus.lastError,
      })
      .from(dataStatus);

    return NextResponse.json(
      { ok: true, datasets: rows },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    // DB not available — return empty so UI shows stale warning
    return NextResponse.json({ ok: false, datasets: [] });
  }
}
