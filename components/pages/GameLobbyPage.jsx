"use client";

import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";

function gameUrl(server) {
  return server ? `/game/index.html?server=${encodeURIComponent(server)}` : "/game/index.html";
}

export function GameLobbyPage() {
  const { t } = useTheme();
  const [server, setServer] = useState("");
  const [error, setError] = useState("");

  function joinLanWorld() {
    const address = server.trim();
    if (!address) {
      setError("Enter the WebSocket address of the LAN host.");
      return;
    }
    try {
      const url = new URL(address);
      if (url.protocol !== "ws:" && url.protocol !== "wss:") throw new Error("protocol");
      window.location.assign(gameUrl(url.toString()));
    } catch {
      setError("Use a WebSocket address, e.g. ws://192.168.1.42:2567.");
    }
  }

  return (
    <div style={{ padding: "clamp(40px,7vw,88px) 0 clamp(64px,9vw,120px)", maxWidth: 980 }}>
      <div style={{ borderLeft: `2px solid ${t.green}`, paddingLeft: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".1em", textTransform: "uppercase" }}>Experimental game</span>
      </div>
      <h1 style={{ fontSize: "clamp(42px,6vw,70px)", fontWeight: 800, color: t.text, lineHeight: 0.98, letterSpacing: "-.06em", marginBottom: 18 }}>Blockworks</h1>
      <p style={{ maxWidth: 610, fontSize: 17, color: t.textMid, lineHeight: 1.65, marginBottom: 36 }}>
        A small block sandbox that runs directly in the browser. Solo is ready now; LAN worlds sync player positions and block edits through a lightweight host server.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        <GlassCard variant="outlined" padding={24} style={{ borderTop: `2px solid ${t.green}` }}>
          <Icon name="Compass" size={22} color={t.green} strokeWidth={1.8} />
          <div style={{ fontSize: 20, fontWeight: 750, color: t.text, letterSpacing: "-.03em", margin: "16px 0 8px" }}>Solo world</div>
          <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.6, marginBottom: 20 }}>A self-contained world with mining, placement, a procedural landscape, and zero external game-engine dependencies.</p>
          <GlassButton href="/game/index.html" variant="primary" size="md" iconAfter="ArrowRight">Play solo</GlassButton>
        </GlassCard>

        <GlassCard variant="outlined" padding={24}>
          <Icon name="Users" size={22} color={t.green} strokeWidth={1.8} />
          <div style={{ fontSize: 20, fontWeight: 750, color: t.text, letterSpacing: "-.03em", margin: "16px 0 8px" }}>Join LAN world</div>
          <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.6, marginBottom: 16 }}>Enter the host address after someone starts the bundled local world server.</p>
          <label style={{ display: "block", fontSize: 11, fontWeight: 750, color: t.textLight, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 }}>Host address</label>
          <input
            value={server}
            onChange={(event) => { setServer(event.target.value); setError(""); }}
            onKeyDown={(event) => event.key === "Enter" && joinLanWorld()}
            placeholder="ws://192.168.1.42:2567"
            spellCheck="false"
            style={{ width: "100%", padding: "11px 12px", background: t.card, color: t.text, border: `1px solid ${error ? t.err : t.border}`, borderRadius: "var(--r-sm)", outline: "none", fontSize: 13, marginBottom: 10 }}
          />
          {error ? <div style={{ color: t.err, fontSize: 12, marginBottom: 10 }}>{error}</div> : null}
          <GlassButton variant="secondary" size="md" iconAfter="ArrowRight" onClick={joinLanWorld}>Join world</GlassButton>
        </GlassCard>
      </div>

      <GlassCard variant="flat" padding={20} style={{ marginTop: 12, border: `1px solid ${t.borderLight}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: t.green, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Host a LAN world</div>
        <code style={{ display: "block", fontSize: 13, color: t.text, marginBottom: 8 }}>npm run game:server</code>
        <p style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>The host shares the printed <code>ws://</code> address with people on the same network. For a secure public deployment, use a <code>wss://</code> game server.</p>
      </GlassCard>
    </div>
  );
}
