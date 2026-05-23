"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  from: "you" | "maia";
  text: string;
  time: string;
}

// ─── Conversations ────────────────────────────────────────────────────────────

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
    { from: "maia", text: "she's very happy",              time: "8:46 PM" },
    { from: "you",  text: "obviously",                    time: "8:46 PM" },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Backgrounds ─────────────────────────────────────────────────────────────

const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E")`;
const DOT_BG    = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='0.85' fill='rgba(42%2C33%2C28%2C0.13)'/%3E%3C/svg%3E")`;

// ─── Static config ────────────────────────────────────────────────────────────

const SNOWFLAKES = Array.from({ length: 40 }, (_, i) => ({
  left:     (i * 2.63 + 0.8)  % 100,
  size:     3 + (i % 4),
  duration: 5 + (i % 5),
  delay:   -(i * 0.7 % 9),
  opacity:  0.25 + (i % 4) * 0.14,
  sway:     i % 2 === 0 ? "snowA" : "snowB",
}));

const BG_LEAVES = Array.from({ length: 10 }, (_, i) => ({
  top:      6 + i * 9,
  size:     16 + (i % 3) * 8,
  duration: 20 + (i % 4) * 6,
  delay:   -(i * 4.2),
}));

const MAIA_TOASTS = [
  "thinking of you ♡",
  "hi ♡",
  "miss you a little",
  "sending hugs",
  "u okay? ♡",
  "just wanted to say hi",
  "♡♡♡",
  "still thinking about the chickens",
  "you're my favorite ♡",
  "can't sleep again",
  "i made toast",
  "♡",
  "you should be here",
  "the plants say hi",
  "counting down ♡",
  "are u awake",
];

const TITLE_SECRETS = [
  "♡ made for the long distance",
  "she's your person ♡",
  "working on it ♡",
  "♡ worth every mile",
  "soon ♡",
  "♡ you're hers",
  "from here to there ♡",
];

const GARDEN_ITEMS = [
  "tomatoes (the big ones)",
  "sunflowers obviously",
  "something for the chickens",
  "herbs. idk which ones. all of them",
  "a bench to sit on together",
  "maybe a little path",
  "no people allowed sign",
];

// ─── Widget helpers ───────────────────────────────────────────────────────────

function timeAgo(ts: number | null): string {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)     return "just now";
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function pickFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function getMaiaResponse(q: string): string {
  const t = q.toLowerCase();
  if (/do you love|you love me|love you/.test(t))    return pickFrom(["obviously ♡", "you know i do", "always", "more than you know ♡"]);
  if (/miss me|do you miss/.test(t))                 return pickFrom(["all the time", "terribly honestly", "more than i say ♡", "yes"]);
  if (/you ok|are you ok|u ok|you okay/.test(t))     return pickFrom(["yeah i'm fine", "tired but okay ♡", "pretty good actually", "mhm"]);
  if (/sleep|tired|bed/.test(t))                     return pickFrom(["probably should", "in a bit", "stop asking lol ♡", "soon"]);
  if (/chicken|coop/.test(t))                        return pickFrom(["obviously yes ♡", "top priority", "it's happening", "very important"]);
  if (/garden|plant|grow/.test(t))                   return pickFrom(["yes always ♡", "working on the list", "eventually ♡", "obviously"]);
  if (/cold|canada|winter|snow/.test(t))             return pickFrom(["it's so cold", "freezing actually", "come warm it up ♡", "yes very cold"]);
  if (/when|soon|how long/.test(t))                  return pickFrom(["working on it ♡", "not soon enough", "soon ♡", "eventually"]);
  if (/think about|thinking about|think of/.test(t)) return pickFrom(["constantly", "always ♡", "more than sometimes", "obviously"]);
  if (/happy|good|great/.test(t))                    return pickFrom(["yes ♡", "when i talk to you", "getting there ♡", "mostly yeah"]);
  if (/why|how come/.test(t))                        return pickFrom(["idk it just is ♡", "because", "long story", "no reason"]);
  if (q.trim().length <= 3)                          return pickFrom(["♡", "yes", "hi", "maybe", "obviously"]);
  return pickFrom([
    "probably yes ♡", "idk maybe", "yes obviously", "ask me later", "yeah",
    "honestly yes ♡", "maybe", "probably", "shut up yes ♡", "♡", "always",
    "lol yes", "depends", "mhm ♡", "not really but ♡", "obviously",
  ]);
}

const DEFAULT_BUCKET = [
  "make breakfast together",
  "go on a walk",
  "watch something at midnight",
  "get plants for the garden",
  "just be in the same room",
  "sleep in",
  "cook something new",
  "sit outside and do nothing",
];

// ─── Widget: Memory Jar ───────────────────────────────────────────────────────

function MemoryJarWidget() {
  const LS = "maia-memories";
  const [memories, setMemories] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  function save(m: string[]) {
    setMemories(m);
    try { localStorage.setItem(LS, JSON.stringify(m)); } catch {}
  }
  function add() {
    const t = input.trim(); if (!t) return;
    save([...memories, t]); setInput("");
  }
  function shake() {
    if (!memories.length) return;
    const i = rand(0, memories.length - 1);
    setHighlighted(i);
    setTimeout(() => setHighlighted(null), 2200);
  }

  return (
    <div style={{ padding: "16px 20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", fontFamily: "'Caveat', cursive" }}>
          🫙 memory jar
        </span>
        <span style={{ fontSize: 11, color: "#9a8070", fontFamily: "'Caveat', cursive" }}>
          {memories.length} inside
        </span>
        {memories.length > 0 && (
          <motion.button onClick={shake} whileTap={{ rotate: [0, -15, 15, -8, 8, 0] }} transition={{ duration: 0.5 }}
            style={{ marginLeft: "auto", background: "rgba(200,143,136,0.25)", border: "1px solid rgba(42,33,28,0.12)", borderRadius: 8, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontFamily: "'Caveat', cursive", color: "#2a1c14" }}>
            shake ♡
          </motion.button>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="drop a memory in..." maxLength={100}
          className="maia-draft-input"
          style={{ flex: 1, background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(42,33,28,0.14)", borderRadius: 18, padding: "7px 14px", fontFamily: "'Caveat', cursive", fontSize: 14, color: "#2a1c14" }}
        />
        <motion.button onClick={add} whileTap={{ scale: 0.85 }}
          style={{ background: "rgba(200,143,136,0.55)", border: "1px solid rgba(42,33,28,0.1)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ArtHeart size={13} />
        </motion.button>
      </div>

      {memories.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(42,28,20,0.35)", fontSize: 13, padding: "10px 0", fontFamily: "'Caveat', cursive" }}>
          the jar is empty — add your first memory ♡
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
          {memories.map((m, i) => (
            <motion.div key={i}
              animate={highlighted === i ? { scale: [1, 1.04, 1], backgroundColor: ["rgba(238,222,196,0.5)", "rgba(200,143,136,0.4)", "rgba(238,222,196,0.5)"] } : {}}
              transition={{ duration: 0.7 }}
              style={{
                background: "rgba(238,222,196,0.5)", border: "1px solid rgba(42,33,28,0.09)",
                borderRadius: "4px 12px 12px 12px", padding: "7px 10px 7px 12px",
                fontSize: 13, color: "#2a1c14", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                transform: `rotate(${((i * 1.4 + 0.3) % 3) - 1.2}deg)`, fontFamily: "'Caveat', cursive",
                boxShadow: highlighted === i ? "0 2px 12px rgba(200,100,100,0.2)" : "none",
              }}>
              <span style={{ flex: 1 }}>{m}</span>
              <button onClick={() => save(memories.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(42,28,20,0.3)", fontSize: 11, padding: "0 2px", lineHeight: 1 }}>
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Widget: Thinking of you ──────────────────────────────────────────────────

function ThinkingOfYouWidget() {
  const LS = "maia-thinking-ts";
  const [lastTs, setLastTs] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const s = localStorage.getItem(LS); return s ? Number(s) : null;
  });
  const [justPressed, setJustPressed] = useState(false);
  const [displayAgo, setDisplayAgo] = useState(() => timeAgo(typeof window !== "undefined" ? Number(localStorage.getItem("maia-thinking-ts") || "0") || null : null));

  // update "X ago" every minute
  useEffect(() => {
    const t = setInterval(() => setDisplayAgo(timeAgo(lastTs)), 30000);
    return () => clearInterval(t);
  }, [lastTs]);

  function press() {
    const now = Date.now();
    setLastTs(now); setDisplayAgo(timeAgo(now));
    setJustPressed(true);
    try { localStorage.setItem(LS, String(now)); } catch {}
    setTimeout(() => setJustPressed(false), 2200);
  }

  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 13, color: "rgba(42,28,20,0.5)", fontFamily: "'Caveat', cursive", textAlign: "center" }}>
        press when you&#39;re thinking of her
      </div>
      <motion.button onClick={press} whileTap={{ scale: 0.88 }}
        animate={justPressed ? { scale: [1, 1.35, 1.1, 1.18, 1] } : {}}
        transition={{ duration: 0.55 }}
        style={{
          background: justPressed ? "rgba(200,80,80,0.65)" : "rgba(200,143,136,0.38)",
          border: "2px solid rgba(42,33,28,0.13)", borderRadius: "50%",
          width: 76, height: 76, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.3s, box-shadow 0.3s",
          boxShadow: justPressed ? "0 0 24px rgba(200,80,80,0.28)" : "0 2px 8px rgba(0,0,0,0.08)",
        }}>
        <ArtHeart size={36} pulse={!justPressed} />
      </motion.button>
      <AnimatePresence mode="wait">
        {justPressed ? (
          <motion.div key="sent"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 14, color: "#9a5a52", fontFamily: "'Caveat', cursive", letterSpacing: "0.02em" }}>
            ♡ sent to maia
          </motion.div>
        ) : lastTs ? (
          <motion.div key="ago" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 12, color: "rgba(42,28,20,0.4)", fontFamily: "'Caveat', cursive", textAlign: "center" }}>
            last pressed: {displayAgo}
          </motion.div>
        ) : (
          <motion.div key="never" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 12, color: "rgba(42,28,20,0.3)", fontFamily: "'Caveat', cursive" }}>
            you haven&#39;t pressed yet ♡
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Widget: Ask Maia ─────────────────────────────────────────────────────────

function AskMaiaWidget() {
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [history,  setHistory]  = useState<{ q: string; a: string }[]>([]);

  function ask() {
    const q = question.trim(); if (!q) return;
    setAnswer(null); setIsTyping(true); setQuestion("");
    const delay = 900 + Math.random() * 900;
    setTimeout(() => {
      const a = getMaiaResponse(q);
      setIsTyping(false); setAnswer(a);
      setHistory(prev => [...prev.slice(-4), { q, a }]);
    }, delay);
  }

  return (
    <div style={{ padding: "16px 20px 20px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", marginBottom: 12, fontFamily: "'Caveat', cursive" }}>
        ✦ ask maia anything
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto" }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 12, color: "rgba(42,28,20,0.45)", fontFamily: "'Caveat', cursive", textAlign: "left", paddingLeft: 4 }}>
                {h.q}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "rgba(200,143,136,0.55)", borderRadius: "15px 3px 15px 13px", padding: "6px 12px", fontSize: 13, fontFamily: "'Caveat', cursive", color: "#2a1c14", maxWidth: 220 }}>
                  {h.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="do you miss me?" maxLength={80}
          className="maia-draft-input"
          style={{ flex: 1, background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(42,33,28,0.14)", borderRadius: 18, padding: "7px 14px", fontFamily: "'Caveat', cursive", fontSize: 14, color: "#2a1c14" }}
        />
        <motion.button onClick={ask} whileTap={{ scale: 0.85 }} disabled={!question.trim()}
          style={{ background: question.trim() ? "rgba(200,143,136,0.6)" : "rgba(200,143,136,0.2)", border: "1px solid rgba(42,33,28,0.1)", borderRadius: "50%", width: 32, height: 32, cursor: question.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="#3a2a1e" strokeWidth="2" strokeLinecap="round">
            <path d="M2,8 L14,8 M9,3 L14,8 L9,13"/>
          </svg>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isTyping && (
          <motion.div key="typing" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "rgba(200,143,136,0.6)", borderRadius: "15px 3px 15px 13px", padding: "8px 14px" }}>
              <TypingDots isMaia />
            </div>
          </motion.div>
        )}
        {answer && !isTyping && (
          <motion.div key={answer} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "rgba(200,143,136,0.6)", borderRadius: "15px 3px 15px 13px", padding: "9px 14px", fontSize: 14, fontFamily: "'Caveat', cursive", color: "#2a1c14", maxWidth: 240 }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Widget: Timezone clocks ──────────────────────────────────────────────────

const CA_ZONES  = ["America/Toronto", "America/Winnipeg", "America/Edmonton", "America/Vancouver"];
const CA_LABELS = ["Ontario", "Manitoba", "Alberta", "BC"];

function TimezoneWidget() {
  const [tzIdx, setTzIdx] = useState(3); // default: Vancouver (BC)
  const [now,   setNow]   = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const browserTz = "America/Chicago"; // Chase — Central Time
  const maTz      = CA_ZONES[tzIdx];

  function fmt(tz: string, opts: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(now);
  }

  // approximate hour diff
  const hourDiff = (() => {
    try {
      const cH = new Date(now.toLocaleString("en-US", { timeZone: browserTz })).getHours();
      const mH = new Date(now.toLocaleString("en-US", { timeZone: maTz })).getHours();
      let d = mH - cH; if (d > 12) d -= 24; if (d < -12) d += 24;
      return d;
    } catch { return null; }
  })();

  const ClockFace = ({ tz, label, color }: { tz: string; label: string; color: string }) => (
    <div style={{ textAlign: "center", flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 11, color: "#9a8070", marginBottom: 6, fontFamily: "'Caveat', cursive" }}>{label}</div>
      <div style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {fmt(tz, { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
      </div>
      <div style={{ fontSize: 11, color: "rgba(42,28,20,0.38)", marginTop: 5, fontFamily: "'Caveat', cursive" }}>
        {fmt(tz, { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "16px 20px 22px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", marginBottom: 18, fontFamily: "'Caveat', cursive" }}>
        🕐 right now
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <ClockFace tz={browserTz} label="chase" color="#2a1c14" />
        <div style={{ fontSize: 18, color: "rgba(42,28,20,0.18)", flexShrink: 0 }}>♡</div>
        <ClockFace tz={maTz} label="maia" color="#9a5a52" />
      </div>
      <div style={{ textAlign: "center", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {hourDiff !== null && (
          <span style={{ fontSize: 11, color: "rgba(42,28,20,0.38)", fontFamily: "'Caveat', cursive" }}>
            {hourDiff === 0 ? "same hour ♡" : hourDiff > 0 ? `maia is ${Math.abs(hourDiff)}h ahead` : `maia is ${Math.abs(hourDiff)}h behind`}
          </span>
        )}
        <button onClick={() => setTzIdx(i => (i + 1) % CA_ZONES.length)}
          style={{ background: "rgba(200,143,136,0.2)", border: "1px solid rgba(42,33,28,0.12)", borderRadius: 8, padding: "2px 8px", fontSize: 10, cursor: "pointer", fontFamily: "'Caveat', cursive", color: "rgba(42,28,20,0.5)" }}>
          {CA_LABELS[tzIdx]} ↻
        </button>
      </div>
    </div>
  );
}

// ─── Widget: Bucket list ──────────────────────────────────────────────────────

function BucketListWidget() {
  const LS = "maia-bucket";
  const [items, setItems] = useState<{ text: string; done: boolean }[]>(() => {
    if (typeof window === "undefined") return DEFAULT_BUCKET.map(t => ({ text: t, done: false }));
    try {
      const s = localStorage.getItem(LS);
      return s ? JSON.parse(s) : DEFAULT_BUCKET.map(t => ({ text: t, done: false }));
    } catch { return DEFAULT_BUCKET.map(t => ({ text: t, done: false })); }
  });
  const [input, setInput] = useState("");

  function save(arr: typeof items) { setItems(arr); try { localStorage.setItem(LS, JSON.stringify(arr)); } catch {} }
  function toggle(i: number) { save(items.map((x, j) => j === i ? { ...x, done: !x.done } : x)); }
  function add() { const t = input.trim(); if (!t) return; save([...items, { text: t, done: false }]); setInput(""); }

  const done = items.filter(x => x.done).length;

  return (
    <div style={{ padding: "16px 20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", fontFamily: "'Caveat', cursive" }}>
          ☑ when i get there
        </span>
        <span style={{ fontSize: 11, color: "#9a8070", fontFamily: "'Caveat', cursive" }}>
          {done} / {items.length}
        </span>
        {done > 0 && done === items.length && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 13 }}>🎉</motion.span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 190, overflowY: "auto", marginBottom: 12 }}>
        {items.map((item, i) => (
          <motion.div key={i} onClick={() => toggle(i)} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <motion.div
              animate={{ background: item.done ? "rgba(200,143,136,0.7)" : "transparent" }}
              transition={{ duration: 0.2 }}
              style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(42,33,28,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 9, color: "#fff" }}>✓</motion.span>}
            </motion.div>
            <span style={{
              fontSize: 13, color: item.done ? "rgba(42,28,20,0.38)" : "#2a1c14",
              textDecoration: item.done ? "line-through" : "none",
              transition: "all 0.2s", fontFamily: "'Caveat', cursive",
            }}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="add something..." maxLength={60}
          className="maia-draft-input"
          style={{ flex: 1, background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(42,33,28,0.14)", borderRadius: 18, padding: "6px 14px", fontFamily: "'Caveat', cursive", fontSize: 14, color: "#2a1c14" }}
        />
        <motion.button onClick={add} whileTap={{ scale: 0.85 }}
          style={{ background: "rgba(200,143,136,0.45)", border: "1px solid rgba(42,33,28,0.1)", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, color: "#2a1c14", lineHeight: 1 }}>
          +
        </motion.button>
      </div>
    </div>
  );
}

// ─── Widget: Vibe presets ─────────────────────────────────────────────────────

interface VibeProps {
  candleLit: boolean; setCandleLit: (v: boolean) => void;
  raining:   boolean; toggleRain:   () => void;
  snowing:   boolean; setSnowing:   (v: boolean) => void;
  playing:   boolean; toggleAudio:  () => void;
}

function VibePresetsWidget({ candleLit, setCandleLit, raining, toggleRain, snowing, setSnowing, playing, toggleAudio }: VibeProps) {
  function applyVibe(preset: string) {
    const want = {
      cozy:   { candle: true,  rain: false, snow: false, music: true  },
      rainy:  { candle: true,  rain: true,  snow: false, music: true  },
      quiet:  { candle: true,  rain: false, snow: false, music: false },
      winter: { candle: true,  rain: false, snow: true,  music: true  },
      clear:  { candle: false, rain: false, snow: false, music: false },
    }[preset];
    if (!want) return;
    if (want.candle !== candleLit)  setCandleLit(want.candle);
    if (want.snow   !== snowing)    setSnowing(want.snow);
    if (want.rain   !== raining)    toggleRain();
    if (want.music  !== playing)    toggleAudio();
  }

  const PRESETS = [
    { id: "cozy",   emoji: "🕯️", label: "cozy night",        sub: "candle + lo-fi" },
    { id: "rainy",  emoji: "🌧️", label: "rainy night",       sub: "candle + rain + lo-fi" },
    { id: "quiet",  emoji: "🌙", label: "quiet",             sub: "just the candle" },
    { id: "winter", emoji: "❄️", label: "winter in canada",  sub: "candle + snow + lo-fi" },
    { id: "clear",  emoji: "◦",  label: "clear everything",  sub: "turn it all off" },
  ];

  return (
    <div style={{ padding: "16px 20px 22px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", marginBottom: 14, fontFamily: "'Caveat', cursive" }}>
        ✨ set the vibe
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {PRESETS.map(p => (
          <motion.button key={p.id} onClick={() => applyVibe(p.id)}
            whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.03, y: -1 }}
            style={{ background: "rgba(238,222,196,0.55)", border: "1.5px solid rgba(42,33,28,0.13)", borderRadius: 10, padding: "9px 14px", cursor: "pointer", textAlign: "left", transition: "box-shadow 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2a1c14", fontFamily: "'Caveat', cursive" }}>
              {p.emoji} {p.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(42,28,20,0.45)", fontFamily: "'Caveat', cursive", marginTop: 1 }}>{p.sub}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Art components ───────────────────────────────────────────────────────────

function ArtHeart({ size = 22, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/maia-heart.png" alt="" aria-hidden width={size} height={size}
      style={{ display: "inline-block", objectFit: "contain",
        animation: pulse ? "heartBeat 2.8s ease-in-out infinite" : undefined }}
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
      <path d="M14,30 L14,19 Q14,16 14,13"/>
      <path d="M14,25 Q7,21 6,14 Q12,16 14,24"/>
      <path d="M14,25 Q10,21 9,16"/>
      <path d="M14,20 Q21,16 22,9 Q16,12 14,19"/>
      <path d="M14,20 Q18,16 19,12"/>
      <path d="M14,13 Q13,8 14,5 Q16,9 14,12"/>
    </svg>
  );
}

function ArtSeedling({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 32" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5,28 Q14,30 23,28"/>
      <line x1="14" y1="28" x2="14" y2="17"/>
      <path d="M14,23 Q7,19 6,11 Q12,14 14,22"/>
      <path d="M14,23 Q10,19 9,14"/>
      <path d="M14,19 Q21,15 22,7 Q16,11 14,18"/>
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

// ─── Bubble ───────────────────────────────────────────────────────────────────

function Bubble({ text, typing, side, time, accent }: {
  text: string | null; typing: boolean; side: "left" | "right"; time?: string; accent?: boolean;
}) {
  const isMaia = side === "right";
  const show = typing || text !== null;
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
          <div style={{
            maxWidth: "min(190px, 38vw)",
            padding: typing ? "10px 14px" : "9px 14px 10px",
            background: accent
              ? "rgba(240,200,120,0.88)"
              : isMaia
                ? "rgba(200,143,136,0.70)"
                : "rgba(238,222,196,0.74)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1.5px solid rgba(42,33,28,${isMaia ? "0.13" : "0.11"})`,
            borderRadius: isMaia ? "17px 4px 18px 15px" : "4px 18px 15px 17px",
            boxShadow: "2px 3px 12px rgba(0,0,0,0.15)",
            fontFamily: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive",
            fontSize: "clamp(13px, 3vw, 15px)",
            lineHeight: 1.4,
            color: "#2a1c14",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            transform: `rotate(${rot}deg)`,
            position: "relative",
          }}>
            {typing ? <TypingDots isMaia={isMaia} /> : text}
            <span style={{
              position: "absolute", bottom: -8,
              [isMaia ? "right" : "left"]: 13,
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `8px solid ${accent ? "rgba(240,200,120,0.88)" : isMaia ? "rgba(200,143,136,0.70)" : "rgba(238,222,196,0.74)"}`,
            }} />
          </div>
          {!typing && text && time && (
            <div style={{
              fontSize: "clamp(9px, 1.6vw, 10px)", color: "rgba(42,28,20,0.32)",
              marginTop: 4, textAlign: isMaia ? "right" : "left",
              fontFamily: "'Caveat', cursive", letterSpacing: "0.03em",
              paddingLeft: isMaia ? 0 : 4, paddingRight: isMaia ? 4 : 0,
            }}>{time}</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Sparkle burst ────────────────────────────────────────────────────────────

function SparkleBurst({ id, onDone }: { id: number; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 700);
    return () => clearTimeout(t);
  }, [id, onDone]);
  const particles = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2;
    const dist = rand(18, 34);
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, size: rand(3, 6) };
  });
  return (
    <>
      {particles.map((p, i) => (
        <motion.div key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ position: "absolute", top: "50%", left: "50%",
            width: p.size, height: p.size, borderRadius: "50%",
            background: i % 2 === 0 ? "#c8855a" : "#d4a060",
            marginLeft: -p.size / 2, marginTop: -p.size / 2,
            pointerEvents: "none" }}
        />
      ))}
    </>
  );
}

function StarButton({ size = 11 }: { size?: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  const idRef = useRef(0);
  const removeBurst = useCallback((id: number) => setBursts(prev => prev.filter(b => b !== id)), []);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <motion.button
        onClick={() => { const id = ++idRef.current; setBursts(prev => [...prev, id]); }}
        whileTap={{ scale: 0.7, rotate: 45 }}
        transition={{ duration: 0.15 }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
        aria-label="star">
        <ArtStar size={size} />
      </motion.button>
      {bursts.map(id => <SparkleBurst key={id} id={id} onDone={removeBurst} />)}
    </div>
  );
}

// ─── Secret heart confetti burst ─────────────────────────────────────────────

function SecretHeartBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hearts = useMemo(() => Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist  = 80 + Math.random() * 200;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, size: rand(14, 30), delay: Math.random() * 0.15 };
  }), []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      {hearts.map((h, i) => (
        <motion.div key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.2 }}
          animate={{ opacity: 0, x: h.dx, y: h.dy, scale: 1.3 }}
          transition={{ duration: 1.6, delay: h.delay, ease: "easeOut" }}
          style={{ position: "absolute" }}>
          <ArtHeart size={h.size} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Chicken with egg easter egg ──────────────────────────────────────────────

function ChickenButton({ size = 32 }: { size?: number }) {
  const [anim, setAnim] = useState<"idle" | "hop" | "peck">("idle");
  const [eggState, setEggState] = useState<"none" | "wobble" | "crack" | "chick">("none");
  const timerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clickCountRef  = useRef(0);
  const clickTimerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const eggTimersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function scheduleIdle() {
      timerRef.current = setTimeout(() => {
        setAnim("peck");
        setTimeout(() => { setAnim("idle"); scheduleIdle(); }, 560);
      }, rand(8000, 16000));
    }
    scheduleIdle();
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(clickTimerRef.current);
      eggTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  function handleClick() {
    setAnim("hop"); setTimeout(() => setAnim("idle"), 360);
    clickCountRef.current++;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 1600);
    if (clickCountRef.current >= 5 && eggState === "none") {
      clickCountRef.current = 0;
      setEggState("wobble");
      const t1 = setTimeout(() => setEggState("crack"), 1400);
      const t2 = setTimeout(() => setEggState("chick"), 2000);
      const t3 = setTimeout(() => setEggState("none"),  3400);
      eggTimersRef.current = [t1, t2, t3];
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <motion.button onClick={handleClick}
        animate={
          anim === "hop"  ? { y: [0, -13, 0], rotate: 0 } :
          anim === "peck" ? { rotate: [0, 15, 0, 15, 0], y: [0, 2, 0, 2, 0] } :
          { y: 0, rotate: 0 }
        }
        transition={{ duration: anim === "peck" ? 0.52 : 0.34 }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
        aria-label="chicken (click 5× for a surprise)">
        <ArtChicken size={size} />
      </motion.button>
      <AnimatePresence>
        {eggState !== "none" && (
          <motion.div key="egg"
            initial={{ opacity: 0, y: -4, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4, y: 4 }}
            transition={{ duration: 0.3 }}
            style={{ position: "absolute", top: "100%", marginTop: 2 }}>
            {eggState === "chick" ? (
              <motion.div
                animate={{ rotate: [-10, 10, -10], y: [0, -3, 0] }}
                transition={{ duration: 0.4, repeat: 3 }}
                style={{ fontSize: 18, lineHeight: 1 }}>🐥</motion.div>
            ) : (
              <motion.svg width={18} height={22} viewBox="0 0 18 22"
                animate={eggState === "wobble" ? { rotate: [-8, 8, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.7 }}>
                <ellipse cx="9" cy="13" rx="7" ry="9" fill="rgba(252,244,220,0.9)" stroke="#c8a87a" strokeWidth="1.3"/>
                {eggState === "crack" && (
                  <path d="M9,4 L7,10 L10,12 L8,18" stroke="#c8a87a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                )}
              </motion.svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Maple button ─────────────────────────────────────────────────────────────

function MapleButton({ size = 30 }: { size?: number }) {
  const [spins, setSpins] = useState(0);
  return (
    <motion.button
      onClick={() => setSpins(s => s + 1)}
      animate={{ rotate: spins * 360 }}
      transition={{ duration: 0.44 }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
      aria-label="maple leaf">
      <ArtMapleLeaf size={size} />
    </motion.button>
  );
}

// ─── Garden note popup ────────────────────────────────────────────────────────

function GardenNote({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div style={{ position: "relative" }}>
      <motion.div whileHover={{ rotate: 3, scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        style={{ transform: "rotate(-4deg)", transformOrigin: "center", lineHeight: 0, cursor: "pointer" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/maia-note.png" alt="garden ideas" width={96} height={96}
          className="maia-note-img" style={{ display: "block", objectFit: "contain" }}
        />
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
              transform: "translateX(-50%)", width: 210,
              background: "#faf3e0", backgroundImage: `url('/maia-paper.png')`,
              backgroundSize: "cover", border: "1.5px solid rgba(42,33,28,0.18)",
              borderRadius: 10, boxShadow: "2px 6px 22px rgba(42,28,10,0.18)",
              padding: "14px 16px 16px", zIndex: 50, rotate: "-2deg",
              fontFamily: "'Caveat', cursive",
            }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2a1c14", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              garden ideas <ArtHeart size={13} pulse />
            </div>
            {GARDEN_ITEMS.map((item, i) => (
              <motion.div key={item}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.055 }}
                style={{ fontSize: 13, color: "#3a2a1e", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 5 }}>
                <span style={{ color: "#9a5a52", flexShrink: 0 }}>•</span>{item}
              </motion.div>
            ))}
            <div style={{ fontSize: 10, color: "rgba(42,28,20,0.35)", marginTop: 10, textAlign: "right" }}>(tap to close)</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Love letter ──────────────────────────────────────────────────────────────

const LETTER_LINES = [
  "hey you ♡",
  "",
  "i was going to say something",
  "important but then i forgot",
  "",
  "i think it was just —",
  "i miss you",
  "",
  "i think about the house",
  "we haven't found yet",
  "and the garden",
  "and the chickens",
  "and the plants",
  "",
  "mostly you",
  "",
  "okay that was it.",
  "",
  "— c ♡",
];

function LoveLetter({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(28,20,14,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }}
          />
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40, scale: 0.88, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201, width: "min(340px, 88vw)",
              background: "#fdf6e3",
              backgroundImage: `url('/maia-paper.png')`,
              backgroundSize: "cover",
              border: "1.5px solid rgba(42,33,28,0.2)",
              borderRadius: 12,
              boxShadow: "4px 8px 40px rgba(28,16,6,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
              padding: "28px 30px 30px",
              fontFamily: "'Caveat', cursive",
              cursor: "default",
            }}>
            {LETTER_LINES.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.04, duration: 0.3 }}
                style={{
                  fontSize: line === "" ? undefined : i === 0 ? 18 : i === LETTER_LINES.length - 1 ? 17 : 15,
                  fontWeight: (i === 0 || i === LETTER_LINES.length - 1) ? 600 : 400,
                  color: i === 0 ? "#9a3a3a" : "#2a1c14",
                  lineHeight: line === "" ? "0.7" : "1.55",
                  marginBottom: 0,
                  minHeight: line === "" ? "0.7em" : undefined,
                }}>
                {line}
              </motion.p>
            ))}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{
                position: "absolute", top: 10, right: 12,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 16, color: "rgba(42,28,20,0.35)", fontFamily: "'Caveat', cursive",
              }}>
              ✕
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ArtEnvelope({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 24" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="24" height="16" rx="2.5"/>
      <path d="M2,4 L14,13 L26,4"/>
      <path d="M2,20 L10,13"/>
      <path d="M26,20 L18,13"/>
    </svg>
  );
}

function EnvelopeButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      animate={{ y: hover ? -2 : 0, opacity: hover ? 1 : 0.65 }}
      transition={{ duration: 0.2 }}
      title="a letter ♡"
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block", position: "relative" }}
      aria-label="open love letter">
      <ArtEnvelope size={26} />
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, color: "#9a5a52", fontFamily: "'Caveat', cursive",
              whiteSpace: "nowrap", pointerEvents: "none",
            }}>
            a letter ♡
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Candle ───────────────────────────────────────────────────────────────────

function ArtCandle({ size = 26, lit = false }: { size?: number; lit?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 30" fill="none"
      stroke="#3a2a1e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8" y="16" width="8" height="12" rx="1.5" fill="rgba(252,240,200,0.6)"/>
      <path d="M8,16 Q12,14 16,16"/>
      <path d="M8,20 Q12,18 16,20" strokeOpacity="0.3"/>
      <line x1="12" y1="16" x2="12" y2="13"/>
      {lit ? (
        <motion.g
          animate={{ scaleY: [1, 1.22, 0.88, 1.15, 1], scaleX: [1, 0.82, 1.12, 0.9, 1], x: [0, 0.5, -0.5, 0.3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "12px 13px" }}>
          <ellipse cx="12" cy="9.5" rx="2.2" ry="3.5" fill="rgba(255,170,30,0.9)" stroke="rgba(255,120,0,0.5)" strokeWidth="0.5"/>
          <ellipse cx="12" cy="10.5" rx="1.1" ry="2"   fill="rgba(255,245,160,0.8)" stroke="none"/>
        </motion.g>
      ) : (
        <circle cx="12" cy="12" r="1.5" fill="rgba(80,50,30,0.4)" stroke="none"/>
      )}
    </svg>
  );
}

function CandleButton({ lit, onToggle }: { lit: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: lit ? 1 : 0.5 }}
      transition={{ duration: 0.25 }}
      title={lit ? "snuff candle" : "light candle"}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
      aria-label={lit ? "snuff candle" : "light candle"}>
      <ArtCandle size={26} lit={lit} />
    </motion.button>
  );
}

// ─── Snow toggle ──────────────────────────────────────────────────────────────

function ArtSnowflake({ size = 26, on = false }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      stroke="#3a2a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="14" y1="3" x2="14" y2="25"/>
      <line x1="3"  y1="14" x2="25" y2="14"/>
      <line x1="6"  y1="6"  x2="22" y2="22"/>
      <line x1="22" y1="6"  x2="6"  y2="22"/>
      <line x1="14" y1="3"  x2="11" y2="7"  strokeOpacity={on ? 1 : 0.3}/>
      <line x1="14" y1="3"  x2="17" y2="7"  strokeOpacity={on ? 1 : 0.3}/>
      <line x1="14" y1="25" x2="11" y2="21" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="14" y1="25" x2="17" y2="21" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="3"  y1="14" x2="7"  y2="11" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="3"  y1="14" x2="7"  y2="17" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="25" y1="14" x2="21" y2="11" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="25" y1="14" x2="21" y2="17" strokeOpacity={on ? 1 : 0.3}/>
    </svg>
  );
}

function SnowButton({ snowing, onToggle }: { snowing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: snowing ? 1 : 0.5, rotate: snowing ? 360 : 0 }}
      transition={{ duration: snowing ? 1.2 : 0.25 }}
      title={snowing ? "stop snow" : "it's cold in canada"}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0, display: "block" }}
      aria-label={snowing ? "stop snow" : "let it snow"}>
      <ArtSnowflake size={26} on={snowing} />
    </motion.button>
  );
}

// ─── Speaker / rain ───────────────────────────────────────────────────────────

function ArtSpeaker({ size = 26, on = false }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3,10 L3,18 L9,18 L15,23 L15,5 L9,10 Z"/>
      {on ? (<>
        <path d="M18,10.5 Q21,14 18,17.5"/>
        <path d="M21,7.5 Q25.5,14 21,20.5"/>
      </>) : (<>
        <line x1="19" y1="11" x2="25" y2="17"/>
        <line x1="25" y1="11" x2="19" y2="17"/>
      </>)}
    </svg>
  );
}

function SpeakerButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button onClick={onToggle} whileTap={{ scale: 0.85 }}
      animate={{ opacity: playing ? 1 : 0.55 }} transition={{ duration: 0.25 }}
      style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:0, display:"block" }}
      aria-label={playing ? "pause lo-fi" : "play lo-fi"}>
      <ArtSpeaker size={26} on={playing}/>
    </motion.button>
  );
}

function ArtRain({ size = 26, on = false }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      stroke="#3a2a1e" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6,15 Q4,15 4,12.5 Q4,10 7,10 Q7.5,7 10.5,7 Q12.5,7 13.5,8.5 Q14.5,7 16.5,7 Q19.5,7 19.5,10.5 Q21.5,10.5 21.5,13 Q21.5,15 19.5,15 Z"/>
      <line x1="9"    y1="18" x2="7.5"  y2="23" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="13.5" y1="18" x2="12"   y2="23" strokeOpacity={on ? 1 : 0.3}/>
      <line x1="18"   y1="18" x2="16.5" y2="23" strokeOpacity={on ? 1 : 0.3}/>
    </svg>
  );
}

function RainButton({ raining, onToggle }: { raining: boolean; onToggle: () => void }) {
  return (
    <motion.button onClick={onToggle} whileTap={{ scale: 0.85 }}
      animate={{ opacity: raining ? 1 : 0.55 }} transition={{ duration: 0.25 }}
      style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:0, display:"block" }}
      aria-label={raining ? "stop rain" : "add rain sounds"}>
      <ArtRain size={26} on={raining}/>
    </motion.button>
  );
}

// ─── Skip button ──────────────────────────────────────────────────────────────

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button onClick={onClick} whileHover={{ x: 3 }} whileTap={{ scale: 0.85 }}
      title="next conversation"
      style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 4px", lineHeight:0, display:"flex", alignItems:"center", gap:3, opacity:0.55 }}
      aria-label="skip to next conversation">
      <svg width={18} height={18} viewBox="0 0 20 20" fill="none"
        stroke="#3a2a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="5,5 12,10 5,15"/>
        <line x1="15" y1="5" x2="15" y2="15"/>
      </svg>
    </motion.button>
  );
}

// ─── Time-aware hint ──────────────────────────────────────────────────────────

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

// ─── PIN Gate ─────────────────────────────────────────────────────────────────

const UNLOCK_PIN = "78760";

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput]   = useState("");
  const [shake, setShake]   = useState(false);
  const [pulse, setPulse]   = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => setPulse(p => !p), 900);
    return () => clearInterval(t);
  }, []);

  function tryUnlock() {
    if (input === UNLOCK_PIN) {
      try { sessionStorage.setItem("maia-unlocked", "1"); } catch {}
      onUnlock();
    } else {
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 550);
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#120d07",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32,
      fontFamily: "'Caveat', cursive",
    }}>
      {/* Pulsing heart */}
      <motion.div
        animate={{ scale: pulse ? 1.18 : 1, opacity: pulse ? 1 : 0.65 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ fontSize: 52, lineHeight: 1, userSelect: "none", cursor: "default" }}
      >
        ♡
      </motion.div>

      <motion.p style={{
        color: "rgba(220,185,160,0.55)",
        fontSize: 15,
        letterSpacing: "0.12em",
        textTransform: "lowercase",
        margin: 0,
        userSelect: "none",
      }}>
        for you only
      </motion.p>

      {/* Input + button */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
      >
        <input
          ref={inputRef}
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
          maxLength={10}
          placeholder="••••••"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1.5px solid ${shake ? "rgba(180,80,70,0.7)" : "rgba(200,160,130,0.25)"}`,
            borderRadius: 12,
            padding: "12px 22px",
            fontSize: 22,
            color: "rgba(235,210,190,0.9)",
            outline: "none",
            textAlign: "center",
            letterSpacing: "0.25em",
            width: 180,
            transition: "border-color 0.2s",
            caretColor: "rgba(200,143,136,0.8)",
          }}
        />
        <motion.button
          whileHover={{ scale: 1.04, background: "rgba(200,143,136,0.22)" }}
          whileTap={{ scale: 0.97 }}
          onClick={tryUnlock}
          style={{
            background: "rgba(200,143,136,0.12)",
            border: "1.5px solid rgba(200,143,136,0.3)",
            borderRadius: 10,
            padding: "9px 32px",
            color: "rgba(235,210,190,0.85)",
            fontSize: 14,
            fontFamily: "'Caveat', cursive",
            letterSpacing: "0.08em",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          enter ♡
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MaiaPageContent() {
  const reduced = useReducedMotion() ?? false;

  // Conversation
  const [convoIdx,    setConvoIdx]    = useState(() => Math.floor(Math.random() * CONVOS.length));
  const [leftText,    setLeftText]    = useState<string | null>(null);
  const [rightText,   setRightText]   = useState<string | null>(null);
  const [leftTyping,  setLeftTyping]  = useState(false);
  const [rightTyping, setRightTyping] = useState(false);
  const [leftTime,    setLeftTime]    = useState<string | undefined>();
  const [rightTime,   setRightTime]   = useState<string | undefined>();
  const stopRef  = useRef(false);
  const heroRef  = useRef<HTMLDivElement>(null);

  // Audio
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const fadeRef     = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const rainCtxRef  = useRef<AudioContext | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const rainFadeRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [raining, setRaining] = useState(false);
  const plinkCtxRef = useRef<AudioContext | null>(null);

  // Parallax + hover
  const [parallax,  setParallax]  = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  // Hero click hearts
  const [heroHearts, setHeroHearts] = useState<{ id: number; x: number; y: number; rot: number; sz: number }[]>([]);
  const heartIdRef = useRef(0);

  // Cursor trail hearts
  const [trailHearts, setTrailHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const trailIdRef    = useRef(0);
  const lastTrailRef  = useRef(0);

  // Header heart
  const [heartPop,   setHeartPop]   = useState(false);
  const [heartCount, setHeartCount] = useState(0);

  // Garden note popup
  const [noteOpen, setNoteOpen] = useState(false);

  // Custom message
  const [draftMsg,      setDraftMsg]      = useState("");
  const [customBubbles, setCustomBubbles] = useState<{ id: number; text: string }[]>([]);
  const customIdRef = useRef(0);

  // NEW: snow
  const [snowing, setSnowing] = useState(false);

  // NEW: candle
  const [candleLit, setCandleLit] = useState(false);

  // NEW: love letter
  const [letterOpen, setLetterOpen] = useState(false);

  // NEW: Maia toasts
  const [maiaToasts, setMaiaToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastIdRef = useRef(0);

  // NEW: secret keyboard burst
  const [secretBurst, setSecretBurst] = useState(false);

  // NEW: title double-click secret
  const [titleSecret, setTitleSecret] = useState<string | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Widget panel
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  // Time hint
  const [footerHint] = useState(getFooterHint);

  // ── Audio: lo-fi ─────────────────────────────────────────────────────────

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
        if (audio.volume > 0.04) { audio.volume = Math.max(0, audio.volume - 0.04); }
        else { audio.volume = 0; audio.pause(); clearInterval(fadeRef.current); }
      }, 40);
      setPlaying(false);
    } else {
      audio.volume = 0;
      audio.play()
        .then(() => {
          setPlaying(true);
          fadeRef.current = setInterval(() => {
            if (audio.volume < 0.38) { audio.volume = Math.min(0.4, audio.volume + 0.03); }
            else { audio.volume = 0.4; clearInterval(fadeRef.current); }
          }, 40);
        })
        .catch(() => { audio.volume = 0.4; setPlaying(true); });
    }
  }, [playing]);

  // ── Audio: rain ──────────────────────────────────────────────────────────

  const toggleRain = useCallback(() => {
    if (!rainCtxRef.current) {
      const ctx = new AudioContext();
      rainCtxRef.current = ctx;
      const len = ctx.sampleRate * 3;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
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
        if (g.gain.value > 0.005) g.gain.value = Math.max(0, g.gain.value - 0.006);
        else { g.gain.value = 0; clearInterval(rainFadeRef.current); }
      }, 40);
      setRaining(false);
    } else {
      g.gain.value = 0; setRaining(true);
      rainFadeRef.current = setInterval(() => {
        if (g.gain.value < 0.07) g.gain.value = Math.min(0.08, g.gain.value + 0.004);
        else { g.gain.value = 0.08; clearInterval(rainFadeRef.current); }
      }, 40);
    }
  }, [raining]);

  // ── Hero mouse: parallax + hover side + cursor trail ─────────────────────

  const onHeroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverSide(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
    if (!reduced) {
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / rect.width;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / rect.height;
      setParallax({ x: dx * -10, y: dy * -6 });
    }
    // cursor trail (throttled)
    const now = Date.now();
    if (now - lastTrailRef.current > 140) {
      lastTrailRef.current = now;
      const id = ++trailIdRef.current;
      const x  = ((e.clientX - rect.left) / rect.width)  * 100;
      const y  = ((e.clientY - rect.top)  / rect.height) * 100;
      setTrailHearts(prev => [...prev.slice(-14), { id, x, y }]);
      setTimeout(() => setTrailHearts(prev => prev.filter(h => h.id !== id)), 750);
    }
  }, [reduced]);

  const onHeroMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
    setHoverSide(null);
  }, []);

  // ── Hero click → heart burst ─────────────────────────────────────────────

  const onHeroClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    try {
      if (!plinkCtxRef.current) plinkCtxRef.current = new AudioContext();
      const ctx = plinkCtxRef.current;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.22);
    } catch {}
    const count = rand(2, 3);
    const newHearts = Array.from({ length: count }, () => {
      const id  = ++heartIdRef.current;
      const x   = ((e.clientX - rect.left) / rect.width)  * 100 + (Math.random() - 0.5) * 6;
      const y   = ((e.clientY - rect.top)  / rect.height) * 100 + (Math.random() - 0.5) * 4;
      const rot = (Math.random() - 0.5) * 40;
      const sz  = rand(16, 26);
      return { id, x, y, rot, sz };
    });
    setHeroHearts(prev => [...prev, ...newHearts]);
    const ids = newHearts.map(h => h.id);
    setTimeout(() => setHeroHearts(prev => prev.filter(h => !ids.includes(h.id))), 1100);
  }, []);

  // ── Skip convo ───────────────────────────────────────────────────────────

  const skipConvo = useCallback(() => {
    setConvoIdx(prev => (prev + rand(1, CONVOS.length - 1)) % CONVOS.length);
  }, []);

  // ── Custom message ────────────────────────────────────────────────────────

  const sendCustom = useCallback(() => {
    const text = draftMsg.trim();
    if (!text) return;
    const id = ++customIdRef.current;
    setCustomBubbles(prev => [...prev, { id, text }]);
    setDraftMsg("");
    setTimeout(() => setCustomBubbles(prev => prev.filter(b => b.id !== id)), 4500);
  }, [draftMsg]);

  // ── Title double-click ────────────────────────────────────────────────────

  const onTitleDblClick = useCallback(() => {
    clearTimeout(titleTimerRef.current);
    setTitleSecret(TITLE_SECRETS[rand(0, TITLE_SECRETS.length - 1)]);
    titleTimerRef.current = setTimeout(() => setTitleSecret(null), 2600);
  }, []);

  // ── Maia random toasts ────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;
    function schedule() {
      const delay = rand(42000, 85000);
      const timer = setTimeout(() => {
        if (!mounted) return;
        const msg = MAIA_TOASTS[rand(0, MAIA_TOASTS.length - 1)];
        const id = ++toastIdRef.current;
        setMaiaToasts(prev => [...prev, { id, msg }]);
        setTimeout(() => {
          if (!mounted) return;
          setMaiaToasts(prev => prev.filter(t => t.id !== id));
          schedule();
        }, 3800);
      }, delay);
      return timer;
    }
    let t = schedule();
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  // ── Secret keyboard: type "maia" ─────────────────────────────────────────

  useEffect(() => {
    let typed = "";
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-4);
        if (typed === "maia") {
          typed = "";
          setSecretBurst(true);
          setTimeout(() => setSecretBurst(false), 2400);
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Favicon ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    const link: HTMLLinkElement = existing ?? document.createElement("link");
    const prev = link.href;
    link.rel = "icon"; link.href = "/maia-heart.png";
    if (!existing) document.head.appendChild(link);
    return () => { link.href = prev; };
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearInterval(fadeRef.current);
      clearInterval(rainFadeRef.current);
      clearTimeout(titleTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (rainCtxRef.current) rainCtxRef.current.close().catch(() => {});
      if (plinkCtxRef.current) plinkCtxRef.current.close().catch(() => {});
    };
  }, []);

  // ── Conversation engine ───────────────────────────────────────────────────

  const runConvo = useCallback(async (idx: number) => {
    const convo = CONVOS[idx % CONVOS.length];
    setLeftText(null); setRightText(null);
    setLeftTyping(false); setRightTyping(false);
    for (const msg of convo) {
      if (stopRef.current) return;
      const isLeft = msg.from === "you";
      if (isLeft) { setLeftTyping(true);  setLeftText(null); }
      else         { setRightTyping(true); setRightText(null); }
      await sleep(rand(reduced ? 800 : 3200, reduced ? 1500 : 5800));
      if (stopRef.current) return;
      if (isLeft) { setLeftTyping(false); setLeftText(msg.text);  setLeftTime(msg.time);  }
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

  // ── Render ────────────────────────────────────────────────────────────────

  // Candle warm glow overlay on card when lit
  const candleGlow = candleLit
    ? "radial-gradient(ellipse 340px 220px at 72% 50%, rgba(255,160,30,0.10) 0%, transparent 65%)"
    : "none";

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
        @keyframes snowA {
          0%   { transform:translateY(-20px) translateX(0px); opacity:0; }
          8%   { opacity:1; }
          90%  { opacity:0.7; }
          100% { transform:translateY(110%) translateX(18px); opacity:0; }
        }
        @keyframes snowB {
          0%   { transform:translateY(-20px) translateX(0px); opacity:0; }
          8%   { opacity:1; }
          90%  { opacity:0.7; }
          100% { transform:translateY(110%) translateX(-18px); opacity:0; }
        }
        @keyframes leafDrift {
          0%   { transform:translateX(-60px) rotate(0deg); opacity:0; }
          6%   { opacity:0.55; }
          92%  { opacity:0.4; }
          100% { transform:translateX(calc(100vw + 60px)) rotate(540deg); opacity:0; }
        }

        .float-heart {
          animation: floatUp .95s ease-out forwards;
          position: absolute;
          pointer-events: none;
        }
        .maia-draft-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(180,130,90,0.35); }
        .maia-draft-input::placeholder { color: rgba(42,28,20,0.32); }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @media (max-width: 600px) {
          .maia-footer { padding: 12px 14px 18px !important; gap: 8px !important; }
          .maia-footer-right { gap: 6px !important; }
          .maia-footer-right img { width: 34px !important; height: 34px !important; }
          .maia-footer-right svg { width: 20px !important; height: 20px !important; }
          .maia-note-img { width: 64px !important; height: 64px !important; }
          .maia-header-right img { width: 34px !important; height: 34px !important; }
          .maia-header-left img  { width: 30px !important; height: 30px !important; }
          .maia-draft-row { padding: 8px 10px 12px !important; }
        }
      `}</style>

      {/* ── Floating background leaves ── */}
      {BG_LEAVES.map((l, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src="/maia-maple.png" alt="" aria-hidden
          width={l.size} height={l.size}
          style={{
            position: "fixed", left: 0, top: `${l.top}%`, pointerEvents: "none",
            zIndex: 0, opacity: 0,
            animation: `leafDrift ${l.duration}s ${l.delay}s linear infinite`,
          }}
        />
      ))}

      {/* ── Page background ── */}
      <div style={{
        minHeight: "100dvh", position: "relative", zIndex: 1,
        background: `radial-gradient(ellipse 900px 520px at 50% 38%, rgba(195,155,90,0.22) 0%, transparent 65%), #d8ccb4`,
        backgroundImage: `${DOT_BG}, ${NOISE_BG}`,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: "24px 14px 40px",
        fontFamily: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive, system-ui",
      }}>

        {/* Dismiss note backdrop */}
        {noteOpen && (
          <div onClick={() => setNoteOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }} />
        )}

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%", maxWidth: 860, position: "relative",
            backgroundColor: "#f0e6d0",
            backgroundImage: `${candleGlow}, url('/maia-paper.png')`,
            backgroundSize: "auto, cover", backgroundRepeat: "no-repeat", backgroundPosition: "center",
            border: "2px solid rgba(42,33,28,0.16)",
            borderRadius: 20, overflow: "hidden",
            boxShadow: [
              "0 2px 0 rgba(42,33,28,0.07)",
              "0 5px 0 rgba(42,33,28,0.04)",
              "0 14px 40px rgba(42,33,28,0.14)",
              "inset 0 1px 0 rgba(255,255,255,0.45)",
              candleLit ? "0 0 60px rgba(255,160,30,0.12)" : "",
            ].filter(Boolean).join(", "),
            transition: "box-shadow 0.6s ease",
          }}
        >

          {/* ── HEADER ── */}
          <div style={{
            padding: "18px 28px 15px", display: "flex", alignItems: "center",
            justifyContent: "center", position: "relative",
            borderBottom: "1.5px solid rgba(42,33,28,0.09)",
          }}>
            <div className="maia-header-left" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 10 }}>
              <ArtMoon size={46} />
              <ArtLeaves size={26} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                onDoubleClick={onTitleDblClick}
              >
                <h1 style={{ fontSize: "clamp(32px,6vw,52px)", fontWeight: 700, color: "#1e1610", letterSpacing: "0.02em", lineHeight: 1, fontFamily: "'Caveat', cursive", cursor: "default", userSelect: "none" }}>
                  Maia
                </h1>
                <button
                  onClick={() => { setHeartPop(true); setHeartCount(c => c + 1); }}
                  onAnimationEnd={() => setHeartPop(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", position: "relative", lineHeight: 0 }}
                  aria-label="send heart">
                  <ArtHeart size={38} pulse />
                  {heartPop && (
                    <span className="float-heart" style={{ top: -4, left: "50%", transform: "translateX(-50%)" }}>
                      <ArtHeart size={20} />
                    </span>
                  )}
                  <AnimatePresence>
                    {heartCount > 0 && (
                      <motion.span key={heartCount}
                        initial={{ opacity: 0, scale: 0.6, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: "absolute", top: -6, right: -8,
                          background: "rgba(200,90,90,0.85)", color: "#fff",
                          fontSize: 10, fontWeight: 700, borderRadius: 10,
                          padding: "1px 5px", fontFamily: "system-ui",
                          pointerEvents: "none", lineHeight: 1.4,
                        }}>
                        ×{heartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <h1 style={{ fontSize: "clamp(32px,6vw,52px)", fontWeight: 700, color: "#1e1610", letterSpacing: "0.02em", lineHeight: 1, fontFamily: "'Caveat', cursive", cursor: "default", userSelect: "none" }}>
                  Chase
                </h1>
              </div>

              {/* Double-click secret message */}
              <AnimatePresence>
                {titleSecret && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.3 }}
                    style={{ fontSize: 13, color: "#9a5a52", fontFamily: "'Caveat', cursive", letterSpacing: "0.03em", pointerEvents: "none" }}>
                    {titleSecret}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="maia-header-right" style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "flex-end", gap: 8 }}>
              <ArtPlant size={54} />
            </div>
          </div>

          {/* ── HERO ── */}
          <div
            ref={heroRef}
            onMouseMove={onHeroMouseMove}
            onMouseLeave={onHeroMouseLeave}
            onClick={onHeroClick}
            style={{
              position: "relative", width: "100%",
              aspectRatio: "1024 / 478", overflow: "hidden",
              lineHeight: 0, cursor: "crosshair",
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

            {/* Room glows */}
            <motion.div animate={{ opacity: hoverSide === "left" ? 1 : 0 }} transition={{ duration: 0.45 }}
              style={{ position:"absolute", left:0, top:0, width:"50%", height:"100%",
                background:"linear-gradient(to right, rgba(190,148,80,0.22) 0%, transparent 100%)",
                pointerEvents:"none", zIndex:4 }} />
            <motion.div animate={{ opacity: hoverSide === "right" ? 1 : 0 }} transition={{ duration: 0.45 }}
              style={{ position:"absolute", right:0, top:0, width:"50%", height:"100%",
                background:"linear-gradient(to left, rgba(200,130,130,0.22) 0%, transparent 100%)",
                pointerEvents:"none", zIndex:4 }} />

            {/* Snow layer */}
            {snowing && (
              <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:8 }}>
                {SNOWFLAKES.map((s, i) => (
                  <div key={i} style={{
                    position: "absolute", left: `${s.left}%`, top: 0,
                    width: s.size, height: s.size, borderRadius: "50%",
                    background: "rgba(255,255,255,0.82)",
                    animation: `${s.sway} ${s.duration}s ${s.delay}s linear infinite`,
                    opacity: s.opacity,
                  }} />
                ))}
              </div>
            )}

            {/* Click hearts */}
            {heroHearts.map(h => (
              <motion.div key={h.id}
                initial={{ opacity: 0.9, y: 0, scale: 0.7 }}
                animate={{ opacity: 0, y: -55, scale: 1.3 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                style={{
                  position: "absolute", left: `${h.x}%`, top: `${h.y}%`,
                  transform: `translate(-50%,-50%) rotate(${h.rot}deg)`,
                  zIndex: 20, pointerEvents: "none",
                }}>
                <ArtHeart size={h.sz} />
              </motion.div>
            ))}

            {/* Cursor trail hearts */}
            {trailHearts.map(h => (
              <motion.div key={h.id}
                initial={{ opacity: 0.55, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 0.25, y: -22 }}
                transition={{ duration: 0.72, ease: "easeOut" }}
                style={{
                  position: "absolute", left: `${h.x}%`, top: `${h.y}%`,
                  transform: "translate(-50%,-50%)",
                  zIndex: 7, pointerEvents: "none",
                }}>
                <ArtHeart size={12} />
              </motion.div>
            ))}

            {/* Conversation bubbles */}
            <div style={{ position:"absolute", left:"5%", top:"48%", zIndex:10 }}>
              <Bubble text={leftText} typing={leftTyping} side="left" time={leftTime} />
            </div>
            <div style={{ position:"absolute", right:"5%", top:"48%", zIndex:10, display:"flex", justifyContent:"flex-end" }}>
              <Bubble text={rightText} typing={rightTyping} side="right" time={rightTime} />
            </div>

            {/* Custom message bubbles */}
            <AnimatePresence>
              {customBubbles.map((b, i) => (
                <motion.div key={b.id}
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute", bottom: `${12 + i * 58}px`, left: "50%",
                    transform: "translateX(-50%)", zIndex: 15, pointerEvents: "none",
                  }}>
                  <Bubble text={b.text} typing={false} side="left" accent />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Convo progress */}
            <div style={{ position:"absolute", top:8, right:10, fontSize:11,
              color:"rgba(42,28,20,0.28)", fontFamily:"'Caveat', cursive",
              pointerEvents:"none", zIndex:5 }}>
              {convoIdx + 1} / {CONVOS.length}
            </div>

            {/* "click anywhere" hint */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
              style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)",
                fontSize:10, color:"rgba(42,28,20,0.2)", fontFamily:"'Caveat', cursive",
                pointerEvents:"none", zIndex:5, whiteSpace:"nowrap" }}>
              click anywhere ♡
            </motion.div>
          </div>

          {/* ── FOOTER ── */}
          <div className="maia-footer" style={{
            padding: "18px 24px 20px",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            flexWrap: "wrap", gap: 14,
            borderTop: "1.5px solid rgba(42,33,28,0.08)",
          }}>
            {/* Left — garden + letter */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:12, position:"relative", zIndex:50 }}>
              <ArtSeedling size={32} />
              <GardenNote open={noteOpen} onToggle={() => setNoteOpen(o => !o)} />
              <StarButton size={11} />
              <EnvelopeButton onClick={() => setLetterOpen(true)} />
            </div>

            {/* Center — hint + skip */}
            <div style={{
              fontSize:12, color:"#9a8070", letterSpacing:"0.04em", textAlign:"center",
              flexGrow:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              fontFamily:"'Caveat', cursive",
            }}>
              {footerHint}
              <ArtHeart size={12} />
              <SkipButton onClick={skipConvo} />
            </div>

            {/* Right — ambient + interactive */}
            <div className="maia-footer-right" style={{ display:"flex", alignItems:"flex-end", gap:10 }}>
              <StarButton size={11} />
              <CandleButton lit={candleLit} onToggle={() => setCandleLit(l => !l)} />
              <SnowButton snowing={snowing} onToggle={() => setSnowing(s => !s)} />
              <ChickenButton size={52} />
              <MapleButton size={46} />
              <RainButton raining={raining} onToggle={toggleRain} />
              <SpeakerButton playing={playing} onToggle={toggleAudio} />
            </div>
          </div>

          {/* ── CUSTOM MESSAGE INPUT ── */}
          <div className="maia-draft-row" style={{
            padding: "10px 18px 18px", borderTop: "1px solid rgba(42,33,28,0.07)",
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <input
              className="maia-draft-input"
              type="text"
              value={draftMsg}
              onChange={e => setDraftMsg(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendCustom(); }}
              placeholder="say something to maia..."
              maxLength={120}
              style={{
                flex: 1, background: "rgba(255,255,255,0.38)",
                border: "1.5px solid rgba(42,33,28,0.15)",
                borderRadius: 22, padding: "9px 18px",
                fontFamily: "'Caveat', cursive", fontSize: 15,
                color: "#2a1c14", transition: "box-shadow 0.2s",
              }}
            />
            <motion.button
              onClick={sendCustom}
              whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.08 }}
              disabled={!draftMsg.trim()}
              style={{
                background: draftMsg.trim() ? "rgba(200,143,136,0.75)" : "rgba(200,143,136,0.28)",
                border: "1.5px solid rgba(42,33,28,0.13)", borderRadius: "50%",
                width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: draftMsg.trim() ? "pointer" : "default",
                transition: "background 0.2s", flexShrink: 0,
              }}
              aria-label="send message">
              <ArtHeart size={18} />
            </motion.button>
          </div>

          {/* ── INTERACTIVE WIDGETS ── */}
          <div style={{ borderTop: "1px solid rgba(42,33,28,0.07)" }}>

            {/* Tab bar */}
            <div style={{ display: "flex", overflowX: "auto" }}>
              {[
                { id: "jar",      icon: "🫙", label: "memories" },
                { id: "thinking", icon: "♡",  label: "thinking" },
                { id: "ask",      icon: "✦",  label: "ask maia" },
                { id: "time",     icon: "🕐", label: "right now" },
                { id: "list",     icon: "☑",  label: "together" },
                { id: "vibe",     icon: "✨", label: "vibe" },
              ].map(w => (
                <motion.button key={w.id}
                  onClick={() => setActiveWidget(v => v === w.id ? null : w.id)}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    flex: 1, minWidth: 60, padding: "10px 6px 8px",
                    background: activeWidget === w.id ? "rgba(200,143,136,0.12)" : "transparent",
                    border: "none",
                    borderBottom: `2px solid ${activeWidget === w.id ? "rgba(200,143,136,0.65)" : "transparent"}`,
                    cursor: "pointer", fontFamily: "'Caveat', cursive",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    transition: "background 0.18s",
                  }}>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{w.icon}</span>
                  <span style={{ fontSize: 10, color: activeWidget === w.id ? "#9a5a52" : "rgba(42,28,20,0.45)", whiteSpace: "nowrap", transition: "color 0.18s" }}>{w.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Panel */}
            <AnimatePresence mode="wait">
              {activeWidget && (
                <motion.div key={activeWidget}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ borderTop: "1px solid rgba(42,33,28,0.06)" }}>
                  {activeWidget === "jar"      && <MemoryJarWidget />}
                  {activeWidget === "thinking" && <ThinkingOfYouWidget />}
                  {activeWidget === "ask"      && <AskMaiaWidget />}
                  {activeWidget === "time"     && <TimezoneWidget />}
                  {activeWidget === "list"     && <BucketListWidget />}
                  {activeWidget === "vibe"     && (
                    <VibePresetsWidget
                      candleLit={candleLit} setCandleLit={setCandleLit}
                      raining={raining}     toggleRain={toggleRain}
                      snowing={snowing}     setSnowing={setSnowing}
                      playing={playing}     toggleAudio={toggleAudio}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>

      {/* ── OVERLAYS (outside card) ── */}

      {/* Love letter */}
      <LoveLetter open={letterOpen} onClose={() => setLetterOpen(false)} />

      {/* Maia toasts — bottom-left */}
      <div style={{ position:"fixed", bottom:20, left:20, zIndex:300, display:"flex", flexDirection:"column-reverse", gap:8, pointerEvents:"none" }}>
        <AnimatePresence>
          {maiaToasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -28, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -18, scale: 0.92 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "rgba(200,143,136,0.88)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1.5px solid rgba(42,33,28,0.14)",
                borderRadius: "14px 16px 16px 4px",
                padding: "9px 16px 10px",
                fontFamily: "'Caveat', cursive",
                fontSize: 15, color: "#2a1c14",
                boxShadow: "2px 4px 16px rgba(0,0,0,0.14)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              <ArtHeart size={14} />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Secret keyboard burst */}
      <AnimatePresence>
        {secretBurst && (
          <SecretHeartBurst key="burst" onDone={() => setSecretBurst(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Root export (PIN gate wrapper) ───────────────────────────────────────────

export default function MaiaPage() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem("maia-unlocked") === "1"; } catch { return false; }
  });

  return unlocked
    ? <MaiaPageContent />
    : <PinGate onUnlock={() => setUnlocked(true)} />;
}
