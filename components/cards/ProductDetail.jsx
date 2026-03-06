"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Stars } from "@/components/ui";
import { amazonLink, amazonDP } from "@/lib/helpers";

function asinImg(asin) {
  if (!asin) return null;
  return `/api/img?asin=${asin}`;
}

export function ProductDetail({ product, type }) {
  const { t } = useTheme();
  const [tab, setTab] = useState("verdict");
  const [imgFailed, setImgFailed] = useState(false);

  const tabs = [
    { id: "verdict", label: "Our Take" },
    { id: "pros", label: "Pros & Cons" },
    { id: "people", label: "Reviews" },
    { id: "quirks", label: "Gotchas" },
  ];

  const specs = type === "panel"
    ? [
        { l: "Watts", v: `${product.watts}W` },
        { l: "Efficiency", v: product.efficiency },
        { l: "Weight", v: product.weight },
        { l: "Type", v: product.type?.split(" ")[0] },
        { l: "Warranty", v: product.warranty },
      ]
    : [
        { l: "Capacity", v: product.capacity },
        { l: "Output", v: product.output },
        { l: "Battery", v: product.battery },
        { l: "Cycles", v: product.cycles },
        { l: "Warranty", v: product.warranty },
      ];

  const href = product.asin ? amazonDP(product.asin) : amazonLink(product.amazonSearch);
  const imgSrc = product.image || asinImg(product.asin);

  return (
    <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: 240,
          background: t.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {imgSrc && !imgFailed ? (
          <>
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 16 }}
              onError={() => setImgFailed(true)}
            />
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 12,
                fontSize: 10,
                color: t.textFaint,
                background: t.card,
                borderRadius: 6,
                padding: "2px 8px",
                border: `1px solid ${t.borderLight}`,
              }}
            >
              product image
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", opacity: 0.4 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: t.textLight }}>{type === "panel" ? "Solar" : "Power"}</div>
            <div style={{ fontSize: 12, color: t.textFaint, marginTop: 6, fontWeight: 600 }}>{product.brand}</div>
          </div>
        )}
      </div>

      <div style={{ padding: 24, borderBottom: `1px solid ${t.borderLight}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.green, textTransform: "uppercase", letterSpacing: ".05em" }}>{product.brand}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginTop: 4 }}>{product.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <Stars n={product.rating} />
              <span style={{ fontSize: 13, color: t.textMid }}>
                {product.rating}/5 | {product.reviews.toLocaleString()} reviews
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: t.green }}>${product.price}</div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: "#fff",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                padding: "7px 16px",
                background: t.green,
                borderRadius: 8,
                transition: "opacity .2s",
              }}
            >
              View on Amazon
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginTop: 16 }}>
          {specs.map((s, i) => (
            <div key={i} style={{ padding: 10, background: t.card, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: t.textLight, fontWeight: 600 }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${t.borderLight}`, overflow: "auto" }}>
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              padding: "12px 20px",
              fontSize: 13,
              fontWeight: tab === tb.id ? 700 : 500,
              color: tab === tb.id ? t.green : t.textMid,
              background: "none",
              border: "none",
              borderBottom: tab === tb.id ? `2px solid ${t.green}` : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === "verdict" && <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.75 }}>{product.verdict}</div>}
        {tab === "pros" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.green, marginBottom: 8 }}>STRENGTHS</div>
              {product.prosRaw.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 14, color: t.textMid, lineHeight: 1.5 }}>
                  <span style={{ color: t.green }}>+</span>{p}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>WEAKNESSES</div>
              {product.consRaw.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 14, color: t.textMid, lineHeight: 1.5 }}>
                  <span style={{ color: "#ef4444" }}>-</span>{c}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "people" && <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.75 }}>{product.peopleSay}</div>}
        {tab === "quirks" && <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.75 }}>{product.quirks}</div>}
      </div>

      <div
        style={{
          padding: "12px 24px 16px",
          borderTop: `1px solid ${t.borderLight}`,
          display: "flex",
          gap: 8,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 11, color: t.textFaint }}>Affiliate link. Wattfull may earn a commission at no cost to you.</div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: t.green,
            padding: "10px 20px",
            borderRadius: 8,
            textDecoration: "none",
            transition: "opacity .2s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Check Price on Amazon
        </a>
      </div>
    </div>
  );
}
