"use client";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { useSheen } from "@/lib/useSheen";
import { Icon } from "./Icon";

/**
 * ToolTile — card for the tools grid.
 *
 * featured prop:
 *   false (default) — compact card, normal grid cell
 *   true            — richer card spanning 2 columns, more prominent
 *
 * Props:
 *   icon     — Lucide icon name
 *   title    — tool name
 *   desc     — short description
 *   href     — navigation target
 *   featured — boolean
 *   cta      — CTA label (featured only, default "Open Calculator →")
 *   chips    — string[] — small pills shown inside featured card
 */
export function ToolTile({ icon, title, desc, href, featured = false, cta, chips }) {
  const { t } = useTheme();
  const sheen = useSheen();

  if (featured) {
    return (
      <Link
        href={href}
        style={{ gridColumn: "span 2", textDecoration: "none", display: "block" }}
      >
        <div
          className={`${sheen.className} wf-lift`}
          {...sheen.handlers}
          style={{
            position: "relative",
            background: t.featuredBg,
            border: `1.5px solid ${t.featuredBorder}`,
            borderRadius: "var(--r-xl)",
            padding: "24px 28px",
            overflow: "hidden",
            boxShadow: t.shadowLg,
          }}
        >
          {/* ── Top row: icon + eyebrow + title + desc ── */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 18 }}>
            {/* Icon */}
            <div style={{
              flexShrink: 0,
              width: 52,
              height: 52,
              borderRadius: "var(--r-lg)",
              background: t.greenGlass,
              border: `1.5px solid ${t.featuredBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 10px ${t.green}22`,
              marginTop: 2,
            }}>
              <Icon name={icon} size={26} color={t.green} strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: t.green,
                marginBottom: 5,
              }}>
                Featured Tool
              </div>
              <div style={{
                fontSize: "clamp(16px, 2.2vw, 20px)",
                fontWeight: 750,
                color: t.text,
                letterSpacing: "-.02em",
                lineHeight: 1.2,
                marginBottom: 5,
              }}>
                {title}
              </div>
              <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.55 }}>
                {desc}
              </div>
            </div>
          </div>

          {/* ── Bottom row: chips (left) + CTA (right) ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}>
            {/* Chips */}
            {chips && chips.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {chips.map((chip, i) => (
                  <span key={i} style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.green,
                    background: t.greenGlass,
                    border: `1px solid ${t.featuredBorder}`,
                    borderRadius: "var(--r-md)",
                    padding: "3px 10px",
                  }}>
                    {chip}
                  </span>
                ))}
              </div>
            ) : <div />}

            {/* CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.green }}>
                {cta || "Open Calculator"}
              </span>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: t.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 2px 10px ${t.green}55`,
              }}>
                <Icon name="ArrowRight" size={15} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Decorative rings */}
          <div style={{
            position: "absolute",
            right: -40,
            top: "50%",
            transform: "translateY(-50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `1px solid ${t.featuredBorder}`,
            opacity: 0.35,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            right: -80,
            top: "50%",
            transform: "translateY(-50%)",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: `1px solid ${t.featuredBorder}`,
            opacity: 0.2,
            pointerEvents: "none",
          }} />
        </div>
      </Link>
    );
  }

  // Normal tile
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        className={`${sheen.className} wf-lift`}
        {...sheen.handlers}
        style={{
          background: t.white,
          border: `1px solid ${t.borderLight}`,
          borderRadius: "var(--r-lg)",
          padding: "20px 20px 18px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: t.shadowMd,
          transition: "box-shadow var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 42,
          height: 42,
          borderRadius: "var(--r-md)",
          background: t.greenGlass,
          border: `1px solid ${t.featuredBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name={icon} size={22} color={t.green} strokeWidth={1.75} />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-.015em", marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>
            {desc}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: t.green, marginTop: 2 }}>
          Open
          <Icon name="ChevronRight" size={14} color={t.green} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
