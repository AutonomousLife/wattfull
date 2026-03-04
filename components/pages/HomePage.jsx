"use client";
import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/lib/ThemeContext";
import { Stars, AnimCount, FadeIn } from "@/components/ui";
import { SOLAR_PANELS, POWER_STATIONS } from "@/lib/data";
import { NewsletterForm } from "@/components/widgets/NewsletterForm";

export function HomePage({ navigate }) {
  const { t } = useTheme();
  const [heroZip, setHeroZip] = useState("");

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "clamp(48px,10vw,100px) 0 clamp(40px,8vw,72px)" }}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ flex: "1 1 60%" }}>
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
                <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${t.border}`, borderRadius: 12, background: t.white, overflow: "hidden" }}>
                    <span style={{ paddingLeft: 14, color: t.textLight, fontSize: 14 }}>📍</span>
                    <input
                      value={heroZip}
                      onChange={(e) => setHeroZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      onKeyDown={(e) => { if (e.key === "Enter") navigate("ev", heroZip); }}
                      placeholder="Your ZIP code"
                      maxLength={5}
                      inputMode="numeric"
                      style={{ border: "none", outline: "none", padding: "13px 12px", fontSize: 15, background: "transparent", color: t.text, width: 130 }}
                    />
                  </div>
                  <button onClick={() => navigate("ev", heroZip)} style={{ background: t.green, color: "#fff", border: "none", borderRadius: 12, padding: "13px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    Run EV Savings →
                  </button>
                  <button onClick={() => navigate("solar")} style={{ background: "transparent", color: t.text, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "13px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                    Solar ROI →
                  </button>
                </div>
              </div>
            </div>
            {/* 📷 Hero image — add /public/images/hero-ev.jpg (recommended: 720×540 WebP).
                Until then, a styled placeholder is shown. */}
            <div style={{ flex: "1 1 35%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 420, aspectRatio: "4/3", borderRadius: 20, overflow: "hidden", background: t.greenLight }}>
                <Image
                  src="/images/hero-ev.jpg"
                  alt="Electric vehicle charging"
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 0px, 420px"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                {/* Fallback visible when image is missing */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 72 }}>⚡</span>
                  <span style={{ fontSize: 13, color: t.green, fontWeight: 600 }}>Clean Energy</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Stats */}
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

      {/* Tools Grid */}
      <section style={{ padding: "56px 0", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Tools</div>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, color: t.text, marginBottom: 28 }}>Things that actually compute</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {[
            { icon: "⚡", title: "EV Calculator", desc: "ZIP-based electricity, gas, climate, incentives.", cta: "ev" },
            { icon: "☀️", title: "Solar ROI", desc: "Your roof, rates, sun. 25-year projections.", cta: "solar" },
            { icon: "🛒", title: "Gear Reviews", desc: "Honest pros, cons, and real quirks.", cta: "marketplace" },
            { icon: "🔄", title: "Compare", desc: "Side-by-side EVs and power stations.", cta: "compare" },
            { icon: "🔋", title: "What Can I Run?", desc: "Pick a station, check appliances.", cta: "runtime" },
            { icon: "🌍", title: "Carbon Impact", desc: "Visualize your environmental savings.", cta: "carbon" },
            { icon: "🗺️", title: "State Grades", desc: "50 states graded on energy policy.", cta: "states" },
            { icon: "🔗", title: "Referral Links", desc: "Community codes for Tesla, solar & more.", cta: "referrals" },
          ].map((tool, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div
                onClick={() => navigate(tool.cta)}
                style={{ padding: 20, border: `1px solid ${t.borderLight}`, borderRadius: 14, cursor: "pointer", background: t.white, transition: "all .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.green + "66"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>{tool.title}</h3>
                <p style={{ fontSize: 13, color: t.textMid, lineHeight: 1.5 }}>{tool.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Quick Picks */}
      <section style={{ padding: "40px 0", borderBottom: `1px solid ${t.border}` }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 20 }}>Quick Picks</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {[SOLAR_PANELS[0], POWER_STATIONS[0], SOLAR_PANELS[2]].map((p) => (
            <div
              key={p.id + p.name}
              onClick={() => navigate("marketplace")}
              style={{ padding: 20, background: t.white, border: `1px solid ${t.borderLight}`, borderRadius: 14, cursor: "pointer", transition: "transform .2s" }}
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
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: "64px 0" }}>
        <NewsletterForm />
      </section>
    </div>
  );
}
