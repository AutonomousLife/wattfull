import { NextRequest, NextResponse } from "next/server";
import { db, incentives } from "@/lib/db/index";
import { eq, and, or, isNull } from "drizzle-orm";
import { STATE_DATA } from "@/lib/data/stateData";

const HAS_DB = Boolean(process.env.DATABASE_URL);

/**
 * GET /api/incentives?state=CA
 * Returns applicable federal + state EV incentives for a given state.
 */
export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state")?.toUpperCase() ?? null;

  if (HAS_DB) {
    try {
      const rows = await db
        .select()
        .from(incentives)
        .where(
          or(
            eq(incentives.type, "federal"),
            state ? and(eq(incentives.type, "state"), eq(incentives.jurisdiction, state)) : isNull(incentives.type)
          )
        );

      return NextResponse.json({ incentives: rows }, {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
      });
    } catch {
      // fall through to static fallback
    }
  }

  // Static fallback: federal only + state credit from stateData
  const stateCredit = state ? ((STATE_DATA as Record<string, { ec?: number }>)[state]?.ec ?? 0) : 0;
  const items = [
    {
      id: 1,
      type: "federal",
      jurisdiction: "US",
      amount: 7500,
      amountType: "flat",
      eligibilityNotes:
        "IRA §30D credit: MSRP cap ($80k trucks/vans/SUVs, $55k other). Income limit: $150k single/$300k joint. Vehicle must have final assembly in North America.",
      source: "IRS Rev. Proc. 2023-33",
    },
  ];
  if (stateCredit > 0) {
    items.push({
      id: 2,
      type: "state",
      jurisdiction: state!,
      amount: stateCredit,
      amountType: "flat",
      eligibilityNotes: "State-level EV incentive — program rules vary. Verify current availability.",
      source: "Wattfull state seed (DSIRE)",
    });
  }

  return NextResponse.json({ incentives: items }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
