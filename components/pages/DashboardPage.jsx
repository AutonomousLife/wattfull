"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";
import { AssumptionGrid, TrustStrip, VerdictPanel } from "@/components/ui";

const PROFILE_KEY = "wattfull_profile";
const EV_KEY = "wattfull_ev_calc_v2";
const SAVED_GEAR_KEY = "wattfull_saved_gear";

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
  const [savedGear, setSavedGear] = useState([]);

  useEffect(() => {
    try { setProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || "null")); } catch { setProfile(null); }
    try { setEvCalc(JSON.parse(localStorage.getItem(EV_KEY) || "null")); } catch { setEvCalc(null); }
    try { setSavedGear(JSON.parse(localStorage.getItem(SAVED_GEAR_KEY) || "[]")); } catch { setSavedGear([]); }
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
  const confidence = state ? "Medium confidence" : "Low confidence";

  const reasons = [
    state ? `${state} context is loaded, so rates and policy assumptions are more grounded.` : "No ZIP is saved yet, so this uses broad benchmark assumptions.",
    `${miles.toLocaleString()} miles per year is the current usage assumption across your profile and EV tool.`,
    `Electricity is modeled at ${electricity} cents/kWh and gas at about $${gas.toFixed(2)}/gal.`,
  ];

  const caveats = [
    "Insurance, financing, and installer quotes are not personalized here yet.",
    "Battery and solar numbers remain directional unless a dedicated tool is run.",
  ];

  const changes = [
    "If annual miles fall materially, EV savings compress fast.",
    "If home charging is unavailable, public charging can reduce the advantage.",
    "If your utility is above the state average, solar and EV economics can shift in opposite directions.",
  ];

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Energy Profile Dashboard</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        A lightweight command center for your stored assumptions, recent calculation context, and the next actions Wattfull recommends.
      </p>

      <div style={{ marginTop: 18, marginBottom: 20 }}>
        <TrustStrip
          title="Profile trust layer"
          items={[
            { label: "Location context", value: state ? `${state} estimated` : "No ZIP saved", note: "ZIP improves rates, incentives, and climate context.", tone: state ? "positive" : "low" },
            { label: "Recent calc state", value: evCalc ? "Saved locally" : "No recent EV run", note: "Used to prefill dashboard and next steps.", tone: evCalc ? "neutral" : "low" },
            { label: "Data quality", value: confidence, note: "Higher confidence when your profile is complete.", tone: state ? "neutral" : "low" },
          ]}
        />
      </div>

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

          <div style={{ marginTop: 16 }}>
            <VerdictPanel
              label={evSavings > 900 ? "Strong candidate for an EV-first review" : evSavings > 0 ? "Marginal but promising" : "Low-confidence EV case so far"}
              tone={evSavings > 900 ? "favorable" : evSavings > 0 ? "marginal" : state ? "neutral" : "lowConfidence"}
              summary={evSavings > 900
                ? "Your current profile points toward favorable EV operating economics, but you still need purchase-cost and charging-friction checks before acting."
                : evSavings > 0
                ? "The operating-cost case leans positive, but purchase cost, apartment charging, or cold-climate penalties could still change the recommendation."
                : "The dashboard does not yet show a strong EV operating advantage. Fill in more profile context before treating this as decision-grade guidance."}
              reasons={reasons}
              caveats={caveats}
              changes={changes}
              confidence={confidence}
              nextAction="Best next action: run EV and Compare with your actual vehicle shortlist."
            />
          </div>
        </section>

        <aside style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 12 }}>Best next move</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>
            {evSavings > 900 ? "Validate total ownership and break-even on the EV and Compare tools." : profile?.homeowner ? "Check solar and battery economics before making a hardware purchase." : "Start with Compare and State context, then return here."}
          </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <section style={cardStyle(t)}>
          <AssumptionGrid
            title="Tracked assumptions"
            items={[
              { label: "ZIP", value: profile?.zip || "Not saved" },
              { label: "Electricity", value: `${electricity} cents/kWh` },
              { label: "Miles", value: `${miles.toLocaleString()} / year` },
              { label: "Home charging", value: profile?.hasCharger === false ? "No" : "Yes" },
              { label: "Homeowner", value: profile?.homeowner === false ? "No" : "Yes" },
              { label: "Solar interest", value: profile?.solarInterest || "Exploring" },
            ]}
            footer="These assumptions are currently stored locally in your browser and reused across calculators where possible."
          />
        </section>

        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Saved and recent items</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Recent calculator</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{evCalc?.evId || "No EV selected yet"}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{evCalc?.iceId ? `Against ${evCalc.iceId}` : "Run the EV calculator to populate this."}</div>
            </div>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Saved gear</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{savedGear.length ? `${savedGear.length} saved product${savedGear.length === 1 ? "" : "s"}` : "No saved gear yet"}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{savedGear.length ? savedGear.slice(0, 2).join(", ") : "Use Gear to save chargers, batteries, or backup products later."}</div>
            </div>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Battery ROI signal</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{batteryRoi}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>Directional only. This should be validated in a dedicated battery tool.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
