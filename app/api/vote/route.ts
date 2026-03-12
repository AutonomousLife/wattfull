import { NextRequest, NextResponse } from "next/server";
import { db, votes } from "@/lib/db/index";
import { eq, and, gte, count } from "drizzle-orm";
import { sha256, formatVoteResult } from "@/lib/core/scoring";

const COOKIE_NAME = "wf_did"; // device ID cookie (1 year, httpOnly)
const VOTE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_VOTES_PER_DAY = 20;
const BURST_THRESHOLD = 5; // 5+ votes on same item in 1hr → flag

/**
 * POST /api/vote
 * Body: { itemType: "product"|"vehicle"|"link", itemId: string, direction: "up"|"down" }
 */
export async function POST(req: NextRequest) {
  try {
    const salt = process.env.VOTE_SALT ?? process.env.ADMIN_PASSWORD ?? "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const ipHash = await sha256(ip + salt);

    // Device hash from cookie (or generate new one)
    let deviceId = req.cookies.get(COOKIE_NAME)?.value;
    let newCookie = false;
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      newCookie = true;
    }
    const deviceHash = await sha256(deviceId + salt);

    const body = await req.json();
    const { itemType, itemId, direction } = body;

    if (!itemType || !itemId || !["up", "down"].includes(direction)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - VOTE_WINDOW_MS);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    // Check: 1 vote per item per device per 24h
    const existingDeviceVote = await db
      .select({ id: votes.id })
      .from(votes)
      .where(
        and(
          eq(votes.itemId, itemId),
          eq(votes.deviceHash, deviceHash),
          gte(votes.createdAt, windowStart)
        )
      )
      .limit(1);

    if (existingDeviceVote.length > 0) {
      return NextResponse.json({ error: "Already voted on this item today" }, { status: 429 });
    }

    // Check: max 20 votes per IP per day
    const ipVotesToday = await db
      .select({ c: count() })
      .from(votes)
      .where(and(eq(votes.ipHash, ipHash), gte(votes.createdAt, dayStart)));

    if ((ipVotesToday[0]?.c ?? 0) >= MAX_VOTES_PER_DAY) {
      return NextResponse.json({ error: "Vote limit reached for today" }, { status: 429 });
    }

    // Burst detection: 5+ votes on same item from same IP in 1hr
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const burstCount = await db
      .select({ c: count() })
      .from(votes)
      .where(and(eq(votes.itemId, itemId), eq(votes.ipHash, ipHash), gte(votes.createdAt, hourAgo)));

    const flagged = (burstCount[0]?.c ?? 0) >= BURST_THRESHOLD;

    // Insert vote
    await db.insert(votes).values({
      itemType,
      itemId,
      direction,
      ipHash,
      deviceHash,
      flagged,
    });

    // Fetch updated counts
    const allVotes = await db
      .select({ direction: votes.direction })
      .from(votes)
      .where(and(eq(votes.itemId, itemId), eq(votes.flagged, false)));

    const ups = allVotes.filter((v) => v.direction === "up").length;
    const downs = allVotes.filter((v) => v.direction === "down").length;
    const result = formatVoteResult({ ups, downs });

    const res = NextResponse.json({ success: true, ...result });

    // Set device cookie if new
    if (newCookie) {
      res.cookies.set(COOKIE_NAME, deviceId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("[vote] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
