import { NextRequest, NextResponse } from "next/server";
import { db, userLinks } from "@/lib/db/index";
import { eq, and, gte, count } from "drizzle-orm";
import { sha256 } from "@/lib/core/scoring";

// In-memory rate limiter (per cold-start instance): max 3 submissions / IP / hour
const rateLimitMap = new Map<string, number[]>();
function isRateLimited(ipHash: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (rateLimitMap.get(ipHash) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= 3) return true;
  rateLimitMap.set(ipHash, [...hits, now]);
  return false;
}

// Suspicious TLDs that are commonly used for spam
const SPAM_TLDS = new Set([".xyz", ".tk", ".ml", ".gq", ".cf", ".ga", ".top", ".click", ".loan", ".win", ".bid"]);
function isSpamUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith("http") ? url : `https://${url}`);
    return SPAM_TLDS.has("." + hostname.split(".").pop());
  } catch {
    return false;
  }
}

/** GET /api/community — return approved community links */
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.status, "approved"))
      .orderBy(userLinks.createdAt);

    return NextResponse.json({ referrals: rows });
  } catch {
    return NextResponse.json({ referrals: [] });
  }
}

/** POST /api/community — submit a new link */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const ipHash = await sha256(ip + (process.env.ADMIN_PASSWORD ?? "wf"));

    if (isRateLimited(ipHash)) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    const body = await req.json();

    // Honeypot
    if (body.website) {
      return NextResponse.json({ success: true }); // silent
    }

    const { type, name, code, desc, url } = body;
    if (!type || !name || !code || !desc) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }
    if (code.length < 3 || code.length > 60) {
      return NextResponse.json({ error: "Code must be 3–60 characters." }, { status: 400 });
    }
    if (url && isSpamUrl(url)) {
      return NextResponse.json({ error: "URL not accepted." }, { status: 400 });
    }

    // Duplicate domain check
    if (url) {
      try {
        const { hostname } = new URL(url.startsWith("http") ? url : `https://${url}`);
        const existing = await db
          .select({ id: userLinks.id })
          .from(userLinks)
          .limit(1);
        // Simple: if same code already exists, reject
        const dupCode = await db
          .select({ id: userLinks.id })
          .from(userLinks)
          .where(eq(userLinks.code, String(code).replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 60)))
          .limit(1);
        if (dupCode.length > 0) {
          return NextResponse.json({ error: "Code already submitted." }, { status: 400 });
        }
      } catch {
        // ignore URL parse errors
      }
    }

    await db.insert(userLinks).values({
      category: String(type).slice(0, 30),
      title: String(name).slice(0, 100),
      code: String(code).replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 60),
      url: url ? String(url).slice(0, 500) : null,
      submittedBy: String(desc).slice(0, 200),
      ipHash,
      status: "pending",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
