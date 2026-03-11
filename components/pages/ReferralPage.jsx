"use client";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Badge } from "@/components/ui";
import { REFERRALS } from "@/lib/data/referrals";

const KOFI_URL = "https://ko-fi.com/wattfull"; // ← swap in your Ko-fi URL

const TYPES = ["Tesla", "SunPower", "Enphase", "Other"];

function formatReferral(referral) {
  return {
    ...referral,
    type: referral.type || "Other",
    name: referral.name || "Community submission",
    desc: referral.desc || "Referral details were not provided.",
    date: referral.date || "Recently added",
    upvotes: referral.upvotes ?? 0,
    url: referral.url || null,
  };
}

export function ReferralPage() {
  const { t } = useTheme();
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(null);
  const [referrals, setReferrals] = useState(REFERRALS.map(formatReferral));
  const [form, setForm] = useState({ type: "Tesla", name: "", code: "", desc: "", website: "" });
  const [submitState, setSubmitState] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [reported, setReported] = useState({});

  useEffect(() => {
    fetch("/api/community")
      .then((response) => response.json())
      .then((data) => {
        if (data.referrals?.length) {
          const normalizedApi = data.referrals.map(formatReferral);
          const apiCodes = new Set(normalizedApi.map((item) => item.code));
          const staticOnly = REFERRALS.map(formatReferral).filter((item) => !apiCodes.has(item.code));
          setReferrals([...normalizedApi, ...staticOnly]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const normalizedFilter = filter.toLowerCase();
    const items = normalizedFilter === "all"
      ? referrals
      : referrals.filter((item) => String(item.type).toLowerCase() === normalizedFilter);
    return [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [filter, referrals]);

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1800);
  }

  async function reportExpired(referral) {
    const key = referral.id ?? referral.code;
    if (reported[key]) return;
    setReported((prev) => ({ ...prev, [key]: "loading" }));
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: referral.id }),
      });
    } catch {
      // best-effort
    }
    setReported((prev) => ({ ...prev, [key]: "done" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      if (!res.ok || !data.success) {
        setSubmitState("error");
        setSubmitError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      setSubmitState("success");
      setForm({ type: "Tesla", name: "", code: "", desc: "", website: "" });
    } catch {
      setSubmitState("error");
      setSubmitError("Network error. Please try again.");
    }
  }

  const inputStyle = {
    width: "100%",
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 13,
    background: t.bg,
    color: t.text,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: t.textMid, display: "block", marginBottom: 6 };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Community Referral Links</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 680 }}>
        Verified community referral codes for Tesla, solar brands, and energy products. Approved submissions appear here after review.
      </p>

      <div style={{ maxWidth: 760, marginBottom: 20, padding: "16px 20px", background: t.warnBg, border: `1.5px solid ${t.warn}44`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>
          If this page gave you value, it would mean a lot — I built and maintain this in my spare time.
        </p>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flexShrink: 0, textDecoration: "none" }}
        >
          <img
            src="https://ko-fi.com/img/githubbutton_sm.svg"
            alt="Buy Me a Coffee at ko-fi.com"
            style={{ height: 36, display: "block" }}
          />
        </a>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", ...TYPES].map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              onClick={() => setFilter(item)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                background: active ? t.green : "transparent",
                color: active ? "#fff" : t.textMid,
                border: `1.5px solid ${active ? t.green : t.border}`,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {item === "all" ? "All" : item}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 12, maxWidth: 760, marginBottom: 28 }}>
        {filtered.map((referral) => (
          <div key={referral.id ?? referral.code} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <Badge type="tag">{referral.type}</Badge>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{referral.name}</span>
                <span style={{ fontSize: 11, color: t.textLight }}>{referral.date}</span>
              </div>
              <div style={{ fontSize: 14, color: t.text, fontWeight: 700, marginBottom: 6 }}>{referral.code}</div>
              <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, marginBottom: 10 }}>{referral.desc}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => copyCode(referral.code)} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: copied === referral.code ? t.greenLight : t.card, color: copied === referral.code ? t.greenDark : t.textMid, cursor: "pointer", fontWeight: 700 }}>
                  {copied === referral.code ? "Copied" : "Copy code"}
                </button>
                {referral.url ? (
                  <a href={referral.url.startsWith("http") ? referral.url : `https://${referral.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.white, color: t.textMid, textDecoration: "none", fontWeight: 700 }}>
                    Visit link
                  </a>
                ) : null}
                {(() => {
                  const key = referral.id ?? referral.code;
                  const state = reported[key];
                  if (state === "done") return <span style={{ fontSize: 11, color: t.textLight }}>Thanks for the report</span>;
                  return (
                    <button
                      onClick={() => reportExpired(referral)}
                      disabled={state === "loading"}
                      style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textLight, cursor: state === "loading" ? "wait" : "pointer" }}
                    >
                      Code no longer works?
                    </button>
                  );
                })()}
              </div>
            </div>
            <div style={{ minWidth: 88, textAlign: "right" }}>
              <div style={{ fontSize: 10, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Status</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.greenDark, background: t.greenLight, borderRadius: 999, padding: "6px 10px", display: "inline-flex" }}>Approved</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: t.textLight, fontSize: 14, background: t.card, borderRadius: 14, border: `1px solid ${t.borderLight}` }}>
            No approved referrals yet in this category.
          </div>
        ) : null}
      </div>

      <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 18, padding: 24, maxWidth: 560 }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: t.text, marginBottom: 4 }}>Submit a Referral Code</div>
        <div style={{ fontSize: 13, color: t.textMid, marginBottom: 20 }}>All submissions are reviewed before going live. Approved entries typically appear after manual review in admin.</div>

        {submitState === "success" ? (
          <div style={{ padding: "16px 20px", background: t.greenLight, borderRadius: 12, color: t.greenDark, fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
            Submitted successfully. Your code is now waiting for admin approval.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
              style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} style={inputStyle}>
                  {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Jane D." style={inputStyle} maxLength={50} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Referral Code or Link</label>
              <input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} placeholder="your-referral-code" style={inputStyle} maxLength={60} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>What does it offer?</label>
              <input value={form.desc} onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))} placeholder="$500 off + 3 months free Supercharging" style={inputStyle} maxLength={200} />
            </div>

            {submitError ? <div style={{ fontSize: 13, color: t.err, marginBottom: 12 }}>{submitError}</div> : null}

            <button type="submit" disabled={submitState === "loading"} style={{ background: t.green, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: submitState === "loading" ? 0.6 : 1 }}>
              {submitState === "loading" ? "Submitting..." : "Submit referral"}
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: 16, padding: 14, background: t.card, borderRadius: 12, fontSize: 12, color: t.textLight, maxWidth: 760 }}>
        Referral links are user-submitted. Wattfull does not guarantee or endorse any referral program. Verify current terms directly with the provider.
      </div>
    </div>
  );
}
