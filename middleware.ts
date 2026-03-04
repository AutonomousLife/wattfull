import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: protect /admin/* routes behind password cookie.
 * Login page (/admin/login) is exempt.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exempt the login page itself
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get("wf_admin")?.value;
    const password = process.env.ADMIN_PASSWORD ?? "admin";

    if (cookie !== password) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
