"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";

export function StatesPage() {
  const { t } = useTheme();
  const [sel, setSel] = useState(null);

  const states = Object.entries(STATE_DATA)
    .map(([a, d]) => ({
      a,
      ...d,
      sc2: Math.round((d.gc + (d.ec > 0 ? 20 : 0) + (d.sc > 0 ? 10 : 0) + (d.nm === "full" ? 15 : d.nm === "partial" ? 8 : 0))),
    }))
    .sort((a, b) => b.sc2 - a.sc2);

  const gr = (s) => (s >= 60 ? "A" : s >= 45 ? "B+" : s >= 35 ? "B" : s >= 25 ? "C+" : s >= 15 ? "C" : "D");
  const gc = (g) => (g.startsWith("A") ? t.greenDark : g.startsWith("B") ? t.blue : t.textMid);
  const d = sel ? states.find((s) => s.a === sel) : null;

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>State Report Cards</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
        Graded on grid, incentives, solar policy, and utility friendliness.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: d ? "1fr 1fr" : "1fr", gap: 24, marginTop: 24 }}>
        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowY: "auto", maxHeight: 540 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: t.card, position: "sticky", top: 0 }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: t.textLight }}>State</th>
                  <th style={{ padding: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: t.textLight }}>Grid</th>
                  <th style={{ padding: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: t.textLight }}>EV $</th>
                  <th style={{ padding: 10, textAlign: "center", fontSize: 12, fontWeight: 600, color: t.textLight }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.a} onClick={() => setSel(s.a)} style={{ borderTop: `1px solid ${t.borderLight}`, cursor: "pointer", background: sel === s.a ? t.greenLight : "transparent" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: t.text }}>{s.a}</td>
                    <td style={{ padding: 10, textAlign: "center", color: t.textMid }}>{s.gc}%</td>
                    <td style={{ padding: 10, textAlign: "center", color: t.textMid }}>{s.ec > 0 ? `$${s.ec.toLocaleString()}` : "—"}</td>
                    <td style={{ padding: 10, textAlign: "center", fontWeight: 700, color: gc(gr(s.sc2)) }}>{gr(s.sc2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {d && (
          <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{d.a}</h2>
            <div style={{ fontSize: 36, fontWeight: 800, color: gc(gr(d.sc2)), marginBottom: 16 }}>{gr(d.sc2)}</div>
            <div style={{ fontSize: 14, color: t.textMid, lineHeight: 2 }}>
              <div>Electricity: <b>{d.e}¢/kWh</b></div>
              <div>Gas: <b>${d.g}/gal</b></div>
              <div>Solar: <b>{d.s} sun-hrs/day</b></div>
              <div>Climate: <b>{d.z}</b></div>
              <div>EV incentive: <b>{d.ec > 0 ? `$${d.ec.toLocaleString()}` : "None"}</b></div>
              <div>Net metering: <b>{d.nm}</b></div>
              <div>Grid renewable: <b>{d.gc}%</b></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
