"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { CHARGERS, STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";
import { AssumptionGrid, FaqList, Slider, TrustStrip, VerdictPanel } from "@/components/ui";
import { STORAGE_KEYS, getStoredJson, pushStoredHistory } from "@/lib/profileStore";

function cardStyle(t) {
  return { background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 18 };
}

export function ChargingPage() {
  const { t } = useTheme();
  const [zip, setZip] = useState("");
  const [miles, setMiles] = useState(12000);
  const [homeowner, setHomeowner] = useState(true);
  const [homeAccess, setHomeAccess] = useState(true);
  const [installCost, setInstallCost] = useState(1600);
  const [chargerPrice, setChargerPrice] = useState(399);
  const [electricity, setElectricity] = useState(16);
  const [publicShare, setPublicShare] = useState(20);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const profile = getStoredJson(STORAGE_KEYS.profile, null);
    if (!profile) return;
    if (profile.zip) setZip(profile.zip);
    if (profile.mi) setMiles(profile.mi);
    if (profile.homeowner === false) setHomeowner(false);
    if (profile.hasCharger === false) setHomeAccess(false);
    if (profile.elecOverride !== "" && profile.elecOverride != null) setElectricity(Number(profile.elecOverride));
  }, []);

  const state = useMemo(() => resolveStateFromZip(zip), [zip]);
  const stateData = state ? STATE_DATA[state] : null;

  useEffect(() => {
    if (stateData && !getStoredJson(STORAGE_KEYS.profile, null)?.elecOverride) {
      setElectricity(stateData.e);
    }
  }, [stateData]);

  function calculate() {
    const annualKwh = miles * 0.29;
    const homeRate = electricity / 100;
    const publicRate = homeRate + 0.18;
    const currentPublicShare = homeAccess ? publicShare / 100 : 0.85;
    const currentHomeShare = 1 - currentPublicShare;
    const l1Cost = annualKwh * ((currentHomeShare * homeRate) + (currentPublicShare * publicRate));
    const l2PublicShare = homeAccess ? Math.max(0.05, currentPublicShare - 0.15) : currentPublicShare;
    const l2HomeShare = 1 - l2PublicShare;
    const l2Cost = annualKwh * ((l2HomeShare * homeRate) + (l2PublicShare * publicRate));
    const annualSavings = Math.round(l1Cost - l2Cost);
    const timeValue = Math.round((miles / 1200) * (homeAccess ? 3 : 0));
    const yearlyValue = annualSavings + timeValue * 20;
    const totalUpfront = installCost + chargerPrice;
    const paybackYears = yearlyValue > 0 ? Number((totalUpfront / yearlyValue).toFixed(1)) : null;
    const verdictTone = !homeowner && !homeAccess ? "lowConfidence" : paybackYears && paybackYears <= 5 ? "favorable" : paybackYears && paybackYears <= 9 ? "marginal" : "lowConfidence";
    const topPicks = CHARGERS
      .filter((charger) => homeowner ? charger.amps >= 40 : charger.id === "lectron-portable" || charger.amps <= 16)
      .slice(0, 3);

    const next = {
      annualKwh: Math.round(annualKwh),
      l1Cost: Math.round(l1Cost),
      l2Cost: Math.round(l2Cost),
      annualSavings,
      yearlyValue,
      paybackYears,
      totalUpfront,
      verdictTone,
      topPicks,
      recommendations: topPicks.map((charger) => `${charger.name} | ${charger.tag}`),
    };

    setResult(next);
    pushStoredHistory(STORAGE_KEYS.chargingHistory, {
      zip,
      state,
      miles,
      homeowner,
      homeAccess,
      annualSavings: next.annualSavings,
      paybackYears: next.paybackYears,
      at: new Date().toISOString(),
    });
  }

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Home Charging Economics</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        Decide whether Level 2 charging is worth it, what setup fits your living situation, and which charger style makes sense before you spend money on installation.
      </p>

      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <TrustStrip
          title="Charging tool trust layer"
          items={[
            { label: "Electricity", value: state ? `${state} estimated` : "Fallback estimate", note: "State average unless you saved a utility override.", tone: state ? "neutral" : "low" },
            { label: "Install cost", value: "User input", note: "Use your electrician quote if you have one.", tone: "positive" },
            { label: "Output", value: "Directional economics", note: "Best for screening whether Level 2 is worth deeper shopping.", tone: "caution" },
          ]}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 22, alignItems: "start" }}>
        <section style={cardStyle(t)}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>Your setup</div>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ fontSize: 12, color: t.textMid }}>ZIP code
              <input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <Slider label="Annual miles" value={miles} onChange={setMiles} min={4000} max={40000} step={500} editable inputModes={["year","week","day"]} suffix=" / year" />
            <label style={{ fontSize: 12, color: t.textMid }}>Electricity rate
              <input type="number" value={electricity} onChange={(e) => setElectricity(Number(e.target.value) || 0)} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Install cost
              <input type="number" value={installCost} onChange={(e) => setInstallCost(Number(e.target.value) || 0)} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Charger hardware cost
              <input type="number" value={chargerPrice} onChange={(e) => setChargerPrice(Number(e.target.value) || 0)} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Current public charging share
              <input type="range" min={0} max={90} step={5} value={publicShare} onChange={(e) => setPublicShare(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "#10b981" }} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{publicShare}%</div>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setHomeowner(true)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${homeowner ? "#10b981" : t.borderLight}`, background: homeowner ? "#d1fae5" : t.card, color: homeowner ? "#065f46" : t.text }}>Own</button>
              <button onClick={() => setHomeowner(false)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${!homeowner ? "#10b981" : t.borderLight}`, background: !homeowner ? "#d1fae5" : t.card, color: !homeowner ? "#065f46" : t.text }}>Rent</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setHomeAccess(true)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${homeAccess ? "#10b981" : t.borderLight}`, background: homeAccess ? "#d1fae5" : t.card, color: homeAccess ? "#065f46" : t.text }}>Dedicated spot</button>
              <button onClick={() => setHomeAccess(false)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${!homeAccess ? "#10b981" : t.borderLight}`, background: !homeAccess ? "#d1fae5" : t.card, color: !homeAccess ? "#065f46" : t.text }}>No home spot</button>
            </div>
            <button onClick={calculate} style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: t.green, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Evaluate charging setup</button>
          </div>
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          {!result ? (
            <div style={cardStyle(t)}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Run the charging screen</div>
              <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.65, marginTop: 8 }}>Wattfull will estimate annual charging cost, the value of reducing public charging, a rough payback on Level 2, and the charger style most likely to fit your situation.</div>
            </div>
          ) : (
            <>
              <VerdictPanel
                label={result.verdictTone === "favorable" ? "Level 2 looks financially and practically justified" : result.verdictTone === "marginal" ? "Level 2 looks useful, but quote-sensitive" : "Treat home charging as a convenience decision first"}
                tone={result.verdictTone}
                summary={result.verdictTone === "favorable"
                  ? "Your current miles, charging mix, and install assumptions suggest a home charger can pay back in a reasonable period while also lowering public-charging dependency."
                  : result.verdictTone === "marginal"
                  ? "The case is not bad, but a high install quote or low public-charging reliance can quickly weaken the economics."
                  : "The charger may still be worth it for convenience, but the financial case is weak without higher mileage, lower install cost, or more home access."}
                reasons={[
                  `${result.annualKwh.toLocaleString()} kWh/year of charging demand gives home charging enough volume to matter.`,
                  `Estimated annual savings versus your current setup: ${result.annualSavings >= 0 ? "+" : "-"}$${Math.abs(result.annualSavings).toLocaleString()}.`,
                  result.paybackYears ? `Simple payback is about ${result.paybackYears} years on a $${result.totalUpfront.toLocaleString()} all-in setup.` : "There is no clean payback at the current assumptions.",
                ]}
                caveats={[
                  "Public DC fast charging pricing varies a lot by network and region.",
                  "Install cost is highly panel- and wiring-dependent.",
                ]}
                changes={[
                  "Higher annual miles improve the charger case quickly.",
                  "A lower electrician quote can move a marginal case into favorable territory.",
                  "Apartment or shared-parking constraints can override the math.",
                ]}
                confidence={state ? "Estimated with state context" : "Estimated benchmark"}
                nextAction="Next best action: shortlist the charger type, then confirm install cost with a local electrician."
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {[ 
                  { label: "Current charging cost", value: `$${result.l1Cost.toLocaleString()}/yr` },
                  { label: "With Level 2", value: `$${result.l2Cost.toLocaleString()}/yr` },
                  { label: "All-in upfront", value: `$${result.totalUpfront.toLocaleString()}` },
                  { label: "Estimated payback", value: result.paybackYears ? `${result.paybackYears} yrs` : "No payback" },
                ].map((item) => (
                  <div key={item.label} style={cardStyle(t)}>
                    <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginTop: 5 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <AssumptionGrid
                title="Charging assumptions"
                items={[
                  { label: "ZIP / state", value: state ? `${zip} / ${state}` : zip || "No ZIP" },
                  { label: "Electricity", value: `${electricity} cents/kWh` },
                  { label: "Annual miles", value: `${miles.toLocaleString()} / year` },
                  { label: "Public mix now", value: `${homeAccess ? publicShare : 85}%` },
                  { label: "Install cost", value: `$${installCost.toLocaleString()}` },
                  { label: "Hardware", value: `$${chargerPrice.toLocaleString()}` },
                ]}
                footer="Use this as a screening model. Real electrician quotes and parking constraints still matter more than the slider values."
              />

              <div style={cardStyle(t)}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Recommended charger picks</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {result.topPicks.map((charger) => (
                    <div key={charger.id} style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{charger.name}</div>
                          <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{charger.bestFor}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.green }}>{charger.tag}</div>
                          <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>${charger.price} | {charger.amps}A</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <Link href="/gear" style={{ textDecoration: "none", color: t.green, fontSize: 13, fontWeight: 700 }}>Open Gear for more product context</Link>
                </div>
              </div>

              <FaqList
                title="Charging questions"
                items={[
                  { q: "When does Level 2 make financial sense?", a: "Usually when you drive enough miles, pay a public-charging premium today, or can get installation done without an expensive panel upgrade." },
                  { q: "What if I rent?", a: "For renters, charger economics are often weak unless you control a dedicated parking spot. Portable chargers and charging access matter more than raw payback." },
                  { q: "What is not in this model yet?", a: "Panel upgrades, utility-specific EV tariffs, and charging-time preference are not fully personalized yet." },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}


