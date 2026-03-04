"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Badge } from "@/components/ui";
import { REFERRALS } from "@/lib/data/referrals";

const TYPES = ["Tesla", "SunPower", "Enphase", "Other"];

export function ReferralPage() {
  const { t } = useTheme();
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(null);
  const [referrals, setReferrals] = useState(REFERRALS); // seed with static data

  // Load approved referrals from API (merges with static seed)
  useEffect(() => {
    fetch("/api/community")
      .then((r) => r.json())
      .then((data) => {
        if (data.referrals?.length) {
          // Merge API list with static seed (dedupe by code)
          const apiCodes = new Set(data.referrals.map((r) => r.code));
          const staticOnly = REFERRALS.filter((r) => !apiCodes.has(r.code));
          setReferrals([...data.referrals, ...staticOnly]);
        }
      })
      .catch(() => {}); // silently keep static seed on error
  }, []);

  // Submit form state
  const [form, setForm] = useState({ type: "Tesla", name: "", code: "", desc: "", website: "" });
  const [submitState, setSubmitState] = useState("idle"); // idle | loading | success | error
  const [submitError, setSubmitError] = useState("");

  const filtered = filter === "all" ? referrals : referrals.filter((r) => r.type === filter);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.desc.trim()) {
      setSubmitError("Please fill in all fields.");
      return;
    }
    setSubmitState("loading");
    setSubmitError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitState("success");
        setForm({ type: "Tesla", name: "", code: "", desc: "", website: "" });
      } else {
        setSubmitState("error");
        setSubmitError(data.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setSubmitState("error");
      setSubmitError("Network error. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%", border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px",
    fontSize: 13, background: t.bg, color: t.text, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: t.textMid, display: "block", marginBottom: 4 };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Community Referral Links</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Save money with referral codes from our community. Submit yours to help others save too.
      </p>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 24, flexWrap: "wrap" }}>
        {["all", ...TYPES].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: filter === f ? 700 : 500, background: filter === f ? t.green : "transparent", color: filter === f ? "#fff" : t.textMid, border: `1.5px solid ${filter === f ? t.green : t.border}`, cursor: "pointer", transition: "all .2s" }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Referral list */}
      <div style={{ display: "grid", gap: 12, maxWidth: 700 }}>
        {filtered.map((r) => (
          <div key={r.id} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <Badge type="tag">{r.type}</Badge>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.name}</span>
                <span style={{ fontSize: 11, color: t.textLight }}>{r.date}</span>
              </div>
              <div style={{ fontSize: 14, color: t.textMid, marginBottom: 6 }}>{r.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code style={{ fontSize: 12, padding: "4px 8px", background: t.card, borderRadius: 4, color: t.green, fontWeight: 600 }}>{r.code}</code>
                <button onClick={() => copyCode(r.code)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: `1px solid ${t.border}`, background: copied === r.code ? t.greenLight : t.white, color: copied === r.code ? t.green : t.textMid, cursor: "pointer", fontWeight: 600 }}>
                  {copied === r.code ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <button style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12, color: t.textMid, fontWeight: 600 }}>
                ▲ {r.upvotes}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: t.textLight, fontSize: 14 }}>No referrals yet in this category.</div>
        )}
      </div>

      {/* Submit form */}
      <div style={{ marginTop: 32, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 24, maxWidth: 560 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 4 }}>Submit a Referral Code</div>
        <div style={{ fontSize: 13, color: t.textMid, marginBottom: 20 }}>All submissions are reviewed before going live. Usually approved within 24 hours.</div>

        {submitState === "success" ? (
          <div style={{ padding: "16px 20px", background: t.greenLight, borderRadius: 10, color: t.greenDark, fontWeight: 600, fontSize: 14, textAlign: "center" }}>
            ✓ Submitted — thank you! Your code will appear once approved.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={inputStyle}>
                  {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Jane D." style={inputStyle} maxLength={50} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Referral Code or Link</label>
              <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="your-referral-code" style={inputStyle} maxLength={60} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>What does it offer? (short description)</label>
              <input value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} placeholder="$500 off + 3 months free Supercharging" style={inputStyle} maxLength={200} />
            </div>

            {submitError && (
              <div style={{ fontSize: 13, color: t.err, marginBottom: 12 }}>{submitError}</div>
            )}

            <button type="submit" disabled={submitState === "loading"} style={{ background: t.green, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: submitState === "loading" ? 0.6 : 1 }}>
              {submitState === "loading" ? "Submitting…" : "Submit Referral →"}
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: 16, padding: 14, background: t.card, borderRadius: 10, fontSize: 12, color: t.textLight, maxWidth: 700 }}>
        Referral links are user-submitted. Wattfull does not guarantee or endorse any referral program. Verify terms with the provider.
      </div>
    </div>
  );
}
