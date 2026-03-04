import { NextRequest, NextResponse } from "next/server";
import store from "@/lib/store";

// In-memory rate limiter: max 3 submissions per IP per hour
const rateLimitMap = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const hits = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= 3) return true;
  rateLimitMap.set(ip, [...hits, now]);
  return false;
}

/** GET /api/community — return approved referrals */
export async function GET() {
  const approved = store.referrals.filter((r) => r.status === "approved");
  return NextResponse.json({ referrals: approved });
}

/** POST /api/community — submit a new referral */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    const body = await req.json();

    // Honeypot: bots fill the hidden 'website' field
    if (body.website) {
      // Silently succeed so bots don't know they were blocked
      return NextResponse.json({ success: true });
    }

    const { type, name, code, desc } = body;
    if (!type || !name || !code || !desc) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }
    if (code.length < 3 || code.length > 60) {
      return NextResponse.json({ error: "Code must be 3–60 characters." }, { status: 400 });
    }

    const newRef = {
      id: store.nextId++,
      type: String(type).slice(0, 30),
      name: String(name).slice(0, 50),
      code: String(code).replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 60),
      desc: String(desc).slice(0, 200),
      upvotes: 0,
      date: new Date().toISOString().slice(0, 7), // "YYYY-MM"
      status: "pending" as const,
    };

    store.referrals.push(newRef);
    console.log(`[community] new submission (pending): ${newRef.code} from ${ip}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
