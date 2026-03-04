/**
 * Admin API — protected by Authorization header.
 *
 * Set ADMIN_PASSWORD in Vercel env vars (defaults to "admin" in dev).
 *
 * GET  /api/admin            — full data export (user_links, email_subscribers, data_status)
 * POST /api/admin            — { action: "approve"|"reject"|"delete", id: number }
 *
 * curl example:
 *   curl -H "Authorization: Bearer admin" http://localhost:3000/api/admin
 */

import { NextRequest, NextResponse } from "next/server";
import { db, userLinks, emailSubscribers, dataStatus } from "@/lib/db/index";
import { eq } from "drizzle-orm";

function isAuthorized(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "admin";
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${password}`;
}

/** GET /api/admin — full data export */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [links, emails, freshness] = await Promise.all([
    db.select().from(userLinks).orderBy(userLinks.createdAt),
    db.select({ id: emailSubscribers.id, email: emailSubscribers.email, sourcePage: emailSubscribers.sourcePage, createdAt: emailSubscribers.createdAt }).from(emailSubscribers).orderBy(emailSubscribers.createdAt),
    db.select().from(dataStatus),
  ]);

  return NextResponse.json({
    userLinks: links,
    emails,
    dataStatus: freshness,
    summary: {
      totalLinks: links.length,
      pendingLinks: links.filter((r) => r.status === "pending").length,
      approvedLinks: links.filter((r) => r.status === "approved").length,
      totalEmails: emails.length,
    },
  });
}

/** POST /api/admin — approve, reject, or delete a link */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { action, id } = await req.json();
    const numId = Number(id);

    if (action === "approve") {
      await db
        .update(userLinks)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(userLinks.id, numId));
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      await db
        .update(userLinks)
        .set({ status: "rejected", reviewedAt: new Date() })
        .where(eq(userLinks.id, numId));
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await db.delete(userLinks).where(eq(userLinks.id, numId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
