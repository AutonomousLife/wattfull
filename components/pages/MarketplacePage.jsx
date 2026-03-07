"use client";
import { useMemo, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { ProductCard, ProductDetail } from "@/components/cards";
import { SOLAR_PANELS, POWER_STATIONS } from "@/lib/data";
import { TrustStrip, VerdictPanel } from "@/components/ui";

function scoreProduct(product, type) {
  const reviewScore = Math.min(30, Math.round(Math.log10(Math.max(product.reviews, 10)) * 10));
  const ratingScore = Math.round(product.rating * 12);
  const valueScore = type === "panel"
    ? Math.max(0, Math.min(25, Math.round((product.watts / Math.max(product.price, 1)) * 18)))
    : Math.max(0, Math.min(25, Math.round((parseFloat(String(product.capacity).replace(/[^\d.]/g, "")) / Math.max(product.price, 1)) * 12)));
  return Math.min(100, reviewScore + ratingScore + valueScore + 10);
}

export function MarketplacePage() {
  const { t } = useTheme();
  const [tab, setTab] = useState("panels");
  const [sp, setSp] = useState(1);
  const [ss, setSs] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("score");

  const sourceItems = tab === "panels" ? SOLAR_PANELS : POWER_STATIONS;
  const type = tab === "panels" ? "panel" : "station";
  const filtered = useMemo(() => {
    const base = sourceItems
      .filter((p) => {
        const hay = `${p.name} ${p.brand} ${p.bestFor} ${(p.tags || []).join(" ")}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      })
      .map((product) => ({ ...product, wattfullScore: scoreProduct(product, type) }));

    return base.sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "reviews") return b.reviews - a.reviews;
      return b.wattfullScore - a.wattfullScore;
    });
  }, [sourceItems, query, sort, type]);

  const selectedId = tab === "panels" ? sp : ss;
  const setSelected = tab === "panels" ? setSp : setSs;
  const sel = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  if (sel && sel.id !== selectedId) setSelected(sel.id);

  const topPick = filtered[0];

  return (
    <div>
      <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: t.text }}>Gear Reviews</h1>
      <p style={{ fontSize: 16, color: t.textMid, lineHeight: 1.6, marginTop: 8, maxWidth: 640 }}>
        Independent assessments from real owner reviews and field reports. Wattfull treats gear as a fit problem, not a generic shopping feed.
      </p>

      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <TrustStrip
          title="Product layer status"
          items={[
            { label: "Catalog", value: "Curated static set", note: "Human-curated shortlist of products, not a full marketplace ingest.", tone: "neutral" },
            { label: "Verdicts", value: "Editorial synthesis", note: "Built from product specs, review volume, and field-report framing.", tone: "positive" },
            { label: "Pricing", value: "Seeded price", note: "Verify merchant price before purchase; prices can drift.", tone: "caution" },
          ]}
        />
      </div>

      <div style={{ display: "inline-flex", gap: 4, padding: 4, background: t.card, borderRadius: 10, marginTop: 20, marginBottom: 16 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 14, marginBottom: 20 }}>
        <VerdictPanel
          label={topPick ? `${topPick.name} is the current Wattfull top pick` : "Catalog needs a query reset"}
          tone="favorable"
          summary={topPick
            ? `${topPick.brand} leads this set on a simple Wattfull Score that balances review volume, product rating, and value for money. It is not a replacement for fit, but it is a useful starting point.`
            : "No product matched the current search. Clear the search to restore the shortlist."}
          reasons={topPick ? [
            `${topPick.rating}/5 rating across ${topPick.reviews.toLocaleString()} reviews.`,
            `${type === "panel" ? `${topPick.watts}W` : topPick.capacity} and ${topPick.bestFor.toLowerCase()} positioning fit common use cases.`,
            `Seeded price of $${topPick.price} keeps it competitive inside this shortlist.`,
          ] : []}
          caveats={[
            "Prices are seeded, not live merchant quotes.",
            "This section is curated rather than exhaustively scraped.",
          ]}
          changes={[
            "A sharper filter for your use case can reorder the best pick.",
            "If price moves materially, the value ranking can change.",
          ]}
          confidence="Curated gear layer"
          nextAction="Next best action: open a product and match it to your actual use case."
        />

        <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 10 }}>Browse this category</div>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab === "panels" ? "solar panels" : "power stations"}`}
              style={{ border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "10px 12px", background: t.card, color: t.text, outline: "none" }}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "10px 12px", background: t.card, color: t.text }}>
              <option value="score">Sort by Wattfull Score</option>
              <option value="price">Sort by price</option>
              <option value="reviews">Sort by review volume</option>
            </select>
            <div style={{ fontSize: 12, color: t.textLight }}>{filtered.length} product{filtered.length === 1 ? "" : "s"} in the current shortlist.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 720, overflowY: "auto", paddingRight: 8, paddingLeft: 3, paddingTop: 3, paddingBottom: 3 }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} type={type} onSelect={setSelected} selected={p.id === sel?.id} />
          ))}
        </div>
        <div className="detail-col">
          {sel ? <ProductDetail product={sel} type={type} /> : <div style={{ background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, padding: 20, color: t.textMid }}>No product matches the current filter.</div>}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 14, background: t.card, borderRadius: 10, fontSize: 12, color: t.textLight, lineHeight: 1.6 }}>
        <b style={{ color: t.textMid }}>Disclosure:</b> Product links may be affiliate links. Wattfull may earn a commission at no cost to you.
      </div>
    </div>
  );
}
