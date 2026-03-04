"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { Stars, AnimCount, FadeIn } from "@/components/ui";
import { SOLAR_PANELS, POWER_STATIONS } from "@/lib/data";
import { NewsletterForm } from "@/components/widgets/NewsletterForm";
import { EnergyProfile } from "@/components/widgets/EnergyProfile";
import { idToHref } from "@/lib/routes";

// Static "Did you know?" insight cards — mix of general & calculation-driven facts
const INSIGHT_CARDS = [
  {
    icon: "⚡",
    title: "Charging vs. filling up",
    body: "In most US states, charging an EV costs the equivalent of paying ~$1.00–1.50/gallon for gas.",
  },
  {
    icon: "☀️",
    title: "Solar payback",
    body: "The average US homeowner recoups their solar installation cost in 6–10 years — then gets free electricity for 15+ more.",
  },
  {
    icon: "🔧",
    title: "Maintenance advantage",
    body: "EVs have ~17 moving parts vs. ~2,000 for a gas engine. Annual service costs run $300–500 less on average.",
  },
  {
    icon: "🗺️",
    title: "Location matters most",
    body: "Moving from a high-electricity state to a low-electricity state can double your EV fuel savings.",
  },
  {
    icon: "💰",
    title: "Federal credit opportunity",
    body: "The IRA's $7,500 EV tax credit can cut break-even time from 5 years down to 2–3 for qualifying buyers.",
  },
  {
    icon: "🌿",
    title: "Grid cleanliness varies",
    body: "An EV in Vermont (100% renewable grid) emits ~90% less lifetime CO₂ than gas. In West Virginia (8% renewable) it's still ~30% less.",
  },
];

const TOOLS = [
  { icon: "⚡", title: "EV Calculator", desc: "ZIP-based electricity, gas, climate, incentives.", cta: "ev" },
  { icon: "☀️", title: "Solar ROI", desc: "Your roof, rates, sun. 25-year projections.", cta: "solar" },
  { icon: "🛒", title: "Gear Reviews", desc: "Honest pros, cons, and real quirks.", cta: "marketplace" },
  { icon: "🔄", title: "Compare", desc: "Side-by-side EVs and power stations.", cta: "compare" },
  { icon: "🔋", title: "What Can I Run?", desc: "Pick a station, check appliances.", cta: "runtime" },
  { icon: "🌍", title: "Carbon Impact", desc: "Visualize your environmental savings.", cta: "carbon" },
  { icon: "🗺️", title: "State Grades", desc: "50 states graded on energy policy.", cta: "states" },
  { icon: "🔗", title: "Referral Links", desc: "Community codes for Tesla, solar & more.", cta: "referrals" },
];

export function HomePage() {
  const router = useRouter();
  const { t } = useTheme();
  const [heroZip, setHeroZip] = useState("");
  const [heroMi, setHeroMi] = useState("");

  function goToEV() {
    const params = new URLSearchParams();
    if (heroZip) params.set("zip", heroZip);
    router.push(`/ev${params.toString() ? "?" + params.toString() : ""}`);
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ padding: "clamp(48px,10vw,100px) 0 clamp(40px,8vw,72px)" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 55%", minWidth: 280 }}>
              <div style={{ maxWidth: 660 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: t.greenLight, borderRadius: 100, padding: "5px 14px", marginBottom: 24 }}>
                  <span style={{ fontSize: 14 }}>🌱</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.greenDark }}>Independent & Unbiased</span>
                </div>
                <h1 style={{ fontSize: "clamp(32px,5.5vw,52px)", fontWeight: 800, lineHeight: 1.1, color: t.text, letterSpacing: "-0.03em" }}>
                  Energy decisions are<br />expensive. <span style={{ color: t.green }}>Get them right.</span>
                </h1>
                <p style={{ fontSize: "clamp(16px,2vw,19px)", color: t.textMid, lineHeight: 1.65, marginTop: 20, maxWidth: 500 }}>
                  Real calculators with real data. Every assumption visible. Every number computed, not guessed.
                </p>

                {/* Quick EV calculator entry */}
                <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${t.border}`, borderRadius: 12, background: t.white, overflow: "hidden", flex: "1 1 120px" }}>
                      <span style={{ paddingLeft: 12, color: t.textLight, fontSize: 14 }}>📍</span>
                      <input
                        value={heroZip}
                        onChange={(e) => setHeroZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        onKeyDown={(e) => { if (e.key === "Enter") goToEV(); }}
                        placeholder="ZIP code"
                        maxLength={5}
                        inputMode="numeric"
                        style={{ border: "none", outline: "none", padding: "13px 10px", fontSize: 15, background: "transparent", color: t.text, width: 110 }}
                      />
                    </div>
                    <button
                      onClick={goToEV}
                      style={{
                        background: t.green, color: "#fff", border: "none", borderRadius: 12,
                        padding: "13px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                        transition: "transform .1s, box-shadow .1s", flex: "1 1 auto",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,.35)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      Run EV Savings →
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href="/solar"
                      style={{ background: "transparent", color: t.text, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", flex: 1, textAlign: "center", transition: "border-color .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.green + "88"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
                    >
                      Solar ROI →
                    </Link>
                    <Link
                      href="/states"
                      style={{ background: "transparent", color: t.text, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", flex: 1, textAlign: "center", transition: "border-color .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.green + "88"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
                    >
                      State Map →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero image / Energy Profile */}
            <div style={{ flex: "1 1 30%", minWidth: 240, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 400, aspectRatio: "4/3", borderRadius: 20, overflow: "hidden", background: t.greenLight }}>
                <Image
                  src="/images/hero-ev.jpg"
                  alt="Electric vehicle charging"
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 0px, 400px"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 64 }}>⚡</span>
                  <span style={{ fontSize: 13, color: t.green, fontWeight: 600 }}>Clean Energy Tools</span>
                </div>
              </div>
              <EnergyProfile />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Stats ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 16, paddingBottom: 56, borderBottom: `1px solid ${t.border}` }}>
        {[
          { n: 50, s: " states", l: "Full coverage" },
          { n: 12847, s: "", l: "ZIP codes" },
          { n: 850, s: "+", l: "Utility rates" },
          { n: 8, s: "", l: "Free tools" },
        ].map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28 }}>
                <AnimCount end={s.n} suffix={s.s} duration={1400} />
              </div>
              <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>{s.l}</div>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── Tools Grid ── */}
      <section style={{ padding: "56px 0", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Tools</div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, color: t.text, marginBottom: 28 }}>Things that actually compute</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {TOOLS.map((tool, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <Link
                href={idToHref(tool.cta)}
                style={{ padding: 20, border: `1px solid ${t.borderLight}`, borderRadius: 14, cursor: "pointer", background: t.white, transition: "all .2s", textDecoration: "none", display: "block" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.green + "66";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.borderLight;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>{tool.title}</h3>
                <p style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>{tool.desc}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Did You Know — Insight Cards ── */}
      <section style={{ padding: "56px 0", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Insights</div>
        <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: t.text, marginBottom: 8 }}>Did you know?</h2>
        <p style={{ fontSize: 14, color: t.textMid, marginBottom: 28 }}>Energy facts that change how people think about EVs and solar.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {INSIGHT_CARDS.map((card, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div
                style={{
                  padding: "18px 20px",
                  background: t.white,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: 14,
                  transition: "transform .2s, box-shadow .2s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{card.body}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Quick Picks ── */}
      <section style={{ padding: "40px 0", borderBottom: `1px solid ${t.border}` }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 20 }}>Quick Picks</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {[SOLAR_PANELS[0], POWER_STATIONS[0], SOLAR_PANELS[2]].map((p) => (
            <Link
              key={p.id + p.name}
              href="/gear"
              style={{ padding: 20, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, cursor: "pointer", transition: "transform .2s", textDecoration: "none", display: "block" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textLight, textTransform: "uppercase" }}>{p.brand}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginTop: 4 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <Stars n={p.rating} />
                <span style={{ fontSize: 12, color: t.textLight }}>({p.reviews.toLocaleString()})</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.green, marginTop: 6 }}>${p.price}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "56px 0", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Methodology</div>
        <h2 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: t.text, marginBottom: 8 }}>How Wattfull works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginTop: 24 }}>
          {[
            { step: "1", title: "Real location data", body: "Electricity rates from EIA, gas prices from state datasets, all updated regularly." },
            { step: "2", title: "Honest assumptions", body: "Every assumption is visible. Override any number. Nothing hidden, nothing optimistic." },
            { step: "3", title: "Sensitivity analysis", body: "See what changes your verdict — electricity thresholds, mileage impact, incentive effect." },
            { step: "4", title: "Clear verdict", body: "Not just numbers — a plain-English verdict with reasons, so you can actually decide." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: t.greenLight,
                  color: t.green, fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{item.body}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/methodology" style={{ fontSize: 13, color: t.green, fontWeight: 600, textDecoration: "none" }}>
            Full methodology →
          </Link>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section style={{ padding: "64px 0" }}>
        <NewsletterForm />
      </section>
    </div>
  );
}
