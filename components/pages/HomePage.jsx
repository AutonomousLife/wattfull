"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ToolTile } from "@/components/ui/ToolTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { STATE_DATA, zipToState } from "@/lib/data";

const EnergyProfile = dynamic(
  () => import("@/components/widgets/EnergyProfileV2").then((mod) => mod.EnergyProfileV2),
  { ssr: false, loading: () => null }
);

const TOOLS = [
  {
    icon: "Zap",
    title: "EV Calculator",
    desc: "ZIP-based electricity rates, EPA vehicle efficiency, climate zones, and state incentives. Every assumption shown and editable.",
    href: "/ev",
    featured: true,
    cta: "Start with EV savings",
    chips: ["ZIP-based rates", "Climate adjusted", "State incentives", "5-year projection"],
  },
  { icon: "Sun", title: "Solar ROI", desc: "Roof, production, incentives, and payback logic in one flow.", href: "/solar" },
  { icon: "BatteryCharging", title: "Home Charging", desc: "Level 1 vs Level 2 economics, install assumptions, and charger fit.", href: "/charging" },
  { icon: "Battery", title: "Battery Preview", desc: "Backup runtime, TOU value, and resilience-first battery economics.", href: "/battery" },
  { icon: "GitCompare", title: "Compare", desc: "Separate purchase cost, operating cost, and total ownership cost.", href: "/compare" },
  { icon: "Map", title: "State Grades", desc: "50 states ranked by incentives, economics, and grid context.", href: "/states" },
  { icon: "Plug", title: "What Can I Run?", desc: "Match appliances to a power station with realistic runtime context.", href: "/runtime" },
  { icon: "Leaf", title: "Carbon Impact", desc: "Visualize lifetime emissions savings for your vehicle and region.", href: "/carbon" },
  { icon: "ShoppingBag", title: "Gear Reviews", desc: "Review chargers, solar gear, and backup products without the spam.", href: "/gear" },
  { icon: "Link", title: "Referrals", desc: "Community-curated referral links that go through approval first.", href: "/referrals" },
];

const START_PATHS = [
  {
    eyebrow: "Best first tool",
    title: "Should I buy an EV?",
    desc: "Run the flagship calculator with local rates, driving mix, incentives, and a plain-language verdict.",
    href: "/ev",
    icon: "Zap",
    stat: "Operating or buying view",
    note: "Best if you know your ZIP and annual miles.",
  },
  {
    eyebrow: "Homeowner path",
    title: "Is solar worth it here?",
    desc: "Estimate payback, 25-year savings, and incentive effects without pretending every roof is identical.",
    href: "/solar",
    icon: "Sun",
    stat: "Payback and lifetime savings",
    note: "Best if you know monthly kWh and roof constraints.",
  },
  {
    eyebrow: "Decision support",
    title: "Which option is smarter overall?",
    desc: "Use the compare flow when you need purchase price, annual cost, and long-term ownership separated cleanly.",
    href: "/compare",
    icon: "GitCompare",
    stat: "Purchase vs operating cost",
    note: "Best if you are actively comparing two vehicles or setups.",
  },
];

const TRUST_SIGNALS = [
  { label: "Electricity", value: "EIA rates", note: "Live when available, fallback when not", icon: "Database" },
  { label: "Vehicles", value: "EPA efficiency", note: "Per-mile math stays transparent", icon: "Car" },
  { label: "Methodology", value: "Open formulas", note: "Every major assumption is visible", icon: "Eye" },
  { label: "Positioning", value: "Independent analysis", note: "Built to explain tradeoffs, not hide them", icon: "Shield" },
];

const PLATFORM_STATS = [
  { value: "50", label: "states covered", icon: "Map" },
  { value: "33K+", label: "ZIP contexts", icon: "MapPin" },
  { value: "7K+", label: "rate records", icon: "Database" },
  { value: "8", label: "core tools", icon: "Zap" },
];

const USE_CASES = [
  {
    title: "Apartment driver deciding if EV ownership still works",
    body: "Public charging changes the math fast. Wattfull keeps charging mix explicit so the verdict stays honest.",
    accent: "#4A7C59",
    bg: "#E6EFE9",
    darkBg: "#1A2E20",
    href: "/charging",
    tag: "Charging practicality",
  },
  {
    title: "Cold-climate buyer comparing two vehicles before purchasing",
    body: "Purchase price, climate penalties, and annual mileage can reverse the result. The compare flow shows where that happens.",
    accent: "#4A6FA5",
    bg: "#EEF3FA",
    darkBg: "#1A2230",
    href: "/compare",
    tag: "Ownership decision",
  },
  {
    title: "Homeowner checking if solar payback is real or wishful",
    body: "Solar is strongest when incentives, roof use, and utility economics line up. This is where ROI framing matters more than installer hype.",
    accent: "#C97B2A",
    bg: "#FFF8EF",
    darkBg: "#2A2218",
    href: "/solar",
    tag: "Home energy economics",
  },
  {
    title: "State-to-state economics shift that changes the answer",
    body: "The exact same car can be a smart buy in one state and marginal in another. Rates, fuel prices, and incentives move the verdict.",
    accent: "#7C3AED",
    bg: "#F3E8FF",
    darkBg: "#1E1030",
    href: "/states",
    tag: "Regional context",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Start with your location and use case",
    desc: "ZIP code, annual miles, charging mix, and ownership horizon define the economic context before any verdict is shown.",
    icon: "MapPin",
  },
  {
    step: "02",
    title: "Run the actual cost math",
    desc: "Wattfull separates purchase cost, operating cost, and total ownership cost instead of collapsing everything into one headline number.",
    icon: "Calculator",
  },
  {
    step: "03",
    title: "Show the assumptions clearly",
    desc: "Rates, efficiency, climate adjustments, and incentives are shown so you can see what is driving the result.",
    icon: "FileSearch",
  },
  {
    step: "04",
    title: "Point to the next best action",
    desc: "Every tool should leave you with a verdict, caveats, and a sensible next step instead of a dead end.",
    icon: "ArrowRightCircle",
  },
];

const WHY_WATTFULL = [
  {
    title: "Built to answer expensive questions",
    body: "The platform is designed around purchases and operating decisions that actually matter: EVs, solar, charging, batteries, and equipment.",
    icon: "Wallet",
  },
  {
    title: "Transparent by default",
    body: "It is obvious where the estimate comes from, what is live vs fallback, and which assumptions could change the answer.",
    icon: "Eye",
  },
  {
    title: "Practical, not generic",
    body: "The goal is not content volume or generic AI chatter. The goal is to help you choose with more confidence and less noise.",
    icon: "Compass",
  },
];

function QuickLink({ href, label, icon, t }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        borderRadius: "999px",
        textDecoration: "none",
        color: t.textMid,
        background: t.white,
        border: `1px solid ${t.borderLight}`,
        boxShadow: t.shadowMd,
        fontSize: 12,
        fontWeight: 650,
      }}
    >
      <Icon name={icon} size={14} color={t.green} strokeWidth={2} />
      {label}
    </a>
  );
}

function HeroPreview({ zip }) {
  const { t } = useTheme();
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
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: t.white,
          border: `1px solid ${t.border}`,
          borderTop: `2px solid ${t.green}`,
          borderRadius: "var(--r-lg)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Zap" size={15} color="#fff" strokeWidth={2.25} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".09em", textTransform: "uppercase" }}>Field estimate</div>
              <div style={{ fontSize: 13, fontWeight: 750, color: t.text, marginTop: 3 }}>EV vs gas baseline</div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 750, color: t.textLight, letterSpacing: ".06em", textTransform: "uppercase" }}>
            {hasLoc ? `${st} context` : "US average"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: t.textFaint, textTransform: "uppercase", letterSpacing: ".08em" }}>Model Y vs RAV4 / 12k mi/yr</span>
          <span style={{ fontSize: 11, fontWeight: 750, color: t.green, minWidth: 62, textAlign: "right" }}>EV</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.textLight, minWidth: 62, textAlign: "right" }}>Gas</span>
        </div>
        <div style={{ height: 1, background: t.borderLight, marginBottom: 10 }} />

        {[
          { label: "Fuel per year", ev: evFuel, gas: iceFuel },
          { label: "Maintenance per year", ev: 600, gas: 1100 },
        ].map((row) => (
          <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "6px 0" }}>
            <span style={{ fontSize: 13, color: t.textMid }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.green, minWidth: 72, textAlign: "right" }}>${row.ev.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: t.textLight, minWidth: 72, textAlign: "right" }}>${row.gas.toLocaleString()}</span>
          </div>
        ))}

        <div style={{ margin: "16px 0 12px", padding: "12px 0 12px 14px", borderLeft: `2px solid ${annSav > 0 ? t.green : t.warn}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".09em", color: annSav > 0 ? t.green : t.warn, marginBottom: 4 }}>Annual delta</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Estimated annual savings</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 850, color: annSav > 0 ? t.green : t.warn, letterSpacing: "-.03em" }}>
              {annSav > 0 ? `+$${annSav.toLocaleString()}` : `-$${Math.abs(annSav).toLocaleString()}`}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
          <div style={{ background: t.card, borderRadius: "var(--r-md)", padding: "10px 12px", border: `1px solid ${t.borderLight}` }}>
            <div style={{ fontSize: 10, color: t.textLight, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>5-year savings</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: t.text }}>{annSav > 0 ? `+$${(annSav * 5).toLocaleString()}` : "-"}</div>
          </div>
          <div style={{ background: t.card, borderRadius: "var(--r-md)", padding: "10px 12px", border: `1px solid ${t.borderLight}` }}>
            <div style={{ fontSize: 10, color: t.textLight, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>Break-even</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: t.text }}>{breakEven && breakEven < 20 ? `~${breakEven.toFixed(1)} yrs` : "-"}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.borderLight}` }}>
          <span style={{ fontSize: 11, color: t.textLight }}>Rates: <b style={{ color: t.text }}>{e}¢/kWh</b></span>
          <span style={{ fontSize: 11, color: t.textLight }}>Gas: <b style={{ color: t.text }}>{hasLoc ? `$${g.toFixed(2)}` : "$3.40"}/gal</b></span>
          <span style={{ fontSize: 11, color: t.textLight }}>Inputs shown in full tool</span>
        </div>
      </div>
    </div>
  );
}

function StartCard({ item, t }) {
  return (
    <GlassCard variant="outlined" padding={22} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, borderTop: `2px solid ${t.green}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".09em", textTransform: "uppercase" }}>
          {item.eyebrow}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={item.icon} size={19} color={t.green} strokeWidth={1.75} />
        </div>
      </div>
      <div style={{ fontSize: 21, fontWeight: 800, color: t.text, lineHeight: 1.2, letterSpacing: "-.025em" }}>{item.title}</div>
      <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, flex: 1 }}>{item.desc}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, paddingTop: 12, borderTop: `1px solid ${t.borderLight}` }}>{item.stat}</div>
      <div style={{ fontSize: 12, color: t.textLight }}>{item.note}</div>
      <GlassButton href={item.href} variant="secondary" size="sm" iconAfter="ArrowRight">
        Open this path
      </GlassButton>
    </GlassCard>
  );
}

function TrustRow({ t }) {
  return (
    <div style={{ margin: "0 clamp(-48px,-4vw,-16px)", padding: "34px clamp(16px,4vw,48px)", background: t.bg2, borderTop: `1px solid ${t.borderLight}`, borderBottom: `1px solid ${t.borderLight}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="wf-trust-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, alignItems: "start" }}>
          <GlassCard variant="outlined" padding={22}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 750, letterSpacing: ".08em", textTransform: "uppercase", color: t.green, marginBottom: 5 }}>Why this feels different</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.text, letterSpacing: "-.025em" }}>Clear assumptions, source-backed numbers, practical verdicts</div>
              </div>
              <GlassButton href="/methodology" variant="ghost" size="sm" iconAfter="ArrowRight">See methodology</GlassButton>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
              {TRUST_SIGNALS.map((signal) => (
                <div key={signal.label} style={{ background: t.card, borderRadius: "var(--r-lg)", padding: "14px 14px 13px", border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: t.greenGlass, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={signal.icon} size={15} color={t.green} strokeWidth={1.75} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em" }}>{signal.label}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: t.text, marginBottom: 4 }}>{signal.value}</div>
                  <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.55 }}>{signal.note}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div style={{ display: "grid", gap: 10 }}>
            {PLATFORM_STATS.map((item) => (
              <GlassCard key={item.label} variant="glass" padding={18}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={item.icon} size={18} color={t.green} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 850, color: t.text, letterSpacing: "-.03em", lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>{item.label}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UseCaseCard({ item, t, dark }) {
  return (
    <GlassCard variant="flat" padding={0} style={{ background: dark ? item.darkBg : item.bg, borderRadius: "var(--r-xl)", border: `1px solid ${t.borderLight}`, height: "100%" }}>
      <div style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: item.accent, textTransform: "uppercase", letterSpacing: ".06em" }}>
          {item.tag}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.text, lineHeight: 1.24, letterSpacing: "-.025em" }}>{item.title}</div>
        <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.65, flex: 1 }}>{item.body}</div>
        <GlassButton href={item.href} variant="ghost" size="sm" iconAfter="ArrowRight">Explore this use case</GlassButton>
      </div>
    </GlassCard>
  );
}

function WhyCard({ item, t }) {
  return (
    <GlassCard variant="outlined" padding={20} style={{ height: "100%" }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: t.greenGlass, border: `1px solid ${t.featuredBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon name={item.icon} size={20} color={t.green} strokeWidth={1.75} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 750, color: t.text, marginBottom: 8, letterSpacing: "-.015em" }}>{item.title}</div>
      <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.65 }}>{item.body}</div>
    </GlassCard>
  );
}

export function HomePage() {
  const router = useRouter();
  const { t, advanced, toggleAdvanced } = useTheme();
  const [heroZip, setHeroZip] = useState("");
  const [zipFocused, setZipFocused] = useState(false);

  const goToEV = () => {
    const q = heroZip ? `?zip=${heroZip}` : "";
    router.push(`/ev${q}`);
  };

  return (
    <div>
      <section className="wf-home-hero" style={{ padding: "clamp(44px,7vw,88px) 0 clamp(42px,5vw,64px)", position: "relative", borderBottom: `1px solid ${t.borderLight}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(28px,5vw,64px)", flexWrap: "wrap", position: "relative" }}>
          <div style={{ flex: "1 1 54%", minWidth: 300, maxWidth: 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingLeft: 10, borderLeft: `2px solid ${t.green}`, marginBottom: 26 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="Shield" size={11} color="#fff" strokeWidth={2.25} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.green }}>Independent analysis · Transparent assumptions</span>
            </div>
            <h1 style={{ fontSize: "clamp(42px,6vw,68px)", fontWeight: 800, color: t.text, lineHeight: 0.98, letterSpacing: "-.06em", maxWidth: 620, marginBottom: 20 }}>
              Know the cost before you commit.
            </h1>
            <p style={{ fontSize: "clamp(15px,1.8vw,17px)", color: t.textMid, lineHeight: 1.65, maxWidth: 520, marginBottom: 22 }}>
              EV ownership, solar payback, and charging economics — source-backed data and plain-language verdicts.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              {["Local rates", "Ownership cost", "Payback"].map((label) => (
                <span key={label} style={{ fontSize: 11, fontWeight: 750, color: t.textLight, letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, maxWidth: 500, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px", minWidth: 0, position: "relative", display: "flex", alignItems: "center", background: t.white, border: `1px solid ${zipFocused ? t.green : t.border}`, borderRadius: "var(--r-md)", boxShadow: zipFocused ? `0 0 0 3px ${t.green}22` : "none", transition: "border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)" }}>
                <div style={{ paddingLeft: 14, flexShrink: 0 }}>
                  <Icon name="MapPin" size={16} color={zipFocused ? t.green : t.textLight} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  autoComplete="postal-code"
                  aria-label="ZIP code"
                  placeholder="Enter ZIP code"
                  maxLength={5}
                  value={heroZip}
                  onChange={(e) => setHeroZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  onKeyDown={(e) => e.key === "Enter" && goToEV()}
                  onFocus={() => setZipFocused(true)}
                  onBlur={() => setZipFocused(false)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontWeight: 650, color: t.text, padding: "13px 14px 13px 10px" }}
                />
              </div>
              <GlassButton variant="primary" size="md" iconAfter="ArrowRight" onClick={goToEV}>Check EV costs</GlassButton>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <GlassButton variant="ghost" size="sm" href="/solar" icon="Sun">Solar ROI</GlassButton>
              <GlassButton variant="ghost" size="sm" href="/compare" icon="GitCompare">Compare options</GlassButton>
              {advanced ? <GlassButton variant="ghost" size="sm" href="/states" icon="Map">State grades</GlassButton> : null}
            </div>
          </div>
          <div style={{ flex: "1 1 38%", minWidth: 300, maxWidth: 460 }}>
            <HeroPreview zip={heroZip} />
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(38px,5vw,68px) 0 0" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.green, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Choose your question</div>
            <h2 style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 780, color: t.text, lineHeight: 1.08, letterSpacing: "-.045em" }}>Start where the decision is.</h2>
          </div>
          {!advanced ? <GlassButton variant="ghost" size="sm" iconAfter="ArrowRight" onClick={toggleAdvanced}>See all tools</GlassButton> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {START_PATHS.map((item) => <StartCard key={item.href} item={item} t={t} />)}
        </div>
      </section>

      {advanced ? (
      <>
      <section id="tools" style={{ padding: "clamp(36px,4vw,56px) 0 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14 }}>All tools</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
          {TOOLS.map((tool) => <ToolTile key={tool.href} {...tool} />)}
        </div>
      </section>

      <section id="trust" style={{ padding: "clamp(36px,4vw,56px) 0 0" }}>
        <GlassCard variant="featured" padding={22}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.green, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Founder note</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, lineHeight: 1.2, letterSpacing: "-.03em", marginBottom: 10 }}>Most calculators hide the assumptions that actually decide the outcome.</div>
              <div style={{ fontSize: 14, color: t.textMid, lineHeight: 1.7 }}>Whether an EV or solar setup makes sense depends on local rates, usage, incentives, and ownership horizon. Wattfull makes those drivers visible.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              <StatPill icon="Database" value="EIA · EPA · NREL data" variant="green" />
              <StatPill icon="Eye" value="Transparent math" variant="glass" />
              <StatPill icon="Shield" value="Independent" variant="glass" />
            </div>
          </div>
        </GlassCard>
      </section>
      </>
      ) : null}

    </div>
  );
}
