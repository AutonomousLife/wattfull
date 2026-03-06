"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { ProductCard, ProductDetail } from "@/components/cards";
import { SOLAR_PANELS, POWER_STATIONS } from "@/lib/data";

export function MarketplacePage() {
  const { t } = useTheme();
  const [tab, setTab] = useState("panels");
  const [sp, setSp] = useState(1);
  const [ss, setSs] = useState(1);

  const items = tab === "panels" ? SOLAR_PANELS : POWER_STATIONS;
  const sel = tab === "panels" ? SOLAR_PANELS.find((p) => p.id === sp) : POWER_STATIONS.find((p) => p.id === ss);
  const setSel = tab === "panels" ? setSp : setSs;

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Gear Reviews</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 640 }}>
        Independent assessments from real owner reviews and field reports.
      </p>
      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: t.card, borderRadius: 10, marginTop: 20, marginBottom: 24 }}>
        {[{ id: "panels", label: "Solar Panels" }, { id: "stations", label: "Power Stations" }].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: tab === tb.id ? 700 : 500,
              background: tab === tb.id ? t.white : "transparent",
              color: tab === tb.id ? t.text : t.textMid,
              border: "none",
              cursor: "pointer",
              boxShadow: tab === tb.id ? `0 1px 4px ${t.shadow}` : "none",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 720, overflowY: "auto", paddingRight: 8, paddingLeft: 3, paddingTop: 3, paddingBottom: 3 }}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} type={tab === "panels" ? "panel" : "station"} onSelect={setSel} selected={p.id === (tab === "panels" ? sp : ss)} />
          ))}
        </div>
        <div className="detail-col">
          {sel && <ProductDetail product={sel} type={tab === "panels" ? "panel" : "station"} />}
        </div>
      </div>
      <div style={{ marginTop: 24, padding: 14, background: t.card, borderRadius: 10, fontSize: 12, color: t.textLight, lineHeight: 1.6 }}>
        <b style={{ color: t.textMid }}>Disclosure:</b> Product links may be affiliate links. Wattfull may earn a commission at no cost to you.
      </div>
    </div>
  );
}
