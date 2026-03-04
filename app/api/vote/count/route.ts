import { NextRequest, NextResponse } from "next/server";
import { db, votes } from "@/lib/db/index";
import { eq, and, count } from "drizzle-orm";
import { formatVoteResult } from "@/lib/core/scoring";

/**
 * GET /api/vote/count?itemType=product&itemId=anker-solix
 * Returns vote counts + Wilson score + recommendation status.
 * Cached 60s (revalidate).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemType = searchParams.get("itemType");
  const itemId = searchParams.get("itemId");

  if (!itemType || !itemId) {
    return NextResponse.json({ error: "itemType and itemId required" }, { status: 400 });
  }

  try {
    const allVotes = await db
      .select({ direction: votes.direction })
      .from(votes)
      .where(and(eq(votes.itemId, itemId), eq(votes.flagged, false)));

    const ups = allVotes.filter((v) => v.direction === "up").length;
    const downs = allVotes.filter((v) => v.direction === "down").length;
    const result = formatVoteResult({ ups, downs });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ ups: 0, downs: 0, total: 0, score: 0, recommended: false, label: null });
  }
}
