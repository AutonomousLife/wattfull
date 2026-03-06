"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";

const PROFILE_KEY = "wattfull_profile";

const defaultProfile = {
  zip: "",
  mi: 12000,
  driveStyle: "normal",
  hasCharger: true,
  elecOverride: "",
  solarInterest: "exploring",
  homeowner: true,
};

function fieldStyle(t) {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    fontSize: 13,
    border: `1.5px solid ${t.borderLight}`,
    borderRadius: 8,
    background: t.white,
    color: t.text,
    outline: "none",
  };
}

function Field({ label, note, children, t }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.textMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
      {children}
      {note ? <div style={{ fontSize: 11, color: t.textLight, marginTop: 5 }}>{note}</div> : null}
    </div>
  );
}

function Metric({ label, value, tone, t }) {
  const palette = {
    green: { bg: "#d1fae5", label: "#065f46", value: "#059669" },
    blue: { bg: "#eff6ff", label: "#1e40af", value: "#1d4ed8" },
    neutral: { bg: t.card, label: t.textLight, value: t.text },
  }[tone] ?? { bg: t.card, label: t.textLight, value: t.text };

  return (
    <div style={{ background: palette.bg, borderRadius: 10, padding: "11px 12px" }}>
      <div style={{ fontSize: 10, color: palette.label }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: palette.value, marginTop: 3 }}>{value}</div>
    </div>
  );
}

export function EnergyProfileV2() {
  const { t } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [state, setState] = useState(null);
  const [stateData, setStateData] = useState(null);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      setProfile({ ...defaultProfile, ...existing });
    } catch {}
  }, []);

  useEffect(() => {
    const nextState = resolveStateFromZip(profile.zip);
    setState(nextState);
    setStateData(nextState ? STATE_DATA[nextState] : null);
  }, [profile.zip]);

  function update(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {}
  }

  function launch(path) {
    saveProfile();
    const params = new URLSearchParams();
    if (profile.zip) params.set("zip", profile.zip);
    router.push(params.toString() ? `${path}?${params.toString()}` : path);
  }

  const annualMiles = profile.mi || 12000;
  const electricityRate = profile.elecOverride !== "" ? Number(profile.elecOverride) : stateData?.e ?? 16;
  const gasPrice = stateData?.g ?? 3.5;
  const publicMix = profile.hasCharger ? 0.15 : 0.7;
  const homeMix = 1 - publicMix;
  const blendedElectricRate = homeMix * (electricityRate / 100) + publicMix * ((electricityRate / 100) + 0.18);
  const annualEvSpend = Math.round(annualMiles * 0.27 * blendedElectricRate);
  const annualGasSpend = Math.round((annualMiles / 30) * gasPrice);
  const annualSavings = annualGasSpend - annualEvSpend;
  const solarPotential = stateData ? Math.round(annualMiles * 0.08 * Math.min(1.25, stateData.s / 5)) : null;
  const batteryRoi = stateData ? (stateData.nm === "full" ? "Low" : stateData.gc >= 35 ? "Moderate" : "Situational") : "Estimated";
  const confidence = state ? (profile.elecOverride !== "" ? "High" : "Medium") : "Estimated";
  const hasProfile = Boolean(profile.zip || annualMiles !== 12000 || profile.elecOverride !== "");

  const verdict =
    annualSavings > 900
      ? "Your profile strongly favors running the EV tools first."
      : annualSavings > 0
      ? "Your profile leans EV-favorable, but charger access and rates still matter."
      : "Your current profile does not show a clear EV operating-cost edge yet.";

  const verdictReason =
    annualSavings > 0
      ? "Gasoline spending remains meaningfully above your estimated electric driving cost."
      : "Public charging reliance or higher electricity costs are compressing the EV advantage.";

  return (
    <div style={{ background: t.white, border: `1.5px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Your Energy Profile</div>
          <div style={{ fontSize: 11, color: t.textLight }}>
            {hasProfile ? `${profile.zip || "No ZIP"} | ${annualMiles.toLocaleString()} mi/yr | ${confidence} confidence` : "Save once, reuse across EV, solar, compare, and state tools"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasProfile ? <span style={{ fontSize: 10, background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>Saved</span> : null}
          <span style={{ fontSize: 10, color: t.textLight }}>{open ? "Hide" : "Open"}</span>
        </div>
      </button>

      {open ? (
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 16 }}>
            <Metric label="Gasoline spending estimate" value={`$${annualGasSpend.toLocaleString()}/yr`} tone="neutral" t={t} />
            <Metric label="Electric driving estimate" value={`$${annualEvSpend.toLocaleString()}/yr`} tone="green" t={t} />
            <Metric label="EV savings potential" value={`${annualSavings >= 0 ? "+" : "-"}$${Math.abs(annualSavings).toLocaleString()}/yr`} tone={annualSavings >= 0 ? "blue" : "neutral"} t={t} />
            <Metric label="Solar savings potential" value={solarPotential ? `$${solarPotential.toLocaleString()}/yr` : "Add ZIP"} tone={solarPotential ? "green" : "neutral"} t={t} />
          </div>

          <div style={{ background: t.card, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>Wattfull Profile Verdict</div>
            <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{verdict} {verdictReason}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: t.green, background: "#d1fae5", borderRadius: 999, padding: "4px 8px" }}>{confidence} confidence</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: t.textMid, background: t.white, borderRadius: 999, padding: "4px 8px" }}>{state ? `${state} state context loaded` : "National fallback until ZIP is added"}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: t.textMid, background: t.white, borderRadius: 999, padding: "4px 8px" }}>{profile.hasCharger ? "Home charging friendly" : "Public charging heavy"}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16 }}>
            <div>
              <Field label="ZIP Code" t={t} note="Used to prefill state electricity, gas, solar, and incentive assumptions.">
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={profile.zip}
                    onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="e.g. 78701"
                    style={fieldStyle(t)}
                  />
                  {state ? (
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                      {state} | {electricityRate}c/kWh
                    </div>
                  ) : null}
                </div>
              </Field>

              <Field label="Annual Miles" t={t}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={3000} max={40000} step={500} value={annualMiles} onChange={(e) => update("mi", Number(e.target.value))} style={{ flex: 1, accentColor: "#10b981" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text, minWidth: 70 }}>{annualMiles.toLocaleString()}</span>
                </div>
              </Field>

              <Field label="Electricity Override" t={t} note="Optional. Use your utility bill if you know your all-in rate.">
                <input type="number" value={profile.elecOverride} onChange={(e) => update("elecOverride", e.target.value)} placeholder="Use state average" style={fieldStyle(t)} />
              </Field>

              <Field label="Driving Style" t={t}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[ ["efficient", "Efficient"], ["normal", "Normal"], ["aggressive", "Spirited"] ].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => update("driveStyle", id)}
                      style={{
                        flex: 1,
                        padding: "7px 6px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        cursor: "pointer",
                        border: `1.5px solid ${profile.driveStyle === id ? "#10b981" : t.borderLight}`,
                        background: profile.driveStyle === id ? "#d1fae5" : t.card,
                        color: profile.driveStyle === id ? "#065f46" : t.textMid,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div>
              <Field label="Home Charging" t={t}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[ [true, "Home charger"], [false, "Public only"] ].map(([value, label]) => (
                    <button
                      key={String(value)}
                      onClick={() => update("hasCharger", value)}
                      style={{
                        flex: 1,
                        padding: "7px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        cursor: "pointer",
                        border: `1.5px solid ${profile.hasCharger === value ? "#10b981" : t.borderLight}`,
                        background: profile.hasCharger === value ? "#d1fae5" : t.card,
                        color: profile.hasCharger === value ? "#065f46" : t.textMid,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Solar Interest" t={t}>
                <select value={profile.solarInterest} onChange={(e) => update("solarInterest", e.target.value)} style={fieldStyle(t)}>
                  <option value="exploring">Exploring</option>
                  <option value="serious">Serious this year</option>
                  <option value="not-now">Not right now</option>
                </select>
              </Field>

              <Field label="Home Ownership" t={t}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[ [true, "Own"], [false, "Rent"] ].map(([value, label]) => (
                    <button
                      key={String(value)}
                      onClick={() => update("homeowner", value)}
                      style={{
                        flex: 1,
                        padding: "7px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        cursor: "pointer",
                        border: `1.5px solid ${profile.homeowner === value ? "#10b981" : t.borderLight}`,
                        background: profile.homeowner === value ? "#d1fae5" : t.card,
                        color: profile.homeowner === value ? "#065f46" : t.textMid,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Advisory Snapshot" t={t}>
                <div style={{ background: t.card, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>
                  Home battery ROI: <b style={{ color: t.text }}>{batteryRoi}</b><br />
                  Recommended next tool: <b style={{ color: t.text }}>{profile.solarInterest === "serious" ? "Solar ROI" : annualSavings >= 0 ? "EV Calculator" : "Compare"}</b><br />
                  Data mode: <b style={{ color: t.text }}>{state ? "Estimated with state context" : "Static until ZIP is added"}</b>
                </div>
              </Field>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={saveProfile} style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: `1.5px solid #10b981`, background: saved ? "#10b981" : "transparent", color: saved ? "#fff" : "#10b981" }}>
              {saved ? "Saved" : "Save Profile"}
            </button>
            <button onClick={() => launch("/ev")} style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: "none", background: "#10b981", color: "#fff" }}>
              Run EV Calculator
            </button>
            <button onClick={() => launch("/solar")} style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer", border: `1.5px solid ${t.borderLight}`, background: t.card, color: t.text }}>
              Check Solar ROI
            </button>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textMid, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Recommended next tools</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
              {[
                { href: "/ev", title: "Run EV calculator", desc: state ? `${state} state context available` : "Get a full ownership verdict" },
                { href: "/solar", title: "Check solar ROI", desc: profile.homeowner ? "Model rooftop savings and payback" : "See how ownership changes the case" },
                { href: "/compare", title: "Compare options", desc: "Separate upfront, operating, and ownership cost" },
              ].map((tool) => (
                <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
                  <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{tool.title}</div>
                    <div style={{ fontSize: 11, color: t.textLight, marginTop: 4, lineHeight: 1.5 }}>{tool.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: t.textLight, marginTop: 10, lineHeight: 1.6 }}>
            Profile is stored locally in your browser. Savings estimates here are advisory previews, not full calculator verdicts. Final tool pages may use live, estimated, or static data depending on availability.
          </div>
        </div>
      ) : null}
    </div>
  );
}
