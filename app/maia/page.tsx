"use client";
import { useState, useCallback } from "react";
import { Music, Coffee, Gamepad2, Ticket, Trees, StickyNote, LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemId = "music" | "coffee" | "games" | "movies" | "north" | "notes";
type MoodKey = "cozy" | "aurora" | "neon";

interface RoomItem {
  id: ItemId;
  title: string;
  label: string;
  description: string;
  detail: string;
  Icon: LucideIcon;
  x: number; // percent
  y: number; // percent
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROOM_ITEMS: RoomItem[] = [
  {
    id: "music",
    title: "The Record",
    label: "Music",
    description: "A vinyl spinning slowly in the corner, always the same three albums on repeat.",
    detail: "Probably Fleetwood Mac. Definitely at 2am.",
    Icon: Music,
    x: 14,
    y: 58,
  },
  {
    id: "coffee",
    title: "The Mug",
    label: "Coffee",
    description: "Always half-full. Never sure if it's been reheated or just forgotten.",
    detail: "Oat milk, no sugar, something about that matters a lot.",
    Icon: Coffee,
    x: 72,
    y: 64,
  },
  {
    id: "games",
    title: "The Controller",
    label: "Games",
    description: "Left on the desk like it might be picked up at any moment.",
    detail: "Something cozy. A farm sim, a puzzle game. Nothing with a timer.",
    Icon: Gamepad2,
    x: 82,
    y: 52,
  },
  {
    id: "movies",
    title: "The Stub",
    label: "Movies",
    description: "A kept ticket from a movie that meant something.",
    detail: "Probably seen it four times. The cozy kind, or the quietly devastating kind.",
    Icon: Ticket,
    x: 28,
    y: 72,
  },
  {
    id: "north",
    title: "The Window",
    label: "North",
    description: "The view is always pines and sky. Sometimes aurora.",
    detail: "🇨🇦 Somewhere cold enough to matter.",
    Icon: Trees,
    x: 50,
    y: 20,
  },
  {
    id: "notes",
    title: "The Note",
    label: "Notes",
    description: "Sticky notes on the wall. Little things worth keeping.",
    detail: "\"you are doing okay\" — left there on purpose.",
    Icon: StickyNote,
    x: 62,
    y: 42,
  },
];

const MOODS: Record<MoodKey, { label: string; accent: string; bg: string; glow: string }> = {
  cozy:   { label: "Cozy",   accent: "#f0a050", bg: "radial-gradient(ellipse at 30% 20%, #2a1a0a 0%, #1a1008 60%, #0e0a06 100%)", glow: "rgba(240,160,80,0.18)" },
  aurora: { label: "Aurora", accent: "#40ffaa", bg: "radial-gradient(ellipse at 50% 0%,   #0a2a1a 0%, #061810 60%, #030d08 100%)", glow: "rgba(64,255,170,0.18)" },
  neon:   { label: "Neon",   accent: "#e040fb", bg: "radial-gradient(ellipse at 70% 20%,  #1a0a2a 0%, #10061a 60%, #08030e 100%)", glow: "rgba(224,64,251,0.18)" },
};

// Fixed snow positions — no Math.random() on render (hydration-safe)
const SNOW = [
  { left: "8%",  top: "12%", size: 3, delay: "0s",    dur: "7s"  },
  { left: "15%", top: "5%",  size: 2, delay: "1.2s",  dur: "9s"  },
  { left: "23%", top: "18%", size: 4, delay: "0.4s",  dur: "6s"  },
  { left: "31%", top: "8%",  size: 2, delay: "2.1s",  dur: "8s"  },
  { left: "38%", top: "2%",  size: 3, delay: "0.8s",  dur: "7.5s"},
  { left: "45%", top: "14%", size: 2, delay: "3.0s",  dur: "9s"  },
  { left: "52%", top: "6%",  size: 4, delay: "1.5s",  dur: "6.5s"},
  { left: "59%", top: "20%", size: 2, delay: "0.2s",  dur: "8s"  },
  { left: "66%", top: "3%",  size: 3, delay: "2.6s",  dur: "7s"  },
  { left: "73%", top: "11%", size: 2, delay: "1.0s",  dur: "9.5s"},
  { left: "80%", top: "7%",  size: 4, delay: "0.6s",  dur: "6s"  },
  { left: "87%", top: "16%", size: 2, delay: "3.4s",  dur: "8.5s"},
  { left: "11%", top: "24%", size: 3, delay: "4.0s",  dur: "7s"  },
  { left: "27%", top: "28%", size: 2, delay: "2.8s",  dur: "9s"  },
  { left: "42%", top: "30%", size: 3, delay: "1.8s",  dur: "6.5s"},
  { left: "58%", top: "26%", size: 2, delay: "3.8s",  dur: "8s"  },
  { left: "75%", top: "22%", size: 4, delay: "0.9s",  dur: "7.5s"},
  { left: "91%", top: "9%",  size: 2, delay: "2.3s",  dur: "9s"  },
];

// ─── Shape renderer ───────────────────────────────────────────────────────────

function ItemShape({ id, accent }: { id: ItemId; accent: string }) {
  if (id === "music") return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", border: `3px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
      <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: `1px solid ${accent}33` }} />
    </div>
  );
  if (id === "coffee") return (
    <div style={{ position: "relative" }}>
      <div style={{ width: 28, height: 26, borderRadius: "0 0 8px 8px", border: `2.5px solid ${accent}`, borderTop: "none", background: "transparent" }} />
      <div style={{ position: "absolute", right: -8, top: 4, width: 8, height: 12, borderRadius: "0 6px 6px 0", border: `2px solid ${accent}`, borderLeft: "none" }} />
      <div style={{ position: "absolute", top: -10, left: 4, width: 20, height: 10, overflow: "hidden" }}>
        <div className="maia-steam" style={{ width: 4, height: 14, background: `linear-gradient(to top, ${accent}88, transparent)`, borderRadius: 4, position: "absolute", left: 3, bottom: 0 }} />
        <div className="maia-steam" style={{ width: 4, height: 10, background: `linear-gradient(to top, ${accent}66, transparent)`, borderRadius: 4, position: "absolute", left: 10, bottom: 0, animationDelay: "0.5s" }} />
      </div>
    </div>
  );
  if (id === "games") return (
    <div style={{ width: 36, height: 24, borderRadius: 8, border: `2.5px solid ${accent}`, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${accent}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: `${accent}88` }} />)}
      </div>
    </div>
  );
  if (id === "movies") return (
    <div style={{ width: 28, height: 36, borderRadius: 3, border: `2.5px solid ${accent}`, background: "#111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 3 }}>
      {[0,1,2].map(i => <div key={i} style={{ height: 4, background: `${accent}55`, borderRadius: 2 }} />)}
    </div>
  );
  if (id === "north") return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <polygon points="19,2 6,28 19,22 32,28" fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="19,14 10,34 19,29 28,34" fill={`${accent}44`} stroke={accent} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
  // notes
  return (
    <div style={{ width: 32, height: 32, background: `${accent}22`, border: `2px solid ${accent}`, borderRadius: 4, transform: "rotate(-4deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gap: 3 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: `${accent}88`, borderRadius: 1 }} />)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MaiaPage() {
  const [mood, setMood] = useState<MoodKey>("cozy");
  const [active, setActive] = useState<ItemId | null>(null);
  const [pinned, setPinned] = useState<ItemId | null>(null);

  const m = MOODS[mood];
  const displayed = pinned ?? active;
  const panel = displayed ? ROOM_ITEMS.find(i => i.id === displayed)! : null;

  const cycleNext = useCallback(() => {
    const ids = ROOM_ITEMS.map(i => i.id);
    const cur = displayed ?? ids[0];
    const next = ids[(ids.indexOf(cur) + 1) % ids.length];
    setPinned(next);
    setActive(null);
  }, [displayed]);

  const handlePin = useCallback(() => {
    if (!displayed) return;
    setPinned(prev => prev === displayed ? null : displayed);
  }, [displayed]);

  const isPinned = pinned === displayed;

  return (
    <>
      <style>{`
        @keyframes snowFall {
          0%   { transform: translateY(-10px) translateX(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(100px) translateX(8px); opacity: 0; }
        }
        @keyframes auroraDrift {
          0%   { transform: scaleX(1) translateX(0); opacity: 0.35; }
          50%  { transform: scaleX(1.08) translateX(12px); opacity: 0.55; }
          100% { transform: scaleX(1) translateX(0); opacity: 0.35; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes steam {
          0%   { transform: translateY(0) scaleX(1); opacity: 0.7; }
          50%  { transform: translateY(-6px) scaleX(1.2); opacity: 0.4; }
          100% { transform: translateY(-12px) scaleX(0.8); opacity: 0; }
        }
        .maia-steam { animation: steam 2s ease-in-out infinite; }
        .maia-obj:hover { transform: scale(1.13); }
        .maia-obj { transition: transform .18s ease; }
        .maia-obj:focus-visible { outline: 2px solid white; outline-offset: 3px; border-radius: 8px; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: "100dvh", background: m.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 16px 40px", transition: "background 0.6s ease", fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 28, zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: "clamp(28px,6vw,52px)", fontWeight: 900, color: m.accent, letterSpacing: "-0.03em", textShadow: `0 0 32px ${m.glow}, 0 0 8px ${m.glow}`, animation: "glow 3s ease-in-out infinite" }}>
            Maia
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#ffffff66", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            a room to visit
          </p>
        </div>

        {/* ── Mood switcher ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.05)", borderRadius: 40, padding: "5px 8px", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(Object.entries(MOODS) as [MoodKey, typeof MOODS[MoodKey]][]).map(([key, val]) => (
            <button
              key={key}
              aria-pressed={mood === key}
              onClick={() => setMood(key)}
              style={{
                padding: "6px 16px",
                borderRadius: 40,
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: mood === key ? val.accent : "transparent",
                color: mood === key ? "#000" : "#ffffff88",
                transition: "all .2s ease",
                letterSpacing: "0.04em",
              }}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* ── Room + Panel layout ── */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", width: "100%", maxWidth: 960, flexWrap: "wrap", justifyContent: "center" }}>

          {/* ── Room scene ── */}
          <div
            style={{
              position: "relative",
              width: "min(560px, 100%)",
              aspectRatio: "16/10",
              borderRadius: 20,
              overflow: "hidden",
              border: `1.5px solid ${m.accent}33`,
              boxShadow: `0 0 60px ${m.glow}, 0 8px 40px rgba(0,0,0,0.6)`,
              background: "rgba(0,0,0,0.3)",
              flexShrink: 0,
            }}
          >
            {/* Window sky */}
            <div style={{ position: "absolute", left: "28%", right: "28%", top: "5%", height: "38%", borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg,#0a1a2a 0%,#0d2438 100%)", border: `1px solid ${m.accent}22`, overflow: "hidden" }}>
              {/* Aurora */}
              <div style={{ position: "absolute", top: "20%", left: "-10%", right: "-10%", height: 14, borderRadius: 10, background: `linear-gradient(90deg, transparent, ${m.accent}88, ${m.accent}cc, ${m.accent}55, transparent)`, filter: "blur(4px)", animation: "auroraDrift 5s ease-in-out infinite" }} />
              {/* Snow particles */}
              {SNOW.slice(0, 8).map((s, i) => (
                <div key={i} style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: "50%", background: "rgba(255,255,255,0.85)", animation: `snowFall ${s.dur} ${s.delay} ease-in infinite` }} />
              ))}
              {/* Pines silhouette */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "0 4px" }}>
                {[18, 24, 16, 22, 14, 20, 18].map((h, i) => (
                  <svg key={i} width="10" height={h} viewBox={`0 0 10 ${h}`} fill="none">
                    <polygon points={`5,0 0,${h} 10,${h}`} fill={`#0d2e1a`} />
                  </svg>
                ))}
              </div>
            </div>

            {/* Window sill */}
            <div style={{ position: "absolute", left: "26%", right: "26%", top: "43%", height: 5, background: `${m.accent}44`, borderRadius: 2 }} />

            {/* Lamp glow */}
            <div style={{ position: "absolute", left: "8%", top: "22%", width: 50, height: 70 }}>
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 18, height: 28, background: `linear-gradient(180deg, ${m.accent}44 0%, transparent 100%)`, borderRadius: "50% 50% 0 0", filter: "blur(2px)" }} />
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 2, height: 42, background: `${m.accent}66` }} />
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 3, background: `${m.accent}88`, borderRadius: 2 }} />
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, ${m.accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />
            </div>

            {/* Neon sign */}
            <div style={{ position: "absolute", right: "8%", top: "12%", fontSize: 18, fontWeight: 900, color: m.accent, textShadow: `0 0 8px ${m.accent}, 0 0 20px ${m.accent}`, animation: "glow 3s ease-in-out infinite", letterSpacing: "0.15em" }}>
              MAIA
            </div>

            {/* Floor */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "32%", background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)` }} />

            {/* Room items */}
            {ROOM_ITEMS.map((item) => (
              <button
                key={item.id}
                className="maia-obj"
                onMouseEnter={() => { if (!pinned) setActive(item.id); }}
                onMouseLeave={() => { if (!pinned) setActive(null); }}
                onClick={() => {
                  if (pinned === item.id) { setPinned(null); setActive(null); }
                  else { setPinned(item.id); setActive(null); }
                }}
                aria-label={item.label}
                style={{
                  position: "absolute",
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: "translate(-50%, -50%)",
                  background: "transparent",
                  border: pinned === item.id ? `1.5px solid ${m.accent}` : "1.5px solid transparent",
                  borderRadius: 10,
                  padding: 6,
                  cursor: "pointer",
                  boxShadow: pinned === item.id ? `0 0 12px ${m.glow}` : "none",
                }}
              >
                <ItemShape id={item.id} accent={m.accent} />
              </button>
            ))}
          </div>

          {/* ── Detail panel ── */}
          <div style={{ width: 260, minHeight: 200, flexShrink: 0 }}>
            {panel ? (
              <div
                key={panel.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${m.accent}44`,
                  borderRadius: 16,
                  padding: "20px 18px",
                  animation: "panelIn .25s ease",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <panel.Icon size={18} color={m.accent} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: m.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{panel.label}</span>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{panel.title}</h2>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{panel.description}</p>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, fontStyle: "italic" }}>{panel.detail}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handlePin}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 8,
                      border: `1px solid ${m.accent}66`,
                      background: isPinned ? `${m.accent}22` : "transparent",
                      color: m.accent,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={cycleNext}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 8,
                      border: "none",
                      background: m.accent,
                      color: "#000",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 18px" }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>Hover or tap an object in the room to learn more.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile card grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", maxWidth: 560, marginTop: 24 }}>
          {ROOM_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPinned(item.id);
                setActive(null);
              }}
              style={{
                padding: "12px 8px",
                borderRadius: 12,
                border: `1px solid ${pinned === item.id ? m.accent : "rgba(255,255,255,0.1)"}`,
                background: pinned === item.id ? `${m.accent}18` : "rgba(255,255,255,0.04)",
                color: pinned === item.id ? m.accent : "rgba(255,255,255,0.55)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                transition: "all .18s ease",
              }}
            >
              <item.Icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Footer hint ── */}
        <p style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.7 }}>
          Customize this room by editing <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>ROOM_ITEMS</code> in <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>app/maia/page.tsx</code>
        </p>
      </div>
    </>
  );
}
