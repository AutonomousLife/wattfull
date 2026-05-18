"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  from: "you" | "maia";
  text: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

const CONVOS: Msg[][] = [
  [
    { from: "you",  text: "how was work" },
    { from: "maia", text: "it was okay" },
    { from: "you",  text: "people annoying?" },
    { from: "maia", text: "a little lol" },
    { from: "you",  text: "what u doing" },
    { from: "maia", text: "just got home, making tea" },
    { from: "you",  text: "nice" },
    { from: "maia", text: "yep and looking at dumb videos" },
    { from: "you",  text: "u got any plans tomorrow" },
    { from: "maia", text: "not yet, maybe go outside if it's not freezing" },
    { from: "you",  text: "sounds good" },
    { from: "maia", text: "yeah we'll see" },
    { from: "you",  text: "canada update" },
    { from: "maia", text: "still cold" },
    { from: "you",  text: "of course" },
    { from: "maia", text: "shut up" },
  ],
  [
    { from: "you",  text: "what u doing" },
    { from: "maia", text: "laying here" },
    { from: "you",  text: "productive" },
    { from: "maia", text: "extremely" },
    { from: "you",  text: "proud of u" },
    { from: "maia", text: "thanks i worked hard" },
    { from: "you",  text: "same honestly" },
    { from: "maia", text: "wow inspiring" },
  ],
  [
    { from: "you",  text: "canada update" },
    { from: "maia", text: "still cold" },
    { from: "you",  text: "shocking" },
    { from: "maia", text: "shut up" },
    { from: "you",  text: "sorry" },
    { from: "maia", text: "no ur not" },
    { from: "you",  text: "true" },
  ],
  [
    { from: "you",  text: "still want chickens?" },
    { from: "maia", text: "yes" },
    { from: "you",  text: "how many" },
    { from: "maia", text: "enough" },
    { from: "you",  text: "suspicious answer" },
    { from: "maia", text: "normal answer" },
    { from: "you",  text: "sure" },
    { from: "maia", text: "we also need tomatoes" },
  ],
  [
    { from: "you",  text: "why are we awake" },
    { from: "maia", text: "bad choices" },
    { from: "you",  text: "fair" },
    { from: "maia", text: "what are u doing" },
    { from: "you",  text: "nothing" },
    { from: "maia", text: "same" },
    { from: "you",  text: "elite lifestyle" },
    { from: "maia", text: "honestly yeah" },
  ],
  [
    { from: "you",  text: "u good?" },
    { from: "maia", text: "yeah i'm fine" },
    { from: "you",  text: "good" },
    { from: "maia", text: "u?" },
    { from: "you",  text: "yeah" },
    { from: "maia", text: "okay" },
    { from: "you",  text: "very emotional conversation" },
    { from: "maia", text: "extremely" },
  ],
  [
    { from: "you",  text: "u got any plans tomorrow" },
    { from: "maia", text: "not really" },
    { from: "you",  text: "same" },
    { from: "maia", text: "maybe go outside if it's not gross" },
    { from: "you",  text: "ambitious" },
    { from: "maia", text: "i know" },
    { from: "you",  text: "proud of us" },
    { from: "maia", text: "don't overdo it" },
  ],
  [
    { from: "you",  text: "important question" },
    { from: "maia", text: "what" },
    { from: "you",  text: "garden first or chickens first" },
    { from: "maia", text: "garden" },
    { from: "you",  text: "controversial" },
    { from: "maia", text: "chickens need somewhere to judge us from" },
    { from: "you",  text: "fair" },
  ],
];

const GARDEN_LABELS = ["garden ideas", "tomatoes maybe", "chickens eventually", "no people nearby"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots({ isMaia }: { isMaia: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 4px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: "block", width: 7, height: 7, borderRadius: "50%",
          background: isMaia ? "#9a5a52" : "#7a5a40",
          animation: `dotPulse 1.5s ease-in-out ${i * 0.28}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Floating bubble ──────────────────────────────────────────────────────────

function Bubble({
  text, typing, side,
}: {
  text: string | null;
  typing: boolean;
  side: "left" | "right";
}) {
  const isMaia = side === "right";
  const show = typing || text !== null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={typing ? `typing-${side}` : `msg-${text}`}
          initial={{ opacity: 0, y: 10, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            display: "inline-block",
            maxWidth: "min(200px, 42vw)",
            padding: typing ? "10px 14px" : "10px 16px 11px",
            background: isMaia
              ? "rgba(210, 155, 148, 0.93)"
              : "rgba(242, 228, 208, 0.95)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: `1.5px solid rgba(42,33,28,${isMaia ? "0.13" : "0.10"})`,
            borderRadius: isMaia ? "16px 3px 16px 16px" : "3px 16px 16px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)",
            fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive,system-ui',
            fontSize: "clamp(12px, 2.5vw, 14px)",
            lineHeight: 1.4,
            color: "#2a1c14",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {typing ? <TypingDots isMaia={isMaia} /> : text}
          {/* Tail */}
          <span style={{
            position: "absolute",
            bottom: -9,
            [isMaia ? "right" : "left"]: 12,
            width: 0, height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: `9px solid ${isMaia ? "rgba(210,155,148,0.93)" : "rgba(242,228,208,0.95)"}`,
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.10))",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Doodles ──────────────────────────────────────────────────────────────────

function ChickenDoodle() {
  const [hop, setHop] = useState(false);
  return (
    <motion.button
      onClick={() => { setHop(true); setTimeout(() => setHop(false), 400); }}
      animate={hop ? { y: [0, -10, 0] } : { y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 26, lineHeight: 1 }}
      aria-label="chicken"
    >🐔</motion.button>
  );
}

function MapleLeaf() {
  const [spin, setSpin] = useState(false);
  return (
    <motion.button
      onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 500); }}
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.45 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 26, lineHeight: 1 }}
      aria-label="maple leaf"
    >🍁</motion.button>
  );
}

function GardenNote() {
  const [idx, setIdx] = useState(0);
  return (
    <motion.button
      onClick={() => setIdx(i => (i + 1) % GARDEN_LABELS.length)}
      whileHover={{ rotate: [-1, 1, -1], transition: { duration: 0.3 } }}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        transform: "rotate(-3deg)", transformOrigin: "center",
      }}
      aria-label="garden note"
    >
      <div style={{
        background: "#f5f0d4",
        border: "1.5px solid rgba(42,33,28,0.18)",
        borderRadius: 4,
        padding: "6px 10px 8px",
        boxShadow: "2px 2px 8px rgba(42,33,28,0.10)",
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
        fontSize: 11,
        color: "#4a3828",
        lineHeight: 1.5,
        textAlign: "left",
      }}>
        <span style={{ fontSize: 16 }}>📒</span>
        <br />
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "block" }}
          >
            {GARDEN_LABELS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaiaPage() {
  const reduced = useReducedMotion() ?? false;

  const [leftText,    setLeftText]    = useState<string | null>(null);
  const [rightText,   setRightText]   = useState<string | null>(null);
  const [leftTyping,  setLeftTyping]  = useState(false);
  const [rightTyping, setRightTyping] = useState(false);
  const [convoIdx,    setConvoIdx]    = useState(0);
  const [heartPop,    setHeartPop]    = useState(false);

  const stopRef = useRef(false);

  const runConvo = useCallback(async (idx: number) => {
    const convo = CONVOS[idx % CONVOS.length];
    setLeftText(null);
    setRightText(null);
    setLeftTyping(false);
    setRightTyping(false);

    for (const msg of convo) {
      if (stopRef.current) return;

      const isLeft = msg.from === "you";

      // Start typing
      if (isLeft) { setLeftTyping(true);  setLeftText(null);  }
      else         { setRightTyping(true); setRightText(null); }

      await sleep(rand(reduced ? 700 : 2200, reduced ? 1200 : 3800));
      if (stopRef.current) return;

      // Show message
      if (isLeft) { setLeftTyping(false);  setLeftText(msg.text);  }
      else         { setRightTyping(false); setRightText(msg.text); }

      await sleep(rand(reduced ? 900 : 2800, reduced ? 1500 : 4500));
      if (stopRef.current) return;
    }

    // End — clear and move on
    await sleep(1800);
    if (stopRef.current) return;
    setLeftText(null);
    setRightText(null);
    await sleep(1200);
    if (stopRef.current) return;
    setConvoIdx(prev => prev + 1);
  }, [reduced]);

  useEffect(() => {
    stopRef.current = false;
    runConvo(convoIdx);
    return () => { stopRef.current = true; };
  }, [convoIdx, runConvo]);

  return (
    <>
      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { transform: scale(1);    opacity: .4; }
          30%            { transform: scale(1.45); opacity: 1;  }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25%       { transform: scale(1.28); }
          55%       { transform: scale(0.88); }
          75%       { transform: scale(1.08); }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0)    scale(1);   }
          100% { opacity: 0; transform: translateY(-56px) scale(1.4); }
        }
        .heart-beat  { animation: heartBeat 2.8s ease-in-out infinite; display: inline-block; }
        .float-heart { animation: floatUp .9s ease-out forwards; position: absolute; pointer-events: none; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── Page wrapper ── */}
      <div style={{
        minHeight: "100dvh",
        background: "#e6d9c4",
        backgroundImage: `
          radial-gradient(ellipse at 25% 25%, rgba(160,130,90,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 75%, rgba(140,110,80,0.07) 0%, transparent 50%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive,system-ui',
      }}>
        <div style={{ width: "100%", maxWidth: 900 }}>

          {/* ── HEADER ── */}
          <div style={{
            background: "#e6d9c4",
            padding: "18px 28px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderBottom: "1.5px solid rgba(42,33,28,0.10)",
          }}>
            {/* Left doodles */}
            <div style={{
              position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
              display: "flex", alignItems: "center", gap: 10,
            }} aria-hidden>
              <span style={{ fontSize: 13, opacity: 0.55, lineHeight: 1 }}>✦</span>
              <span style={{ fontSize: 12, opacity: 0.45, lineHeight: 1 }}>✦</span>
              <span style={{ fontSize: 22, opacity: 0.65 }}>🌿</span>
            </div>

            {/* Title + heart */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
              <h1 style={{
                fontSize: "clamp(30px, 6vw, 50px)",
                fontWeight: 700,
                color: "#1e1610",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}>
                Maia
              </h1>
              <button
                onClick={() => setHeartPop(true)}
                onAnimationEnd={() => setHeartPop(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "clamp(22px, 4vw, 38px)", lineHeight: 1, padding: 0,
                  position: "relative",
                }}
                aria-label="send heart"
              >
                <span className="heart-beat" style={{ color: "#b86868" }}>♡</span>
                {heartPop && (
                  <span className="float-heart" style={{ fontSize: 20, color: "#b86868", top: -4, left: "50%", transform: "translateX(-50%)" }}>
                    ♡
                  </span>
                )}
              </button>
            </div>

            {/* Right doodles */}
            <div style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
              display: "flex", alignItems: "center", gap: 10,
            }} aria-hidden>
              <span style={{ fontSize: 24, opacity: 0.70 }}>🐔</span>
              <span style={{ fontSize: 24, opacity: 0.70 }}>🪴</span>
            </div>
          </div>

          {/* ── HERO — image + floating bubbles ── */}
          <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maia-rooms.jpg"
              alt="two cozy rooms at night"
              style={{ width: "100%", display: "block" }}
            />

            {/* Left bubble — above "you" (left person) */}
            <div style={{
              position: "absolute",
              left: "4%",
              top: "18%",
              zIndex: 10,
            }}>
              <Bubble text={leftText} typing={leftTyping} side="left" />
            </div>

            {/* Right bubble — above Maia (right person) */}
            <div style={{
              position: "absolute",
              right: "4%",
              top: "18%",
              zIndex: 10,
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <Bubble text={rightText} typing={rightTyping} side="right" />
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            background: "#e6d9c4",
            borderTop: "1.5px solid rgba(42,33,28,0.09)",
            padding: "20px 24px 28px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}>
            {/* Left cluster */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <span style={{ fontSize: 26, opacity: 0.62, lineHeight: 1 }} aria-hidden>🌱</span>
              <GardenNote />
              <span style={{ fontSize: 14, opacity: 0.38 }} aria-hidden>✦</span>
            </div>

            {/* Center hint */}
            <div style={{
              fontSize: 12, color: "#9a8070", letterSpacing: "0.04em",
              textAlign: "center", flexGrow: 1,
            }}>
              another message in a few seconds... ♡
            </div>

            {/* Right cluster */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <span style={{ fontSize: 14, opacity: 0.38 }} aria-hidden>✦</span>
              <ChickenDoodle />
              <MapleLeaf />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
