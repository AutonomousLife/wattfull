/**
 * Admin API - protected by auth cookie or Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, userLinks, emailSubscribers, dataStatus } from "@/lib/db/index";
import { eq } from "drizzle-orm";

function isAuthorized(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const auth = req.headers.get("authorization") ?? "";
  const cookie = req.cookies.get("wf_admin")?.value ?? "";
  return auth === `Bearer ${password}` || cookie === password;
}

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
      pendingLinks: links.filter((row) => row.status === "pending").length,
      approvedLinks: links.filter((row) => row.status === "approved").length,
      totalEmails: emails.length,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, id } = await req.json();
    const numId = Number(id);

    if (action === "approve") {
      await db.update(userLinks).set({ status: "approved", reviewedAt: new Date() }).where(eq(userLinks.id, numId));
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      await db.update(userLinks).set({ status: "rejected", reviewedAt: new Date() }).where(eq(userLinks.id, numId));
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
