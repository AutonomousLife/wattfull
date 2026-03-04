"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Badge } from "@/components/ui";
import { REFERRALS } from "@/lib/data/referrals";

export function ReferralPage() {
  const { t } = useTheme();
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(null);
  const filtered = filter === "all" ? REFERRALS : REFERRALS.filter((r) => r.type === filter);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Community Referral Links</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Save money with referral codes from our community. Share yours too!
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 24, flexWrap: "wrap" }}>
        {["all", "Tesla", "SunPower", "Enphase"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: filter === f ? 700 : 500, background: filter === f ? t.green : "transparent", color: filter === f ? "#fff" : t.textMid, border: `1.5px solid ${filter === f ? t.green : t.border}`, cursor: "pointer", transition: "all .2s" }}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12, maxWidth: 700 }}>
        {filtered.map((r) => (
          <div key={r.id} style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
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
      </div>
      <div style={{ marginTop: 24, padding: 20, background: t.greenLight, borderRadius: 14, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.greenDark }}>Have a referral code?</div>
        <div style={{ fontSize: 13, color: t.textMid, marginTop: 6, marginBottom: 12 }}>Submit yours to help the community save. Coming soon with account signup!</div>
        <button style={{ background: t.green, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Submit Your Referral →</button>
      </div>
      <div style={{ marginTop: 16, padding: 14, background: t.card, borderRadius: 10, fontSize: 12, color: t.textLight }}>
        Referral links are user-submitted. Wattfull does not guarantee or endorse any referral program. Verify terms with the provider.
      </div>
    </div>
  );
}
