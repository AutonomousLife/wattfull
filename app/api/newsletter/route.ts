import { NextRequest, NextResponse } from "next/server";
import store from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Deduplicate
    const exists = store.emails.some((e) => e.email === normalized);
    if (!exists) {
      store.emails.push({ email: normalized, ts: Date.now(), source: "newsletter" });
      console.log(`[newsletter] new signup: ${normalized} (total: ${store.emails.length})`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
