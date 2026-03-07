"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { POWER_STATIONS, STATE_DATA } from "@/lib/data";
import { resolveStateFromZip } from "@/lib/geo";
import { AssumptionGrid, FaqList, TrustStrip, VerdictPanel } from "@/components/ui";
import { STORAGE_KEYS, getStoredJson, pushStoredHistory } from "@/lib/profileStore";

function cardStyle(t) {
  return { background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 18 };
}

function recommendStations(loadKw, hours) {
  const needWh = loadKw * 1000 * hours;
  return POWER_STATIONS
    .map((station) => ({
      ...station,
      rawCapacity: parseFloat(String(station.capacity).replace(/[^\d.]/g, "")) || 0,
    }))
    .sort((a, b) => Math.abs((a.rawCapacity * 0.85) - needWh) - Math.abs((b.rawCapacity * 0.85) - needWh))
    .slice(0, 3);
}

export function BatteryPage() {
  const { t } = useTheme();
  const [zip, setZip] = useState("");
  const [batteryKwh, setBatteryKwh] = useState(13.5);
  const [batteryCost, setBatteryCost] = useState(13500);
  const [criticalLoadKw, setCriticalLoadKw] = useState(1.5);
  const [outageHours, setOutageHours] = useState(6);
  const [touSpread, setTouSpread] = useState(10);
  const [solarPair, setSolarPair] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const profile = getStoredJson(STORAGE_KEYS.profile, null);
    if (profile?.zip) setZip(profile.zip);
  }, []);

  const state = useMemo(() => resolveStateFromZip(zip), [zip]);
  const stateData = state ? STATE_DATA[state] : null;

  function calculate() {
    const usableKwh = batteryKwh * 0.9;
    const backupHours = Number((usableKwh / Math.max(criticalLoadKw, 0.2)).toFixed(1));
    const arbitrage = Math.round((touSpread / 100) * usableKwh * 180 * 0.72);
    const resilienceValue = Math.round(outageHours * criticalLoadKw * 45);
    const solarPairValue = solarPair ? 280 : 60;
    const annualValue = arbitrage + solarPairValue + Math.round(resilienceValue * 0.35);
    const paybackYears = annualValue > 0 ? Number((batteryCost / annualValue).toFixed(1)) : null;
    const verdictTone = paybackYears && paybackYears <= 12 ? "favorable" : paybackYears && paybackYears <= 18 ? "marginal" : "lowConfidence";
    const stationPicks = recommendStations(criticalLoadKw, Math.min(outageHours, 12));

    const next = {
      usableKwh: Number(usableKwh.toFixed(1)),
      backupHours,
      arbitrage,
      resilienceValue,
      annualValue,
      paybackYears,
      verdictTone,
      stationPicks,
    };

    setResult(next);
    pushStoredHistory(STORAGE_KEYS.batteryHistory, {
      zip,
      state,
      batteryKwh,
      batteryCost,
      backupHours: next.backupHours,
      annualValue: next.annualValue,
      paybackYears: next.paybackYears,
      at: new Date().toISOString(),
    });
  }

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Battery Economics Preview</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.65, maxWidth: 760, marginTop: 8 }}>
        Screen whether a home battery is mainly a resilience purchase, a TOU bill-arbitrage play, or a strong solar-pairing upgrade before you ask installers for quotes.
      </p>

      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <TrustStrip
          title="Battery tool trust layer"
          items={[
            { label: "Economics", value: "Directional", note: "Best for screening, not final underwriting.", tone: "caution" },
            { label: "State context", value: state ? `${state} loaded` : "Fallback context", note: "Used to frame solar-pair and grid context only.", tone: state ? "neutral" : "low" },
            { label: "Gear matches", value: "Portable backup picks", note: "Home battery catalog is not live yet, so backup gear fills the recommendation gap.", tone: "low" },
          ]}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 22, alignItems: "start" }}>
        <section style={cardStyle(t)}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>Battery assumptions</div>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ fontSize: 12, color: t.textMid }}>ZIP code
              <input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Battery size
              <input type="range" min={5} max={30} step={0.5} value={batteryKwh} onChange={(e) => setBatteryKwh(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "#10b981" }} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{batteryKwh} kWh</div>
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Installed cost
              <input type="number" value={batteryCost} onChange={(e) => setBatteryCost(Number(e.target.value) || 0)} style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.card, color: t.text }} />
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Critical load during outage
              <input type="range" min={0.5} max={5} step={0.1} value={criticalLoadKw} onChange={(e) => setCriticalLoadKw(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "#10b981" }} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{criticalLoadKw.toFixed(1)} kW</div>
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Outage hours you care about
              <input type="range" min={1} max={48} step={1} value={outageHours} onChange={(e) => setOutageHours(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "#10b981" }} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{outageHours} hrs/year</div>
            </label>
            <label style={{ fontSize: 12, color: t.textMid }}>Time-of-use spread
              <input type="range" min={0} max={35} step={1} value={touSpread} onChange={(e) => setTouSpread(Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "#10b981" }} />
              <div style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{touSpread} cents/kWh</div>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setSolarPair(true)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${solarPair ? "#10b981" : t.borderLight}`, background: solarPair ? "#d1fae5" : t.card, color: solarPair ? "#065f46" : t.text }}>Paired with solar</button>
              <button onClick={() => setSolarPair(false)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${!solarPair ? "#10b981" : t.borderLight}`, background: !solarPair ? "#d1fae5" : t.card, color: !solarPair ? "#065f46" : t.text }}>Battery only</button>
            </div>
            <button onClick={calculate} style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: t.green, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Evaluate battery case</button>
          </div>
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          {!result ? (
            <div style={cardStyle(t)}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Run the battery preview</div>
              <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.65, marginTop: 8 }}>Wattfull will estimate backup coverage, directional arbitrage value, a rough payback, and what kind of backup product fits the load you actually care about.</div>
            </div>
          ) : (
            <>
              <VerdictPanel
                label={result.verdictTone === "favorable" ? "Battery looks viable for your setup" : result.verdictTone === "marginal" ? "Battery case is real, but still quote-sensitive" : "Battery looks more like resilience than pure ROI"}
                tone={result.verdictTone}
                summary={result.verdictTone === "favorable"
                  ? "The combination of outage needs, TOU spread, and solar pairing makes a battery worth serious installer conversations."
                  : result.verdictTone === "marginal"
                  ? "The value is there, but the final answer depends heavily on installed cost and how often you will actually cycle the battery."
                  : "This looks more like a convenience or resilience purchase. That can still be rational, but the pure financial case is weak under these assumptions."}
                reasons={[
                  `${result.usableKwh} kWh usable energy covers about ${result.backupHours} hours of your critical load.`,
                  `Directional annual value is about $${result.annualValue.toLocaleString()}, including TOU spread and resilience framing.`,
                  result.paybackYears ? `Simple payback is about ${result.paybackYears} years on a $${batteryCost.toLocaleString()} system.` : "There is no clear payback at the current assumptions.",
                ]}
                caveats={[
                  "Resilience value is personal and difficult to price precisely.",
                  "Actual battery quotes vary a lot by electrical work and backup-panel complexity.",
                ]}
                changes={[
                  "Higher TOU spread improves arbitrage quickly.",
                  "More outage risk or solar pairing makes the battery case stronger.",
                  "A materially lower install quote can move a marginal case into favorable territory.",
                ]}
                confidence={stateData ? "Estimated with state context" : "Illustrative screening tool"}
                nextAction="Next best action: compare this preview with a real installer quote or use backup gear if full home storage is too expensive."
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {[
                  { label: "Usable energy", value: `${result.usableKwh} kWh` },
                  { label: "Backup runtime", value: `${result.backupHours} hrs` },
                  { label: "Annual value", value: `$${result.annualValue.toLocaleString()}` },
                  { label: "Simple payback", value: result.paybackYears ? `${result.paybackYears} yrs` : "No payback" },
                ].map((item) => (
                  <div key={item.label} style={cardStyle(t)}>
                    <div style={{ fontSize: 11, color: t.textLight, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginTop: 5 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <AssumptionGrid
                title="Battery assumptions"
                items={[
                  { label: "ZIP / state", value: state ? `${zip} / ${state}` : zip || "No ZIP" },
                  { label: "Battery size", value: `${batteryKwh} kWh` },
                  { label: "Installed cost", value: `$${batteryCost.toLocaleString()}` },
                  { label: "Critical load", value: `${criticalLoadKw.toFixed(1)} kW` },
                  { label: "Outage hours", value: `${outageHours} hrs/year` },
                  { label: "TOU spread", value: `${touSpread} cents/kWh` },
                ]}
                footer="This preview is intentionally conservative about pure financial ROI. Many battery purchases are partly about resilience, not just payback."
              />

              <div style={cardStyle(t)}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 10 }}>Backup gear alternatives</div>
                <div style={{ fontSize: 12, color: t.textLight, lineHeight: 1.65, marginBottom: 12 }}>
                  Until Wattfull has a fuller home-battery catalog, these portable backup options are the closest fit for your critical-load profile.
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {result.stationPicks.map((station) => (
                    <div key={station.id} style={{ background: t.card, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{station.name}</div>
                          <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{station.capacity} | {station.output} | {station.battery}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.green }}>${station.price}</div>
                          <div style={{ fontSize: 11, color: t.textLight, marginTop: 4 }}>{station.bestFor}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <Link href="/gear" style={{ textDecoration: "none", color: t.green, fontSize: 13, fontWeight: 700 }}>Open Gear for more backup products</Link>
                </div>
              </div>

              <FaqList
                title="Battery questions"
                items={[
                  { q: "Why can the ROI still look weak?", a: "Because home batteries are often bought for resilience first. Pure bill savings depend heavily on TOU spread, solar pairing, and how often the battery cycles." },
                  { q: "When does a battery case improve fast?", a: "When outage pain is real, TOU rates are wide, or the battery is paired with solar in a way that increases self-consumption value." },
                  { q: "What is missing here?", a: "Installer-specific battery quotes, interconnection rules, and a true home-battery product catalog are not wired in yet." },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

