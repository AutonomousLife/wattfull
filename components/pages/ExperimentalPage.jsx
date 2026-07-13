"use client";

import Link from "next/link";
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

      <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
        <Link href="/experimental/arcade" style={{ textDecoration: "none" }}>
          <GlassCard variant="outlined" padding={26} className="wf-lift" style={{ borderTop: `2px solid ${t.green}` }}>
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 18 }}>
              <div>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-sm)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, marginBottom: 18 }}>
                  <Icon name="Zap" size={20} color={t.green} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 7 }}>Instant arcade</div>
                <div style={{ fontSize: 22, fontWeight: 760, color: t.text, letterSpacing: "-.035em", marginBottom: 8 }}>Three small games</div>
                <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, maxWidth: 440 }}>A reaction run, a lane-dodging sprint, and a tiny circuit puzzle. Play in seconds.</p>
              </div>
              <Icon name="ArrowRight" size={20} color={t.green} strokeWidth={1.8} />
            </div>
          </GlassCard>
        </Link>

        <Link href="/experimental/play" style={{ textDecoration: "none" }}>
          <GlassCard variant="outlined" padding={26} className="wf-lift" style={{ borderTop: `2px solid ${t.green}` }}>
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 18 }}>
              <div>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-sm)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, marginBottom: 18 }}>
                  <Icon name="Grid" size={20} color={t.green} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 7 }}>Playable prototype</div>
                <div style={{ fontSize: 22, fontWeight: 760, color: t.text, letterSpacing: "-.035em", marginBottom: 8 }}>Blockworks</div>
                <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, maxWidth: 440 }}>
                  A first-person voxel expedition with procedural terrain, crafting, local saves, and a complete beacon objective.
                </p>
              </div>
              <Icon name="ArrowRight" size={20} color={t.green} strokeWidth={1.8} />
            </div>
          </GlassCard>
        </Link>

        <GlassCard variant="outlined" padding={22}>
          <div style={{ fontSize: 16, fontWeight: 730, color: t.text, letterSpacing: "-.02em", marginBottom: 7 }}>The bench is still open.</div>
          <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65 }}>
            Add projects here when they are ready for a small, focused space of their own.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
