"use client";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Stars, Badge } from "@/components/ui";
import VoteBadge from "@/components/ui/VoteBadge";

function asinImg(asin) {
  if (!asin) return null;
  return `/api/img?asin=${asin}`;
}

const TYPE_ICON = { panel: "Solar", station: "Power" };

export function ProductCard({ product, type, onSelect, selected }) {
  const { t } = useTheme();
  const imgSources = useMemo(() => [asinImg(product.asin), product.image].filter(Boolean), [product.asin, product.image]);
  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = imgSources[imgIndex] ?? null;
  const imageScale = product.cardImageScale ?? product.imageScale ?? 1;
  const imagePosition = product.cardImagePosition ?? product.imagePosition ?? "center center";

  useEffect(() => {
    setImgIndex(0);
  }, [product.id]);

  return (
    <div
      onClick={() => onSelect(product.id)}
      style={{
        background: selected ? t.greenLight : t.white,
        border: `1.5px solid ${selected ? t.green : t.borderLight}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .2s",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 160,
          background: t.card,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
        }}
      >
        {imgSrc ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, rgba(245,248,241,0.98) 0%, rgba(232,239,229,0.96) 100%)",
            }}
          >
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: imagePosition,
                transform: `scale(${imageScale})`,
                transformOrigin: "center",
              }}
              onError={() => {
                if (imgIndex < imgSources.length - 1) setImgIndex((n) => n + 1);
                else setImgIndex(-1);
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", opacity: 0.45 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.textLight }}>{TYPE_ICON[type] ?? "Gear"}</div>
            <div style={{ fontSize: 11, color: t.textFaint, marginTop: 4, fontWeight: 600 }}>{product.brand}</div>
          </div>
        )}
      </div>

      <div style={{ padding: 20 }}>
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
            {type === "panel" ? `${product.watts}W | ${product.weight}` : `${product.capacity} | ${product.weight}`}
          </span>
        </div>
        <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5, marginBottom: 10 }}>
          <span style={{ fontWeight: 600 }}>Best for: </span>{product.bestFor}
        </div>
        <VoteBadge itemType="product" itemId={product.id} />
      </div>
    </div>
  );
}
