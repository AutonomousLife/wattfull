"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Icon } from "./Icon";

/**
 * StatPill — compact chip for displaying a stat, label, or metadata signal.
 *
 * Variants: "default" | "green" | "amber" | "blue" | "red" | "glass"
 *
 * Usage:
 *   <StatPill label="Updated" value="Feb 2025" />
 *   <StatPill icon="Zap" value="13.9¢/kWh" variant="green" />
 *   <StatPill icon="TrendingUp" value="+$1,350/yr" variant="green" size="lg" />
 */
export function StatPill({
  label,
  value,
  icon,
  variant = "default",
  size = "md",
  style = {},
}) {
  const { t } = useTheme();

  const SIZES = {
    sm: { fontSize: 11, iconSize: 12, padding: "3px 9px",  gap: 5, radius: "var(--r-md)" },
    md: { fontSize: 12, iconSize: 14, padding: "4px 11px", gap: 5, radius: "var(--r-md)" },
    lg: { fontSize: 13, iconSize: 16, padding: "6px 13px", gap: 6, radius: "var(--r-lg)" },
  };

  const sz = SIZES[size];

  const VARIANTS = {
    default: { bg: t.card,       border: t.borderLight, color: t.textMid },
    green:   { bg: t.greenGlass, border: t.featuredBorder, color: t.green },
    amber:   { bg: t.warnBg,     border: "#F0C060",     color: t.warn  },
    blue:    { bg: t.blueBg,     border: "#A0C0E0",     color: t.blue  },
    red:     { bg: t.errBg,      border: "#F0A0A0",     color: t.err   },
    glass:   { bg: t.glass,      border: t.glassBorder, color: t.text  },
  };

  const v = VARIANTS[variant];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: sz.gap,
      padding: sz.padding,
      borderRadius: sz.radius,
      background: v.bg,
      border: `1px solid ${v.border}`,
      fontSize: sz.fontSize,
      fontWeight: 600,
      color: v.color,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {icon && <Icon name={icon} size={sz.iconSize} color="currentColor" strokeWidth={2} />}
      {label && <span style={{ color: t.textLight, fontWeight: 500 }}>{label}</span>}
      {label && value && <span style={{ color: v.color, opacity: 0.4 }}>·</span>}
      {value && <span style={{ fontWeight: 650 }}>{value}</span>}
    </span>
  );
}
