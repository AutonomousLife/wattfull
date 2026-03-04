"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Select } from "@/components/ui";
import { POWER_STATIONS, APPLIANCES } from "@/lib/data";

const PRESETS = [
  { name: "Camping Weekend", icon: "🏕️", items: ["Mini Fridge", "LED Lights (5)", "Phone Charger", "Portable Fan"] },
  { name: "Power Outage", icon: "🔦", items: ["Mini Fridge", "WiFi Router", "LED Lights (5)", "Phone Charger", "CPAP Machine"] },
  { name: "Tailgate Party", icon: "🎉", items: ["TV (42\")", "Blender", "Phone Charger", "LED Lights (5)"] },
];

export function WhatCanIRunPage() {
  const { t } = useTheme();
  const [stationId, setStationId] = useState(1);
  const [selected, setSelected] = useState(["Mini Fridge", "Phone Charger", "LED Lights (5)", "WiFi Router"]);

  const station = POWER_STATIONS.find((s) => s.id === stationId);
  const wh = parseFloat(station.capacity.replace(/,/g, ""));
  const maxW = parseFloat(station.output.replace(/[^0-9]/g, ""));
  const totalW = selected.reduce((s, n) => { const a = APPLIANCES.find((x) => x.name === n); return s + (a ? a.watts : 0); }, 0);
  const hours = totalW > 0 ? Math.round((wh / totalW) * 10) / 10 : 0;
  const overload = totalW > maxW;
  const capacityPct = Math.min(100, Math.round((totalW / maxW) * 100));

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>What Can I Run?</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Pick a power station and check off appliances to see how long they'll last.
      </p>

      {/* Presets */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button key={p.name} onClick={() => setSelected(p.items)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${t.border}`, background: t.white, color: t.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .15s" }}>
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 28, marginTop: 20 }}>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 22 }}>
          <Select label="Power Station" value={stationId} onChange={(v) => setStationId(Number(v))} options={POWER_STATIONS.map((s) => ({ value: s.id, label: `${s.name} (${s.capacity})` }))} />
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textMid, marginBottom: 12 }}>Select appliances:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {APPLIANCES.map((a) => {
              const on = selected.includes(a.name);
              return (
                <button key={a.name} onClick={() => setSelected((p) => on ? p.filter((x) => x !== a.name) : [...p, a.name])} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${on ? t.green : t.borderLight}`, background: on ? t.greenLight : t.white, cursor: "pointer", transition: "all .15s", fontSize: 13, color: t.text, fontWeight: on ? 600 : 400, textAlign: "left" }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div>
                    <div>{a.name}</div>
                    <div style={{ fontSize: 11, color: t.textLight }}>{a.watts}W</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          {/* Capacity bar */}
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: t.textMid, marginBottom: 8 }}>
              <span>Power Draw</span>
              <span style={{ color: overload ? t.err : t.green }}>{totalW}W / {maxW}W</span>
            </div>
            <div style={{ height: 8, background: t.card, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${capacityPct}%`, background: overload ? t.err : t.green, borderRadius: 4, transition: "width .3s ease" }} />
            </div>
          </div>

          {/* Runtime card */}
          <div style={{ background: overload ? t.err : t.green, borderRadius: 14, padding: 22, color: "#fff", marginBottom: 16 }}>
            {overload ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 700 }}>⚠️ Overload!</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Total {totalW}W exceeds {station.output} output. Remove some appliances.</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Estimated Runtime</div>
                <div style={{ fontSize: 42, fontWeight: 800 }}>{hours > 99 ? "99+" : hours} hrs</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{totalW}W total from {selected.length} appliances · {station.capacity} capacity</div>
              </>
            )}
          </div>

          {/* Breakdown */}
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 12 }}>Runtime Breakdown</div>
            {selected.map((name) => {
              const a = APPLIANCES.find((x) => x.name === name);
              if (!a) return null;
              const h = Math.round((wh / a.watts) * 10) / 10;
              return (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{a.icon}</span>
                    <span style={{ fontSize: 13, color: t.text }}>{a.name}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.green }}>{h > 99 ? "99+" : h} hrs alone</div>
                </div>
              );
            })}
            {selected.length === 0 && <div style={{ fontSize: 13, color: t.textLight, textAlign: "center", padding: 20 }}>Select appliances to see runtime</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
