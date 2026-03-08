"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";
import { AssumptionGrid, PhaseRoadmap, TrustStrip, VerdictPanel } from "@/components/ui";
import { STORAGE_KEYS, getStoredJson } from "@/lib/profileStore";

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

function HistoryCard({ title, items, empty, formatter, t }) {
  return (
    <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{title}</div>
      {items.length ? (
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {items.map((item, index) => (
            <div key={`${title}-${index}`} style={{ fontSize: 12, color: t.textMid, lineHeight: 1.55 }}>{formatter(item)}</div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: t.textLight, marginTop: 8 }}>{empty}</div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTheme();
  const [profile, setProfile] = useState(null);
  const [evCalc, setEvCalc] = useState(null);
  const [savedGear, setSavedGear] = useState([]);
  const [savedStates, setSavedStates] = useState([]);
  const [evHistory, setEvHistory] = useState([]);
  const [solarHistory, setSolarHistory] = useState([]);
  const [compareHistory, setCompareHistory] = useState([]);
  const [batteryHistory, setBatteryHistory] = useState([]);
  const [chargingHistory, setChargingHistory] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);

  useEffect(() => {
    setProfile(getStoredJson(STORAGE_KEYS.profile, null));
    setEvCalc(getStoredJson(STORAGE_KEYS.evCalc, null));
    setSavedGear(getStoredJson(STORAGE_KEYS.savedGear, []));
    setSavedStates(getStoredJson(STORAGE_KEYS.savedStates, []));
    setEvHistory(getStoredJson(STORAGE_KEYS.evHistory, []));
    setSolarHistory(getStoredJson(STORAGE_KEYS.solarHistory, []));
    setCompareHistory(getStoredJson(STORAGE_KEYS.compareHistory, []));
    setBatteryHistory(getStoredJson(STORAGE_KEYS.batteryHistory, []));
    setChargingHistory(getStoredJson(STORAGE_KEYS.chargingHistory, []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/data-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDataStatus(Array.isArray(data?.datasets) ? data.datasets : []);
      })
      .catch(() => {
        if (!cancelled) setDataStatus([]);
      });
    return () => {
      cancelled = true;
    };
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
  const batterySignal = batteryHistory[0]?.paybackYears ? `${batteryHistory[0].paybackYears} yr payback` : stateData ? (stateData.nm === "full" ? "Situational" : "Moderate") : "Estimated";
  const confidence = state ? "Medium confidence" : "Low confidence";
  const freshnessNote = dataStatus.length
    ? `${dataStatus.filter((item) => item?.lastSuccessAt).length} tracked datasets reporting`
    : "No live freshness feed detected";
  const alerts = [
    savedStates.length ? `Watching ${savedStates.length} state${savedStates.length === 1 ? "" : "s"} for follow-up.` : null,
    savedGear.length ? `${savedGear.length} saved gear item${savedGear.length === 1 ? "" : "s"} ready for review.` : null,
    compareHistory[0] ? `Recent comparison: ${compareHistory[0].title}.` : null,
    evHistory[0] ? `Recent EV result: ${evHistory[0].evName} vs ${evHistory[0].iceName}.` : null,
    solarHistory[0] ? `Recent solar screen: ${solarHistory[0].state || solarHistory[0].zip || "profile"} context saved.` : null,
  ].filter(Boolean);

  const reasons = [
    state ? `${state} context is loaded, so rates and policy assumptions are more grounded.` : "No ZIP is saved yet, so this uses broad benchmark assumptions.",
    `${miles.toLocaleString()} miles per year is the current usage assumption across your profile and EV tool.`,
    `Electricity is modeled at ${electricity} cents/kWh and gas at about $${gas.toFixed(2)}/gal.`,
  ];

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Energy Profile Dashboard</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        A lightweight command center for your stored assumptions, saved watchlists, recent decisions, and the next moves Wattfull thinks are worth your time.
      </p>

      <div style={{ marginTop: 18, marginBottom: 20 }}>
        <TrustStrip
          title="Profile trust layer"
          items={[
            { label: "Location context", value: state ? `${state} estimated` : "No ZIP saved", note: "ZIP improves rates, incentives, and climate context.", tone: state ? "positive" : "low" },
            { label: "Recent EV state", value: evCalc ? "Saved locally" : "No recent EV run", note: "Used to prefill dashboard and next steps.", tone: evCalc ? "neutral" : "low" },
            { label: "Watchlists", value: `${savedStates.length} states | ${savedGear.length} gear`, note: "Saved locally until account-based profiles exist.", tone: savedStates.length || savedGear.length ? "positive" : "neutral" },
            { label: "Freshness pulse", value: freshnessNote, note: "Powered by the admin data-status layer when available.", tone: dataStatus.length ? "positive" : "low" },
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
            <Metric label="EV savings potential" value={`${evSavings >= 0 ? "+" : "-"}$${Math.abs(evSavings).toLocaleString()}/yr`} note="Preview only. Final verdict comes from the EV tool." tone={evSavings >= 0 ? "blue" : "neutral"} t={t} />
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
              caveats={[
                "Insurance, financing, and installer quotes are not personalized here yet.",
                "Battery and solar numbers remain directional unless a dedicated tool is run.",
              ]}
              changes={[
                "If annual miles fall materially, EV savings compress fast.",
                "If home charging is unavailable, public charging can reduce the advantage.",
                "If your utility is above the state average, solar and EV economics can shift in opposite directions.",
              ]}
              confidence={confidence}
              nextAction="Best next action: run EV and Compare with your actual shortlist, then validate charging or battery decisions."
            />
          </div>
        </section>

        <aside style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 12 }}>Best next move</div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>
            {evSavings > 900 ? "Validate total ownership and break-even on EV and Compare, then decide whether home charging should be part of the purchase." : profile?.homeowner ? "Check solar, charging, and battery economics before buying hardware." : "Start with Compare and Charging, then revisit the bigger home-energy bets."}
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {[
              { href: "/ev", label: "Run EV calculator", note: "Full ownership verdict and assumptions" },
              { href: "/compare", label: "Compare EV vs gas", note: "Separate purchase, operating, and ownership cost" },
              { href: "/charging", label: "Evaluate charging", note: "Level 1 vs Level 2 and charger fit" },
              { href: "/battery", label: "Preview battery ROI", note: "Resilience, TOU, and backup logic" },
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
            footer="These assumptions are stored locally in your browser and reused across calculators where possible."
          />
        </section>

        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Saved and recent items</div>
          <div style={{ display: "grid", gap: 10 }}>
            <HistoryCard
              title="Saved states"
              items={savedStates}
              empty="No watched states yet. Save them from the States pages."
              formatter={(item) => `${item} is on your watchlist for EV, solar, or policy review.`}
              t={t}
            />
            <HistoryCard
              title="Recent EV verdicts"
              items={evHistory.slice(0, 2)}
              empty="No EV verdicts saved yet."
              formatter={(item) => `${item.evName} vs ${item.iceName} | ${item.annualSavings >= 0 ? "+" : "-"}$${Math.abs(item.annualSavings || 0).toLocaleString()}/yr | ${item.breakEven ? `${item.breakEven} yr break-even` : "no break-even"}`}
              t={t}
            />
            <HistoryCard
              title="Recent solar screens"
              items={solarHistory.slice(0, 2)}
              empty="No solar screens saved yet."
              formatter={(item) => `${item.state || item.zip || "Profile"} | ${item.payback ? `${item.payback} yr payback` : "25+ yr payback"} | $${Math.abs(item.lifetime || 0).toLocaleString()} lifetime value`}
              t={t}
            />
            <HistoryCard
              title="Recent comparisons"
              items={compareHistory.slice(0, 2)}
              empty="No compare sessions saved yet."
              formatter={(item) => `${item.title} | ${item.summary}`}
              t={t}
            />
            <HistoryCard
              title="Recent charging screens"
              items={chargingHistory.slice(0, 2)}
              empty="No charging scenarios saved yet."
              formatter={(item) => `${item.state || item.zip || "Profile"} | ${item.paybackYears ? `${item.paybackYears} yr payback` : "no payback"} | ${item.annualSavings >= 0 ? "+" : "-"}$${Math.abs(item.annualSavings || 0).toLocaleString()}/yr`}
              t={t}
            />
            <HistoryCard
              title="Recent battery screens"
              items={batteryHistory.slice(0, 2)}
              empty="No battery previews saved yet."
              formatter={(item) => `${item.state || item.zip || "Profile"} | ${item.paybackYears ? `${item.paybackYears} yr payback` : "screening only"} | $${Math.abs(item.annualValue || 0).toLocaleString()}/yr value`}
              t={t}
            />
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Current watch context</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Recent EV calculator</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{evCalc?.evId || "No EV selected yet"}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{evCalc?.iceId ? `Against ${evCalc.iceId}` : "Run the EV calculator to populate this."}</div>
            </div>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Saved gear</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{savedGear.length ? `${savedGear.length} saved product${savedGear.length === 1 ? "" : "s"}` : "No saved gear yet"}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{savedGear.length ? savedGear.slice(0, 2).join(", ") : "Use Gear to save chargers, batteries, or backup products later."}</div>
            </div>
            <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>Battery signal</div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginTop: 4 }}>{batterySignal}</div>
              <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>Directional only until a fuller battery economics and product layer is in place.</div>
            </div>
          </div>
        </section>

        <section style={cardStyle(t)}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Alerts and watch updates</div>
          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            {alerts.length ? alerts.map((alert, index) => (
              <div key={index} style={{ background: t.card, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>
                {alert}
              </div>
            )) : (
              <div style={{ background: t.card, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: t.textLight }}>
                Save states, gear, or tool runs to start building a live follow-up loop.
              </div>
            )}
          </div>
          <PhaseRoadmap title="Wattfull build phases" />
        </section>
      </div>
    </div>
  );
}
