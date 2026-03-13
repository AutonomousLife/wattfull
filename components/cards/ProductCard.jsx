"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Stars } from "@/components/ui";

export function ProductCard({ product, type, onSelect, selected }) {
  const { t } = useTheme();
  const spec = type === "panel"
    ? `${product.watts}W · ${product.weight}`
    : `${product.capacity} · ${product.weight}`;
  const tagLine = [product.tags?.[0], spec].filter(Boolean).join(" · ");

  return (
    <div
      onClick={() => onSelect(product.id)}
      style={{
        background: selected ? t.greenLight : t.white,
        border: `1.5px solid ${selected ? t.green : t.borderLight}`,
        borderRadius: 14,
        cursor: "pointer",
        transition: "border-color .15s, background .15s",
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      {/* brand + price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".07em" }}>
          {product.brand}
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, color: t.green, flexShrink: 0, lineHeight: 1 }}>
          ${product.price}
        </span>
      </div>
      {/* name */}
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>
        {product.name}
      </div>
      {/* stars */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Stars n={product.rating} />
        <span style={{ fontSize: 11, color: t.textLight }}>
          {product.rating} ({product.reviews.toLocaleString()})
        </span>
      </div>
      {/* spec + tag as plain text */}
      <div style={{ fontSize: 12, color: t.textMid, marginTop: 2 }}>
        {tagLine}
      </div>
      {/* bestFor */}
      <div style={{
        fontSize: 12,
        color: t.textLight,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {product.bestFor}
      </div>
    </div>
  );
}
