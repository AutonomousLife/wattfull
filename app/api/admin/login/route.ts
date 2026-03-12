import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ success: false, error: "Admin not configured" }, { status: 503 });
    }

    // Basic CSRF: require request to originate from same host
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { password } = await req.json();
    if (String(password ?? "") !== adminPassword) {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("wf_admin", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
