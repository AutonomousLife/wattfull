"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Stars, Badge } from "@/components/ui";

export function ProductCard({ product, type, onSelect, selected }) {
  const { t } = useTheme();
  const spec = type === "panel"
    ? `${product.watts}W · ${product.weight}`
    : `${product.capacity} · ${product.weight}`;

  return (
    <div
      onClick={() => onSelect(product.id)}
      style={{
        background: selected ? t.greenLight : t.white,
        border: `1.5px solid ${selected ? t.green : t.borderLight}`,
        borderRadius: 14,
        cursor: "pointer",
        transition: "border-color .15s, background .15s",
        padding: "16px 18px",
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {/* Row 1: brand + price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em" }}>
          {product.brand}
        </span>
        <span style={{ fontSize: 19, fontWeight: 800, color: t.green, flexShrink: 0, lineHeight: 1 }}>
          ${product.price}
        </span>
      </div>
      {/* Row 2: product name */}
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.35 }}>
        {product.name}
      </div>
      {/* Row 3: stars + rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Stars n={product.rating} />
        <span style={{ fontSize: 11, color: t.textLight }}>
          {product.rating} ({product.reviews.toLocaleString()})
        </span>
      </div>
      {/* Row 4: tags + spec */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
        {product.tags?.slice(0, 2).map((tag) => (
          <Badge key={tag} type="tag">{tag}</Badge>
        ))}
        <span style={{ fontSize: 11, color: t.textMid }}>{spec}</span>
      </div>
    </div>
  );
}
