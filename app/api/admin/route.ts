/**
 * Admin API — protected by Authorization header.
 *
 * Set ADMIN_PASSWORD in your environment (Vercel dashboard → Settings → Env Vars).
 * In dev it defaults to "admin".
 *
 * Usage:
 *   GET  /api/admin          — export all data (emails + referrals)
 *   POST /api/admin          — { action: "approve"|"delete", id: number }
 *
 * curl example:
 *   curl -H "Authorization: Bearer admin" http://localhost:3000/api/admin
 */

import { NextRequest, NextResponse } from "next/server";
import store from "@/lib/store";

function isAuthorized(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "admin";
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${password}`;
}

/** GET /api/admin — full data export (backup) */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    referrals: store.referrals,
    emails: store.emails,
    summary: {
      totalReferrals: store.referrals.length,
      pendingReferrals: store.referrals.filter((r) => r.status === "pending").length,
      approvedReferrals: store.referrals.filter((r) => r.status === "approved").length,
      totalEmails: store.emails.length,
    },
  });
}

/** POST /api/admin — approve or delete a referral */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { action, id } = await req.json();
    const idx = store.referrals.findIndex((r) => r.id === Number(id));
    if (idx === -1) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    if (action === "approve") {
      store.referrals[idx].status = "approved";
      return NextResponse.json({ success: true, referral: store.referrals[idx] });
    }
    if (action === "delete") {
      store.referrals.splice(idx, 1);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
