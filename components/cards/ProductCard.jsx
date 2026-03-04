"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Stars, Badge } from "@/components/ui";

export function ProductCard({ product, type, onSelect, selected }) {
  const { t } = useTheme();
  return (
    <div
      onClick={() => onSelect(product.id)}
      style={{
        background: selected ? t.greenLight : t.white,
        border: `1.5px solid ${selected ? t.green : t.borderLight}`,
        borderRadius: 14,
        padding: 20,
        cursor: "pointer",
        transition: "all .2s",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.textLight, textTransform: "uppercase", letterSpacing: ".04em" }}>{product.brand}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginTop: 2 }}>{product.name}</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.green }}>${product.price}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Stars n={product.rating} />
        <span style={{ fontSize: 12, color: t.textLight }}>({product.reviews.toLocaleString()})</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {product.tags?.map((tag) => (
          <Badge key={tag} type="tag">{tag}</Badge>
        ))}
        <span style={{ fontSize: 12, color: t.textMid, padding: "3px 0" }}>
          {type === "panel" ? `${product.watts}W · ${product.weight}` : `${product.capacity} · ${product.weight}`}
        </span>
      </div>
      <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600 }}>Best for: </span>{product.bestFor}
      </div>
    </div>
  );
}
