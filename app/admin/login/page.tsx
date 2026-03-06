"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setError(params.get("error") === "1");
    } catch {}
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "40px 32px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <h1 style={{ color: "#f8fafc", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Wattfull Admin</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>Enter your admin password to continue.</p>

        {error ? (
          <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16, background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 6 }}>
            Incorrect password. Try again.
          </p>
        ) : null}

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            required
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f8fafc", fontSize: 15, outline: "none" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 16px", borderRadius: 8, background: "#10b981", color: "#fff", fontWeight: 600, fontSize: 15, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.8 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In ->"}
          </button>
        </form>
      </div>
    </main>
  );
}
