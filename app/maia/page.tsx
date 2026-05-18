"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  from: "you" | "maia";
  text: string;
  time: string;
}

// ─── Conversations (20) ───────────────────────────────────────────────────────

const CONVOS: Msg[][] = [
  [
    { from: "you",  text: "how was work",              time: "10:31 PM" },
    { from: "maia", text: "it was okay",               time: "10:32 PM" },
    { from: "you",  text: "people annoying?",          time: "10:32 PM" },
    { from: "maia", text: "a little lol",              time: "10:32 PM" },
    { from: "you",  text: "what u doing now",          time: "10:33 PM" },
    { from: "maia", text: "just got home, making tea", time: "10:33 PM" },
    { from: "you",  text: "nice",                      time: "10:33 PM" },
    { from: "maia", text: "yep and looking at dumb videos", time: "10:34 PM" },
    { from: "you",  text: "sounds about right",        time: "10:34 PM" },
  ],
  [
    { from: "you",  text: "what u doing",         time: "11:08 PM" },
    { from: "maia", text: "laying here",           time: "11:08 PM" },
    { from: "you",  text: "productive",            time: "11:09 PM" },
    { from: "maia", text: "extremely",             time: "11:09 PM" },
    { from: "you",  text: "proud of u",            time: "11:09 PM" },
    { from: "maia", text: "thanks i worked hard",  time: "11:09 PM" },
    { from: "you",  text: "same honestly",         time: "11:10 PM" },
    { from: "maia", text: "wow inspiring",         time: "11:10 PM" },
  ],
  [
    { from: "you",  text: "canada update",  time: "9:54 PM" },
    { from: "maia", text: "still cold",     time: "9:54 PM" },
    { from: "you",  text: "shocking",       time: "9:55 PM" },
    { from: "maia", text: "shut up",        time: "9:55 PM" },
    { from: "you",  text: "sorry",          time: "9:55 PM" },
    { from: "maia", text: "no ur not",      time: "9:55 PM" },
    { from: "you",  text: "true",           time: "9:56 PM" },
  ],
  [
    { from: "you",  text: "still want chickens?",          time: "10:17 PM" },
    { from: "maia", text: "yes",                           time: "10:17 PM" },
    { from: "you",  text: "how many",                      time: "10:18 PM" },
    { from: "maia", text: "enough",                        time: "10:18 PM" },
    { from: "you",  text: "suspicious answer",             time: "10:18 PM" },
    { from: "maia", text: "normal answer",                 time: "10:18 PM" },
    { from: "you",  text: "sure",                          time: "10:18 PM" },
    { from: "maia", text: "we also need tomatoes",         time: "10:19 PM" },
  ],
  [
    { from: "you",  text: "why are we awake",    time: "1:12 AM" },
    { from: "maia", text: "bad choices",          time: "1:12 AM" },
    { from: "you",  text: "fair",                 time: "1:13 AM" },
    { from: "maia", text: "what are u doing",    time: "1:13 AM" },
    { from: "you",  text: "nothing",              time: "1:13 AM" },
    { from: "maia", text: "same",                 time: "1:13 AM" },
    { from: "you",  text: "elite lifestyle",      time: "1:14 AM" },
    { from: "maia", text: "honestly yeah",        time: "1:14 AM" },
  ],
  [
    { from: "you",  text: "u good?",                     time: "11:42 PM" },
    { from: "maia", text: "yeah i'm fine",               time: "11:42 PM" },
    { from: "you",  text: "good",                        time: "11:43 PM" },
    { from: "maia", text: "u?",                          time: "11:43 PM" },
    { from: "you",  text: "yeah",                        time: "11:43 PM" },
    { from: "maia", text: "okay",                        time: "11:43 PM" },
    { from: "you",  text: "very emotional conversation", time: "11:44 PM" },
    { from: "maia", text: "extremely",                   time: "11:44 PM" },
  ],
  [
    { from: "you",  text: "u got any plans tomorrow",            time: "10:05 PM" },
    { from: "maia", text: "not really",                          time: "10:05 PM" },
    { from: "you",  text: "same",                                time: "10:06 PM" },
    { from: "maia", text: "maybe go outside if it's not gross",  time: "10:06 PM" },
    { from: "you",  text: "ambitious",                           time: "10:06 PM" },
    { from: "maia", text: "i know",                              time: "10:07 PM" },
    { from: "you",  text: "proud of us",                         time: "10:07 PM" },
    { from: "maia", text: "don't overdo it",                     time: "10:07 PM" },
  ],
  [
    { from: "you",  text: "important question",                       time: "9:30 PM" },
    { from: "maia", text: "what",                                      time: "9:30 PM" },
    { from: "you",  text: "garden first or chickens first",           time: "9:31 PM" },
    { from: "maia", text: "garden",                                    time: "9:31 PM" },
    { from: "you",  text: "controversial",                            time: "9:31 PM" },
    { from: "maia", text: "chickens need somewhere to judge us from", time: "9:31 PM" },
    { from: "you",  text: "fair point",                               time: "9:32 PM" },
  ],
  [
    { from: "maia", text: "hey",                    time: "10:48 PM" },
    { from: "you",  text: "hey",                    time: "10:48 PM" },
    { from: "maia", text: "nothing i just wanted to say something", time: "10:49 PM" },
    { from: "you",  text: "say it then",            time: "10:49 PM" },
    { from: "maia", text: "i love you",             time: "10:50 PM" },
    { from: "you",  text: "oh",                     time: "10:50 PM" },
    { from: "you",  text: "i love you too",         time: "10:50 PM" },
    { from: "maia", text: "okay good",              time: "10:51 PM" },
    { from: "maia", text: "that's all",             time: "10:51 PM" },
  ],
  [
    { from: "you",  text: "i miss you",          time: "11:22 PM" },
    { from: "maia", text: "same",                time: "11:22 PM" },
    { from: "you",  text: "that's it?",          time: "11:22 PM" },
    { from: "maia", text: "i miss you a lot",    time: "11:23 PM" },
    { from: "you",  text: "better",              time: "11:23 PM" },
    { from: "maia", text: "♡",                   time: "11:23 PM" },
    { from: "you",  text: "♡",                   time: "11:23 PM" },
  ],
  [
    { from: "maia", text: "what did u eat today",  time: "9:18 PM" },
    { from: "you",  text: "cereal twice",           time: "9:18 PM" },
    { from: "maia", text: "incredible",             time: "9:19 PM" },
    { from: "you",  text: "and u",                  time: "9:19 PM" },
    { from: "maia", text: "toast and sadness",      time: "9:19 PM" },
    { from: "you",  text: "we're doing great",      time: "9:20 PM" },
    { from: "maia", text: "thriving",               time: "9:20 PM" },
  ],
  [
    { from: "you",  text: "everything is a lot",    time: "10:58 PM" },
    { from: "maia", text: "yeah",                   time: "10:58 PM" },
    { from: "you",  text: "just needed to say that",time: "10:59 PM" },
    { from: "maia", text: "said and received",      time: "10:59 PM" },
    { from: "you",  text: "thanks",                 time: "11:00 PM" },
    { from: "maia", text: "anytime",                time: "11:00 PM" },
    { from: "you",  text: "i love you",             time: "11:00 PM" },
    { from: "maia", text: "i love you",             time: "11:01 PM" },
  ],
  [
    { from: "maia", text: "how many plants is too many",  time: "8:44 PM" },
    { from: "you",  text: "trick question",               time: "8:44 PM" },
    { from: "maia", text: "correct",                      time: "8:45 PM" },
    { from: "you",  text: "getting another one?",         time: "8:45 PM" },
    { from: "maia", text: "already did",                  time: "8:45 PM" },
    { from: "you",  text: "obviously",                    time: "8:46 PM" },
    { from: "maia", text: "her name is linda",            time: "8:46 PM" },
    { from: "you",  text: "of course it is",              time: "8:46 PM" },
  ],
  [
    { from: "you",  text: "okay i should actually sleep", time: "12:34 AM" },
    { from: "maia", text: "probably",                      time: "12:34 AM" },
    { from: "you",  text: "you too",                       time: "12:35 AM" },
    { from: "maia", text: "maybe",                         time: "12:35 AM" },
    { from: "you",  text: "maia.",                         time: "12:35 AM" },
    { from: "maia", text: "fine",                          time: "12:36 AM" },
    { from: "you",  text: "goodnight ♡",                   time: "12:36 AM" },
    { from: "maia", text: "goodnight ♡",                   time: "12:36 AM" },
  ],
  [
    { from: "maia", text: "are u still awake",              time: "12:02 AM" },
    { from: "you",  text: "yeah",                           time: "12:02 AM" },
    { from: "maia", text: "good",                           time: "12:03 AM" },
    { from: "you",  text: "why",                            time: "12:03 AM" },
    { from: "maia", text: "just wanted to talk",            time: "12:03 AM" },
    { from: "you",  text: "how's your brain",               time: "12:04 AM" },
    { from: "maia", text: "loud tonight",                   time: "12:04 AM" },
    { from: "you",  text: "less loud when i talk to u",     time: "12:05 AM" },
    { from: "maia", text: "♡",                              time: "12:05 AM" },
  ],
  [
    { from: "maia", text: "i love you",          time: "11:16 PM" },
    { from: "you",  text: "i know",              time: "11:16 PM" },
    { from: "maia", text: "okay han solo",       time: "11:17 PM" },
    { from: "you",  text: "i love you too obviously", time: "11:17 PM" },
    { from: "maia", text: "better",              time: "11:17 PM" },
    { from: "you",  text: "♡",                   time: "11:18 PM" },
  ],
  [
    { from: "you",  text: "how cold is it",      time: "10:22 PM" },
    { from: "maia", text: "very",                time: "10:22 PM" },
    { from: "you",  text: "i would keep u warm", time: "10:23 PM" },
    { from: "maia", text: "bold claim",          time: "10:23 PM" },
    { from: "you",  text: "i'm very warm",       time: "10:23 PM" },
    { from: "maia", text: "scientifically?",     time: "10:24 PM" },
    { from: "you",  text: "anecdotally",         time: "10:24 PM" },
    { from: "maia", text: "♡",                   time: "10:24 PM" },
  ],
  [
    { from: "you",  text: "how are you actually",    time: "11:36 PM" },
    { from: "maia", text: "tired but okay",           time: "11:37 PM" },
    { from: "you",  text: "tired how",               time: "11:37 PM" },
    { from: "maia", text: "just the regular kind",   time: "11:37 PM" },
    { from: "you",  text: "okay good",               time: "11:38 PM" },
    { from: "maia", text: "are u checking on me",    time: "11:38 PM" },
    { from: "you",  text: "yes",                     time: "11:38 PM" },
    { from: "maia", text: "i love you",              time: "11:39 PM" },
    { from: "you",  text: "love you",                time: "11:39 PM" },
  ],
  [
    { from: "you",  text: "update",                             time: "9:44 PM" },
    { from: "maia", text: "the sun set",                        time: "9:44 PM" },
    { from: "you",  text: "and?",                              time: "9:45 PM" },
    { from: "maia", text: "it was there then it wasn't",       time: "9:45 PM" },
    { from: "you",  text: "riveting",                          time: "9:45 PM" },
    { from: "maia", text: "i know right",                      time: "9:46 PM" },
    { from: "you",  text: "same time tomorrow?",               time: "9:46 PM" },
    { from: "maia", text: "probably",                          time: "9:46 PM" },
  ],
  [
    { from: "you",  text: "♡",                    time: "10:55 PM" },
    { from: "maia", text: "♡",                    time: "10:55 PM" },
    { from: "you",  text: "okay that's all i had",time: "10:55 PM" },
    { from: "maia", text: "it was enough",        time: "10:56 PM" },
    { from: "you",  text: "yeah?",               time: "10:56 PM" },
    { from: "maia", text: "yeah",                time: "10:56 PM" },
  ],
];

const GARDEN_LABELS = ["garden ideas", "tomatoes maybe", "chickens eventually", "no people allowed"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Paper texture noise (inline SVG data URI) ────────────────────────────────

const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E")`;

// ─── SVG Art ──────────────────────────────────────────────────────────────────

function ArtHeart({ size = 22, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 22" fill="none"
      style={pulse ? { animation: "heartBeat 2.8s ease-in-out infinite", display: "inline-block" } : { display: "inline-block" }}
      aria-hidden>
      <path d="M12,20 C11.4,19.4 8.2,17.2 5.5,14.4 C3,11.8 2,9.8 2,7.5 C2,4.4 4.3,2 7.5,2 C9.6,2 11.2,3.1 12,5 C12.8,3.1 14.4,2 16.5,2 C19.7,2 22,4.4 22,7.5 C22,9.8 21,11.8 18.5,14.4 C15.8,17.2 12.6,19.4 12,20 Z"
        fill="rgba(184,104,104,0.18)" stroke="#b86868" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArtChicken({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 46" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* body */}
      <path d="M9,36 Q6,29 7,23 Q9,15 17,13 Q25,11 30,18 Q34,24 32,33 Q30,40 22,42 Q13,43 9,36 Z"/>
      {/* head */}
      <circle cx="25" cy="13" r="7" stroke="#3a2a1e" strokeWidth="1.55" fill="none"/>
      {/* comb */}
      <path d="M20,7 Q21.5,4 23.5,6.5 Q25,3.5 27,6 Q28.5,3 30,6"/>
      {/* beak */}
      <path d="M31,13 L37,11 L37,15 Z" fill="#3a2a1e" strokeWidth="1"/>
      {/* eye */}
      <circle cx="27" cy="11" r="1.6" fill="#3a2a1e" stroke="none"/>
      {/* wattle */}
      <path d="M30,16 Q32,19 30,21 Q28,19 30,16"/>
      {/* wing */}
      <path d="M10,28 Q15,24 22,25 Q18,31 13,32 Q9,31 10,28"/>
      {/* tail feathers */}
      <path d="M8,28 Q3,22 4,15"/>
      <path d="M8,32 Q2,28 3,21"/>
      {/* legs */}
      <path d="M16,42 L15,47"/>
      <path d="M15,47 L12,46 M15,47 L17,46"/>
      <path d="M23,43 L22,48"/>
      <path d="M22,48 L19,47 M22,48 L24,47"/>
    </svg>
  );
}

function ArtPlant({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 44" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "plantSway 6s ease-in-out infinite", transformOrigin: "18px 42px" }} aria-hidden>
      {/* pot body */}
      <path d="M11,32 L13,41 L23,41 L25,32 Z"/>
      {/* pot rim */}
      <path d="M9,32 L27,32"/>
      {/* pot rim curve (soil) */}
      <path d="M12,32 Q18,34.5 24,32"/>
      {/* main stem */}
      <line x1="18" y1="32" x2="18" y2="20"/>
      {/* left leaf */}
      <path d="M18,28 Q9,24 8,15 Q15,18 18,26"/>
      {/* right leaf */}
      <path d="M18,23 Q27,19 28,10 Q21,13 18,22"/>
      {/* top sprout */}
      <path d="M18,20 Q16,14 17,10 Q20,14 18,19"/>
    </svg>
  );
}

function ArtLeaves({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 32" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "leafSway 4.5s ease-in-out infinite", transformOrigin: "14px 30px" }} aria-hidden>
      {/* stem */}
      <path d="M14,30 L14,19 Q14,16 14,13"/>
      {/* left leaf */}
      <path d="M14,25 Q7,21 6,14 Q12,16 14,24"/>
      {/* midrib of left leaf */}
      <path d="M14,25 Q10,21 9,16"/>
      {/* right leaf */}
      <path d="M14,20 Q21,16 22,9 Q16,12 14,19"/>
      {/* midrib of right leaf */}
      <path d="M14,20 Q18,16 19,12"/>
      {/* top leaf */}
      <path d="M14,13 Q13,8 14,5 Q16,9 14,12"/>
    </svg>
  );
}

function ArtSeedling({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 32" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* ground line */}
      <path d="M5,28 Q14,30 23,28"/>
      {/* stem */}
      <line x1="14" y1="28" x2="14" y2="17"/>
      {/* left leaf */}
      <path d="M14,23 Q7,19 6,11 Q12,14 14,22"/>
      {/* left midrib */}
      <path d="M14,23 Q10,19 9,14"/>
      {/* right leaf */}
      <path d="M14,19 Q21,15 22,7 Q16,11 14,18"/>
      {/* right midrib */}
      <path d="M14,19 Q18,15 19,10"/>
    </svg>
  );
}

function ArtMapleLeaf({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 36" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* maple leaf */}
      <path d="M16,3 L18,9 L23,7 L20,13 L27,12 L22,18 L25,23 L16,20 L7,23 L10,18 L5,12 L12,13 L9,7 L14,9 Z"/>
      {/* veins */}
      <line x1="16" y1="20" x2="16" y2="8"/>
      <path d="M16,14 L10,12 M16,14 L22,12"/>
      <path d="M16,17 L11,20 M16,17 L21,20"/>
      {/* stem */}
      <line x1="16" y1="20" x2="16" y2="32"/>
      <path d="M13,32 Q16,31 19,32"/>
    </svg>
  );
}

function ArtStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="#3a2a1e" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      {/* 4-point sparkle — each spike tapers to center */}
      <path d="M8,1 Q8.9,5.5 8,8 Q7.1,5.5 8,1"/>
      <path d="M15,8 Q10.5,8.9 8,8 Q10.5,7.1 15,8"/>
      <path d="M8,15 Q7.1,10.5 8,8 Q8.9,10.5 8,15"/>
      <path d="M1,8 Q5.5,7.1 8,8 Q5.5,8.9 1,8"/>
    </svg>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots({ isMaia }: { isMaia: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
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

function Bubble({ text, typing, side, time }: {
  text: string | null; typing: boolean; side: "left" | "right"; time?: string;
}) {
  const isMaia = side === "right";
  const show = typing || text !== null;
  // slight rotation variation per message
  const rot = text ? ((text.charCodeAt(0) % 5) - 2) * 0.45 : 0;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={typing ? `t-${side}` : `m-${text}`}
          initial={{ opacity: 0, x: isMaia ? 18 : -18, y: 4, scale: 0.93 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: isMaia ? 10 : -10, y: -6, scale: 0.96 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block" }}
        >
          <div
            style={{
              maxWidth: "min(190px, 38vw)",
              padding: typing ? "10px 14px" : "9px 14px 10px",
              background: isMaia
                ? "rgba(200, 143, 136, 0.70)"
                : "rgba(238, 222, 196, 0.74)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: `1.5px solid rgba(42,33,28,${isMaia ? "0.13" : "0.11"})`,
              // Slightly irregular corners for hand-drawn feel
              borderRadius: isMaia ? "17px 4px 18px 15px" : "4px 18px 15px 17px",
              boxShadow: isMaia
                ? "2px 3px 12px rgba(0,0,0,0.16), 1px 1px 0 rgba(42,33,28,0.06)"
                : "2px 3px 12px rgba(0,0,0,0.14), 1px 1px 0 rgba(42,33,28,0.05)",
              fontFamily: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive",
              fontSize: "clamp(13px, 3vw, 15px)",
              lineHeight: 1.4,
              color: "#2a1c14",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              transform: `rotate(${rot}deg)`,
              position: "relative",
            }}
          >
            {typing ? <TypingDots isMaia={isMaia} /> : text}
            {/* Tail */}
            <span style={{
              position: "absolute",
              bottom: -8,
              [isMaia ? "right" : "left"]: 13,
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `8px solid ${isMaia ? "rgba(200,143,136,0.70)" : "rgba(238,222,196,0.74)"}`,
            }} />
          </div>
          {/* Timestamp */}
          {!typing && text && time && (
            <div style={{
              fontSize: "clamp(9px, 1.6vw, 10px)",
              color: "rgba(42,28,20,0.32)",
              marginTop: 4,
              textAlign: isMaia ? "right" : "left",
              fontFamily: "'Caveat', cursive",
              letterSpacing: "0.03em",
              paddingLeft: isMaia ? 0 : 4,
              paddingRight: isMaia ? 4 : 0,
            }}>
              {time}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Interactive chicken (idles with random pecks) ────────────────────────────

function ChickenButton({ size = 32 }: { size?: number }) {
  const [anim, setAnim] = useState<"idle" | "hop" | "peck">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function scheduleIdle() {
      timerRef.current = setTimeout(() => {
        setAnim("peck");
        setTimeout(() => { setAnim("idle"); scheduleIdle(); }, 560);
      }, rand(8000, 16000));
    }
    scheduleIdle();
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <motion.button
      onClick={() => { setAnim("hop"); setTimeout(() => setAnim("idle"), 360); }}
      animate={
        anim === "hop"  ? { y: [0, -13, 0], rotate: 0 } :
        anim === "peck" ? { rotate: [0, 15, 0, 15, 0], y: [0, 2, 0, 2, 0] } :
        { y: 0, rotate: 0 }
      }
      transition={{ duration: anim === "peck" ? 0.52 : 0.34 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
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
      onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 480); }}
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.44 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
      aria-label="maple leaf"
    >
      <ArtMapleLeaf size={size} />
    </motion.button>
  );
}

// ─── Garden note ─────────────────────────────────────────────────────────────

function GardenNote() {
  const [idx, setIdx] = useState(0);
  return (
    <motion.button
      onClick={() => setIdx(i => (i + 1) % GARDEN_LABELS.length)}
      whileHover={{ rotate: [-1, 1.5], transition: { duration: 0.3 } }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, transform: "rotate(-3deg)", transformOrigin: "center" }}
      aria-label="garden note"
    >
      <div style={{
        background: "rgba(246, 241, 218, 0.92)",
        border: "1.5px solid rgba(42,33,28,0.18)",
        borderRadius: "3px 5px 4px 3px",
        padding: "7px 12px 9px",
        boxShadow: "2px 3px 8px rgba(42,33,28,0.10), 1px 1px 0 rgba(42,33,28,0.05)",
        fontFamily: "'Caveat', cursive",
        fontSize: 12,
        color: "#4a3828",
        lineHeight: 1.6,
        textAlign: "left" as const,
        minWidth: 88,
      }}>
        <svg width="16" height="16" viewBox="0 0 22 22" fill="none" stroke="#3a2a1e" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", marginBottom: 3 }}>
          <rect x="3" y="2" width="16" height="18" rx="2"/>
          <line x1="3" y1="7" x2="7" y2="7"/>
          <line x1="7" y1="2" x2="7" y2="20"/>
          <line x1="10" y1="9" x2="17" y2="9"/>
          <line x1="10" y1="13" x2="17" y2="13"/>
          <line x1="10" y1="17" x2="14" y2="17"/>
        </svg>
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ display: "block" }}>
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

  const [convoIdx,    setConvoIdx]    = useState(() => Math.floor(Math.random() * CONVOS.length));
  const [leftText,    setLeftText]    = useState<string | null>(null);
  const [rightText,   setRightText]   = useState<string | null>(null);
  const [leftTyping,  setLeftTyping]  = useState(false);
  const [rightTyping, setRightTyping] = useState(false);
  const [leftTime,    setLeftTime]    = useState<string | undefined>();
  const [rightTime,   setRightTime]   = useState<string | undefined>();
  const [heartPop,    setHeartPop]    = useState(false);

  const stopRef = useRef(false);

  const runConvo = useCallback(async (idx: number) => {
    const convo = CONVOS[idx % CONVOS.length];
    setLeftText(null); setRightText(null);
    setLeftTyping(false); setRightTyping(false);

    for (const msg of convo) {
      if (stopRef.current) return;
      const isLeft = msg.from === "you";

      if (isLeft) { setLeftTyping(true);  setLeftText(null);  }
      else         { setRightTyping(true); setRightText(null); }

      await sleep(rand(reduced ? 800 : 3200, reduced ? 1500 : 5800));
      if (stopRef.current) return;

      if (isLeft) { setLeftTyping(false);  setLeftText(msg.text);  setLeftTime(msg.time);  }
      else         { setRightTyping(false); setRightText(msg.text); setRightTime(msg.time); }

      await sleep(rand(reduced ? 1000 : 3800, reduced ? 2000 : 6500));
      if (stopRef.current) return;
    }

    await sleep(2400);
    if (stopRef.current) return;
    setLeftText(null); setRightText(null);
    await sleep(1600);
    if (stopRef.current) return;
    setConvoIdx(prev => (prev + rand(1, CONVOS.length - 1)) % CONVOS.length);
  }, [reduced]);

  useEffect(() => {
    stopRef.current = false;
    runConvo(convoIdx);
    return () => { stopRef.current = true; };
  }, [convoIdx, runConvo]);

  // Card background color — must match vignette bottom color
  const CARD_BG = "#f0e6d0";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap');

        html, body { background: #d8ccb4 !important; margin: 0; padding: 0; }

        @keyframes dotPulse {
          0%,60%,100% { transform:scale(1);   opacity:.38; }
          30%          { transform:scale(1.5); opacity:1;   }
        }
        @keyframes heartBeat {
          0%,100% { transform:scale(1); }
          25%     { transform:scale(1.28); }
          55%     { transform:scale(0.88); }
          75%     { transform:scale(1.06); }
        }
        @keyframes floatUp {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-56px) scale(1.3); }
        }
        @keyframes leafSway {
          0%,100% { transform:rotate(-3deg); }
          50%     { transform:rotate(3deg); }
        }
        @keyframes plantSway {
          0%,100% { transform:rotate(-2deg); }
          50%     { transform:rotate(2deg); }
        }

        .float-heart {
          animation: floatUp .95s ease-out forwards;
          position: absolute;
          pointer-events: none;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── Page background (darker parchment + noise) ── */}
      <div style={{
        minHeight: "100dvh",
        background: "#d8ccb4",
        backgroundImage: NOISE_BG,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px 14px 40px",
        fontFamily: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive, system-ui",
      }}>

        {/* ── Card ── */}
        <div style={{
          width: "100%",
          maxWidth: 860,
          background: CARD_BG,
          backgroundImage: NOISE_BG,
          border: "2px solid rgba(42,33,28,0.16)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: [
            "0 2px 0 rgba(42,33,28,0.07)",
            "0 5px 0 rgba(42,33,28,0.04)",
            "0 14px 40px rgba(42,33,28,0.14)",
            "inset 0 1px 0 rgba(255,255,255,0.45)",
          ].join(", "),
        }}>

          {/* ── HEADER ── */}
          <div style={{
            padding: "18px 28px 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderBottom: "1.5px solid rgba(42,33,28,0.09)",
          }}>
            <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
              <ArtStar size={12} />
              <ArtStar size={9}  />
              <ArtLeaves size={26} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
              <h1 style={{
                fontSize: "clamp(32px,6vw,52px)",
                fontWeight: 700,
                color: "#1e1610",
                letterSpacing: "0.02em",
                lineHeight: 1,
                fontFamily: "'Caveat', cursive",
              }}>
                Maia
              </h1>
              <button
                onClick={() => setHeartPop(true)}
                onAnimationEnd={() => setHeartPop(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", position: "relative", lineHeight: 0 }}
                aria-label="send heart"
              >
                <ArtHeart size={30} pulse />
                {heartPop && (
                  <span className="float-heart" style={{ top: -4, left: "50%", transform: "translateX(-50%)" }}>
                    <ArtHeart size={20} />
                  </span>
                )}
              </button>
              <h1 style={{
                fontSize: "clamp(32px,6vw,52px)",
                fontWeight: 700,
                color: "#1e1610",
                letterSpacing: "0.02em",
                lineHeight: 1,
                fontFamily: "'Caveat', cursive",
              }}>
                Chase
              </h1>
            </div>

            <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
              <ArtChicken size={30} />
              <ArtPlant size={30} />
            </div>
          </div>

          {/* ── HERO — full-width image crop showing only the two rooms ── */}
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

            {/* Bottom vignette */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"18%",
              background:`linear-gradient(to bottom, transparent 0%, ${CARD_BG} 100%)`,
              pointerEvents:"none", zIndex:5 }}/>

            {/* Left bubble */}
            <div style={{ position:"absolute", left:"5%", top:"32%", zIndex:10 }}>
              <Bubble text={leftText} typing={leftTyping} side="left" time={leftTime}/>
            </div>

            {/* Right bubble */}
            <div style={{ position:"absolute", right:"5%", top:"32%", zIndex:10, display:"flex", justifyContent:"flex-end" }}>
              <Bubble text={rightText} typing={rightTyping} side="right" time={rightTime}/>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            padding: "18px 24px 26px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            borderTop: "1.5px solid rgba(42,33,28,0.08)",
          }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
              <ArtSeedling size={26}/>
              <GardenNote/>
              <ArtStar size={11}/>
            </div>

            <div style={{ fontSize:12, color:"#9a8070", letterSpacing:"0.04em", textAlign:"center",
              flexGrow:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              fontFamily:"'Caveat', cursive" }}>
              another message in a few seconds
              <ArtHeart size={12}/>
            </div>

            <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
              <ArtStar size={11}/>
              <ChickenButton size={32}/>
              <MapleButton size={28}/>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
