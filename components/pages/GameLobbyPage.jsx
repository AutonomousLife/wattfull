"use client";

import { useTheme } from "@/lib/ThemeContext";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";

export function GameLobbyPage() {
  const { t } = useTheme();
  return (
    <div style={{ padding: "clamp(40px,7vw,88px) 0 clamp(64px,9vw,120px)", maxWidth: 980 }}>
      <div style={{ borderLeft: `2px solid ${t.green}`, paddingLeft: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".1em", textTransform: "uppercase" }}>Experimental game</span>
      </div>
      <h1 style={{ fontSize: "clamp(42px,6vw,70px)", fontWeight: 800, color: t.text, lineHeight: 0.98, letterSpacing: "-.06em", marginBottom: 18 }}>Blockworks</h1>
      <p style={{ maxWidth: 650, fontSize: 17, color: t.textMid, lineHeight: 1.65, marginBottom: 36 }}>
        A first-person voxel expedition built as an independent Three.js game. Gather resources, craft tools, find crystal, and raise a signal beacon—then keep the world as a building sandbox.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(250px, .65fr)", gap: 12 }}>
        <GlassCard variant="outlined" padding={28} style={{ borderTop: `2px solid ${t.green}` }}>
          <Icon name="Compass" size={22} color={t.green} strokeWidth={1.8} />
          <div style={{ fontSize: 22, fontWeight: 760, color: t.text, letterSpacing: "-.03em", margin: "18px 0 8px" }}>Begin the expedition</div>
          <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, marginBottom: 22 }}>Procedural terrain, grounded first-person movement, mining, nine-slot hotbar, crafting, health, objectives, original sound, and local browser saves.</p>
          <GlassButton href="/blockworks/" variant="primary" size="md" iconAfter="ArrowRight">Launch Blockworks</GlassButton>
        </GlassCard>
        <GlassCard variant="flat" padding={24}>
          <div style={{ fontSize: 11, fontWeight: 800, color: t.green, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Field controls</div>
          <p style={{ fontSize: 13, color: t.textMid, lineHeight: 1.8 }}>WASD to move<br />Mouse to look<br />Left click to mine<br />Right click to place<br />E for inventory<br />C for crafting</p>
        </GlassCard>
      </div>
    </div>
  );
}
