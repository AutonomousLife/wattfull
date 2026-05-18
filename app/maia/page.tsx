"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  from: "you" | "maia";
  text: string;
}

// ─── 20 Conversations ────────────────────────────────────────────────────────

const CONVOS: Msg[][] = [
  // 1
  [
    { from: "you",  text: "how was work" },
    { from: "maia", text: "it was okay" },
    { from: "you",  text: "people annoying?" },
    { from: "maia", text: "a little lol" },
    { from: "you",  text: "what u doing now" },
    { from: "maia", text: "just got home, making tea" },
    { from: "you",  text: "nice" },
    { from: "maia", text: "yep and looking at dumb videos" },
    { from: "you",  text: "sounds about right" },
  ],
  // 2
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
  // 3
  [
    { from: "you",  text: "canada update" },
    { from: "maia", text: "still cold" },
    { from: "you",  text: "shocking" },
    { from: "maia", text: "shut up" },
    { from: "you",  text: "sorry" },
    { from: "maia", text: "no ur not" },
    { from: "you",  text: "true" },
  ],
  // 4
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
  // 5
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
  // 6
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
  // 7
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
  // 8
  [
    { from: "you",  text: "important question" },
    { from: "maia", text: "what" },
    { from: "you",  text: "garden first or chickens first" },
    { from: "maia", text: "garden" },
    { from: "you",  text: "controversial" },
    { from: "maia", text: "chickens need somewhere to judge us from" },
    { from: "you",  text: "fair point" },
  ],
  // 9 — sweet
  [
    { from: "maia", text: "hey" },
    { from: "you",  text: "hey" },
    { from: "maia", text: "nothing i just wanted to say something" },
    { from: "you",  text: "say it then" },
    { from: "maia", text: "i love you" },
    { from: "you",  text: "oh" },
    { from: "you",  text: "i love you too" },
    { from: "maia", text: "okay good" },
    { from: "maia", text: "that's all" },
  ],
  // 10 — missing
  [
    { from: "you",  text: "i miss you" },
    { from: "maia", text: "same" },
    { from: "you",  text: "that's it?" },
    { from: "maia", text: "i miss you a lot" },
    { from: "you",  text: "better" },
    { from: "maia", text: "♡" },
    { from: "you",  text: "♡" },
  ],
  // 11 — food
  [
    { from: "maia", text: "what did u eat today" },
    { from: "you",  text: "cereal twice" },
    { from: "maia", text: "incredible" },
    { from: "you",  text: "and u" },
    { from: "maia", text: "toast and sadness" },
    { from: "you",  text: "we're doing great" },
    { from: "maia", text: "thriving" },
  ],
  // 12 — life is a lot
  [
    { from: "you",  text: "everything is a lot" },
    { from: "maia", text: "yeah" },
    { from: "you",  text: "just needed to say that" },
    { from: "maia", text: "said and received" },
    { from: "you",  text: "thanks" },
    { from: "maia", text: "anytime" },
    { from: "you",  text: "i love you" },
    { from: "maia", text: "i love you" },
  ],
  // 13 — plants
  [
    { from: "maia", text: "how many plants is too many" },
    { from: "you",  text: "trick question" },
    { from: "maia", text: "correct" },
    { from: "you",  text: "getting another one?" },
    { from: "maia", text: "already did" },
    { from: "you",  text: "obviously" },
    { from: "maia", text: "her name is linda" },
    { from: "you",  text: "of course it is" },
  ],
  // 14 — goodnight
  [
    { from: "you",  text: "okay i should actually sleep" },
    { from: "maia", text: "probably" },
    { from: "you",  text: "you too" },
    { from: "maia", text: "maybe" },
    { from: "you",  text: "maia." },
    { from: "maia", text: "fine" },
    { from: "you",  text: "goodnight ♡" },
    { from: "maia", text: "goodnight ♡" },
  ],
  // 15 — quiet
  [
    { from: "maia", text: "are u still awake" },
    { from: "you",  text: "yeah" },
    { from: "maia", text: "good" },
    { from: "you",  text: "why" },
    { from: "maia", text: "just wanted to talk" },
    { from: "you",  text: "how's your brain" },
    { from: "maia", text: "loud tonight" },
    { from: "you",  text: "less loud when i talk to u" },
    { from: "maia", text: "♡" },
  ],
  // 16 — han solo
  [
    { from: "maia", text: "i love you" },
    { from: "you",  text: "i know" },
    { from: "maia", text: "okay han solo" },
    { from: "you",  text: "i love you too obviously" },
    { from: "maia", text: "better" },
    { from: "you",  text: "♡" },
  ],
  // 17 — cold canada warmth
  [
    { from: "you",  text: "how cold is it" },
    { from: "maia", text: "very" },
    { from: "you",  text: "i would keep u warm" },
    { from: "maia", text: "bold claim" },
    { from: "you",  text: "i'm very warm" },
    { from: "maia", text: "scientifically?" },
    { from: "you",  text: "anecdotally" },
    { from: "maia", text: "♡" },
  ],
  // 18 — how are you actually
  [
    { from: "you",  text: "how are you actually" },
    { from: "maia", text: "tired but okay" },
    { from: "you",  text: "tired how" },
    { from: "maia", text: "just the regular kind" },
    { from: "you",  text: "okay good" },
    { from: "maia", text: "are u checking on me" },
    { from: "you",  text: "yes" },
    { from: "maia", text: "i love you" },
    { from: "you",  text: "love you" },
  ],
  // 19 — sun update
  [
    { from: "you",  text: "update" },
    { from: "maia", text: "the sun set" },
    { from: "you",  text: "and?" },
    { from: "maia", text: "it was there then it wasn't" },
    { from: "you",  text: "riveting" },
    { from: "maia", text: "i know right" },
    { from: "you",  text: "same time tomorrow?" },
    { from: "maia", text: "probably" },
  ],
  // 20 — just hearts
  [
    { from: "you",  text: "♡" },
    { from: "maia", text: "♡" },
    { from: "you",  text: "okay that's all i had" },
    { from: "maia", text: "it was enough" },
    { from: "you",  text: "yeah?" },
    { from: "maia", text: "yeah" },
  ],
];

const GARDEN_LABELS = ["garden ideas", "tomatoes maybe", "chickens eventually", "no people allowed"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Custom SVG art (no emojis) ───────────────────────────────────────────────

function ArtHeart({ size = 22, pulse = false, className = "" }: { size?: number; pulse?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 22" fill="none"
      className={className}
      style={pulse ? { animation: "heartBeat 2.8s ease-in-out infinite", display: "inline-block" } : undefined}
      aria-hidden>
      <path d="M12,20 C12,20 2,13 2,7 C2,4 4.5,2 7.5,2 C9.5,2 11,3.2 12,4.8 C13,3.2 14.5,2 16.5,2 C19.5,2 22,4 22,7 C22,13 12,20 12,20 Z"
        stroke="#b86868" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArtChicken({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 40" fill="none"
      stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12,30 Q8,26 9,20 Q10,12 19,11 Q28,10 29,19 Q30,26 27,30 Q23,35 19,35 Q14,35 12,30"/>
      <path d="M21,11 Q20,5 18,4 Q14,3 13,7 Q12,9 15,11"/>
      <path d="M16,4 Q17,1 18,3 Q19.5,1 21,3"/>
      <circle cx="17" cy="7.5" r="1.3" fill="#3a2a1e"/>
      <path d="M21,8.5 L24.5,9.5 L21,11"/>
      <path d="M21,11 Q23,13 21,14.5"/>
      <path d="M13,20 Q10,22 11,26 Q13,24 15,24"/>
      <path d="M14,35 L13,38.5 M14,35 L16,38.5"/>
      <path d="M22,35 L21,38.5 M22,35 L24,38.5"/>
    </svg>
  );
}

function ArtPlant({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 40" fill="none"
      stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10,40 L13,30 L23,30 L26,40"/>
      <path d="M12,34 L24,34"/>
      <path d="M13,30 Q18,28 23,30"/>
      <path d="M18,30 L18,18"/>
      <path d="M18,24 Q11,20 9,13 Q15,16 18,22"/>
      <path d="M18,20 Q25,16 27,9 Q21,13 18,19"/>
      <path d="M18,18 Q17,13 17,10 Q19,13 18,17"/>
    </svg>
  );
}

function ArtLeaves({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 36" fill="none"
      stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17,34 Q13,28 11,22 Q14,24 15,28 Q14,23 10,17 Q14,20 15,24 Q13,19 13,13 Q16,17 16,23"/>
      <path d="M17,34 Q21,28 23,22 Q20,24 19,28 Q20,23 24,17 Q20,20 19,24 Q21,19 21,13 Q18,17 18,23"/>
      <path d="M16,34 L18,34"/>
    </svg>
  );
}

function ArtSeedling({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 34" fill="none"
      stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15,32 L15,20"/>
      <path d="M15,24 Q9,20 7,14 Q13,16 15,22"/>
      <path d="M15,21 Q21,17 23,11 Q17,13 15,20"/>
      <path d="M13,32 L17,32"/>
    </svg>
  );
}

function ArtMapleLeaf({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 38" fill="none"
      stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17,3 L19.5,9.5 L25,7 L22,14 L29,13 L24,18 L27,24 L17,21 L7,24 L10,18 L5,13 L12,14 L9,7 L14.5,9.5 Z"/>
      <line x1="17" y1="21" x2="17" y2="33"/>
      <path d="M14,33 L17,33 L20,33"/>
    </svg>
  );
}

function ArtStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="#3a2a1e" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <line x1="8" y1="1" x2="8" y2="15"/>
      <line x1="1" y1="8" x2="15" y2="8"/>
      <line x1="3" y1="3" x2="13" y2="13"/>
      <line x1="13" y1="3" x2="3" y2="13"/>
    </svg>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots({ isMaia }: { isMaia: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 2px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: "block", width: 7, height: 7, borderRadius: "50%",
          background: isMaia ? "#9a5a52" : "#7a5a40",
          animation: `dotPulse 1.6s ease-in-out ${i * 0.3}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Floating bubble ──────────────────────────────────────────────────────────

function Bubble({ text, typing, side }: { text: string | null; typing: boolean; side: "left" | "right" }) {
  const isMaia = side === "right";
  const show = typing || text !== null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={typing ? `t-${side}` : `m-${text}`}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            display: "inline-block",
            maxWidth: "min(195px, 40vw)",
            padding: typing ? "10px 14px" : "10px 15px 11px",
            background: isMaia
              ? "rgba(205, 148, 141, 0.72)"
              : "rgba(240, 225, 200, 0.76)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1.5px solid rgba(42,33,28,${isMaia ? "0.12" : "0.10"})`,
            borderRadius: isMaia ? "16px 3px 16px 16px" : "3px 16px 16px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
            fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive,system-ui',
            fontSize: "clamp(12px, 2.8vw, 14px)",
            lineHeight: 1.45,
            color: "#2a1c14",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {typing ? <TypingDots isMaia={isMaia} /> : text}
          <span style={{
            position: "absolute",
            bottom: -8,
            [isMaia ? "right" : "left"]: 11,
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${isMaia ? "rgba(205,148,141,0.72)" : "rgba(240,225,200,0.76)"}`,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Garden note (interactive) ────────────────────────────────────────────────

function GardenNote() {
  const [idx, setIdx] = useState(0);
  return (
    <motion.button
      onClick={() => setIdx(i => (i + 1) % GARDEN_LABELS.length)}
      whileHover={{ rotate: 1 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, transformOrigin: "center" }}
      aria-label="garden note"
    >
      <div style={{
        background: "#f5f0d4",
        border: "1.5px solid rgba(42,33,28,0.20)",
        borderRadius: 4,
        padding: "7px 12px 9px",
        boxShadow: "2px 3px 8px rgba(42,33,28,0.10)",
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
        fontSize: 11,
        color: "#4a3828",
        lineHeight: 1.6,
        textAlign: "left",
        transform: "rotate(-3deg)",
        minWidth: 88,
      }}>
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="#3a2a1e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginBottom: 3 }}>
          <rect x="3" y="2" width="16" height="18" rx="2"/>
          <line x1="3" y1="7" x2="7" y2="7"/>
          <line x1="7" y1="2" x2="7" y2="20"/>
          <line x1="10" y1="9" x2="17" y2="9"/>
          <line x1="10" y1="13" x2="17" y2="13"/>
          <line x1="10" y1="17" x2="14" y2="17"/>
        </svg>
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: "block" }}>
            {GARDEN_LABELS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ─── Interactive chicken ──────────────────────────────────────────────────────

function ChickenButton({ size = 32 }: { size?: number }) {
  const [hop, setHop] = useState(false);
  return (
    <motion.button
      onClick={() => { setHop(true); setTimeout(() => setHop(false), 380); }}
      animate={hop ? { y: [0, -11, 0] } : { y: 0 }}
      transition={{ duration: 0.32 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
      aria-label="chicken"
    >
      <ArtChicken size={size} />
    </motion.button>
  );
}

// ─── Interactive maple leaf ───────────────────────────────────────────────────

function MapleButton({ size = 30 }: { size?: number }) {
  const [spin, setSpin] = useState(false);
  return (
    <motion.button
      onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 460); }}
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.42 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
      aria-label="maple leaf"
    >
      <ArtMapleLeaf size={size} />
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaiaPage() {
  const reduced = useReducedMotion() ?? false;

  // Randomize starting conversation on each page load
  const [convoIdx,    setConvoIdx]    = useState(() => Math.floor(Math.random() * CONVOS.length));
  const [leftText,    setLeftText]    = useState<string | null>(null);
  const [rightText,   setRightText]   = useState<string | null>(null);
  const [leftTyping,  setLeftTyping]  = useState(false);
  const [rightTyping, setRightTyping] = useState(false);
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

      // Show typing — slower
      if (isLeft) { setLeftTyping(true);  setLeftText(null);  }
      else         { setRightTyping(true); setRightText(null); }

      await sleep(rand(reduced ? 800 : 3000, reduced ? 1400 : 5500));
      if (stopRef.current) return;

      // Show message
      if (isLeft) { setLeftTyping(false);  setLeftText(msg.text);  }
      else         { setRightTyping(false); setRightText(msg.text); }

      // Reading pause — slower
      await sleep(rand(reduced ? 1000 : 3500, reduced ? 1800 : 6000));
      if (stopRef.current) return;
    }

    await sleep(2200);
    if (stopRef.current) return;
    setLeftText(null);
    setRightText(null);
    await sleep(1400);
    if (stopRef.current) return;
    // Pick a different conversation next
    setConvoIdx(prev => {
      const next = (prev + rand(1, CONVOS.length - 1)) % CONVOS.length;
      return next;
    });
  }, [reduced]);

  useEffect(() => {
    stopRef.current = false;
    runConvo(convoIdx);
    return () => { stopRef.current = true; };
  }, [convoIdx, runConvo]);

  return (
    <>
      <style>{`
        html, body { background: #e6d9c4 !important; margin: 0; padding: 0; }
        @keyframes dotPulse {
          0%, 60%, 100% { transform: scale(1);    opacity: .38; }
          30%            { transform: scale(1.5);  opacity: 1;   }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25%       { transform: scale(1.28); }
          55%       { transform: scale(0.88); }
          75%       { transform: scale(1.06); }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-54px) scale(1.35); }
        }
        .float-heart { animation: floatUp .9s ease-out forwards; position: absolute; pointer-events: none; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{
        background: "#e6d9c4",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(160,130,90,0.09) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 80%, rgba(140,110,80,0.07) 0%, transparent 50%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive,system-ui',
      }}>
        <div style={{ width: "100%", maxWidth: 900 }}>

          {/* ── HEADER ── */}
          <div style={{
            padding: "18px 28px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderBottom: "1.5px solid rgba(42,33,28,0.09)",
          }}>
            {/* Left doodles */}
            <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
              <ArtStar size={13} />
              <ArtStar size={10} />
              <ArtLeaves size={26} />
            </div>

            {/* Title + heart */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, position: "relative" }}>
              <h1 style={{
                fontSize: "clamp(30px,6vw,50px)",
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
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, position: "relative", lineHeight: 0 }}
                aria-label="send heart"
              >
                <ArtHeart size={28} pulse />
                {heartPop && (
                  <span className="float-heart" style={{ top: -4, left: "50%", transform: "translateX(-50%)" }}>
                    <ArtHeart size={20} />
                  </span>
                )}
              </button>
            </div>

            {/* Right doodles */}
            <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
              <ArtChicken size={30} />
              <ArtPlant size={30} />
            </div>
          </div>

          {/* ── HERO — image + floating bubbles ── */}
          <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1024 / 478",
            overflow: "hidden",
            lineHeight: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maia-rooms.jpg"
              alt="two cozy rooms at night"
              style={{ width: "100%", display: "block", marginTop: "-16.5%" }}
            />

            {/* Left bubble */}
            <div style={{ position: "absolute", left: "5%", top: "32%", zIndex: 10 }}>
              <Bubble text={leftText} typing={leftTyping} side="left" />
            </div>

            {/* Right bubble */}
            <div style={{ position: "absolute", right: "5%", top: "32%", zIndex: 10, display: "flex", justifyContent: "flex-end" }}>
              <Bubble text={rightText} typing={rightTyping} side="right" />
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            borderTop: "1.5px solid rgba(42,33,28,0.09)",
            padding: "20px 24px 28px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <ArtSeedling size={26} />
              <GardenNote />
              <ArtStar size={12} />
            </div>

            {/* Center hint */}
            <div style={{ fontSize: 12, color: "#9a8070", letterSpacing: "0.04em", textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              another message in a few seconds
              <ArtHeart size={12} />
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <ArtStar size={12} />
              <ChickenButton size={32} />
              <MapleButton size={30} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
