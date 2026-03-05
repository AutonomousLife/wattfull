"use client";
import { useTheme } from "@/lib/ThemeContext";

/**
 * SectionHeader — consistent heading block used across all pages.
 *
 * Props:
 *   eyebrow  — small uppercase label above the title (optional)
 *   title    — main headline (required)
 *   desc     — paragraph below title (optional)
 *   align    — "left" | "center" (default: "left")
 *   titleSize — CSS font-size value (default: "clamp(22px,3vw,32px)")
 *   style    — extra styles on the container
 */
export function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "left",
  titleSize = "clamp(22px,3vw,32px)",
  style = {},
}) {
  const { t } = useTheme();

  return (
    <div style={{ textAlign: align, marginBottom: 32, ...style }}>
      {eyebrow && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: t.green,
          marginBottom: 10,
          padding: "4px 12px",
          background: t.greenGlass,
          borderRadius: "var(--r-xl)",
          border: `1px solid ${t.featuredBorder}`,
        }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontSize: titleSize,
        fontWeight: 760,
        color: t.text,
        lineHeight: 1.22,
        letterSpacing: "-.025em",
        margin: 0,
      }}>
        {title}
      </h2>
      {desc && (
        <p style={{
          fontSize: 15,
          color: t.textMid,
          lineHeight: 1.65,
          marginTop: 10,
          maxWidth: align === "center" ? 560 : 600,
          margin: align === "center" ? "10px auto 0" : "10px 0 0",
        }}>
          {desc}
        </p>
      )}
    </div>
  );
}
