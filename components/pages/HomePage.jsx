"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { AnimCount, FadeIn, Reveal } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ToolTile } from "@/components/ui/ToolTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { STATE_DATA, zipToState } from "@/lib/data";
const EnergyProfile = dynamic(() => import("@/components/widgets/EnergyProfileV2").then((mod) => mod.EnergyProfileV2), { ssr: false, loading: () => null });

const TOOLS = [
  {
    icon: "Zap",
    title: "EV Calculator",
    desc: "ZIP-based electricity rates, EPA vehicle efficiency, climate zones, and state incentives. Every assumption shown and editable.",
    href: "/ev",
    featured: true,
    cta: "Calculate My Savings",
    chips: ["ZIP-based rates", "Climate adjusted", "State incentives", "5-yr projection"],
  },
  { icon: "Sun", title: "Solar ROI", desc: "Your roof, sun-hours, and incentives. 25-year payback projection.", href: "/solar" },
  { icon: "BatteryCharging", title: "Home Charging", desc: "Level 1 vs Level 2 economics, install assumptions, and charger fit.", href: "/charging" },
  { icon: "Battery", title: "Battery Preview", desc: "Backup runtime, TOU value, and resilience-first battery economics.", href: "/battery" },
  { icon: "GitCompare", title: "Compare", desc: "Side-by-side total cost of ownership - EV vs gas, 6 financial sections.", href: "/compare" },
  { icon: "Map", title: "State Grades", desc: "50 states ranked by grid cleanliness, incentives, and EV friendliness.", href: "/states" },
  { icon: "Plug", title: "What Can I Run?", desc: "Pick a power station, check which appliances it can power.", href: "/runtime" },
  { icon: "Leaf", title: "Carbon Impact", desc: "Visualize lifetime emissions savings for your specific vehicle.", href: "/carbon" },
  { icon: "ShoppingBag", title: "Gear Reviews", desc: "Honest reviews of EVs, solar panels, and portable power stations.", href: "/gear" },
  { icon: "Link", title: "Referral Links", desc: "Community-curated codes for Tesla, solar installs, and more.", href: "/referrals" },
];

const INSIGHTS = [
  { icon: "Zap", title: "Charging can feel like $1-1.50 per gallon equivalent", body: "In most US states, electricity makes EV fuel far cheaper per mile than gas. Your exact number depends on local rates.", color: "#4A7C59", bg: "#E6EFE9", darkBg: "#1A2E20", wide: false },
  { icon: "Sun", title: "Solar often pays back in 6-10 years", body: "Average US homeowners can recoup solar investment in under a decade. The long-term net gain can be substantial after that payback point.", color: "#C97B2A", bg: "#FFF8EF", darkBg: "#2A2218", wide: true },
  { icon: "Wrench", title: "EVs avoid a lot of maintenance", body: "No oil changes, no timing belt, no transmission service. Annual maintenance often runs a few hundred dollars lower than gas.", color: "#4A6FA5", bg: "#EEF3FA", darkBg: "#1A2230", wide: false },
  { icon: "MapPin", title: "Your ZIP code changes the math", body: "Moving from a high-electricity to a low-electricity state can double or erase EV fuel savings.", color: "#7C3AED", bg: "#F3E8FF", darkBg: "#1E1030", wide: false },
  { icon: "DollarSign", title: "Tax credits can shorten payback", body: "For qualifying buyers, federal and state incentives can materially improve EV or solar economics.", color: "#059669", bg: "#D1FAE5", darkBg: "#064E3B", wide: false },
  { icon: "Leaf", title: "EV emissions still depend on the grid", body: "Cleaner grids strengthen the carbon case, but EVs still tend to outperform gas on lifetime emissions in most contexts.", color: "#16A34A", bg: "#DCFCE7", darkBg: "#052E16", wide: true },
];

function HeroPreview({ zip }) {
  const { t, dark } = useTheme();
  const st = zip.length === 5 ? zipToState(zip) : null;
  const d = st ? STATE_DATA[st] : null;

  const e = d?.e ?? 16;
  const g = d?.g ?? 3.4;
  const mi = 12000;
  const evFuel = Math.round(0.28 * mi * (e / 100));
  const iceFuel = Math.round((mi / 30) * g);
  const annSav = iceFuel + 1100 - (evFuel + 600);
  const breakEven = annSav > 0 ? (42490 - 27600 - 7500) / annSav : null;
  const hasLoc = zip.length === 5 && !!st;

  return (
    <div style={{ position: "relative", paddingBottom: 28 }}>
      <div
        style={{
          background: dark ? "rgba(28,28,32,0.88)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: `1px solid ${t.glassBorder}`,
          borderRadius: "var(--r-xl)",
          padding: "22px 24px",
          boxShadow: t.shadowXl,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 100, background: "radial-gradient(ellipse at 100% 0%, rgba(74,124,89,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Zap" size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>EV vs Gas preview</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: t.green, background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, borderRadius: "var(--r-md)", padding: "2px 8px" }}>
            {hasLoc ? st : "US avg"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: ".05em" }}>Model Y vs RAV4 | 12k mi/yr</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: t.green, minWidth: 62, textAlign: "right" }}>EV</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: t.textLight, minWidth: 62, textAlign: "right" }}>Gas</span>
        </div>
        <div style={{ height: 1, background: t.borderLight, marginBottom: 6 }} />

        {[
          { label: "Fuel/yr", ev: evFuel, gas: iceFuel },
          { label: "Maint/yr", ev: 600, gas: 1100 },
        ].map((row) => (
          <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "4px 0" }}>
            <span style={{ fontSize: 12, color: t.textMid }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 650, color: t.green, minWidth: 62, textAlign: "right" }}>${row.ev.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: t.textLight, minWidth: 62, textAlign: "right" }}>${row.gas.toLocaleString()}</span>
          </div>
        ))}

        <div style={{ height: 1, background: t.borderLight, margin: "10px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "var(--r-md)", background: annSav > 0 ? t.greenGlass : t.warnBg, border: `1px solid ${annSav > 0 ? t.featuredBorder : "#F0C060"}`, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: annSav > 0 ? t.green : t.warn }}>Annual savings</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: annSav > 0 ? t.green : t.warn, letterSpacing: "-.025em" }}>
            {annSav > 0 ? `+$${annSav.toLocaleString()}` : `-$${Math.abs(annSav).toLocaleString()}`}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "5-Year Savings", val: annSav > 0 ? `+$${(annSav * 5).toLocaleString()}` : "-" },
            { label: "Break-Even", val: breakEven && breakEven < 20 ? `~${breakEven.toFixed(1)} yrs` : "-" },
          ].map((s) => (
            <div key={s.label} style={{ background: t.card, borderRadius: "var(--r-md)", padding: "8px 12px" }}>
              <div style={{ fontSize: 10, color: t.textLight, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: "-.02em" }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, fontSize: 10, color: t.textFaint }}>
          EIA rates | EPA efficiency | {hasLoc ? `${e} cents/kWh` : "16 cents/kWh avg"} | {hasLoc ? `$${g.toFixed(2)}/gal` : "$3.40/gal avg"}
        </div>
      </div>

      <div style={{ position: "absolute", top: -12, right: 18 }}>
        <StatPill icon="RefreshCw" value="Feb 2025" variant="glass" size="sm" />
      </div>
      <div style={{ position: "absolute", bottom: 4, left: 16 }}>
        <StatPill icon="Zap" value={`${e} cents/kWh`} variant="green" size="md" />
      </div>
      {hasLoc && (
        <div style={{ position: "absolute", bottom: 4, right: 16 }}>
          <StatPill icon="MapPin" value={st} variant="glass" size="md" />
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const router = useRouter();
  const { t, dark } = useTheme();
  const [heroZip, setHeroZip] = useState("");
  const [zipFocused, setZipFocused] = useState(false);

  const goToEV = () => {
    const q = heroZip ? `?zip=${heroZip}` : "";
    router.push(`/ev${q}`);
  };

  return (
    <div>
      <section className="wf-motif" style={{ padding: "clamp(52px,8vw,96px) 0 clamp(56px,8vw,80px)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: dark ? "radial-gradient(ellipse at 70% 30%, rgba(106,175,123,0.06) 0%, transparent 60%)" : "radial-gradient(ellipse at 70% 30%, rgba(74,124,89,0.07) 0%, transparent 60%)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(32px,5vw,64px)", flexWrap: "wrap", position: "relative" }}>
          <div style={{ flex: "1 1 52%", minWidth: 280 }}>
            <FadeIn>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 10px", borderRadius: "var(--r-xl)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, marginBottom: 24 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="Shield" size={11} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 650, color: t.green }}>Independent | Open Methodology | Real Data</span>
              </div>

              <h1 style={{ fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 800, color: t.text, lineHeight: 1.12, letterSpacing: "-.035em", maxWidth: 580, marginBottom: 18 }}>
                The real numbers on EVs and solar for <span style={{ color: t.green }}>your ZIP code.</span>
              </h1>

              <p style={{ fontSize: "clamp(15px,1.8vw,17px)", color: t.textMid, lineHeight: 1.65, maxWidth: 520, marginBottom: 32 }}>
                EIA electricity rates, EPA vehicle efficiency, NREL solar data, and state incentives. Every assumption is shown. Everything is editable.
              </p>

              <div style={{ display: "flex", gap: 10, maxWidth: 460, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 160px", position: "relative", display: "flex", alignItems: "center", background: t.white, border: `1.5px solid ${zipFocused ? t.green : t.border}`, borderRadius: "var(--r-lg)", boxShadow: zipFocused ? `0 0 0 3px ${t.green}22, ${t.shadowMd}` : t.shadowMd, transition: "border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)" }}>
                  <div style={{ paddingLeft: 14, flexShrink: 0 }}>
                    <Icon name="MapPin" size={16} color={zipFocused ? t.green : t.textLight} strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter ZIP code"
                    maxLength={5}
                    value={heroZip}
                    onChange={(e) => setHeroZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    onKeyDown={(e) => e.key === "Enter" && goToEV()}
                    onFocus={() => setZipFocused(true)}
                    onBlur={() => setZipFocused(false)}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontWeight: 600, color: t.text, padding: "12px 14px 12px 10px" }}
                  />
                </div>
                <GlassButton variant="primary" size="md" iconAfter="ArrowRight" onClick={goToEV}>
                  Calculate
                </GlassButton>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <GlassButton variant="ghost" size="sm" href="/solar" icon="Sun">Solar ROI</GlassButton>
                <GlassButton variant="ghost" size="sm" href="/states" icon="Map">State Grades</GlassButton>
                <GlassButton variant="ghost" size="sm" href="/compare" icon="GitCompare">Compare EVs</GlassButton>
              </div>
            </FadeIn>
          </div>

          <div style={{ flex: "1 1 38%", minWidth: 280, maxWidth: 420 }}>
            <FadeIn delay={120}>
              <HeroPreview zip={heroZip} />
            </FadeIn>
          </div>
        </div>
      </section>

      <div style={{ margin: "0 clamp(-16px,-4vw,-48px)", padding: "30px clamp(16px,4vw,48px)", background: dark ? t.bg2 : t.card, borderTop: `1px solid ${t.borderLight}`, borderBottom: `1px solid ${t.borderLight}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "clamp(24px,5vw,72px)", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { val: 50, suffix: "", label: "States covered", icon: "Map" },
            { val: 33, suffix: "K+", label: "ZIP codes", icon: "MapPin" },
            { val: 7, suffix: "K+", label: "Utility rates", icon: "Database" },
            { val: 8, suffix: "", label: "Free tools", icon: "Zap" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={s.icon} size={18} color={t.green} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: "clamp(22px,2.5vw,28px)", fontWeight: 800, color: t.text, lineHeight: 1, letterSpacing: "-.03em" }}>
                    <AnimCount end={s.val} />{s.suffix}
                  </div>
                  <div style={{ fontSize: 12, color: t.textLight, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <section style={{ padding: "clamp(52px,7vw,80px) 0" }}>
        <SectionHeader eyebrow="TOOLS" title="Things that actually compute" desc="No affiliate bias, no vague estimates. Every calculation uses real data with every assumption visible." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.href} delay={i * 35}>
              <ToolTile {...tool} />
            </Reveal>
          ))}
        </div>
      </section>

      <div style={{ margin: "0 clamp(-16px,-4vw,-48px)", padding: "clamp(52px,7vw,80px) clamp(16px,4vw,48px)", background: dark ? "#14141A" : "#F2F1EE", borderTop: `1px solid ${t.borderLight}`, borderBottom: `1px solid ${t.borderLight}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader eyebrow="INSIGHTS" title="Did you know?" desc="Energy facts that tend to change how people think about the decision." style={{ marginBottom: 28 }} />
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
            <style>{`.wf-insights-row::-webkit-scrollbar{display:none}`}</style>
            {INSIGHTS.map((card, i) => (
              <Reveal key={card.title} delay={i * 45}>
                <div style={{ flexShrink: 0, width: card.wide ? "clamp(260px,34vw,380px)" : "clamp(220px,26vw,290px)", background: dark ? card.darkBg : card.bg, borderRadius: "var(--r-xl)", padding: "22px 22px 20px", scrollSnapAlign: "start", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={card.icon} size={20} color={card.color} strokeWidth={1.75} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.3, letterSpacing: "-.015em" }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6, flex: 1 }}>{card.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <section style={{ padding: "clamp(52px,7vw,80px) 0" }}>
        <SectionHeader eyebrow="METHODOLOGY" title="How we compute the numbers" desc="Every calculation built on public data and transparent formulas." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {[
            { step: "01", icon: "MapPin", title: "ZIP to real rates", desc: "We resolve your ZIP to state, then pull EIA electricity rates and AAA gas prices for that state - not national averages." },
            { step: "02", icon: "Car", title: "EPA efficiency", desc: "Vehicle kWh/100mi and MPG come from fueleconomy.gov. We apply a climate zone penalty based on ASHRAE data." },
            { step: "03", icon: "Calculator", title: "Blended charging cost", desc: "We weight home, public L2, and DC fast charging by your split - each with its own rate and efficiency loss factor." },
            { step: "04", icon: "Eye", title: "Every assumption shown", desc: "Nothing is hidden. Every input, source, and formula is visible and editable. See the full methodology page." },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 60}>
              <GlassCard variant="outlined" padding={20}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".05em", marginBottom: 4 }}>{s.step}</div>
                    <div style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={s.icon} size={20} color={t.green} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 6, letterSpacing: "-.01em" }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <GlassButton variant="secondary" href="/methodology" icon="ExternalLink">Full Methodology -&gt;</GlassButton>
        </div>
      </section>

      <div style={{ margin: "0 clamp(-16px,-4vw,-48px)", padding: "clamp(40px,6vw,64px) clamp(16px,4vw,48px)", background: dark ? t.bg2 : t.card, borderTop: `1px solid ${t.borderLight}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: t.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: `0 4px 16px ${t.green}44` }}>
            <Icon name="Lightbulb" size={24} color="#fff" strokeWidth={1.75} />
          </div>
          <p style={{ fontSize: "clamp(15px,2vw,18px)", color: t.text, lineHeight: 1.7, fontWeight: 450, marginBottom: 16 }}>
            "We built Wattfull because every EV calculator we tried hid its assumptions. Whether an EV saves you money depends entirely on your ZIP code, drive style, and charger mix - not a national average. So we made a tool that shows all of it."
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <StatPill icon="Database" value="Open data" variant="green" />
            <StatPill icon="Eye" value="No black boxes" variant="green" />
          </div>
        </div>
      </div>

      <section style={{ padding: "clamp(40px,6vw,60px) 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <SectionHeader align="center" eyebrow="PROFILE" title="Save once, pre-fill everywhere" desc="Store your ZIP, annual miles, and drive style. Every calculator uses it automatically." style={{ marginBottom: 20 }} />
          <EnergyProfile />
        </div>
      </section>
    </div>
  );
}





