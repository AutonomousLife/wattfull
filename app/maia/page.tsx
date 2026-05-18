"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  from: "you" | "maia";
  text: string;
  time: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

const CONVOS: Msg[][] = [
  // 1 — work check-in
  [
    { from: "you",  text: "how was work",                         time: "10:31 PM" },
    { from: "maia", text: "it was okay",                          time: "10:32 PM" },
    { from: "you",  text: "people annoying?",                     time: "10:32 PM" },
    { from: "maia", text: "a little lol",                         time: "10:32 PM" },
    { from: "you",  text: "what u doing",                         time: "10:33 PM" },
    { from: "maia", text: "just got home, making tea",            time: "10:33 PM" },
    { from: "you",  text: "nice",                                  time: "10:33 PM" },
    { from: "maia", text: "yep and looking at dumb videos",       time: "10:33 PM" },
    { from: "you",  text: "u got any plans tomorrow",             time: "10:34 PM" },
    { from: "maia", text: "not yet, maybe go outside if it's not freezing", time: "10:34 PM" },
    { from: "you",  text: "sounds good",                          time: "10:34 PM" },
    { from: "maia", text: "yeah we'll see",                       time: "10:34 PM" },
    { from: "you",  text: "canada update",                        time: "10:34 PM" },
    { from: "maia", text: "still cold",                           time: "10:34 PM" },
    { from: "you",  text: "of course",                            time: "10:34 PM" },
    { from: "maia", text: "shut up",                              time: "10:34 PM" },
  ],
  // 2 — productive nothing
  [
    { from: "you",  text: "what u doing",       time: "11:08 PM" },
    { from: "maia", text: "laying here",         time: "11:08 PM" },
    { from: "you",  text: "productive",          time: "11:09 PM" },
    { from: "maia", text: "extremely",           time: "11:09 PM" },
    { from: "you",  text: "proud of u",          time: "11:09 PM" },
    { from: "maia", text: "thanks i worked hard",time: "11:09 PM" },
    { from: "you",  text: "same honestly",       time: "11:10 PM" },
    { from: "maia", text: "wow inspiring",        time: "11:10 PM" },
  ],
  // 3 — canada weather
  [
    { from: "you",  text: "canada update",    time: "9:54 PM" },
    { from: "maia", text: "still cold",       time: "9:54 PM" },
    { from: "you",  text: "shocking",         time: "9:55 PM" },
    { from: "maia", text: "shut up",          time: "9:55 PM" },
    { from: "you",  text: "sorry",            time: "9:55 PM" },
    { from: "maia", text: "no ur not",        time: "9:55 PM" },
    { from: "you",  text: "true",             time: "9:55 PM" },
  ],
  // 4 — chickens + garden
  [
    { from: "you",  text: "still want chickens?",         time: "10:17 PM" },
    { from: "maia", text: "yes",                           time: "10:17 PM" },
    { from: "you",  text: "how many",                     time: "10:18 PM" },
    { from: "maia", text: "enough",                       time: "10:18 PM" },
    { from: "you",  text: "suspicious answer",            time: "10:18 PM" },
    { from: "maia", text: "normal answer",                time: "10:18 PM" },
    { from: "you",  text: "sure",                         time: "10:18 PM" },
    { from: "maia", text: "we also need tomatoes",        time: "10:19 PM" },
  ],
  // 5 — late night
  [
    { from: "you",  text: "why are we awake",   time: "1:12 AM" },
    { from: "maia", text: "bad choices",         time: "1:12 AM" },
    { from: "you",  text: "fair",                time: "1:12 AM" },
    { from: "maia", text: "what are u doing",   time: "1:13 AM" },
    { from: "you",  text: "nothing",             time: "1:13 AM" },
    { from: "maia", text: "same",                time: "1:13 AM" },
    { from: "you",  text: "elite lifestyle",     time: "1:13 AM" },
    { from: "maia", text: "honestly yeah",       time: "1:13 AM" },
  ],
  // 6 — check-in
  [
    { from: "you",  text: "u good?",                    time: "11:42 PM" },
    { from: "maia", text: "yeah i'm fine",               time: "11:42 PM" },
    { from: "you",  text: "good",                        time: "11:42 PM" },
    { from: "maia", text: "u?",                          time: "11:43 PM" },
    { from: "you",  text: "yeah",                        time: "11:43 PM" },
    { from: "maia", text: "okay",                        time: "11:43 PM" },
    { from: "you",  text: "very emotional conversation", time: "11:43 PM" },
    { from: "maia", text: "extremely",                   time: "11:43 PM" },
  ],
  // 7 — plans
  [
    { from: "you",  text: "u got any plans tomorrow",           time: "10:05 PM" },
    { from: "maia", text: "not really",                         time: "10:05 PM" },
    { from: "you",  text: "same",                               time: "10:06 PM" },
    { from: "maia", text: "maybe go outside if it's not gross", time: "10:06 PM" },
    { from: "you",  text: "ambitious",                          time: "10:06 PM" },
    { from: "maia", text: "i know",                             time: "10:06 PM" },
    { from: "you",  text: "proud of us",                        time: "10:07 PM" },
    { from: "maia", text: "don't overdo it",                    time: "10:07 PM" },
  ],
  // 8 — garden or chickens first
  [
    { from: "you",  text: "important question",                       time: "9:30 PM" },
    { from: "maia", text: "what",                                      time: "9:30 PM" },
    { from: "you",  text: "garden first or chickens first",           time: "9:31 PM" },
    { from: "maia", text: "garden",                                    time: "9:31 PM" },
    { from: "you",  text: "controversial",                            time: "9:31 PM" },
    { from: "maia", text: "chickens need somewhere to judge us from", time: "9:31 PM" },
    { from: "you",  text: "fair",                                      time: "9:31 PM" },
  ],
];

// ─── Garden note labels ───────────────────────────────────────────────────────

const GARDEN_LABELS = ["garden ideas", "tomatoes maybe", "chickens eventually", "no people nearby"];

// ─── Stars (fixed to avoid hydration mismatch) ────────────────────────────────

const STARS_LEFT  = [
  { cx: 18, cy: 22, r: 1.2, op: 0.9 }, { cx: 42, cy: 14, r: 0.8, op: 0.7 },
  { cx: 67, cy: 30, r: 1.0, op: 0.8 }, { cx: 88, cy: 10, r: 0.6, op: 0.6 },
  { cx: 25, cy: 48, r: 0.7, op: 0.5 }, { cx: 55, cy: 55, r: 1.1, op: 0.7 },
  { cx: 78, cy: 42, r: 0.9, op: 0.8 }, { cx: 10, cy: 65, r: 0.6, op: 0.5 },
  { cx: 45, cy: 70, r: 0.8, op: 0.6 }, { cx: 92, cy: 60, r: 1.0, op: 0.7 },
];
const STARS_RIGHT = [
  { cx: 12, cy: 18, r: 1.0, op: 0.8 }, { cx: 35, cy: 8,  r: 0.7, op: 0.7 },
  { cx: 60, cy: 25, r: 1.2, op: 0.9 }, { cx: 82, cy: 15, r: 0.8, op: 0.6 },
  { cx: 20, cy: 45, r: 0.6, op: 0.5 }, { cx: 50, cy: 52, r: 1.0, op: 0.7 },
  { cx: 75, cy: 38, r: 0.7, op: 0.8 }, { cx: 90, cy: 60, r: 0.9, op: 0.6 },
  { cx: 38, cy: 68, r: 1.1, op: 0.7 }, { cx: 65, cy: 72, r: 0.6, op: 0.5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots({ side }: { side: "you" | "maia" }) {
  return (
    <div className={`flex items-end gap-1 mb-1 ${side === "maia" ? "justify-end" : "justify-start"}`}>
      <div
        className="flex items-center gap-[5px] px-4 py-3 rounded-[18px]"
        style={{
          background: side === "maia" ? "#d7a39a" : "#f0e4d0",
          border: "1.5px solid rgba(42,33,28,0.12)",
          minWidth: 56,
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 7, height: 7,
              background: side === "maia" ? "#8a4a40" : "#8a6a50",
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, reduced }: { msg: Msg; reduced: boolean }) {
  const isMaia = msg.from === "maia";
  return (
    <motion.div
      className={`flex items-end gap-2 ${isMaia ? "justify-end" : "justify-start"}`}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMaia ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-2.5 text-sm leading-snug"
          style={{
            background: isMaia ? "#d7a39a" : "#f0e4d0",
            color: "#2a211c",
            border: "1.5px solid rgba(42,33,28,0.10)",
            borderRadius: isMaia
              ? "18px 4px 18px 18px"
              : "4px 18px 18px 18px",
            fontFamily: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive, system-ui',
            fontSize: "0.9rem",
            boxShadow: "0 1px 3px rgba(42,33,28,0.07)",
          }}
        >
          {msg.text}
        </div>
        <span
          className="text-[10px] px-1"
          style={{ color: "#a08878", fontFamily: "system-ui" }}
        >
          {msg.time}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Room panel — CSS-illustrated cozy room ───────────────────────────────────

function RoomPanel({ side, typing }: { side: "left" | "right"; typing: boolean }) {
  const isMaia = side === "right";
  const stars   = isMaia ? STARS_RIGHT : STARS_LEFT;

  return (
    <div
      className="relative overflow-hidden flex-1"
      style={{
        background: "#0f1520",
        borderRadius: side === "left" ? "14px 0 0 14px" : "0 14px 14px 0",
        minHeight: 240,
        border: "1.5px solid rgba(42,33,28,0.18)",
        borderRight: side === "left" ? "none" : "1.5px solid rgba(42,33,28,0.18)",
        borderLeft:  side === "right" ? "none" : "1.5px solid rgba(42,33,28,0.18)",
      }}
    >
      {/* Night sky gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg,#060d1a 0%,#0f1825 55%,#1a1008 100%)",
      }}/>

      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.op}>
            <animate attributeName="opacity"
              values={`${s.op};${s.op * 0.35};${s.op}`}
              dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {/* Moon — left panel only */}
        {!isMaia && (
          <path d="M72,18 A10,10 0 1,1 72,38 A6,7 0 1,0 72,18 Z" fill="#f0e0b0" opacity=".9"/>
        )}
      </svg>

      {/* Window frame */}
      <div className="absolute" style={{
        top: "8%", left: "50%", transform: "translateX(-50%)",
        width: "58%", height: "46%",
        border: "2px solid rgba(200,170,120,0.55)",
        borderRadius: 4,
        boxShadow: "inset 0 0 20px rgba(15,24,38,0.6)",
      }}>
        {/* Window cross */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: "100%", height: "1.5px", background: "rgba(200,170,120,0.45)" }}/>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: "1.5px", height: "100%", background: "rgba(200,170,120,0.45)" }}/>
        </div>
        {/* Maple leaf on Maia's window */}
        {isMaia && (
          <div className="absolute bottom-2 left-2 text-xs" style={{ fontSize: 14 }} aria-hidden>🍁</div>
        )}
      </div>

      {/* String lights — Maia's room */}
      {isMaia && (
        <div className="absolute flex gap-3 items-end" style={{ top: "57%", left: "8%", right: "8%" }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div style={{ width: 1, height: 10, background: "rgba(160,120,60,0.5)" }}/>
              <div style={{
                width: 8, height: 10, borderRadius: "50% 50% 45% 45%",
                background: ["#f8d070","#f0a060","#d0f0a0","#a0d8f8","#f8a0c0"][i%5],
                opacity: 0.85,
                boxShadow: `0 0 6px 2px ${["#f8d07088","#f0a06088","#d0f0a088","#a0d8f888","#f8a0c088"][i%5]}`,
              }}/>
            </div>
          ))}
        </div>
      )}

      {/* Lamp glow */}
      <div className="absolute" style={{
        bottom: "22%",
        left: isMaia ? "auto" : "12%",
        right: isMaia ? "12%" : "auto",
        width: 28, height: 36,
      }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 3, height: 24, background: "#b08040" }}/>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 14, borderRadius: "50% 50% 0 0", background: "#e8c060" }}/>
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
          width: 80, height: 60, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(230,180,80,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
      </div>

      {/* Bookshelf hints */}
      <div className="absolute" style={{
        top: "10%",
        left: isMaia ? "auto" : "5%",
        right: isMaia ? "5%" : "auto",
      }}>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          {[18,24,20,16,22].map((h, i) => (
            <div key={i} style={{ width: 6, height: h, borderRadius: 1, background: ["#a05048","#4860a0","#508050","#c0a040","#806090"][i], opacity: 0.7 }}/>
          ))}
        </div>
      </div>

      {/* Plant */}
      <div className="absolute text-base" style={{
        bottom: "30%",
        left: isMaia ? "6%" : "auto",
        right: isMaia ? "auto" : "6%",
        fontSize: 18,
      }} aria-hidden>🌿</div>

      {/* Person silhouette — lying on bed looking at phone glow */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0 }}>
        {/* Bed / blanket */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "36%",
          background: isMaia
            ? "linear-gradient(180deg,#3a2535 0%,#2a1828 100%)"
            : "linear-gradient(180deg,#3d2020 0%,#2a1010 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}/>
        {/* Person body (silhouette) */}
        <div style={{
          position: "absolute",
          bottom: "28%",
          left: isMaia ? "auto" : "18%",
          right: isMaia ? "18%" : "auto",
          width: 60, height: 28,
          background: "#1a1208",
          borderRadius: "40% 40% 0 0",
          opacity: 0.85,
        }}/>
        {/* Head */}
        <div style={{
          position: "absolute",
          bottom: "52%",
          left: isMaia ? "auto" : "32%",
          right: isMaia ? "32%" : "auto",
          width: 22, height: 22,
          background: isMaia ? "#c49060" : "#c49060",
          borderRadius: "50%",
          opacity: 0.9,
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}/>
        {/* Phone glow */}
        <div style={{
          position: "absolute",
          bottom: "44%",
          left: isMaia ? "auto" : "42%",
          right: isMaia ? "42%" : "auto",
          width: 14, height: 22,
          background: "rgba(180,210,255,0.7)",
          borderRadius: 3,
          boxShadow: "0 0 16px 8px rgba(160,195,255,0.35)",
        }}/>
      </div>

      {/* Typing bubble above person */}
      <AnimatePresence>
        {typing && (
          <motion.div
            key="typing-hero"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="absolute flex items-center gap-1 px-3 py-2 rounded-2xl"
            style={{
              bottom: "68%",
              left: isMaia ? "auto" : "28%",
              right: isMaia ? "28%" : "auto",
              background: "rgba(240,228,210,0.92)",
              border: "1.5px solid rgba(42,33,28,0.14)",
              backdropFilter: "blur(4px)",
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: "block", width: 5, height: 5, borderRadius: "50%",
                background: "#8a6a50",
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}/>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <div className="absolute top-2 w-full text-center" style={{
        fontSize: 11,
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
        color: "rgba(240,228,200,0.45)",
        letterSpacing: "0.08em",
      }}>
        {isMaia ? "maia" : "you"}
      </div>
    </div>
  );
}

// ─── Doodle components ────────────────────────────────────────────────────────

function ChickenDoodle() {
  const [hop, setHop] = useState(false);
  return (
    <motion.button
      onClick={() => { setHop(true); setTimeout(() => setHop(false), 400); }}
      animate={hop ? { y: [-8, 0] } : { y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-2xl cursor-pointer select-none bg-transparent border-0 p-0"
      aria-label="chicken doodle"
      title="bawk"
    >🐔</motion.button>
  );
}

function MapleLeafDoodle() {
  const [spin, setSpin] = useState(false);
  return (
    <motion.button
      onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 500); }}
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.45 }}
      className="text-2xl cursor-pointer select-none bg-transparent border-0 p-0"
      aria-label="maple leaf"
    >🍁</motion.button>
  );
}

function GardenNote() {
  const [idx, setIdx] = useState(0);
  return (
    <motion.button
      onClick={() => setIdx(i => (i + 1) % GARDEN_LABELS.length)}
      whileHover={{ rotate: 1 }}
      className="cursor-pointer select-none bg-transparent border-0 p-0"
      aria-label="garden note"
    >
      <div style={{
        background: "#f5f0d8",
        border: "1.5px solid rgba(42,33,28,0.2)",
        borderRadius: 4,
        padding: "6px 10px",
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
        fontSize: 11,
        color: "#4a3828",
        boxShadow: "2px 2px 6px rgba(42,33,28,0.1)",
        transform: "rotate(-2deg)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}>
        <span style={{ fontSize: 14 }}>📒</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {GARDEN_LABELS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MaiaPage() {
  const reduced = useReducedMotion() ?? false;

  const [visibleMsgs, setVisibleMsgs]   = useState<Msg[]>([]);
  const [typingSender, setTypingSender] = useState<"you" | "maia" | null>(null);
  const [heroTyping, setHeroTyping]     = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [convoIdx, setConvoIdx]         = useState(0);
  const [heartPop, setHeartPop]         = useState(false);
  const [clearing, setClearing]         = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const stopRef    = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMsgs, typingSender]);

  const runConvo = useCallback(async (idx: number) => {
    const convo = CONVOS[idx % CONVOS.length];
    setVisibleMsgs([]);
    setTypingSender(null);

    for (const msg of convo) {
      if (stopRef.current) return;

      // Show typing
      setTypingSender(msg.from);
      setHeroTyping({ left: msg.from === "you", right: msg.from === "maia" });
      await sleep(rand(reduced ? 300 : 700, reduced ? 600 : 1400));
      if (stopRef.current) return;

      // Append message
      setTypingSender(null);
      setHeroTyping({ left: false, right: false });
      setVisibleMsgs(prev => [...prev, msg]);
      await sleep(rand(reduced ? 150 : 300, reduced ? 300 : 700));
      if (stopRef.current) return;
    }

    // Pause, then clear
    await sleep(rand(2500, 4000));
    if (stopRef.current) return;

    setClearing(true);
    await sleep(500);
    setClearing(false);
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
          0%, 60%, 100% { transform: scale(1); opacity: .5; }
          30%            { transform: scale(1.3); opacity: 1; }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          30%       { transform: scale(1.22); }
          60%       { transform: scale(0.92); }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(1.4); }
        }
        .heart-pulse { animation: heartBeat 2.4s ease-in-out infinite; }
        .float-heart { animation: floatUp 0.8s ease-out forwards; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Page wrapper */}
      <div style={{
        minHeight: "100dvh",
        background: "#f4ead8",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(180,140,100,0.07) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(160,120,80,0.06) 0%, transparent 55%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive,system-ui',
        padding: "24px 16px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{ width: "100%", maxWidth: 1100 }}>

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div
            className="relative flex items-center justify-center mb-6"
            style={{ padding: "18px 0 10px" }}
          >
            {/* Decorative doodles left */}
            <div className="absolute left-2 top-2 flex items-center gap-3" aria-hidden>
              <span style={{ fontSize: 13, opacity: 0.55 }}>✦</span>
              <span style={{ fontSize: 18, opacity: 0.6 }}>🌿</span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <h1 style={{
                fontSize: "clamp(32px,6vw,52px)",
                fontWeight: 700,
                color: "#2a211c",
                letterSpacing: "0.02em",
                lineHeight: 1,
                margin: 0,
                textShadow: "1px 1px 0 rgba(42,33,28,0.07)",
              }}>
                Maia
              </h1>
              {/* Heart — clickable */}
              <div className="relative">
                <button
                  onClick={() => setHeartPop(true)}
                  onAnimationEnd={() => setHeartPop(false)}
                  className="bg-transparent border-0 cursor-pointer p-0 leading-none"
                  aria-label="send heart"
                  style={{ fontSize: "clamp(24px,4vw,36px)" }}
                >
                  <span className="heart-pulse inline-block" style={{ color: "#c07070" }}>♡</span>
                </button>
                {heartPop && (
                  <span
                    className="float-heart absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ fontSize: 18 }}
                    aria-hidden
                  >
                    ♡
                  </span>
                )}
              </div>
            </div>

            {/* Decorative doodles right */}
            <div className="absolute right-2 top-2 flex items-center gap-3" aria-hidden>
              <span style={{ fontSize: 18, opacity: 0.6 }}>🐔</span>
              <span style={{ fontSize: 18, opacity: 0.6 }}>🪴</span>
            </div>
          </div>

          {/* ── HERO PANELS ────────────────────────────────────────── */}
          <div
            className="w-full mb-5 overflow-hidden"
            style={{
              display: "flex",
              border: "2px solid rgba(42,33,28,0.15)",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(42,33,28,0.10), inset 0 0 0 1px rgba(255,255,255,0.12)",
              minHeight: 220,
              maxHeight: 340,
            }}
          >
            <RoomPanel side="left"  typing={heroTyping.left} />
            {/* Center divider */}
            <div style={{ width: 2, background: "rgba(42,33,28,0.15)", flexShrink: 0 }}/>
            <RoomPanel side="right" typing={heroTyping.right} />
          </div>

          {/* ── CHAT BOX ───────────────────────────────────────────── */}
          <motion.div
            animate={{ opacity: clearing ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "rgba(255,250,242,0.92)",
              border: "1.5px solid rgba(42,33,28,0.12)",
              borderRadius: 20,
              padding: "20px 20px 16px",
              boxShadow: "0 2px 16px rgba(42,33,28,0.07), inset 0 0 0 1px rgba(255,255,255,0.5)",
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {/* "today" divider */}
            <div className="flex items-center gap-3 mb-4">
              <div style={{ flex: 1, height: 1, background: "rgba(42,33,28,0.1)" }}/>
              <span style={{ fontSize: 12, color: "#a08878", letterSpacing: "0.06em" }}>today</span>
              <div style={{ flex: 1, height: 1, background: "rgba(42,33,28,0.1)" }}/>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-2 flex-1" aria-live="polite" aria-label="chat messages">
              {visibleMsgs.map((msg, i) => (
                <MessageBubble key={`${convoIdx}-${i}`} msg={msg} reduced={reduced} />
              ))}
              {typingSender && <TypingDots side={typingSender} />}
              <div ref={chatEndRef}/>
            </div>
          </motion.div>

          {/* Subtle hint */}
          <div className="text-center mt-3" style={{
            fontSize: 12,
            color: "#b09080",
            letterSpacing: "0.04em",
            fontFamily: '"Segoe Print","Bradley Hand","Comic Sans MS",cursive',
          }}>
            another message in a few seconds... ♡
          </div>

          {/* ── FOOTER DOODLES ─────────────────────────────────────── */}
          <div
            className="flex items-end justify-between flex-wrap gap-4 mt-8 px-2"
            aria-hidden
          >
            {/* Left cluster */}
            <div className="flex items-end gap-4">
              <span style={{ fontSize: 24, opacity: 0.6 }}>🌱</span>
              <GardenNote />
              <span style={{ fontSize: 18, opacity: 0.5 }}>✦</span>
            </div>
            {/* Center */}
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 20, opacity: 0.5 }}>🌙</span>
              <span style={{ fontSize: 14, opacity: 0.4 }}>· · ·</span>
              <span style={{ fontSize: 18, opacity: 0.5 }}>⭒</span>
            </div>
            {/* Right cluster */}
            <div className="flex items-end gap-4">
              <span style={{ fontSize: 16, opacity: 0.5 }}>✦</span>
              <ChickenDoodle />
              <MapleLeafDoodle />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
