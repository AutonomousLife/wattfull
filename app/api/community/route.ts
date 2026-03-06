import { NextRequest, NextResponse } from "next/server";
import { db, userLinks } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { sha256 } from "@/lib/core/scoring";

const rateLimitMap = new Map<string, number[]>();
const localPendingLinks: Array<{
  id: number;
  category: string;
  title: string;
  url: string | null;
  code: string;
  submittedBy: string;
  ipHash: string;
  status: "pending";
  createdAt: Date;
}> = [];
const HAS_DATABASE_URL = Boolean(process.env.DATABASE_URL);

function isRateLimited(ipHash: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (rateLimitMap.get(ipHash) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= 3) return true;
  rateLimitMap.set(ipHash, [...hits, now]);
  return false;
}

const SPAM_TLDS = new Set([".xyz", ".tk", ".ml", ".gq", ".cf", ".ga", ".top", ".click", ".loan", ".win", ".bid"]);

function isSpamUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith("http") ? url : `https://${url}`);
    return SPAM_TLDS.has(`.${hostname.split(".").pop()}`);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!HAS_DATABASE_URL) {
    return NextResponse.json({ referrals: [] });
  }

  try {
    const rows = await db
      .select()
      .from(userLinks)
      .where(eq(userLinks.status, "approved"))
      .orderBy(userLinks.createdAt);

    return NextResponse.json({
      referrals: rows.map((row) => ({
        id: row.id,
        type: row.category,
        name: row.title,
        code: row.code,
        desc: row.submittedBy || "Community referral submission",
        upvotes: 0,
        date: row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Recently added",
        url: row.url || null,
      })),
    });
  } catch {
    return NextResponse.json({ referrals: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip")?.trim() ??
      "unknown";
    const agent = req.headers.get("user-agent")?.slice(0, 120) ?? "unknown-agent";
    const ipHash = await sha256(`${ip}|${agent}|${process.env.ADMIN_PASSWORD ?? "wf"}`);

    if (isRateLimited(ipHash)) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    const body = await req.json();

    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const { type, name, code, desc, url } = body;
    if (!type || !name || !code || !desc) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }
    if (code.length < 3 || code.length > 60) {
      return NextResponse.json({ error: "Code must be 3-60 characters." }, { status: 400 });
    }
    if (url && isSpamUrl(url)) {
      return NextResponse.json({ error: "URL not accepted." }, { status: 400 });
    }

    const sanitizedCode = String(code).replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 60);
    const payload = {
      category: String(type).slice(0, 30),
      title: String(name).slice(0, 100),
      code: sanitizedCode,
      url: url ? String(url).slice(0, 500) : null,
      submittedBy: String(desc).slice(0, 200),
      ipHash,
      status: "pending" as const,
    };

    if (!HAS_DATABASE_URL) {
      const dupCode = localPendingLinks.some((entry) => entry.code === sanitizedCode);
      if (dupCode) {
        return NextResponse.json({ error: "Code already submitted." }, { status: 400 });
      }

      localPendingLinks.push({
        id: Date.now(),
        ...payload,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, pendingStorage: "memory" });
    }

    const dupCode = await db
      .select({ id: userLinks.id })
      .from(userLinks)
      .where(eq(userLinks.code, sanitizedCode))
      .limit(1);
    if (dupCode.length > 0) {
      return NextResponse.json({ error: "Code already submitted." }, { status: 400 });
    }

    await db.insert(userLinks).values(payload);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

