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
  [
    { from: "you",  text: "i miss you",           time: "11:55 PM" },
    { from: "maia", text: "i know",               time: "11:55 PM" },
    { from: "you",  text: "come here then",       time: "11:56 PM" },
    { from: "maia", text: "working on it",        time: "11:56 PM" },
    { from: "you",  text: "work faster",          time: "11:56 PM" },
    { from: "maia", text: "lol okay",             time: "11:57 PM" },
    { from: "you",  text: "i'm serious",          time: "11:57 PM" },
    { from: "maia", text: "i know",               time: "11:57 PM" },
  ],
  [
    { from: "maia", text: "what would we be doing right now if you were here", time: "12:03 AM" },
    { from: "you",  text: "nothing",              time: "12:04 AM" },
    { from: "maia", text: "just nothing?",        time: "12:04 AM" },
    { from: "you",  text: "yeah just laying there not doing anything", time: "12:04 AM" },
    { from: "maia", text: "yeah",                 time: "12:05 AM" },
    { from: "you",  text: "that sounds good",     time: "12:05 AM" },
    { from: "maia", text: "it does",              time: "12:05 AM" },
  ],
  [
    { from: "maia", text: "i made toast",         time: "1:22 AM" },
    { from: "you",  text: "at 1am",               time: "1:22 AM" },
    { from: "maia", text: "yes",                  time: "1:22 AM" },
    { from: "you",  text: "how is it",            time: "1:23 AM" },
    { from: "maia", text: "honestly pretty good", time: "1:23 AM" },
    { from: "you",  text: "living ur best life",  time: "1:23 AM" },
    { from: "maia", text: "i really am",          time: "1:24 AM" },
  ],
  [
    { from: "you",  text: "what do u want",       time: "10:44 PM" },
    { from: "maia", text: "what do u mean",       time: "10:44 PM" },
    { from: "you",  text: "like... eventually",   time: "10:45 PM" },
    { from: "maia", text: "a house",              time: "10:45 PM" },
    { from: "you",  text: "yeah",                 time: "10:45 PM" },
    { from: "maia", text: "chickens",             time: "10:46 PM" },
    { from: "you",  text: "obviously",            time: "10:46 PM" },
    { from: "maia", text: "and u",                time: "10:46 PM" },
    { from: "you",  text: "obviously",            time: "10:46 PM" },
  ],
  [
    { from: "you",  text: "quiet night",          time: "11:18 PM" },
    { from: "maia", text: "yeah",                 time: "11:18 PM" },
    { from: "you",  text: "nice though",          time: "11:19 PM" },
    { from: "maia", text: "mhm",                  time: "11:19 PM" },
    { from: "you",  text: "u okay",               time: "11:20 PM" },
    { from: "maia", text: "yeah just thinking",   time: "11:20 PM" },
    { from: "you",  text: "about what",           time: "11:20 PM" },
    { from: "maia", text: "you actually",         time: "11:21 PM" },
  ],
  [
    { from: "maia", text: "are u asleep",         time: "2:14 AM" },
    { from: "you",  text: "no",                   time: "2:14 AM" },
    { from: "maia", text: "good",                 time: "2:14 AM" },
    { from: "you",  text: "what's up",            time: "2:15 AM" },
    { from: "maia", text: "nothing just didn't want to be the only one awake", time: "2:15 AM" },
    { from: "you",  text: "never",                time: "2:15 AM" },
  ],
  [
    { from: "you",  text: "okay i'm actually going to sleep", time: "12:44 AM" },
    { from: "maia", text: "okay",                 time: "12:44 AM" },
    { from: "you",  text: "goodnight",            time: "12:44 AM" },
    { from: "maia", text: "goodnight",            time: "12:45 AM" },
    { from: "you",  text: "hey",                  time: "12:45 AM" },
    { from: "maia", text: "what",                 time: "12:45 AM" },
    { from: "you",  text: "i love you",           time: "12:45 AM" },
    { from: "maia", text: "i love you too",       time: "12:46 AM" },
    { from: "you",  text: "okay NOW goodnight",   time: "12:46 AM" },
    { from: "maia", text: "lol goodnight",        time: "12:46 AM" },
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
const DOT_BG    = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='0.85' fill='rgba(42%2C33%2C28%2C0.13)'/%3E%3C/svg%3E")`;

// ─── SVG Art ──────────────────────────────────────────────────────────────────

function ArtHeart({ size = 22, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-heart.png" alt="" aria-hidden width={size} height={size}
      style={{
        display: "inline-block", objectFit: "contain",
        animation: pulse ? "heartBeat 2.8s ease-in-out infinite" : undefined,
      }}
    />
  );
}

function ArtChicken({ size = 30 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-chicken.png" alt="" aria-hidden width={size} height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

function ArtPlant({ size = 30 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-plant.png" alt="" aria-hidden width={size} height={size}
      style={{ display: "block", objectFit: "contain",
        animation: "plantSway 6s ease-in-out infinite", transformOrigin: "bottom center" }}
    />
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
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-maple.png" alt="" aria-hidden width={size} height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

function ArtMoon({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-moon.png" alt="" aria-hidden width={size} height={size}
      style={{ display: "block", objectFit: "contain" }}
    />
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
  return (
    <motion.div
      whileHover={{ rotate: 3, scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      style={{ transform: "rotate(-4deg)", transformOrigin: "center", lineHeight: 0, cursor: "default" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/maia-note.png" alt="garden ideas" width={96} height={96}
        style={{ display: "block", objectFit: "contain" }}
      />
    </motion.div>
  );
}

// ─── Speaker SVG ─────────────────────────────────────────────────────────────

function ArtSpeaker({ size = 26, on = false }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* body + cone */}
      <path d="M3,10 L3,18 L9,18 L15,23 L15,5 L9,10 Z"/>
      {on ? (
        <>
          {/* sound waves */}
          <path d="M18,10.5 Q21,14 18,17.5"/>
          <path d="M21,7.5 Q25.5,14 21,20.5"/>
        </>
      ) : (
        <>
          {/* muted X */}
          <line x1="19" y1="11" x2="25" y2="17"/>
          <line x1="25" y1="11" x2="19" y2="17"/>
        </>
      )}
    </svg>
  );
}

function SpeakerButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: playing ? 1 : 0.55 }}
      transition={{ duration: 0.25 }}
      style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:0, display:"block" }}
      aria-label={playing ? "pause lo-fi" : "play lo-fi"}
    >
      <ArtSpeaker size={26} on={playing}/>
    </motion.button>
  );
}

// ─── Rain SVG + button ────────────────────────────────────────────────────────

function ArtRain({ size = 26, on = false }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* cloud */}
      <path d="M6,15 Q4,15 4,12.5 Q4,10 7,10 Q7.5,7 10.5,7 Q12.5,7 13.5,8.5 Q14.5,7 16.5,7 Q19.5,7 19.5,10.5 Q21.5,10.5 21.5,13 Q21.5,15 19.5,15 Z"/>
      {/* rain drops — full when on, faint when off */}
      <line x1="9"  y1="18" x2="7.5"  y2="23" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="13.5" y1="18" x2="12" y2="23" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="18" y1="18" x2="16.5" y2="23" strokeOpacity={on ? 1 : 0.3}/>
    </svg>
  );
}

function RainButton({ raining, onToggle }: { raining: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: raining ? 1 : 0.55 }}
      transition={{ duration: 0.25 }}
      style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:0, display:"block" }}
      aria-label={raining ? "stop rain" : "add rain sounds"}
    >
      <ArtRain size={26} on={raining}/>
    </motion.button>
  );
}

// ─── Time-aware footer hint ───────────────────────────────────────────────────

function getFooterHint(): string {
  const h = new Date().getHours();
  if (h >= 1  && h < 4)  return "can't sleep?";
  if (h >= 4  && h < 7)  return "still up...";
  if (h >= 7  && h < 11) return "good morning";
  if (h >= 11 && h < 14) return "afternoon texts";
  if (h >= 14 && h < 18) return "sending more soon";
  if (h >= 18 && h < 21) return "evening check-in";
  return "it's getting late";
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

  const stopRef      = useRef(false);
  const heroRef      = useRef<HTMLDivElement>(null);

  // lo-fi audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [playing, setPlaying] = useState(false);

  // rain audio
  const rainCtxRef   = useRef<AudioContext | null>(null);
  const rainGainRef  = useRef<GainNode | null>(null);
  const rainFadeRef  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [raining, setRaining] = useState(false);

  // parallax + hover side
  const [parallax,  setParallax]  = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  // time-aware hint (computed once at mount)
  const [footerHint] = useState(getFooterHint);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/lofi.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
    const audio = audioRef.current;
    clearInterval(fadeRef.current);

    if (playing) {
      fadeRef.current = setInterval(() => {
        if (audio.volume > 0.04) {
          audio.volume = Math.max(0, audio.volume - 0.04);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeRef.current);
        }
      }, 40);
      setPlaying(false);
    } else {
      audio.volume = 0;
      // start fade AFTER play() resolves so we know audio is actually running
      audio.play()
        .then(() => {
          setPlaying(true);
          fadeRef.current = setInterval(() => {
            if (audio.volume < 0.38) {
              audio.volume = Math.min(0.4, audio.volume + 0.03);
            } else {
              audio.volume = 0.4;
              clearInterval(fadeRef.current);
            }
          }, 40);
        })
        .catch(() => {
          // autoplay blocked — bump volume and mark playing anyway
          audio.volume = 0.4;
          setPlaying(true);
        });
    }
  }, [playing]);

  const toggleRain = useCallback(() => {
    if (!rainCtxRef.current) {
      const ctx = new AudioContext();
      rainCtxRef.current = ctx;
      // white-noise buffer (3 s, looped)
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      // shape into soft rain — highpass removes rumble, lowpass kills harshness, bandpass centres it
      const hi  = ctx.createBiquadFilter(); hi.type = "highpass"; hi.frequency.value = 300;
      const lp  = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 2800;
      const bp  = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.5;
      const gain = ctx.createGain(); gain.gain.value = 0;
      rainGainRef.current = gain;
      src.connect(hi); hi.connect(lp); lp.connect(bp); bp.connect(gain); gain.connect(ctx.destination);
      src.start();
    }
    const g = rainGainRef.current; if (!g) return;
    clearInterval(rainFadeRef.current);
    if (raining) {
      rainFadeRef.current = setInterval(() => {
        if (g.gain.value > 0.005) { g.gain.value = Math.max(0, g.gain.value - 0.006); }
        else { g.gain.value = 0; clearInterval(rainFadeRef.current); }
      }, 40);
      setRaining(false);
    } else {
      g.gain.value = 0; setRaining(true);
      rainFadeRef.current = setInterval(() => {
        if (g.gain.value < 0.07) { g.gain.value = Math.min(0.08, g.gain.value + 0.004); }
        else { g.gain.value = 0.08; clearInterval(rainFadeRef.current); }
      }, 40);
    }
  }, [raining]);

  const onHeroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverSide(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
    if (reduced) return;
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / rect.width;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / rect.height;
    setParallax({ x: dx * -10, y: dy * -6 });
  }, [reduced]);

  const onHeroMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
    setHoverSide(null);
  }, []);

  // swap favicon to heart while on this page
  useEffect(() => {
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    const link: HTMLLinkElement = existing ?? document.createElement("link");
    const prev = link.href;
    link.rel  = "icon";
    link.href = "/maia-heart.png";
    if (!existing) document.head.appendChild(link);
    return () => { link.href = prev; };
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(fadeRef.current);
      clearInterval(rainFadeRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (rainCtxRef.current) rainCtxRef.current.close().catch(() => {});
    };
  }, []);

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

        @media (max-width: 600px) {
          .maia-footer { padding: 12px 14px 18px !important; gap: 8px !important; }
          .maia-footer-right { gap: 7px !important; }
          .maia-footer-right img { width: 34px !important; height: 34px !important; }
          .maia-footer-right svg { width: 20px !important; height: 20px !important; }
          .maia-note-img { width: 64px !important; height: 64px !important; }
          .maia-header-right img { width: 34px !important; height: 34px !important; }
          .maia-header-left img  { width: 30px !important; height: 30px !important; }
        }
      `}</style>

      {/* ── Page background (dot grid + warm glow + noise) ── */}
      <div style={{
        minHeight: "100dvh",
        background: `radial-gradient(ellipse 900px 520px at 50% 38%, rgba(195,155,90,0.22) 0%, transparent 65%), #d8ccb4`,
        backgroundImage: `${DOT_BG}, ${NOISE_BG}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px 14px 40px",
        fontFamily: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive, system-ui",
      }}>

        {/* ── Card (entrance animation) ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
          width: "100%",
          maxWidth: 860,
          backgroundColor: "#f0e6d0",
          backgroundImage: `url('/maia-paper.png')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
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
            <div className="maia-header-left" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
              <ArtMoon size={46} />
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
                <ArtHeart size={38} pulse />
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

            <div className="maia-header-right" style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "flex-end", gap: 8 }}>
              <ArtPlant size={54} />
            </div>
          </div>

          {/* ── HERO — full-width image crop with parallax ── */}
          <div
            ref={heroRef}
            onMouseMove={onHeroMouseMove}
            onMouseLeave={onHeroMouseLeave}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1024 / 478",
              overflow: "hidden",
              lineHeight: 0,
              cursor: "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src="/maia-rooms.jpg"
              alt="two cozy rooms at night"
              animate={{ x: parallax.x, y: parallax.y }}
              transition={{ type: "spring", stiffness: 90, damping: 22 }}
              style={{ width: "calc(100% + 20px)", marginLeft: "-10px", display: "block", marginTop: "-16.5%" }}
            />

            {/* Hover glow — Chase's room (left) */}
            <motion.div
              animate={{ opacity: hoverSide === "left" ? 1 : 0 }}
              transition={{ duration: 0.45 }}
              style={{ position:"absolute", left:0, top:0, width:"50%", height:"100%",
                background:"linear-gradient(to right, rgba(190,148,80,0.22) 0%, transparent 100%)",
                pointerEvents:"none", zIndex:4 }}
            />
            {/* Hover glow — Maia's room (right) */}
            <motion.div
              animate={{ opacity: hoverSide === "right" ? 1 : 0 }}
              transition={{ duration: 0.45 }}
              style={{ position:"absolute", right:0, top:0, width:"50%", height:"100%",
                background:"linear-gradient(to left, rgba(200,130,130,0.22) 0%, transparent 100%)",
                pointerEvents:"none", zIndex:4 }}
            />

            {/* Left bubble — floats above Chase's phone */}
            <div style={{ position:"absolute", left:"5%", top:"48%", zIndex:10 }}>
              <Bubble text={leftText} typing={leftTyping} side="left" time={leftTime}/>
            </div>

            {/* Right bubble — floats above Maia's phone */}
            <div style={{ position:"absolute", right:"5%", top:"48%", zIndex:10, display:"flex", justifyContent:"flex-end" }}>
              <Bubble text={rightText} typing={rightTyping} side="right" time={rightTime}/>
            </div>
          </div>


          {/* ── FOOTER ── */}
          <div className="maia-footer" style={{
            padding: "18px 24px 26px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            borderTop: "1.5px solid rgba(42,33,28,0.08)",
          }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
              <ArtSeedling size={32}/>
              <GardenNote/>
              <ArtStar size={11}/>
            </div>

            <div style={{ fontSize:12, color:"#9a8070", letterSpacing:"0.04em", textAlign:"center",
              flexGrow:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              fontFamily:"'Caveat', cursive" }}>
              {footerHint}
              <ArtHeart size={12}/>
            </div>

            <div className="maia-footer-right" style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
              <ArtStar size={11}/>
              <ChickenButton size={52}/>
              <MapleButton size={46}/>
              <RainButton raining={raining} onToggle={toggleRain}/>
              <SpeakerButton playing={playing} onToggle={toggleAudio}/>
            </div>
          </div>

        </motion.div>
      </div>
    </>
  );
}
