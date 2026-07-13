"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const panel = (t) => ({ border: `1px solid ${t.border}`, background: t.card, borderRadius: "var(--r-md)", boxShadow: "var(--shadow-sm)" });
const button = (t, primary = false) => ({ border: `1px solid ${primary ? t.green : t.border}`, background: primary ? t.green : "transparent", color: primary ? "#07120e" : t.text, borderRadius: 8, padding: "9px 13px", fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: ".02em" });

function ReactorRush({ t }) {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const placeTarget = useCallback(() => setTarget({ x: 10 + Math.random() * 80, y: 12 + Math.random() * 72 }), []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTime((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function start() { setScore(0); setCombo(0); setTime(20); placeTarget(); setRunning(true); }
  function hit() { if (!running) return; setCombo((value) => value + 1); setScore((value) => value + 10 + combo * 2); placeTarget(); }

  return <ArcadeCard t={t} kicker="20-second reaction run" title="Reactor Rush" detail="Tap the live node before it disappears. Keep the combo alive." action={<button onClick={start} style={button(t, true)}>{running ? "Restart" : time === 0 ? "Run again" : "Start run"}</button>}>
    <div style={{ position: "relative", height: 280, overflow: "hidden", borderRadius: 10, background: "radial-gradient(circle at 50% 50%, rgba(84,190,154,.15), transparent 42%), #0c1411", border: "1px solid rgba(118,166,143,.2)" }}>
      {[20, 40, 60, 80].map((value) => <div key={value} style={{ position: "absolute", left: `${value}%`, top: 0, bottom: 0, width: 1, background: "rgba(171,211,190,.06)" }} />)}
      <div style={{ position: "absolute", top: 15, left: 16, color: "#c3d0c8", fontSize: 11, letterSpacing: ".08em", fontWeight: 800 }}>SCORE {score} · COMBO ×{combo}</div>
      <div style={{ position: "absolute", top: 15, right: 16, color: time < 6 ? "#ff8e78" : "#79d8ad", fontWeight: 800 }}>{time}s</div>
      {running && <button aria-label="Capture energy node" onClick={hit} style={{ position: "absolute", left: `${target.x}%`, top: `${target.y}%`, transform: "translate(-50%, -50%)", width: 50, height: 50, borderRadius: "50%", border: "7px solid rgba(213,255,229,.22)", background: "#6ce0ad", boxShadow: "0 0 0 9px rgba(108,224,173,.1), 0 0 30px #5cdaaa", cursor: "crosshair" }} />}
      {!running && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#a9b9af", textAlign: "center", fontSize: 13 }}>{time === 0 ? `Run complete · ${score} points` : "Prime the reactor and start a run."}</div>}
    </div>
  </ArcadeCard>;
}

function SignalSprint({ t }) {
  const [lane, setLane] = useState(1);
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [hazards, setHazards] = useState([]);
  const [message, setMessage] = useState("Choose a lane, then run.");
  const move = useCallback((delta) => setLane((value) => clamp(value + delta, 0, 2)), []);

  useEffect(() => {
    const key = (event) => { if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1); if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [move]);
  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      setDistance((value) => value + 1);
      setHazards((items) => {
        const next = items.map((item) => ({ ...item, y: item.y + 10 })).filter((item) => item.y < 112);
        if (Math.random() > .45) next.push({ id: Math.random(), lane: Math.floor(Math.random() * 3), y: -10 });
        if (next.some((item) => item.lane === lane && item.y > 75 && item.y < 98)) { setRunning(false); setMessage(`Signal lost at ${distance}m. Try another line.`); }
        return next;
      });
    }, 180);
    return () => window.clearInterval(tick);
  }, [running, lane, distance]);
  function start() { setLane(1); setDistance(0); setHazards([]); setMessage("Arrow keys or A / D to switch lanes."); setRunning(true); }

  return <ArcadeCard t={t} kicker="Keyboard micro-runner" title="Signal Sprint" detail="Dodge interference on a failing transmission line." action={<button onClick={start} style={button(t, true)}>{running ? "Restart" : "Start sprint"}</button>}>
    <div style={{ position: "relative", height: 280, overflow: "hidden", borderRadius: 10, background: "linear-gradient(180deg, #152923, #07100d)", border: "1px solid rgba(118,166,143,.2)" }}>
      <div style={{ position: "absolute", inset: "0 17%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>{[0, 1, 2].map((value) => <div key={value} style={{ borderLeft: "1px dashed rgba(206,244,221,.14)", borderRight: "1px dashed rgba(206,244,221,.08)" }} />)}</div>
      <div style={{ position: "absolute", top: 15, left: 16, color: "#c3d0c8", fontSize: 11, letterSpacing: ".08em", fontWeight: 800 }}>DISTANCE {distance}m</div>
      {hazards.map((hazard) => <div key={hazard.id} style={{ position: "absolute", left: `${25 + hazard.lane * 25}%`, top: `${hazard.y}%`, width: 25, height: 25, transform: "translateX(-50%) rotate(45deg)", background: "#d37860", boxShadow: "0 0 16px rgba(211,120,96,.6)" }} />)}
      <div style={{ position: "absolute", left: `${25 + lane * 25}%`, bottom: 18, width: 31, height: 31, borderRadius: 8, transform: "translateX(-50%)", background: "#73dfae", boxShadow: "0 0 20px rgba(115,223,174,.8)", transition: "left .1s" }} />
      <div style={{ position: "absolute", bottom: 15, left: 15, right: 15, textAlign: "center", color: "#a9b9af", fontSize: 11 }}>{message}</div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}><button onClick={() => move(-1)} style={button(t)}>←</button><button onClick={() => move(1)} style={button(t)}>→</button></div>
  </ArcadeCard>;
}

const initialBoard = [true, false, true, false, true, false, true, true, false];
function CircuitFlip({ t }) {
  const [board, setBoard] = useState(initialBoard);
  const [moves, setMoves] = useState(0);
  const solved = useMemo(() => board.every(Boolean), [board]);
  function flip(index) {
    if (solved) return;
    setBoard((current) => current.map((value, position) => {
      const row = Math.floor(index / 3), col = index % 3, targetRow = Math.floor(position / 3), targetCol = position % 3;
      return Math.abs(row - targetRow) + Math.abs(col - targetCol) <= 1 ? !value : value;
    }));
    setMoves((value) => value + 1);
  }
  function reset() { setBoard(initialBoard); setMoves(0); }
  return <ArcadeCard t={t} kicker="Tiny logic puzzle" title="Circuit Flip" detail="Power every node. A press flips its neighbors too." action={<button onClick={reset} style={button(t)}>{solved ? "New board" : "Reset"}</button>}>
    <div style={{ minHeight: 280, display: "grid", placeItems: "center", borderRadius: 10, background: "#101714", border: "1px solid rgba(118,166,143,.2)", padding: 24 }}>
      <div style={{ width: "min(230px, 100%)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>{board.map((on, index) => <button key={index} onClick={() => flip(index)} aria-label={`Circuit node ${index + 1}`} style={{ aspectRatio: 1, borderRadius: 10, border: `1px solid ${on ? "#7ae5b2" : "#34443c"}`, background: on ? "#61d69e" : "#1a241e", boxShadow: on ? "0 0 20px rgba(97,214,158,.55)" : "none", cursor: solved ? "default" : "pointer" }} />)}</div>
      <div style={{ color: solved ? "#78e2ae" : "#a9b9af", fontSize: 12, fontWeight: 750, letterSpacing: ".04em", marginTop: 18 }}>{solved ? `GRID ONLINE · ${moves} MOVES` : `MOVES ${moves}`}</div>
    </div>
  </ArcadeCard>;
}

function ArcadeCard({ t, kicker, title, detail, action, children }) {
  return <article style={{ ...panel(t), padding: "clamp(18px, 3vw, 26px)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", marginBottom: 18 }}><div><div style={{ color: t.green, fontSize: 10, fontWeight: 850, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 7 }}>{kicker}</div><h2 style={{ margin: 0, color: t.text, fontSize: 24, letterSpacing: "-.04em" }}>{title}</h2><p style={{ margin: "7px 0 0", color: t.textMid, fontSize: 13, lineHeight: 1.5 }}>{detail}</p></div>{action}</div>{children}
  </article>;
}

export function ArcadePage() {
  const { t } = useTheme();
  return <div style={{ padding: "clamp(40px,7vw,88px) 0 clamp(64px,9vw,120px)", maxWidth: 1120 }}>
    <div style={{ borderLeft: `2px solid ${t.green}`, paddingLeft: 10, marginBottom: 24 }}><span style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".1em", textTransform: "uppercase" }}>Experimental arcade</span></div>
    <h1 style={{ fontSize: "clamp(42px,6vw,70px)", fontWeight: 800, color: t.text, lineHeight: .98, letterSpacing: "-.06em", margin: "0 0 16px" }}>Small games.<br />No homework.</h1>
    <p style={{ maxWidth: 570, fontSize: 17, color: t.textMid, lineHeight: 1.65, marginBottom: 36 }}>A set of quick, self-contained games made for a few good minutes in the browser. No installs, accounts, or giant tutorial screens.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 14 }}><ReactorRush t={t} /><SignalSprint t={t} /><CircuitFlip t={t} /></div>
  </div>;
}
