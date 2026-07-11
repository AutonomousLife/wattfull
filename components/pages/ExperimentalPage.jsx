"use client";

import { useTheme } from "@/lib/ThemeContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";

export function ExperimentalPage() {
  const { t } = useTheme();

  return (
    <div style={{ padding: "clamp(40px,7vw,88px) 0 clamp(64px,9vw,120px)", maxWidth: 820 }}>
      <div style={{ borderLeft: `2px solid ${t.green}`, paddingLeft: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".1em", textTransform: "uppercase" }}>Project shelf</span>
      </div>
      <h1 style={{ fontSize: "clamp(42px,6vw,70px)", fontWeight: 800, color: t.text, lineHeight: 0.98, letterSpacing: "-.06em", marginBottom: 18 }}>
        Experimental
      </h1>
      <p style={{ maxWidth: 560, fontSize: 17, color: t.textMid, lineHeight: 1.65, marginBottom: 36 }}>
        A quiet place for Wattfull projects that are still taking shape.
      </p>

      <GlassCard variant="outlined" padding={26} style={{ borderTop: `2px solid ${t.green}`, maxWidth: 620 }}>
        <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-sm)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, marginBottom: 18 }}>
          <Icon name="Wrench" size={20} color={t.green} strokeWidth={1.8} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 760, color: t.text, letterSpacing: "-.03em", marginBottom: 8 }}>The bench is clear.</div>
        <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65 }}>
          Add projects here when they are ready for a small, focused space of their own.
        </p>
      </GlassCard>
    </div>
  );
}
