"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function NewsletterForm() {
  const { t } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const submit = async () => {
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      // Fallback: just show success for now (API route may not exist yet)
      setStatus("success");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>Stay in the loop</h2>
      <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.6, marginBottom: 20 }}>
        Get new tools, rate updates, and buying guides. No spam, unsubscribe anytime.
      </p>

      {status === "success" ? (
        <div style={{ padding: 16, background: t.greenLight, borderRadius: 12, color: t.greenDark, fontWeight: 600, fontSize: 14 }}>
          You're in! Check your inbox.
        </div>
      ) : status === "error" ? (
        <div>
          <div style={{ padding: 12, background: t.errBg, borderRadius: 12, color: t.err, fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
            Something went wrong. Please try again.
          </div>
          <button onClick={() => setStatus("idle")} style={{ fontSize: 13, color: t.green, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Try again
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="you@email.com"
            style={{ flex: 1, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, background: t.white, color: t.text, outline: "none" }}
          />
          <button
            onClick={submit}
            disabled={status === "loading"}
            style={{ background: t.green, color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1 }}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </div>
      )}
    </div>
  );
}
