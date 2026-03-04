"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";

const SUGGESTIONS = [
  "Is solar worth it in Texas?",
  "Compare Tesla Model 3 vs Camry",
  "Best power station for camping?",
  "How much can I save with an EV?",
];

export function ChatWidget({ navigate }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Hey! I'm Wattbot. Ask me anything about EVs, solar, or energy savings. Try: \"Is solar worth it in Ohio?\" or \"Compare Tesla Model 3 vs Camry\"" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs, typing]);

  const respond = (q) => {
    const ql = q.toLowerCase();
    if (ql.includes("solar") && (ql.includes("worth") || ql.includes("good"))) {
      const stMatch = Object.keys(STATE_DATA).find((s) => ql.includes(s.toLowerCase()));
      if (stMatch) {
        const d = STATE_DATA[stMatch];
        return `In ${stMatch}, you get about ${d.s} sun-hours/day with electricity at ${d.e}¢/kWh. ${d.s >= 5 ? "That's excellent solar potential!" : d.s >= 4 ? "Decent solar potential." : "Solar is possible but not ideal."} ${d.nm === "full" ? "Full net metering helps a lot." : d.nm === "partial" ? "Partial net metering available." : "No net metering unfortunately."} ${d.sc > 0 ? `Plus a $${d.sc} state credit!` : ""} Want exact numbers? Try our Solar ROI Calculator!`;
      }
      return "I can check solar potential for any state! Just mention the state, like 'Is solar worth it in Texas?' Or jump into our Solar ROI Calculator for exact numbers based on your ZIP.";
    }
    if (ql.includes("compare") || ql.includes("vs") || (ql.includes("ev") && ql.includes("save"))) {
      return "Great question! EV savings depend heavily on your location — electricity rates, gas prices, and available incentives vary by state. On average, EV owners save $1,000-2,500/year in fuel costs. Our EV Calculator uses your ZIP code for exact numbers. Want me to walk you through it?";
    }
    if (ql.includes("power station") || ql.includes("battery") || ql.includes("portable power")) {
      return "For power stations, the Anker SOLIX C1000 is our top pick for most people — great value at ~$500 on sale with LiFePO4 longevity. Need home backup? EcoFlow DELTA 2 Max. Ultra-portable? EcoFlow River 3 Plus at 7.8 lbs. Check our Gear Reviews for detailed breakdowns!";
    }
    const stateMatch = Object.keys(STATE_DATA).find((s) => ql.includes(s.toLowerCase()));
    if (stateMatch) {
      const d = STATE_DATA[stateMatch];
      return `${stateMatch}: Electricity ${d.e}¢/kWh, gas $${d.g}/gal, ${d.s} sun-hrs/day, ${d.z} climate. ${d.ec > 0 ? `EV incentive: $${d.ec}.` : "No state EV incentive."} ${d.nm} net metering. Grid is ${d.gc}% renewable.`;
    }
    if (ql.includes("hello") || ql.includes("hi") || ql.includes("hey"))
      return "Hey there! What energy question can I help with? I know about EVs, solar panels, power stations, and state-by-state energy data.";
    if (ql.includes("thank")) return "You're welcome! Feel free to ask anything else about energy savings.";
    return "I can help with: EV savings estimates, solar panel ROI, power station recommendations, and state energy data. Try asking something like 'What are electricity rates in California?' or 'Which power station should I buy?'";
  };

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs((p) => [...p, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((p) => [...p, { from: "bot", text: respond(q) }]);
    }, 400 + Math.random() * 400);
  };

  if (!open)
    return (
      <button onClick={() => setOpen(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, background: t.green, color: "#fff", border: "none", cursor: "pointer", fontSize: 24, boxShadow: `0 4px 20px ${t.shadow}`, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s" }}>
        ⚡
      </button>
    );

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, width: 380, maxWidth: "calc(100vw - 48px)", height: 500, maxHeight: "calc(100vh - 100px)", background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 16, boxShadow: `0 8px 40px ${t.shadow}`, zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: t.green, color: "#fff" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>⚡ Wattbot</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Powered by your data, not GPT</div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.from === "user" ? t.green : t.card, color: m.from === "user" ? "#fff" : t.text, fontSize: 13, lineHeight: 1.5 }}>
            {m.text}
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: t.card, display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: t.textLight, animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        )}
        {msgs.length === 1 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setInput(s); }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.white, color: t.textMid, cursor: "pointer", transition: "all .15s" }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: 12, borderTop: `1px solid ${t.borderLight}`, display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about EVs, solar, energy..." style={{ flex: 1, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, background: t.bg, color: t.text, outline: "none" }} />
        <button onClick={send} style={{ background: t.green, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Send</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
