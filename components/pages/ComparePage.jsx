"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Select } from "@/components/ui";
import { VehicleSearch } from "@/components/ui/VehicleSearch";
import { VEHICLES, POPULAR_EV_IDS, POWER_STATIONS } from "@/lib/data";

export function ComparePage() {
  const { t } = useTheme();
  const [tab, setTab] = useState("ev");
  const [sel1, setSel1] = useState("model3lr");
  const [sel2, setSel2] = useState("ioniq5");
  const [pSel1, setPSel1] = useState(1);
  const [pSel2, setPSel2] = useState(4);

  const TabBar = () => (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, background: t.card, borderRadius: 10, marginTop: 16, marginBottom: 24 }}>
      {[{ id: "ev", label: "⚡ EVs" }, { id: "stations", label: "🔋 Stations" }].map((tb) => (
        <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: tab === tb.id ? 700 : 500, background: tab === tb.id ? t.white : "transparent", color: tab === tb.id ? t.text : t.textMid, border: "none", cursor: "pointer" }}>
          {tb.label}
        </button>
      ))}
    </div>
  );

  if (tab === "ev") {
    const a = VEHICLES.ev.find((v) => v.id === sel1);
    const b = VEHICLES.ev.find((v) => v.id === sel2);
    const rows = a && b ? [
      { l: "Efficiency", a: `${a.kwh} kWh/100mi`, b: `${b.kwh} kWh/100mi`, better: a.kwh < b.kwh ? "a" : b.kwh < a.kwh ? "b" : "tie" },
      { l: "MSRP", a: `$${a.msrp.toLocaleString()}`, b: `$${b.msrp.toLocaleString()}`, better: a.msrp < b.msrp ? "a" : "b" },
      { l: "Max Federal Credit*", a: `$${a.fc.toLocaleString()}`, b: `$${b.fc.toLocaleString()}`, better: a.fc > b.fc ? "a" : "b" },
      { l: "Net Price (w/ max credit)*", a: `$${(a.msrp - a.fc).toLocaleString()}`, b: `$${(b.msrp - b.fc).toLocaleString()}`, better: (a.msrp - a.fc) < (b.msrp - b.fc) ? "a" : "b" },
    ] : [];

    return (
      <div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
        <TabBar />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <VehicleSearch vehicles={VEHICLES.ev} value={sel1} onChange={setSel1} popularIds={POPULAR_EV_IDS} />
          <VehicleSearch vehicles={VEHICLES.ev} value={sel2} onChange={setSel2} popularIds={POPULAR_EV_IDS} />
        </div>
        {a && b && (
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: t.card }}>
                  <th style={{ padding: 12, textAlign: "left", color: t.textLight, fontSize: 12 }}>Spec</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{a.name}</th>
                  <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{b.name}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                    <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? t.green : t.textMid, background: row.better === "a" ? t.greenLight + "44" : "transparent" }}>{row.a}{row.better === "a" ? " ✓" : ""}</td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? t.green : t.textMid, background: row.better === "b" ? t.greenLight + "44" : "transparent" }}>{row.b}{row.better === "b" ? " ✓" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {a && b && (
          <p style={{ fontSize: 11, color: t.textLight, marginTop: 8, lineHeight: 1.5 }}>
            * Federal credit eligibility depends on buyer income, vehicle MSRP, and assembly location. Credits are not automatic — verify at fueleconomy.gov before purchasing.
          </p>
        )}
      </div>
    );
  }

  // Power stations tab
  const a = POWER_STATIONS.find((s) => s.id === pSel1);
  const b = POWER_STATIONS.find((s) => s.id === pSel2);
  const stationRows = a && b ? [
    { l: "Capacity", a: a.capacity, b: b.capacity, better: parseFloat(a.capacity.replace(/,/g, "")) > parseFloat(b.capacity.replace(/,/g, "")) ? "a" : "b" },
    { l: "Output", a: a.output, b: b.output, better: parseFloat(a.output) > parseFloat(b.output) ? "a" : "b" },
    { l: "Price", a: `$${a.price}`, b: `$${b.price}`, better: a.price < b.price ? "a" : "b" },
    { l: "Weight", a: a.weight, b: b.weight },
    { l: "Battery", a: a.battery, b: b.battery },
    { l: "Cycles", a: a.cycles, b: b.cycles },
    { l: "Warranty", a: a.warranty, b: b.warranty },
  ] : [];

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Compare Side-by-Side</h1>
      <TabBar />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select value={pSel1} onChange={(v) => setPSel1(Number(v))} options={POWER_STATIONS.map((s) => ({ value: s.id, label: s.name }))} />
        <Select value={pSel2} onChange={(v) => setPSel2(Number(v))} options={POWER_STATIONS.map((s) => ({ value: s.id, label: s.name }))} />
      </div>
      {a && b && (
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: t.card }}>
                <th style={{ padding: 12, textAlign: "left", color: t.textLight, fontSize: 12 }}>Spec</th>
                <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{a.name}</th>
                <th style={{ padding: 12, textAlign: "center", color: t.text, fontWeight: 700 }}>{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {stationRows.map((row, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${t.borderLight}` }}>
                  <td style={{ padding: 12, color: t.textMid, fontWeight: 600 }}>{row.l}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "a" ? 700 : 400, color: row.better === "a" ? t.green : t.text, background: row.better === "a" ? t.greenLight + "44" : "transparent" }}>{row.a}{row.better === "a" ? " ✓" : ""}</td>
                  <td style={{ padding: 12, textAlign: "center", fontWeight: row.better === "b" ? 700 : 400, color: row.better === "b" ? t.green : t.text, background: row.better === "b" ? t.greenLight + "44" : "transparent" }}>{row.b}{row.better === "b" ? " ✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
