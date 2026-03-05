"use client";
import Link from "next/link";
import { useSheen } from "@/lib/useSheen";
import { useTheme } from "@/lib/ThemeContext";
import { Icon } from "./Icon";

/**
 * GlassButton — premium button with cursor-follow sheen effect.
 *
 * Variants: "primary" | "secondary" | "ghost" | "danger"
 * Sizes:    "sm" | "md" | "lg"
 *
 * Props:
 *   - href: renders as <Link> (internal) or <a> (external)
 *   - icon: Lucide icon name shown before label
 *   - iconAfter: Lucide icon name shown after label
 *   - loading: shows spinner
 *   - disabled
 *   - fullWidth
 *   - onClick
 */
export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconAfter,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  style = {},
  className = "",
  external = false,
  ...props
}) {
  const { t } = useTheme();
  const sheen = useSheen();

  const SIZES = {
    sm: { padding: "7px 14px",  fontSize: 13, gap: 6,  iconSize: 15, radius: "var(--r-md)" },
    md: { padding: "11px 22px", fontSize: 15, gap: 8,  iconSize: 18, radius: "var(--r-lg)" },
    lg: { padding: "14px 28px", fontSize: 16, gap: 10, iconSize: 20, radius: "var(--r-lg)" },
  };

  const sz = SIZES[size];

  const BASE = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sz.gap,
    padding: sz.padding,
    fontSize: sz.fontSize,
    fontWeight: 650,
    borderRadius: sz.radius,
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    whiteSpace: "nowrap",
    userSelect: "none",
    width: fullWidth ? "100%" : undefined,
    transition: "transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease)",
    letterSpacing: "-.01em",
  };

  const VARIANTS = {
    primary: {
      background: t.green,
      color: "#fff",
      boxShadow: `0 2px 8px ${t.green}55, 0 1px 2px rgba(0,0,0,.1)`,
    },
    secondary: {
      background: t.glass,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1.5px solid ${t.border}`,
      color: t.text,
      boxShadow: t.shadowMd,
    },
    ghost: {
      background: "transparent",
      border: `1.5px solid ${t.border}`,
      color: t.textMid,
      boxShadow: "none",
    },
    danger: {
      background: t.err,
      color: "#fff",
      boxShadow: `0 2px 8px ${t.err}44`,
    },
  };

  const combinedStyle = {
    ...BASE,
    ...VARIANTS[variant],
    ...style,
  };

  const inner = (
    <>
      {icon && !loading && <Icon name={icon} size={sz.iconSize} color="currentColor" strokeWidth={2} />}
      {loading && (
        <span style={{
          width: sz.iconSize, height: sz.iconSize,
          border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
          display: "inline-block",
          flexShrink: 0,
        }} />
      )}
      <span>{children}</span>
      {iconAfter && !loading && <Icon name={iconAfter} size={sz.iconSize} color="currentColor" strokeWidth={2} />}
    </>
  );

  const handleClick = (e) => {
    if (disabled || loading) { e.preventDefault(); return; }
    sheen.handlers.onClick(e);
    onClick?.(e);
  };

  const commonProps = {
    className: `${sheen.className} wf-lift ${className}`,
    style: combinedStyle,
    onPointerMove: sheen.handlers.onPointerMove,
    onPointerLeave: sheen.handlers.onPointerLeave,
    onClick: handleClick,
    ...props,
  };

  if (href) {
    if (external) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>{inner}</a>;
    }
    return <Link href={href} {...commonProps}>{inner}</Link>;
  }

  return (
    <button type="button" disabled={disabled || loading} {...commonProps}>
      {inner}
    </button>
  );
}

// Add keyframes for spinner (injected once)
if (typeof document !== "undefined") {
  if (!document.getElementById("wf-spin-keyframes")) {
    const s = document.createElement("style");
    s.id = "wf-spin-keyframes";
    s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(s);
  }
}
