"use client";
import { useTheme } from "@/lib/ThemeContext";

/**
 * GlassCard — premium surface component.
 *
 * Variants:
 *   "default"   — solid surface, shadow, no border (60% of use cases)
 *   "outlined"  — surface + 1px border (for input panels, data displays)
 *   "glass"     — semi-transparent + backdrop-filter (nav, hero overlays)
 *   "featured"  — accent-tinted background (CTAs, highlights)
 *   "flat"      — no shadow, no border (nested content)
 *
 * Props:
 *   variant, padding, radius, style, className, children, as ("div"|"section"|…)
 */
export function GlassCard({
  children,
  variant = "default",
  padding = 22,
  radius,
  style = {},
  className = "",
  as: Tag = "div",
  onClick,
  ...props
}) {
  const { t } = useTheme();

  const r = radius ?? "var(--r-lg)";

  const BASE = {
    borderRadius: r,
    overflow: "hidden",
    transition: "box-shadow var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)",
  };

  const VARIANTS = {
    default: {
      background: t.white,
      boxShadow: t.shadowMd,
      padding,
    },
    outlined: {
      background: t.white,
      border: `1px solid ${t.borderLight}`,
      boxShadow: t.shadowMd,
      padding,
    },
    glass: {
      background: t.glass,
      border: `1px solid ${t.glassBorder}`,
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      boxShadow: `${t.shadowMd}, inset 0 1px 0 ${t.glassBorder}`,
      padding,
    },
    featured: {
      background: t.featuredBg,
      border: `1.5px solid ${t.featuredBorder}`,
      boxShadow: t.shadowMd,
      padding,
    },
    flat: {
      background: t.card,
      padding,
    },
  };

  return (
    <Tag
      className={className}
      style={{ ...BASE, ...VARIANTS[variant], ...style }}
      onClick={onClick}
      {...props}
    >
      {children}
    </Tag>
  );
}
