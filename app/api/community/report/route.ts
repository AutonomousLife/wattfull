import { NextRequest, NextResponse } from "next/server";
import { db, userLinks } from "@/lib/db/index";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/community/report
 * Body: { id: number }
 * Increments report_count; auto-rejects if count >= 3.
 */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const rows = await db
      .select({ reportCount: userLinks.reportCount })
      .from(userLinks)
      .where(eq(userLinks.id, Number(id)))
      .limit(1);

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newCount = (rows[0].reportCount ?? 0) + 1;
    const newStatus = newCount >= 3 ? "rejected" : undefined;

    await db
      .update(userLinks)
      .set({
        reportCount: newCount,
        ...(newStatus ? { status: newStatus as any } : {}),
      })
      .where(eq(userLinks.id, Number(id)));

    return NextResponse.json({ success: true, autoRejected: newCount >= 3 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
