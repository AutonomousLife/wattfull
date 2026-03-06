import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const adminCookie = req.cookies.get("wf_admin")?.value ?? "";

  return NextResponse.json({
    ok: true,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    hasAdminPassword: adminPassword.length > 0,
    adminPasswordLength: adminPassword.length,
    hasDatabaseUrl: databaseUrl.length > 0,
    databaseUrlLength: databaseUrl.length,
    hasAdminCookie: adminCookie.length > 0,
    adminCookieLength: adminCookie.length,
    adminCookieMatchesEnv: adminPassword.length > 0 && adminCookie === adminPassword,
    host: req.headers.get("host") ?? null,
    url: req.nextUrl.pathname,
  });
}
