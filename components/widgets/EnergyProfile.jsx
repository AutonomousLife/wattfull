"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA, zipToState } from "@/lib/data";

const PROFILE_KEY = "wattfull_profile";

const defaultProfile = {
  zip: "",
  mi: 12000,
  driveStyle: "normal",
  hasCharger: true,
  elecOverride: "",
};

function ProfileField({ label, children, t }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.textMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(t) {
  return {
    width: "100%", boxSizing: "border-box",
    padding: "8px 11px", fontSize: 13,
    border: `1.5px solid ${t.borderLight}`, borderRadius: 8,
    background: t.white, color: t.text, outline: "none",
  };
}

export function EnergyProfile() {
  const { t } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [st, setSt] = useState(null);
  const [sd, setSd] = useState(null);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      setProfile({ ...defaultProfile, ...p });
      if (p.zip?.length === 5) {
        const s = zipToState(p.zip);
        setSt(s);
        setSd(s ? STATE_DATA[s] : null);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (profile.zip?.length === 5) {
      const s = zipToState(profile.zip);
      setSt(s);
      setSd(s ? STATE_DATA[s] : null);
    } else {
      setSt(null);
      setSd(null);
    }
  }, [profile.zip]);

  function update(key, val) {
    setProfile(p => ({ ...p, [key]: val }));
    setSaved(false);
  }

  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
  }

  function runCalc() {
    saveProfile();
    const params = new URLSearchParams();
    if (profile.zip) params.set("zip", profile.zip);
    router.push(`/ev?${params.toString()}`);
  }

  const hasProfile = !!(profile.zip || profile.mi !== 12000);
  const er = sd ? sd.e : null;
  const annualEvEst = sd ? Math.round((profile.mi || 12000) * 0.26 * sd.e / 100) : null;
  const annualGasEst = sd ? Math.round((profile.mi || 12000) / 30 * sd.g) : null;

  return (
    <div style={{ background: t.white, border: `1.5px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Your Energy Profile</div>
            <div style={{ fontSize: 11, color: t.textLight }}>
              {hasProfile ? `${profile.zip || "No ZIP"} · ${(profile.mi || 12000).toLocaleString()} mi/yr` : "Save once, pre-fill all calculators"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasProfile && <span style={{ fontSize: 10, background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>Saved</span>}
          <span style={{ fontSize: 12, color: t.textLight }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          {/* Quick estimates if profile is set */}
          {sd && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: "#d1fae5", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#065f46" }}>Est. annual EV spend</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>${annualEvEst?.toLocaleString()}</div>
              </div>
              <div style={{ background: t.card, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: t.textLight }}>Est. annual gas spend</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>${annualGasEst?.toLocaleString()}</div>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#3b82f6" }}>Est. annual savings</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1d4ed8" }}>
                  ${Math.max(0, (annualGasEst || 0) - (annualEvEst || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <ProfileField label="ZIP Code" t={t}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={profile.zip}
                onChange={e => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="e.g. 78701"
                style={inputStyle(t)}
              />
              {st && (
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                  {st} · {sd?.e}¢/kWh
                </div>
              )}
            </div>
          </ProfileField>

          <ProfileField label="Annual Miles" t={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="range"
                min={3000} max={40000} step={500}
                value={profile.mi}
                onChange={e => update("mi", Number(e.target.value))}
                style={{ flex: 1, accentColor: "#10b981" }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text, minWidth: 60 }}>
                {(profile.mi || 12000).toLocaleString()}
              </span>
            </div>
          </ProfileField>

          <ProfileField label="Driving Style" t={t}>
            <div style={{ display: "flex", gap: 6 }}>
              {[["efficient", "🐢 Efficient"], ["normal", "🚗 Normal"], ["aggressive", "🦅 Spirited"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => update("driveStyle", id)}
                  style={{
                    flex: 1, padding: "7px 4px", fontSize: 11, fontWeight: 600,
                    borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${profile.driveStyle === id ? "#10b981" : t.borderLight}`,
                    background: profile.driveStyle === id ? "#d1fae5" : t.card,
                    color: profile.driveStyle === id ? "#065f46" : t.textMid,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </ProfileField>

          <ProfileField label="Home Charger Available?" t={t}>
            <div style={{ display: "flex", gap: 6 }}>
              {[[true, "✅ Yes — home L2 charger"], [false, "❌ No — public only"]].map(([val, label]) => (
                <button
                  key={String(val)}
                  onClick={() => update("hasCharger", val)}
                  style={{
                    flex: 1, padding: "7px 8px", fontSize: 11, fontWeight: 600,
                    borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${profile.hasCharger === val ? "#10b981" : t.borderLight}`,
                    background: profile.hasCharger === val ? "#d1fae5" : t.card,
                    color: profile.hasCharger === val ? "#065f46" : t.textMid,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </ProfileField>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={saveProfile}
              style={{
                flex: 1, padding: "10px", fontSize: 13, fontWeight: 700,
                borderRadius: 10, cursor: "pointer", border: `1.5px solid #10b981`,
                background: saved ? "#10b981" : "transparent",
                color: saved ? "#fff" : "#10b981",
                transition: "all .2s",
              }}
            >
              {saved ? "✓ Saved!" : "Save Profile"}
            </button>
            <button
              onClick={runCalc}
              style={{
                flex: 1, padding: "10px", fontSize: 13, fontWeight: 700,
                borderRadius: 10, cursor: "pointer", border: "none",
                background: "#10b981", color: "#fff",
              }}
            >
              Run EV Calculator →
            </button>
          </div>

          <div style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
            Profile saved locally to your browser. No account required.
          </div>
        </div>
      )}
    </div>
  );
}
