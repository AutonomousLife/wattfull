"use client";
import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemId = "record" | "mug" | "window" | "books" | "photo" | "lights";
type SoundKey = "lofi" | "rain" | "chime" | "rustle" | "sparkle" | "ding";

interface RoomItem {
  id: ItemId;
  label: string;
  note: string;
  subtext: string;
  emoji: string;
  cx: number; cy: number; r: number;   // SVG click region (900×560 space)
  px: string; py: string;              // popup position (viewport %)
  rot: number;                         // sticky note rotation (deg)
  bg: string;                          // sticky note color
  sound: SoundKey;
}

// ── Room content ──────────────────────────────────────────────────────────────

const ITEMS: RoomItem[] = [
  {
    id: "record", label: "Record Player",
    note: "currently spinning:",
    subtext: "Rumours — Fleetwood Mac\nat 2am, always.",
    emoji: "🎵", cx: 120, cy: 348, r: 58, px: "5%", py: "44%",
    rot: -3, bg: "#fef9c3", sound: "lofi",
  },
  {
    id: "mug", label: "The Mug",
    note: "oat milk. no sugar.",
    subtext: "reheated three times.\nstill not finished.",
    emoji: "☕", cx: 680, cy: 330, r: 45, px: "58%", py: "34%",
    rot: 2, bg: "#fce4d6", sound: "chime",
  },
  {
    id: "window", label: "The Window",
    note: "somewhere cold.",
    subtext: "🇨🇦  pines and aurora.\nit matters a lot.",
    emoji: "🌲", cx: 412, cy: 130, r: 100, px: "27%", py: "2%",
    rot: -1.5, bg: "#d4edda", sound: "rain",
  },
  {
    id: "books", label: "The Shelf",
    note: "marked on page 47:",
    subtext: "\"not all those who wander\nare lost.\"",
    emoji: "📚", cx: 800, cy: 200, r: 75, px: "68%", py: "8%",
    rot: 3, bg: "#fef9c3", sound: "rustle",
  },
  {
    id: "photo", label: "Polaroids",
    note: "a kept thing.",
    subtext: "blurry but it felt\nexactly right.",
    emoji: "📸", cx: 160, cy: 175, r: 60, px: "5%", py: "8%",
    rot: -4, bg: "#fce4d6", sound: "sparkle",
  },
  {
    id: "lights", label: "String Lights",
    note: "they stay on all night.",
    subtext: "it makes the dark\nfeel smaller.",
    emoji: "✨", cx: 450, cy: 22, r: 40, px: "34%", py: "4%",
    rot: 1, bg: "#fffde7", sound: "ding",
  },
];

// ── Audio synthesis ───────────────────────────────────────────────────────────

function makeCtx(): AudioContext {
  return new ((window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || AudioContext)();
}

const SOUNDS: Record<SoundKey, () => void> = {
  lofi() {
    try {
      const ctx = makeCtx();
      const notes = [261.63, 311.13, 369.99, 311.13, 261.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass"; lp.frequency.value = 1600;
        osc.type = "sine"; osc.frequency.value = freq;
        osc.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.45;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.5);
      });
      setTimeout(() => ctx.close(), 3000);
    } catch { /* noop */ }
  },
  rain() {
    try {
      const ctx = makeCtx();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 450; f.Q.value = 0.3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 0.3);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + 2);
      setTimeout(() => ctx.close(), 2500);
    } catch { /* noop */ }
  },
  chime() {
    try {
      const ctx = makeCtx();
      [880, 1109].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = freq;
        osc.connect(g); g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.13, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.start(t); osc.stop(t + 1);
      });
      setTimeout(() => ctx.close(), 1500);
    } catch { /* noop */ }
  },
  rustle() {
    try {
      const ctx = makeCtx();
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1800;
      const g = ctx.createGain(); g.gain.value = 0.18;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close(), 600);
    } catch { /* noop */ }
  },
  sparkle() {
    try {
      const ctx = makeCtx();
      [1318, 1568, 2093].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = freq;
        osc.connect(g); g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.1;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t); osc.stop(t + 0.6);
      });
      setTimeout(() => ctx.close(), 1000);
    } catch { /* noop */ }
  },
  ding() {
    try {
      const ctx = makeCtx();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = "triangle"; osc.frequency.value = 740;
      osc.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(); osc.stop(ctx.currentTime + 1.3);
      setTimeout(() => ctx.close(), 1800);
    } catch { /* noop */ }
  },
};

// ── Book shelf data ───────────────────────────────────────────────────────────

const S1 = [ // shelf 1 — base y=170
  {x:724,w:16,h:68,c:"#e05050"},{x:742,w:12,h:55,c:"#5070d0"},{x:756,w:18,h:72,c:"#50a050"},
  {x:776,w:14,h:60,c:"#d0a030"},{x:792,w:10,h:50,c:"#8050c0"},{x:804,w:16,h:65,c:"#e08050"},
  {x:822,w:13,h:58,c:"#40a0b0"},{x:837,w:15,h:70,c:"#c05080"},{x:854,w:8, h:45,c:"#606060"},
];
const S2 = [ // shelf 2 — base y=250
  {x:724,w:14,h:58,c:"#d06040"},{x:740,w:18,h:65,c:"#4060c0"},{x:760,w:12,h:52,c:"#60b060"},
  {x:774,w:16,h:62,c:"#c09040"},{x:792,w:10,h:48,c:"#9060b0"},{x:804,w:14,h:60,c:"#e07060"},
  {x:820,w:18,h:68,c:"#50b0b0"},{x:840,w:12,h:54,c:"#d05070"},{x:854,w:9, h:42,c:"#808080"},
];
const S3 = [ // shelf 3 — base y=330
  {x:724,w:16,h:60,c:"#b04040"},{x:742,w:11,h:50,c:"#4050b0"},{x:755,w:15,h:64,c:"#50904a"},
  {x:772,w:13,h:56,c:"#b08030"},{x:787,w:17,h:70,c:"#7040a0"},{x:806,w:12,h:54,c:"#c06040"},
  {x:820,w:14,h:62,c:"#3090a0"},{x:836,w:16,h:58,c:"#b04060"},
];

// Fixed snow positions
const SNOW = [
  {x:335,y:85},{x:358,y:115},{x:380,y:75},{x:415,y:130},{x:438,y:98},
  {x:462,y:120},{x:488,y:80},{x:498,y:110},{x:348,y:148},{x:372,y:160},
];

// Polaroid configs
const POLAROIDS = [
  {x:75, y:95, rot:-7, fill:"#e0d0be"},
  {x:132,y:88, rot:4,  fill:"#bfd0e0"},
  {x:178,y:118,rot:-5, fill:"#d0e0be"},
];

// String light colors
const BULB_COLORS = ["#ffdd60","#ff8060","#60ccff","#a0ff80","#ff80cc","#ffcc40"];
const BULB_XS     = [55,110,170,230,290,350,410,470,530,590,650,710,770,830];

// Pine data for window silhouette
const PINES: Array<{x:number;base:number;w:number;h:number}> = [
  {x:325,base:200,w:12,h:35},{x:340,base:200,w:10,h:42},{x:358,base:200,w:13,h:38},
  {x:374,base:200,w:11,h:32},{x:390,base:200,w:12,h:40},{x:406,base:200,w:13,h:45},
  {x:422,base:200,w:11,h:36},{x:440,base:200,w:12,h:38},{x:460,base:200,w:10,h:30},
  {x:478,base:200,w:12,h:42},{x:496,base:200,w:11,h:35},
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function MaiaPage() {
  const [active, setActive] = useState<ItemId | null>(null);
  const [spinning, setSpinning] = useState(false);

  const handleClick = useCallback((item: RoomItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (active === item.id) {
      setActive(null);
      if (item.id === "record") setSpinning(false);
      return;
    }
    setActive(item.id);
    SOUNDS[item.sound]();
    if (item.id === "record") setSpinning(true);
  }, [active]);

  const activeItem = active ? ITEMS.find(i => i.id === active) ?? null : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; background: #f2e8d5; }

        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes aurora      { 0%,100%{transform:translateX(-10px) scaleX(1);opacity:.5} 50%{transform:translateX(14px) scaleX(1.08);opacity:.75} }
        @keyframes glow        { 0%,100%{opacity:.75} 50%{opacity:1} }
        @keyframes panelIn     { from{opacity:0;transform:translateY(8px) scale(.96) rotate(var(--note-rot,0deg))} to{opacity:1;transform:translateY(0) scale(1) rotate(var(--note-rot,0deg))} }
        @keyframes bulbPulse   { 0%,100%{opacity:.82} 50%{opacity:1} }
        @keyframes snowDrift   { from{transform:translate(0,0)} to{transform:translate(4px,18px)} }
        @keyframes steamRise   { 0%{transform:translateY(0) scaleX(1);opacity:.65} 50%{transform:translateY(-8px) scaleX(1.3);opacity:.32} 100%{transform:translateY(-16px);opacity:0} }

        .room-wrap  { width:100vw; height:100dvh; position:relative; overflow:hidden; }
        .room-svg   { position:absolute; inset:0; width:100%; height:100%; }
        .hotspot    { cursor:pointer; }
        .hotspot:focus-visible { outline:2px dashed #8b7355; outline-offset:4px; }

        .spin-group { transform-origin: 120px 348px; }
        .spinning   { animation: spin 4s linear infinite; }

        .aurora-band { animation: aurora 5s ease-in-out infinite; transform-origin: 50% 50%; }

        .bulb { animation: bulbPulse 2.5s ease-in-out infinite; }

        .steam-path { animation: steamRise 2.2s ease-in-out infinite; }
        .steam-path:nth-of-type(2) { animation-delay:.7s; }
        .steam-path:nth-of-type(3) { animation-delay:1.4s; }

        .snow-dot { animation: snowDrift linear infinite; }

        .sticky {
          position: absolute;
          font-family: 'Caveat', cursive;
          padding: 14px 16px 10px;
          min-width: 150px;
          max-width: 210px;
          box-shadow: 3px 5px 16px rgba(0,0,0,.15), 0 1px 4px rgba(0,0,0,.08);
          animation: panelIn .22s ease forwards;
          z-index: 200;
          line-height: 1.42;
          pointer-events: all;
        }
        .sticky::before {
          content:'';
          position:absolute;
          top:-9px; left:50%; transform:translateX(-50%);
          width:38px; height:16px;
          background:rgba(190,215,255,.58);
          border-radius:2px;
          box-shadow:0 1px 4px rgba(0,0,0,.1);
        }
        .hint-label {
          position: absolute;
          bottom: 22px; left: 50%;
          transform: translateX(-50%);
          font-family: 'Caveat', cursive;
          font-size: clamp(15px,2.2vw,22px);
          color: #8b7355;
          opacity: .5;
          letter-spacing: .08em;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>

      <div className="room-wrap" onClick={() => setActive(null)}>

        {/* ─── SVG Room ───────────────────────────────────────────────── */}
        <svg
          className="room-svg"
          viewBox="0 0 900 560"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Sketch / hand-drawn displacement */}
            <filter id="sketch" x="-6%" y="-6%" width="112%" height="112%">
              <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="3" seed="5" result="n"/>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
            {/* Soft glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Sky gradient */}
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#07111f"/>
              <stop offset="100%" stopColor="#152840"/>
            </linearGradient>
            {/* Wood floor */}
            <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#c49060"/>
              <stop offset="100%" stopColor="#a87040"/>
            </linearGradient>
            {/* Lamp warm glow radial */}
            <radialGradient id="lampHalo" cx="50%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#ffe08a" stopOpacity="0.52"/>
              <stop offset="100%" stopColor="#ffe08a" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* ── WALL ────────────────────────────────────────────────── */}
          <rect x="0" y="0" width="900" height="415" fill="#f2e8d5"/>
          <line x1="0" y1="210" x2="900" y2="214" stroke="#dfd4c0" strokeWidth="0.6" opacity=".4"/>
          <line x1="0" y1="310" x2="900" y2="308" stroke="#dfd4c0" strokeWidth="0.5" opacity=".3"/>

          {/* ── FLOOR ───────────────────────────────────────────────── */}
          <rect x="0" y="415" width="900" height="145" fill="url(#floor)"/>
          {([420,433,445,457,468,479,490,500,510,519,528,537,546,554] as number[]).map((y,i) => (
            <line key={i} x1="0" y1={y} x2="900" y2={y+(i%3-1)} stroke="#9a6830" strokeWidth=".7" opacity=".3"/>
          ))}
          {([145,290,435,580,725] as number[]).map((x,i) => (
            <line key={i} x1={x} y1="415" x2={x+4} y2="560" stroke="#8a5820" strokeWidth="1" opacity=".2"/>
          ))}

          {/* Baseboard */}
          <rect x="0" y="408" width="900" height="13" fill="#e0cdb0" filter="url(#sketch)"/>

          {/* ── RUG ─────────────────────────────────────────────────── */}
          <ellipse cx="450" cy="462" rx="205" ry="68" fill="#8b3f60" opacity=".68" filter="url(#sketch)"/>
          <ellipse cx="450" cy="462" rx="180" ry="57" fill="none" stroke="#c06080" strokeWidth="4" opacity=".45"/>
          <ellipse cx="450" cy="462" rx="145" ry="43" fill="none" stroke="#a04060" strokeWidth="2" opacity=".38"/>

          {/* ── STRING LIGHTS ────────────────────────────────────────── */}
          <path d="M0,16 Q55,26 110,14 Q170,4 230,16 Q290,26 350,14 Q410,4 470,16 Q530,26 590,14 Q650,4 710,16 Q770,26 830,14 Q865,10 900,18"
            stroke="#706050" strokeWidth="1.5" fill="none"/>
          {BULB_XS.map((x, i) => {
            const y = i % 2 === 0 ? 23 : 19;
            const c = BULB_COLORS[i % BULB_COLORS.length];
            return (
              <g key={i}>
                <line x1={x} y1={y-3} x2={x} y2={y+9} stroke="#504030" strokeWidth="1"/>
                <ellipse cx={x} cy={y+13} rx="7" ry="9" fill={c} className="bulb" filter="url(#glow)"
                  style={{animationDelay:`${i*0.18}s`}}/>
                <ellipse cx={x} cy={y+10} rx="4.5" ry="3.5" fill={c} opacity=".38"/>
              </g>
            );
          })}

          {/* ── WINDOW ───────────────────────────────────────────────── */}
          {/* Sky pane */}
          <rect x="322" y="42" width="182" height="174" fill="url(#sky)" rx="3"/>
          {/* Stars */}
          {([
            [342,66],[362,56],[392,73],[422,61],[458,69],[476,53],[496,71],[337,91],[347,81]
          ] as [number,number][]).map(([sx,sy],i) => (
            <circle key={i} cx={sx} cy={sy} r="1.6" fill="white" opacity=".8">
              <animate attributeName="opacity" values=".8;.25;.8" dur={`${2+i*0.38}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {/* Aurora */}
          <g className="aurora-band">
            <path d="M322,114 Q362,99 402,111 Q442,122 504,108"
              stroke="#38e088" strokeWidth="11" fill="none" opacity=".55" strokeLinecap="round" filter="url(#glow)"/>
            <path d="M332,125 Q376,112 412,122 Q452,133 504,120"
              stroke="#60d09a" strokeWidth="6"  fill="none" opacity=".32" strokeLinecap="round"/>
          </g>
          {/* Snow dots */}
          {SNOW.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="1.3" fill="white" opacity=".72" className="snow-dot"
              style={{animationDuration:`${3.2+i*0.45}s`, animationDelay:`${i*0.3}s`}}/>
          ))}
          {/* Pine silhouettes */}
          {PINES.map((p,i) => (
            <polygon key={i}
              points={`${p.x},${p.base-p.h} ${p.x-p.w/2},${p.base} ${p.x+p.w/2},${p.base}`}
              fill="#0c1c11"/>
          ))}
          {/* Window frame */}
          <rect x="316" y="37" width="194" height="183" fill="none" stroke="#8b7355" strokeWidth="7" rx="4" filter="url(#sketch)"/>
          <line x1="316" y1="128" x2="510" y2="128" stroke="#8b7355" strokeWidth="5" filter="url(#sketch)"/>
          <line x1="413" y1="37"  x2="413" y2="220" stroke="#8b7355" strokeWidth="4" filter="url(#sketch)"/>
          {/* Window sill */}
          <rect x="309" y="218" width="208" height="11" fill="#c4a870" rx="2" filter="url(#sketch)"/>
          {/* Left curtain */}
          <path d="M282,18 Q302,78 297,138 Q292,198 310,223 L302,223 Q284,198 289,138 Q294,78 274,18 Z"
            fill="#c4856a" opacity=".74" filter="url(#sketch)"/>
          {/* Right curtain */}
          <path d="M544,18 Q524,78 529,138 Q534,198 517,223 L525,223 Q541,198 536,138 Q531,78 552,18 Z"
            fill="#c4856a" opacity=".74" filter="url(#sketch)"/>
          {/* Window plant */}
          <ellipse cx="348" cy="219" rx="12" ry="5" fill="#8b6340"/>
          <path d="M348,219 Q338,192 328,180" stroke="#4a7c40" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <ellipse cx="328" cy="180" rx="12" ry="8" fill="#5a9c50" transform="rotate(-20 328 180)"/>
          <path d="M348,219 Q357,196 367,186" stroke="#4a7c40" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <ellipse cx="367" cy="186" rx="10" ry="7" fill="#4a8a40" transform="rotate(15 367 186)"/>

          {/* ── BOOKSHELF ────────────────────────────────────────────── */}
          <rect x="718" y="78"  width="157" height="300" fill="#c8a870" rx="3" filter="url(#sketch)"/>
          <rect x="710" y="78"  width="163" height="10"  fill="#a07840" rx="2" filter="url(#sketch)"/>
          <rect x="710" y="170" width="163" height="10"  fill="#a07840" rx="2" filter="url(#sketch)"/>
          <rect x="710" y="250" width="163" height="10"  fill="#a07840" rx="2" filter="url(#sketch)"/>
          <rect x="710" y="330" width="163" height="10"  fill="#a07840" rx="2" filter="url(#sketch)"/>
          <rect x="710" y="78"  width="10"  height="300" fill="#a07840" rx="2"/>
          <rect x="863" y="78"  width="10"  height="300" fill="#a07840" rx="2"/>
          {/* Small figure on top */}
          <circle cx="852" cy="72" r="8" fill="#f0c080"/>
          <rect x="846" y="72" width="11" height="12" fill="#6080e0" rx="2"/>
          {/* Books shelf 1 */}
          {S1.map((b,i) => <rect key={i} x={b.x} y={170-b.h} width={b.w} height={b.h} fill={b.c} rx="1" opacity=".9"/>)}
          {/* Books shelf 2 */}
          {S2.map((b,i) => <rect key={i} x={b.x} y={250-b.h} width={b.w} height={b.h} fill={b.c} rx="1" opacity=".9"/>)}
          {/* Books shelf 3 */}
          {S3.map((b,i) => <rect key={i} x={b.x} y={330-b.h} width={b.w} height={b.h} fill={b.c} rx="1" opacity=".9"/>)}

          {/* ── RECORD PLAYER ────────────────────────────────────────── */}
          {/* Table legs */}
          <rect x="45"  y="390" width="8"  height="38" fill="#6b4a20"/>
          <rect x="187" y="390" width="8"  height="38" fill="#6b4a20"/>
          {/* Table top */}
          <rect x="38"  y="374" width="172" height="18" fill="#8b6340" rx="3" filter="url(#sketch)"/>
          {/* Player body */}
          <rect x="42"  y="322" width="160" height="55" fill="#a07840" rx="5" filter="url(#sketch)"/>
          {/* Platter */}
          <circle cx="120" cy="348" r="50" fill="#252525"/>
          {/* Record — spins when active */}
          <g className={`spin-group${spinning ? " spinning" : ""}`}>
            <circle cx="120" cy="348" r="46" fill="#1a1a1a"/>
            <circle cx="120" cy="348" r="40" fill="none" stroke="#2d2d2d" strokeWidth="2"/>
            <circle cx="120" cy="348" r="32" fill="none" stroke="#2d2d2d" strokeWidth="1.5"/>
            <circle cx="120" cy="348" r="22" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            <circle cx="120" cy="348" r="14" fill="#c04040"/>
            <circle cx="120" cy="348" r="3"  fill="#1a1a1a"/>
          </g>
          {/* Tone arm */}
          <circle cx="166" cy="320" r="5" fill="#707070"/>
          <line x1="166" y1="320" x2="134" y2="343" stroke="#909090" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="134" cy="344" r="3" fill="#404040"/>
          {/* Power LED */}
          <circle cx="184" cy="342" r="4" fill={spinning ? "#60ff80" : "#333"} filter={spinning ? "url(#glow)" : ""}/>

          {/* ── DESK + LAMP + MUG ────────────────────────────────────── */}
          {/* Desk legs */}
          <rect x="575" y="360" width="8"  height="38" fill="#7a5030"/>
          <rect x="787" y="360" width="8"  height="38" fill="#7a5030"/>
          {/* Desk top */}
          <rect x="565" y="343" width="238" height="20" fill="#9a7048" rx="3" filter="url(#sketch)"/>
          {/* Lamp glow halo */}
          <ellipse cx="787" cy="312" rx="82" ry="62" fill="url(#lampHalo)"/>
          {/* Lamp post */}
          <rect x="780" y="293" width="13" height="52" fill="#8a8a8a" rx="2"/>
          <rect x="770" y="340" width="33" height="6"  fill="#707070" rx="3"/>
          {/* Lamp shade */}
          <path d="M770,293 Q788,272 806,293" fill="#e8c840" stroke="#c0a030" strokeWidth="2" filter="url(#sketch)"/>
          {/* Mug body */}
          <rect x="658" y="310" width="40" height="35" fill="#f0f0e8" rx="5" filter="url(#sketch)"/>
          <path d="M698,318 Q713,318 713,328 Q713,338 698,338" stroke="#b0b0a2" strokeWidth="2.8" fill="none" filter="url(#sketch)"/>
          <text x="666" y="333" fontSize="13" fontFamily="serif" fill="#9a9a8a" opacity=".55">☕</text>
          {/* Steam */}
          {([{x:666,d:"1.1s"},{x:675,d:"0s"},{x:684,d:"0.55s"}]).map((s,i) => (
            <path key={i} className="steam-path" style={{animationDelay:s.d}}
              d={`M${s.x},310 Q${s.x+3},301 ${s.x},293 Q${s.x-3},285 ${s.x},279`}
              stroke="#c0c0c0" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".58"/>
          ))}
          {/* Notebook on desk */}
          <rect x="598" y="304" width="50" height="41" fill="#f8f0e0" rx="2" transform="rotate(-3 598 304)" filter="url(#sketch)"/>
          <line x1="605" y1="316" x2="641" y2="315" stroke="#d0c0a0" strokeWidth="1" transform="rotate(-3 598 304)"/>
          <line x1="605" y1="324" x2="641" y2="323" stroke="#d0c0a0" strokeWidth="1" transform="rotate(-3 598 304)"/>
          <line x1="605" y1="332" x2="641" y2="331" stroke="#d0c0a0" strokeWidth="1" transform="rotate(-3 598 304)"/>

          {/* ── POLAROIDS ────────────────────────────────────────────── */}
          {POLAROIDS.map((p, i) => (
            <g key={i} transform={`rotate(${p.rot} ${p.x+31} ${p.y+40})`}>
              <rect x={p.x}   y={p.y}   width="62" height="72" fill="white" filter="url(#sketch)"/>
              <rect x={p.x+5} y={p.y+5} width="52" height="46" fill={p.fill} opacity=".72"/>
            </g>
          ))}
          {/* Push pins */}
          {([{x:106,y:93},{x:162,y:85},{x:202,y:115}] as {x:number;y:number}[]).map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#e04040" stroke="#c03030" strokeWidth=".6"/>
          ))}

          {/* ── INVISIBLE HOTSPOTS ───────────────────────────────────── */}
          {ITEMS.map(item => (
            <circle
              key={item.id}
              className="hotspot"
              cx={item.cx} cy={item.cy} r={item.r}
              fill="transparent"
              role="button"
              aria-label={item.label}
              tabIndex={0}
              onClick={e => handleClick(item, e)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleClick(item, e as unknown as React.MouseEvent); }}
            />
          ))}
        </svg>

        {/* ─── Sticky note popup ──────────────────────────────────────── */}
        {activeItem && (
          <div
            key={activeItem.id}
            className="sticky"
            style={{
              left: activeItem.px,
              top:  activeItem.py,
              background: activeItem.bg,
              borderRadius: "2px 18px 4px 14px / 14px 4px 18px 2px",
              "--note-rot": `${activeItem.rot}deg`,
            } as React.CSSProperties}
            onClick={e => e.stopPropagation()}
          >
            <div style={{fontSize:12,color:"#777",fontWeight:600,marginBottom:4,letterSpacing:".03em"}}>
              {activeItem.emoji} {activeItem.label}
            </div>
            <div style={{fontSize:24,color:"#333",fontWeight:700,lineHeight:1.25,marginBottom:3}}>
              {activeItem.note}
            </div>
            <div style={{fontSize:19,color:"#555",whiteSpace:"pre-line",lineHeight:1.42}}>
              {activeItem.subtext}
            </div>
            <button
              onClick={() => setActive(null)}
              style={{
                marginTop:10, background:"none", border:"none",
                cursor:"pointer", fontFamily:"inherit",
                fontSize:13, color:"#999", fontWeight:600,
              }}
            >
              ✕ close
            </button>
          </div>
        )}

        {/* ─── Hint ───────────────────────────────────────────────────── */}
        <div className="hint-label">click anything ✦</div>
      </div>
    </>
  );
}
