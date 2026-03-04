import { NextRequest, NextResponse } from "next/server";
import { db, emailSubscribers } from "@/lib/db/index";

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Insert (ignore duplicate — UNIQUE constraint)
    let isNew = false;
    try {
      await db.insert(emailSubscribers).values({
        email: normalized,
        sourcePage: source ?? "newsletter",
      });
      isNew = true;
    } catch (err: any) {
      // Unique constraint violation = already subscribed — that's OK
      if (!err?.message?.includes("unique") && !err?.message?.includes("duplicate")) {
        throw err;
      }
    }

    // Send welcome email via Resend if API key is set
    if (isNew && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "Wattfull <noreply@wattfull.com>",
          to: normalized,
          subject: "Welcome to Wattfull ⚡",
          html: `
            <h2>Thanks for subscribing to Wattfull!</h2>
            <p>You'll get updates on electricity rates, EV incentives, and new tools — no spam, ever.</p>
            <p>In the meantime, check out our free tools at <a href="https://wattfull.com">wattfull.com</a>.</p>
            <p style="color:#888;font-size:12px">Unsubscribe anytime by replying "unsubscribe".</p>
          `,
        });
      } catch (emailErr) {
        // Email failure is non-fatal — subscriber is already in DB
        console.error("[newsletter] Resend error (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
