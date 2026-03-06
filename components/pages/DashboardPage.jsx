"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";

const PROFILE_KEY = "wattfull_profile";
const EV_KEY = "wattfull_ev_calc_v2";

function cardStyle(t) {
  return {
    background: t.white,
    border: `1px solid ${t.borderLight}`,
    borderRadius: 16,
    padding: 18,
  };
}

function Metric({ label, value, note, tone, t }) {
  const palette = {
    green: { bg: "#d1fae5", value: "#065f46" },
    blue: { bg: "#eff6ff", value: "#1d4ed8" },
    neutral: { bg: t.card, value: t.text },
  }[tone] || { bg: t.card, value: t.text };

  return (
    <div style={{ background: palette.bg, borderRadius: 12, padding: "12px 13px" }}>
      <div style={{ fontSize: 10, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: palette.value, marginTop: 4 }}>{value}</div>
      {note ? <div style={{ fontSize: 11, color: t.textLight, marginTop: 5, lineHeight: 1.5 }}>{note}</div> : null}
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTheme();
  const [profile, setProfile] = useState(null);
  const [evCalc, setEvCalc] = useState(null);

  useEffect(() => {
    try {
      setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"));
    } catch {
      setProfile(null);
    }
    try {
      setEvCalc(JSON.parse(localStorage.getItem(EV_KEY) || "null"));
    } catch {
      setEvCalc(null);
    }
  }, []);

  const state = useMemo(() => resolveStateFromZip(profile?.zip), [profile?.zip]);
  const stateData = state ? STATE_DATA[state] : null;
  const miles = profile?.mi || evCalc?.mi || 12000;
  const electricity = profile?.elecOverride !== "" && profile?.elecOverride != null ? Number(profile.elecOverride) : stateData?.e ?? 16;
  const gas = stateData?.g ?? 3.5;
  const gasSpend = Math.round((miles / 30) * gas);
  const evSpend = Math.round(miles * 0.27 * (electricity / 100));
  const evSavings = gasSpend - evSpend;
  const solarPotential = stateData ? Math.round(1200 * Math.min(1.2, stateData.s / 5)) : null;
  const batteryRoi = stateData ? (stateData.nm === "full" ? "Situational" : stateData.gc >= 35 ? "Moderate" : "Low") : "Estimated";
  const recommendation = evSavings > 900 ? "Run EV and compare tools" : profile?.homeowner ? "Check solar and battery economics" : "Start with compare and state tools";

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Energy Profile Dashboard</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        A lightweight command center for your stored assumptions, recent calculation context, and the next actions Wattfull recommends.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24, alignItems: "start" }}>
        <section style={cardStyle(t)}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: t.textLight }}>Your Energy Profile</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, marginTop: 4 }}>{state ? `${state} context loaded` : "Add a ZIP to improve confidence"}</div>
            </div>
            <div style={{ fontSize: 11, color: t.textLight }}>{profile?.zip ? `ZIP ${profile.zip}` : "No ZIP saved"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Metric label="Gasoline spending" value={`$${gasSpend.toLocaleString()}/yr`} note="Baseline using a 30 MPG gas vehicle." tone="neutral" t={t} />
            <Metric label="Electric driving" value={`$${evSpend.toLocaleString()}/yr`} note={`Using ${electricity} cents/kWh.`} tone="green" t={t} />
            <Metric label="EV savings potential" value={`${evSavings >= 0 ? "+" : "-"}$${Math.abs(evSavings).toLocaleString()}/yr`} note="Preview only. Final verdict comes from the calculator." tone={evSavings >= 0 ? "blue" : "neutral"} t={t} />
            <Metric label="Solar savings potential" value={solarPotential ? `$${solarPotential.toLocaleString()}/yr` : "Add ZIP"} note="Directional estimate from state solar context." tone={solarPotential ? "green" : "neutral"} t={t} />
          </div>

          <div style={{ background: t.card, borderRadius: 14, padding: "16px 18px", marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>Wattfull Verdict</div>
            <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.6 }}>
              {evSavings > 900
                ? "Your current assumptions point toward a financially attractive EV operating-cost case. The next step is validating purchase cost, charging mix, and break-even on the EV and compare pages."
                : evSavings > 0
                ? "Your profile still leans EV-favorable, but not by enough to skip the deeper comparison. Purchase price, charging access, and climate assumptions may swing the answer."
                : "Your stored assumptions do not yet show a strong EV advantage. Use compare, state context, and solar tools before making a purchase decision."}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", borderRadius: 999, padding: "4px 8px" }}>{state ? "Estimated with state context" : "Static benchmark"}</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: t.white, color: t.textMid, borderRadius: 999, padding: "4px 8px" }}>Battery ROI: {batteryRoi}</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: t.white, color: t.textMid, borderRadius: 999, padding: "4px 8px" }}>Miles: {miles.toLocaleString()}/yr</span>
            </div>
          </div>
        </section>

        <aside style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 12 }}>Best next move</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{recommendation}</div>
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {[
              { href: "/ev", label: "Run EV calculator", note: "Full ownership verdict and assumptions" },
              { href: "/compare", label: "Compare EV vs gas", note: "Separate purchase, operating, and ownership cost" },
              { href: "/states", label: "Review state context", note: "See incentives, rates, and friendliness" },
              { href: "/gear", label: "See matched gear", note: "Chargers, batteries, and power gear" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{item.note}</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Tracked assumptions</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.75 }}>
            ZIP: <b style={{ color: t.text }}>{profile?.zip || "Not saved"}</b><br />
            Electricity: <b style={{ color: t.text }}>{electricity} cents/kWh</b><br />
            Home charging: <b style={{ color: t.text }}>{profile?.hasCharger === false ? "No" : "Yes"}</b><br />
            Homeowner: <b style={{ color: t.text }}>{profile?.homeowner === false ? "No" : "Yes"}</b><br />
            Solar interest: <b style={{ color: t.text }}>{profile?.solarInterest || "Exploring"}</b>
          </div>
        </section>

        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Recent calculator context</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.75 }}>
            Recent EV: <b style={{ color: t.text }}>{evCalc?.evId || "Not saved"}</b><br />
            Comparison gas vehicle: <b style={{ color: t.text }}>{evCalc?.iceId || "Not saved"}</b><br />
            Ownership years: <b style={{ color: t.text }}>{evCalc?.yr || 8}</b><br />
            Driving style: <b style={{ color: t.text }}>{evCalc?.driveStyle || profile?.driveStyle || "normal"}</b>
          </div>
        </section>

        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Trust and freshness</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.75 }}>
            Vehicle inputs: <b style={{ color: t.text }}>EPA and seed specs</b><br />
            Rates: <b style={{ color: t.text }}>Live or estimated depending on availability</b><br />
            State context: <b style={{ color: t.text }}>Static benchmark layer</b><br />
            Recommendation confidence: <b style={{ color: t.text }}>{state ? "Medium" : "Low"}</b>
          </div>
        </section>
      </div>
    </div>
  );
}
