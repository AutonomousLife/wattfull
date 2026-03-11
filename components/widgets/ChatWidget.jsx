"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { STATE_DATA } from "@/lib/data";
import { FAQ } from "@/lib/data/faq";

const SUGGESTIONS = [
  "Is solar worth it in Texas?",
  "How much can I save with an EV?",
  "How does the EV tax credit work?",
  "Best portable power station?",
  "How long does an EV battery last?",
  "What's the cheapest EV to own?",
];

// Search FAQ dataset — returns best match or null
function faqLookup(query) {
  const ql = query.toLowerCase();
  let bestScore = 0;
  let bestAnswer = null;
  for (const entry of FAQ) {
    const score = entry.keywords.filter((k) => ql.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = entry.answer;
    }
  }
  return bestScore >= 2 ? bestAnswer : null;
}

export function ChatWidget({ navigate }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: "Hey! I'm Wattbot. Ask me anything about EVs, solar, or energy savings. Try: \"Is solar worth it in Ohio?\" or \"How does the EV tax credit work?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs, typing]);

  const respond = (q) => {
    const ql = q.toLowerCase();

    // ── Greetings ─────────────────────────────────────────────────────────
    if (/^(hello|hi|hey|howdy|sup|what's up|yo)\b/.test(ql)) {
      return "Hey! I'm Wattbot 👋 Ask me anything about EVs, solar, power stations, or energy costs. Try: \"Is solar worth it in Arizona?\" or \"What's the cheapest EV to own?\"";
    }
    if (ql.includes("thank")) {
      return "Happy to help! Come back anytime — energy decisions are complicated and I'm always here.";
    }

    // ── State-specific solar query ─────────────────────────────────────────
    if (ql.includes("solar") && (ql.includes("worth") || ql.includes("good") || ql.includes("roi") || ql.includes("payback"))) {
      const stMatch = Object.keys(STATE_DATA).find((s) => ql.includes(s.toLowerCase()));
      if (stMatch) {
        const d = STATE_DATA[stMatch];
        const sunRating = d.s >= 5.5 ? "🌟 Excellent" : d.s >= 4.5 ? "✅ Good" : d.s >= 3.5 ? "⚠️ Decent" : "❌ Low";
        return `${sunRating} solar potential in ${stMatch}! ${d.s} peak sun-hours/day, electricity at ${d.e}¢/kWh. ${
          d.nm === "full" ? "Full net metering — great for ROI." : d.nm === "partial" ? "Partial net metering available." : "No net metering, so batteries help."
        }${d.sc > 0 ? ` State solar credit: $${d.sc}.` : ""} Want exact payback numbers? Try our Solar ROI Calculator!`;
      }
    }

    // ── EV savings for a specific state ───────────────────────────────────
    if ((ql.includes("ev") || ql.includes("electric car")) && ql.includes("save")) {
      const stMatch = Object.keys(STATE_DATA).find((s) => ql.includes(s.toLowerCase()));
      if (stMatch) {
        const d = STATE_DATA[stMatch];
        const fuelPerMile = (d.e / 100) * 0.28; // rough: 28 kWh/100mi
        const gasSaveMi   = (d.g / 30) - fuelPerMile;
        const annualSave  = Math.round(gasSaveMi * 12000);
        return `In ${stMatch}, electricity is ${d.e}¢/kWh and gas is $${d.g}/gal. An average EV driver saves roughly $${annualSave.toLocaleString()}/year on fuel.${
          d.ec > 0 ? ` Plus a $${d.ec} state EV incentive!` : ""
        } Use our EV Calculator for your exact vehicle and miles driven.`;
      }
    }

    // ── General state data lookup ──────────────────────────────────────────
    const stateMatch = Object.keys(STATE_DATA).find((s) => ql.includes(s.toLowerCase()));
    if (stateMatch) {
      const d = STATE_DATA[stateMatch];
      return `📍 ${stateMatch} — Electricity: ${d.e}¢/kWh · Gas: $${d.g}/gal · Sun: ${d.s} hrs/day · Climate: ${d.z}. ${
        d.ec > 0 ? `EV state credit: $${d.ec}. ` : "No state EV credit. "
      }${d.nm} net metering. Grid is ${d.gc}% renewable. See full state details on our States page!`;
    }

    // ── Specific vehicle questions ─────────────────────────────────────────
    if (ql.includes("model 3") || ql.includes("model3")) {
      return "The Tesla Model 3 RWD starts at ~$38,990 and gets ~350 miles of range. It's one of the most efficient EVs at 25 kWh/100mi and qualifies for the $7,500 federal tax credit. The Supercharger network is the best in the industry for road trips. Long Range AWD adds range but pushes MSRP toward $45k.";
    }
    if (ql.includes("ioniq 6") || ql.includes("ioniq6")) {
      return "The Hyundai Ioniq 6 is arguably the best value EV for efficiency-focused buyers — 24 kWh/100mi and up to 361 miles of range. 800V ultra-fast charging hits 10–80% in about 18 minutes. Qualifies for federal credit. Starting around $38,615 for the RWD Standard Range.";
    }
    if (ql.includes("chevy bolt") || ql.includes("bolt ev")) {
      return "The Chevy Bolt EV is one of the best deals in EVs — around $26,500 new. After the $7,500 federal credit, effective cost is near $19,000. Gets 259 miles of range with solid efficiency. The limitation: 55 kW DC fast charging (slower than newer EVs). Perfect for daily commuting and city driving.";
    }
    if (ql.includes("f-150 lightning") || ql.includes("f150 lightning") || ql.includes("lightning")) {
      return "The Ford F-150 Lightning starts at ~$49,995 and offers 240–320 miles of range. Its Pro Power Onboard can run a job site or power your home during an outage. Heavy towing reduces range 40–50% — factor this in if you tow frequently.";
    }
    if (ql.includes("rivian") || ql.includes("r1t") || ql.includes("r1s")) {
      return "Rivian's R1T truck and R1S SUV are premium adventure EVs ($68k–$100k+). Exceptional off-road capability and range (300–400+ miles). Rivian's own fast-charging network is expanding. Not eligible for federal tax credit (MSRP too high for car cap). Best for buyers who want truck capability with EV efficiency.";
    }

    // ── Cheapest EV to own ────────────────────────────────────────────────
    if ((ql.includes("cheap") || ql.includes("affordable") || ql.includes("best value")) && (ql.includes("ev") || ql.includes("electric"))) {
      return "The most affordable EVs to own: 1) Chevy Bolt EV (~$19k after federal credit) — best total value. 2) Nissan Leaf (from ~$20k) — reliable, good city car. 3) Tesla Model 3 RWD (~$31k after credit) — best efficiency and range. Used EVs are even cheaper — a 2022 Bolt can be found for $15–18k with minimal battery degradation.";
    }

    // ── Power station recs ────────────────────────────────────────────────
    if (ql.includes("power station") || ql.includes("portable power") || ql.includes("jackery") || ql.includes("ecoflow") || ql.includes("anker solix")) {
      return "Top portable power station picks: 🥇 Anker SOLIX C1000 (~$500 on sale) — best all-around value with LiFePO4 longevity. 🏠 EcoFlow DELTA 2 Max — for home backup with expandable capacity. 🎒 EcoFlow River 3 Plus — ultra-portable for camping. For solar panel pairing, stay within the same brand's ecosystem for easy compatibility. Check our Gear Reviews for full breakdowns!";
    }

    // ── Solar panel recs ──────────────────────────────────────────────────
    if ((ql.includes("solar panel") || ql.includes("portable panel")) && (ql.includes("best") || ql.includes("recommend") || ql.includes("which"))) {
      return "Best portable solar panels: 🥇 Renogy 200W Suitcase — most reliable, works with any station. Jackery SolarSaga 200W — pairs perfectly with Jackery stations. EcoFlow 220W Bifacial — generates power on cloudy days from reflected light. For efficiency in limited space, look for 22%+ mono panels. Two 100W panels often beat one 200W for flexibility.";
    }

    // ── Compare / vs queries ──────────────────────────────────────────────
    if (ql.includes(" vs ") || ql.includes("compare")) {
      return "EV vs gas savings depend heavily on your location — electricity rates, gas prices, and state incentives vary a lot. On average, EV owners save $1,000–2,500/year in fuel + $500–1,500/year in maintenance. Use our Compare page — pick any two vehicles and we'll run the full numbers for your state.";
    }

    // ── Home charging setup ───────────────────────────────────────────────
    if (ql.includes("home charger") || ql.includes("level 2") || (ql.includes("install") && ql.includes("charg"))) {
      return "Home Level 2 charger installation typically costs $800–2,000 total (charger + electrician). ChargePoint Home Flex and Emporia EV Charger are top picks at $300–400. You'll need a 240V/50A circuit — most electricians can add one in a few hours. Many utilities offer $500–1,000 rebates on L2 charger installation.";
    }

    // ── Carbon / environment ──────────────────────────────────────────────
    if (ql.includes("carbon") || ql.includes("emission") || ql.includes("environment") || ql.includes("co2") || ql.includes("green")) {
      return "Even on the average U.S. grid (~42% renewable), an EV produces roughly half the lifetime CO₂ of a gas car. In states like Washington, Vermont, or California with cleaner grids, EVs cut emissions by 70–80%. As the grid gets cleaner each year, your EV gets greener automatically — a gas car can never improve.";
    }

    // ── Tax credit / incentive questions ─────────────────────────────────
    if (ql.includes("tax credit") || ql.includes("$7500") || ql.includes("7500") || ql.includes("incentive") || ql.includes("rebate")) {
      return "The federal EV tax credit is up to $7,500 (new EVs) or $4,000 (used EVs). Key limits: income ≤$150k single / $300k joint, MSRP ≤$55k cars / $80k trucks, and North American final assembly required. You can now take it as an instant discount at the dealer (since 2024) instead of waiting for tax season. Check fueleconomy.gov for eligible vehicles.";
    }

    // ── FAQ keyword search ────────────────────────────────────────────────
    const faqAnswer = faqLookup(q);
    if (faqAnswer) return faqAnswer;

    // ── Default ───────────────────────────────────────────────────────────
    return "I can help with: EV savings by state, solar ROI, power station recommendations, charging setup, battery lifespan, federal tax credits, and more. Try asking something like \"How much would I save with a Tesla in Florida?\" or \"Is solar worth it in Ohio?\"";
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
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask Wattbot — energy Q&A assistant"
        title="Ask Wattbot"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          height: 44,
          borderRadius: 22,
          padding: "0 18px 0 12px",
          background: t.green,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "-.01em",
          boxShadow: `0 4px 20px ${t.shadow}`,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: 7,
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${t.shadow}`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 20px ${t.shadow}`; }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        <span>Ask Wattbot</span>
      </button>
    );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 380,
        maxWidth: "calc(100vw - 48px)",
        height: 500,
        maxHeight: "calc(100vh - 100px)",
        background: t.white,
        border: `1px solid ${t.borderLight}`,
        borderRadius: 16,
        boxShadow: `0 8px 40px ${t.shadow}`,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${t.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: t.green,
          color: "#fff",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>⚡ Wattbot</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Powered by your data, not GPT</div>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
        >
          ✕
        </button>
      </div>

      <div
        ref={ref}
        style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.from === "user" ? t.green : t.card,
              color: m.from === "user" ? "#fff" : t.text,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "10px 14px",
              borderRadius: "14px 14px 14px 4px",
              background: t.card,
              display: "flex",
              gap: 4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: t.textLight,
                  animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        {msgs.length === 1 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.white,
                  color: t.textMid,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${t.borderLight}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about EVs, solar, energy…"
          style={{
            flex: 1,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            background: t.bg,
            color: t.text,
            outline: "none",
          }}
        />
        <button
          onClick={send}
          style={{
            background: t.green,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
