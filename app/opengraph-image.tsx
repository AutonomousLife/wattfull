import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wattfull — Energy decisions, done right";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #F3F1EC 0%, #E6EFE9 55%, #D7E4DC 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#4A7C59",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.02em" }}>
            Wattfull
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 820,
              color: "#1A1A1A",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              maxWidth: 980,
            }}
          >
            Make the expensive energy decision with the real numbers first.
          </div>
          <div style={{ fontSize: 26, color: "#4A5A50", maxWidth: 920, lineHeight: 1.4 }}>
            EV savings, solar ROI, charging, and ownership tools with transparent assumptions.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["EIA rates", "EPA efficiency", "Open methodology", "Independent"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(74,124,89,0.12)",
                border: "1px solid rgba(74,124,89,0.32)",
                color: "#2F5940",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
