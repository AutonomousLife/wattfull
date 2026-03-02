"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line,
} from "recharts";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Sun,
  Battery,
  TrendingDown,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Star,
  Leaf,
  DollarSign,
  Clock,
  BarChart3,
  CheckCircle,
  Award,
  Globe,
  ChevronUp,
} from "lucide-react";

const C = {
  bg: "#FAFAF8",
  bgAlt: "#F4F3F0",
  white: "#FFFFFF",
  text: "#2D2D2D",
  textMid: "#5A5A5A",
  textLight: "#8A8A8A",
  green: "#5B8C6A",
  greenLight: "#E8F0EA",
  greenDark: "#3D6B4A",
  border: "#E8E6E2",
  borderLight: "#F0EEEA",
  warm: "#F7F6F3",
  accent: "#C4D4C8",
};

const evSavingsData = [
  { year: "Year 1", ev: 1200, gas: 3800 },
  { year: "Year 2", ev: 2400, gas: 7700 },
  { year: "Year 3", ev: 3600, gas: 11800 },
  { year: "Year 4", ev: 4800, gas: 16000 },
  { year: "Year 5", ev: 6000, gas: 20400 },
  { year: "Year 7", ev: 8500, gas: 29500 },
  { year: "Year 10", ev: 12200, gas: 42000 },
];
const solarROIData = [
  { year: 0, savings: 0, cost: 18500 },
  { year: 1, savings: 1850, cost: 18500 },
  { year: 3, savings: 5550, cost: 18500 },
  { year: 5, savings: 9250, cost: 18500 },
  { year: 7, savings: 12950, cost: 18500 },
  { year: 8, savings: 14800, cost: 18500 },
  { year: 10, savings: 18500, cost: 18500 },
  { year: 15, savings: 27750, cost: 18500 },
  { year: 20, savings: 37000, cost: 18500 },
  { year: 25, savings: 46250, cost: 18500 },
];
const priceHistoryData = [
  { month: "Jan '24", price: 42500 },
  { month: "Mar", price: 41800 },
  { month: "May", price: 40200 },
  { month: "Jul", price: 39800 },
  { month: "Sep", price: 38500 },
  { month: "Nov", price: 37200 },
  { month: "Jan '25", price: 36800 },
  { month: "Mar", price: 35900 },
  { month: "May", price: 35100 },
  { month: "Jul", price: 36200 },
  { month: "Sep", price: 34800 },
  { month: "Nov", price: 33500 },
  { month: "Jan '26", price: 32800 },
];
const wattScoreData = [
  { subject: "Capacity", A: 92, fullMark: 100 },
  { subject: "Value/Watt", A: 85, fullMark: 100 },
  { subject: "Longevity", A: 88, fullMark: 100 },
  { subject: "Env. Impact", A: 94, fullMark: 100 },
  { subject: "Efficiency", A: 90, fullMark: 100 },
  { subject: "Reliability", A: 87, fullMark: 100 },
];
const stateGrades = [
  { state: "California", ev: "A", solar: "A+", grid: "B+", utility: "B" },
  { state: "Texas", ev: "B−", solar: "A", grid: "C+", utility: "B−" },
  { state: "New York", ev: "A−", solar: "B+", grid: "B", utility: "C+" },
  { state: "Florida", ev: "B", solar: "A", grid: "C", utility: "B" },
  { state: "Colorado", ev: "A−", solar: "A−", grid: "B+", utility: "B+" },
  { state: "Arizona", ev: "B+", solar: "A+", grid: "C+", utility: "B−" },
];
const crowdsourcedData = [
  { month: "Jan", solar: 72, range: 68 },
  { month: "Feb", solar: 78, range: 71 },
  { month: "Mar", solar: 85, range: 82 },
  { month: "Apr", solar: 91, range: 89 },
  { month: "May", solar: 95, range: 94 },
  { month: "Jun", solar: 98, range: 96 },
  { month: "Jul", solar: 100, range: 98 },
  { month: "Aug", solar: 97, range: 97 },
  { month: "Sep", solar: 90, range: 92 },
  { month: "Oct", solar: 82, range: 85 },
  { month: "Nov", solar: 74, range: 74 },
  { month: "Dec", solar: 68, range: 65 },
];

type ChildrenProps = { children: ReactNode };
type PillProps = { children: ReactNode; active?: boolean };
type GradeBadgeProps = { grade: string };
type TooltipPayloadItem = { name?: string; value?: number | string; color?: string };
type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  prefix?: string;
  suffix?: string;
};

const SectionLabel = ({ children }: ChildrenProps) => (
  <span
    style={{
      color: C.green,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

const SectionTitle = ({ children }: ChildrenProps) => (
  <h2
    style={{
      fontSize: "clamp(28px, 4vw, 42px)",
      fontWeight: 700,
      color: C.text,
      lineHeight: 1.15,
      margin: "12px 0 0",
    }}
  >
    {children}
  </h2>
);

const SectionDesc = ({ children }: ChildrenProps) => (
  <p
    style={{
      fontSize: "clamp(16px, 2vw, 19px)",
      color: C.textMid,
      lineHeight: 1.7,
      margin: "16px 0 0",
      maxWidth: 620,
    }}
  >
    {children}
  </p>
);

const Pill = ({ children, active }: PillProps) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 16px",
      borderRadius: 100,
      fontSize: 13,
      fontWeight: 600,
      background: active ? C.green : C.bgAlt,
      color: active ? "#fff" : C.textMid,
      cursor: "pointer",
      transition: "all 0.2s",
    }}
  >
    {children}
  </span>
);

const GradeBadge = ({ grade }: GradeBadgeProps) => {
  const isA = grade.startsWith("A");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        background: isA ? C.greenLight : C.bgAlt,
        color: isA ? C.greenDark : C.textMid,
      }}
    >
      {grade}
    </span>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: p.color || C.text,
            margin: "4px 0 0",
          }}
        >
          {p.name}: {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {suffix}
        </p>
      ))}
    </div>
  );
};

export default function WattfullSite() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [zip, setZip] = useState("");
  const [vehicle, setVehicle] = useState("Tesla Model 3");
  const [activeSection, setActiveSection] = useState("");
  const [email, setEmail] = useState("");
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 40);
      setShowBackTop(window.scrollY > 800);
      const sections = ["tools", "ev", "solar", "score", "prices", "states", "community", "verified"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top < 300 && r.bottom > 300) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenu(false);
  }, []);

  const navItems = [
    { label: "Tools", id: "tools" },
    { label: "Reviews", id: "score" },
    { label: "State Reports", id: "states" },
    { label: "Research", id: "community" },
    { label: "About", id: "verified" },
  ];

  const containerStyle = { maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px)" };
  const sectionPad = { padding: "clamp(60px, 10vw, 120px) 0" };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(250,250,248,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.borderLight}` : "1px solid transparent",
        }}
      >
        <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Zap size={22} color={C.green} strokeWidth={2.5} />
            <span style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Wattfull</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="nav-desktop" style={{ display: "flex", gap: 28 }}>
              {navItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    color: activeSection === n.id ? C.green : C.textMid,
                    transition: "color 0.2s",
                    padding: 0,
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="nav-mobile-btn"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.text,
                padding: 4,
                display: "none",
              }}
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
            <div style={containerStyle}>
              {navItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "12px 0",
                    fontSize: 16,
                    fontWeight: 500,
                    color: C.text,
                    cursor: "pointer",
                    borderBottom: `1px solid ${C.borderLight}`,
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ ...sectionPad, paddingTop: "clamp(80px, 14vw, 160px)", paddingBottom: "clamp(60px, 10vw, 120px)" }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 780 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.greenLight, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <Leaf size={14} color={C.green} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.greenDark }}>Independent & Unbiased</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 800,
                lineHeight: 1.08,
                color: C.text,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Independent Sustainable
              <br />
              Energy Intelligence.
            </h1>

            <p style={{ fontSize: "clamp(17px, 2.5vw, 21px)", color: C.textMid, lineHeight: 1.65, marginTop: 24, maxWidth: 580 }}>
              Built for people making the biggest purchases of their lives — and who don't want to get it wrong.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 40 }}>
              <button
                onClick={() => scrollTo("ev")}
                style={{
                  background: C.green,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 2px 12px rgba(91,140,106,0.25)",
                }}
              >
                Run the Numbers <ArrowRight size={16} />
              </button>

              <button
                onClick={() => scrollTo("tools")}
                style={{
                  background: "transparent",
                  color: C.text,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Explore Tools
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 20,
              marginTop: 72,
              paddingTop: 48,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {[
              { n: "47", l: "States Covered", i: <MapPin size={18} /> },
              { n: "12K+", l: "Zip Codes Modeled", i: <Globe size={18} /> },
              { n: "850+", l: "Utility Rates Tracked", i: <Zap size={18} /> },
              { n: "98%", l: "Accuracy Rate", i: <CheckCircle size={18} /> },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: C.green, marginBottom: 8 }}>{s.i}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{s.n}</div>
                <div style={{ fontSize: 13, color: C.textLight, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS OVERVIEW */}
      <section id="tools" style={{ background: C.white, ...sectionPad }}>
        <div style={containerStyle}>
          <SectionLabel>Platform Tools</SectionLabel>
          <SectionTitle>Everything you need, nothing you don't.</SectionTitle>
          <SectionDesc>Real data. Real rates. Real results. No national averages, no guesswork.</SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 56 }}>
            {[
              { icon: <Zap size={24} />, title: "EV Savings Calculator", desc: "State-by-state calculations using real electricity rates, gas prices, and all active incentives.", link: "ev" },
              { icon: <Sun size={24} />, title: "Solar ROI Tools", desc: "Zip-specific modeling with real utility rates and actual roof considerations. No averages.", link: "solar" },
              { icon: <Star size={24} />, title: "Wattfull Score", desc: "Our proprietary rating: capacity, value per watt, longevity, and environmental impact.", link: "score" },
              { icon: <TrendingDown size={24} />, title: "Price Tracking", desc: "Interactive price history with clear 'Best Time to Buy' indicators.", link: "prices" },
              { icon: <MapPin size={24} />, title: "State Report Cards", desc: "Quarterly grades for EV infrastructure, solar incentives, grid cleanliness, and more.", link: "states" },
              { icon: <Users size={24} />, title: "Real-World Data", desc: "Crowdsourced solar output, winter EV range, and battery degradation from real owners.", link: "community" },
            ].map((t, i) => (
              <div
                key={i}
                onClick={() => scrollTo(t.link)}
                style={{
                  padding: 32,
                  borderRadius: 16,
                  border: `1px solid ${C.borderLight}`,
                  background: C.bg,
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.borderLight;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.green }}>
                  {t.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 20, color: C.text }}>{t.title}</h3>
                <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.6, marginTop: 8 }}>{t.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16, fontSize: 14, fontWeight: 600, color: C.green }}>
                  Explore <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EV CALCULATOR */}
      <section id="ev" style={{ ...sectionPad, borderTop: `1px solid ${C.border}` }}>
        <div style={containerStyle}>
          <SectionLabel>EV Savings Calculator</SectionLabel>
          <SectionTitle>See what you'd actually save.</SectionTitle>
          <SectionDesc>Not hypothetical savings. Your zip code. Your electricity rate. Your gas prices. Every active incentive.</SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginTop: 48 }}>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 8 }}>Your Zip Code</label>
                  <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "0 16px", background: C.white }}>
                    <MapPin size={16} color={C.textLight} />
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 90210"
                      style={{ border: "none", outline: "none", padding: "14px 12px", fontSize: 15, width: "100%", background: "transparent", color: C.text }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 8 }}>Select Vehicle</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      style={{
                        width: "100%",
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "14px 16px",
                        fontSize: 15,
                        background: C.white,
                        color: C.text,
                        appearance: "none",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {["Tesla Model 3", "Tesla Model Y", "Chevy Bolt EUV", "Ford Mustang Mach-E", "Hyundai Ioniq 5", "Rivian R1S", "BMW iX"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} color={C.textLight} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <button
                  style={{
                    background: C.green,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 24px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 4,
                    boxShadow: "0 2px 12px rgba(91,140,106,0.2)",
                  }}
                >
                  Calculate My Savings
                </button>
              </div>

              <div style={{ marginTop: 32, padding: 24, background: C.greenLight, borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDark, marginBottom: 16 }}>10-Year Projection</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.textMid }}>EV Total Cost</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.greenDark }}>$12,200</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: C.textMid }}>Gas Total Cost</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>$42,000</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, padding: "12px 16px", background: C.white, borderRadius: 10 }}>
                  <div style={{ fontSize: 13, color: C.textMid }}>Your Estimated Savings</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.green }}>$29,800</div>
                </div>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.borderLight}`, padding: "28px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 24 }}>Cumulative Fuel Costs: EV vs Gas</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={evSavingsData}>
                  <defs>
                    <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.textLight} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={C.textLight} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.textLight }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                  <Area type="monotone" dataKey="gas" stroke={C.textLight} strokeWidth={2} fill="url(#gasGrad)" name="Gas" />
                  <Area type="monotone" dataKey="ev" stroke={C.green} strokeWidth={2.5} fill="url(#evGrad)" name="EV" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 24, marginTop: 16, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 3, borderRadius: 2, background: C.green }} />
                  <span style={{ fontSize: 12, color: C.textMid }}>EV Fuel Cost</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 3, borderRadius: 2, background: C.textLight }} />
                  <span style={{ fontSize: 12, color: C.textMid }}>Gas Fuel Cost</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLAR ROI */}
      <section id="solar" style={{ background: C.white, ...sectionPad }}>
        <div style={containerStyle}>
          <SectionLabel>Solar ROI Tools</SectionLabel>
          <SectionTitle>Your roof. Your rates. Your return.</SectionTitle>
          <SectionDesc>Zip-specific solar modeling with real utility rates. See your actual break-even point and lifetime savings.</SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginTop: 48 }}>
            <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.borderLight}`, padding: "28px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 24 }}>Solar Investment vs. Cumulative Savings</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={solarROIData}>
                  <defs>
                    <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: C.textLight }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Years", position: "insideBottom", offset: -5, style: { fontSize: 12, fill: C.textLight } }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: C.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                  <Line type="monotone" dataKey="cost" stroke={C.textLight} strokeWidth={2} strokeDasharray="6 4" dot={false} name="Investment" />
                  <Area type="monotone" dataKey="savings" stroke={C.green} strokeWidth={2.5} fill="url(#savGrad)" name="Savings" />
                </AreaChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 12,
                  padding: "8px 16px",
                  background: C.greenLight,
                  borderRadius: 8,
                  width: "fit-content",
                  margin: "12px auto 0",
                }}
              >
                <CheckCircle size={14} color={C.green} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.greenDark }}>Break-even at ~10 years</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: <DollarSign size={20} />, title: "Real Utility Rates", desc: "We pull your actual utility rate — not a national average that means nothing." },
                { icon: <Sun size={20} />, title: "Roof-Specific Modeling", desc: "Orientation, shading, pitch — all factored into your personalized estimate." },
                { icon: <Clock size={20} />, title: "Break-Even Timeline", desc: "A clear, honest timeline showing exactly when solar starts paying you back." },
                { icon: <BarChart3 size={20} />, title: "25-Year Projection", desc: "See the full lifetime value of your system, including degradation." },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: 20, borderRadius: 14, border: `1px solid ${C.borderLight}`, background: C.bg }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{f.title}</div>
                    <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.55, marginTop: 4 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WATTFULL SCORE */}
      <section id="score" style={{ ...sectionPad, borderTop: `1px solid ${C.border}` }}>
        <div style={containerStyle}>
          <SectionLabel>Wattfull Score™</SectionLabel>
          <SectionTitle>One score. Six dimensions. No shortcuts.</SectionTitle>
          <SectionDesc>Our proprietary rating system evaluates every product across the metrics that actually matter.</SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginTop: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={wattScoreData} cx="50%" cy="50%">
                  <PolarGrid stroke={C.borderLight} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: C.textMid }} />
                  <Radar name="Score" dataKey="A" stroke={C.green} fill={C.green} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.greenDark }}>89</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Overall Wattfull Score</div>
                  <div style={{ fontSize: 13, color: C.textMid }}>Tesla Model 3 Long Range</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Score Comparison</div>
              <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.bgAlt }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Vehicle</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Score</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Value</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Life</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Tesla Model 3 LR", score: 89, value: "A", life: "A" },
                      { name: "Hyundai Ioniq 5", score: 86, value: "A−", life: "B+" },
                      { name: "Chevy Bolt EUV", score: 83, value: "A+", life: "B" },
                      { name: "Ford Mach-E", score: 81, value: "B+", life: "B+" },
                      { name: "BMW iX xDrive", score: 78, value: "B", life: "A−" },
                    ].map((v, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                        <td style={{ padding: "14px 16px", fontWeight: 600, color: C.text }}>{v.name}</td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: v.score >= 85 ? C.greenLight : C.bgAlt,
                              color: v.score >= 85 ? C.greenDark : C.textMid,
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {v.score}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid }}>{v.value}</td>
                        <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid }}>{v.life}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICE TRACKING */}
      <section id="prices" style={{ background: C.white, ...sectionPad }}>
        <div style={containerStyle}>
          <SectionLabel>Price History</SectionLabel>
          <SectionTitle>Know when to buy.</SectionTitle>
          <SectionDesc>Track real transaction prices over time. Our algorithm identifies the best windows to purchase.</SectionDesc>

          <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.borderLight}`, padding: "28px 24px", marginTop: 48 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Tesla Model 3 — Average Transaction Price</div>
                <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>Jan 2024 – Jan 2026</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.greenLight, borderRadius: 8 }}>
                <TrendingDown size={14} color={C.green} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.greenDark }}>Best Time to Buy: Now</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={priceHistoryData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textLight }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textLight }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Area type="monotone" dataKey="price" stroke={C.green} strokeWidth={2.5} fill="url(#priceGrad)" name="Price" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* STATE REPORT CARDS */}
      <section id="states" style={{ ...sectionPad, borderTop: `1px solid ${C.border}` }}>
        <div style={containerStyle}>
          <SectionLabel>State Report Cards</SectionLabel>
          <SectionTitle>How does your state stack up?</SectionTitle>
          <SectionDesc>Quarterly updated grades across EV infrastructure, solar incentives, grid cleanliness, and utility friendliness.</SectionDesc>

          <div style={{ marginTop: 48, border: `1px solid ${C.borderLight}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 500 }}>
                <thead>
                  <tr style={{ background: C.bgAlt }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: C.textMid, fontSize: 12 }}>State</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>EV Infra.</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Solar</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Grid</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: C.textMid, fontSize: 12 }}>Utility</th>
                  </tr>
                </thead>
                <tbody>
                  {stateGrades.map((s, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: `1px solid ${C.borderLight}`, cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.warm)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: C.text }}>{s.state}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <GradeBadge grade={s.ev} />
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <GradeBadge grade={s.solar} />
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <GradeBadge grade={s.grid} />
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <GradeBadge grade={s.utility} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ fontSize: 12, color: C.textLight, marginTop: 16 }}>Last updated: Q4 2025 · Next update: Q1 2026</p>
        </div>
      </section>

      {/* CROWDSOURCED DATA */}
      <section id="community" style={{ background: C.white, ...sectionPad }}>
        <div style={containerStyle}>
          <SectionLabel>Real-World Data</SectionLabel>
          <SectionTitle>From real owners. Not press releases.</SectionTitle>
          <SectionDesc>Crowdsourced solar output, winter EV range, and battery degradation data from thousands of verified owners.</SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginTop: 48 }}>
            <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.borderLight}`, padding: "28px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Seasonal Performance</div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 24 }}>% of rated capacity by month (owner-reported)</div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={crowdsourcedData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textLight }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.textLight }} axisLine={false} tickLine={false} domain={[50, 105]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Bar dataKey="solar" fill={C.green} name="Solar Output" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="range" fill={C.accent} name="EV Range" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: C.green }} />
                  <span style={{ fontSize: 12, color: C.textMid }}>Solar Output</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
                  <span style={{ fontSize: 12, color: C.textMid }}>EV Range</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { metric: "Avg Winter Range Loss", value: "27%", detail: "Based on 4,200+ owner reports in sub-30°F conditions", trend: "down" },
                { metric: "Avg Solar Output vs Rated", value: "89%", detail: "12,800+ systems reporting across 38 states", trend: "up" },
                { metric: "5-Year Battery Degradation", value: "8.2%", detail: "Median across all tracked EVs with 50k+ miles", trend: "stable" },
              ].map((d, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 14, border: `1px solid ${C.borderLight}`, background: C.bg }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{d.metric}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginTop: 4 }}>{d.value}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.5, marginTop: 8 }}>{d.detail}</div>
                </div>
              ))}

              <div style={{ padding: 16, borderRadius: 12, background: C.greenLight, display: "flex", alignItems: "center", gap: 12 }}>
                <Users size={18} color={C.green} />
                <span style={{ fontSize: 14, color: C.greenDark, fontWeight: 600 }}>18,400+ verified contributors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED BADGE */}
      <section id="verified" style={{ ...sectionPad, borderTop: `1px solid ${C.border}` }}>
        <div style={containerStyle}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: C.greenLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
              }}
            >
              <ShieldCheck size={36} color={C.green} strokeWidth={2} />
            </div>

            <SectionLabel>Wattfull Verified</SectionLabel>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTitle>Personally tested. Independently reviewed.</SectionTitle>
            </div>

            <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: C.textMid, lineHeight: 1.7, marginTop: 20, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
              Every product with the Wattfull Verified badge has been physically tested by our team using standardized methodology. No sponsored placements. No affiliate influence on ratings.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 40 }}>
              {[
                { icon: <Battery size={20} />, label: "Hands-on testing" },
                { icon: <Award size={20} />, label: "Standardized methodology" },
                { icon: <ShieldCheck size={20} />, label: "Zero affiliate bias" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 20, borderRadius: 14, background: C.white, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ color: C.green }}>{b.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.text, padding: "clamp(48px, 8vw, 80px) 0" }}>
        <div style={{ ...containerStyle, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: C.white, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Start making smarter energy decisions.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", marginTop: 16, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Free tools. Real data. No sales pitch.
          </p>
          <button
            onClick={() => scrollTo("ev")}
            style={{
              background: C.green,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 32,
              boxShadow: "0 4px 20px rgba(91,140,106,0.35)",
            }}
          >
            Run the Numbers
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: "48px 0 36px" }}>
        <div style={containerStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Zap size={20} color={C.green} strokeWidth={2.5} />
                <span style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Wattfull</span>
              </div>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, maxWidth: 280 }}>
                Independent sustainable energy intelligence for consumers who do their homework.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>Platform</div>
              {["EV Calculator", "Solar ROI", "Wattfull Score", "Price Tracking", "State Reports"].map((l) => (
                <div key={l} style={{ fontSize: 14, color: C.textMid, marginBottom: 10, cursor: "pointer" }}>
                  {l}
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>Stay Informed</div>
              <p style={{ fontSize: 14, color: C.textMid, marginBottom: 12, lineHeight: 1.5 }}>Weekly insights. No spam. Ever.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{
                    flex: 1,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    background: C.white,
                    color: C.text,
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  style={{
                    background: C.green,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: C.textLight }}>© 2026 Wattfull. All rights reserved.</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textMid, fontStyle: "italic", letterSpacing: "-0.01em" }}>
              Don't be wasteful. Be <span style={{ color: C.green }}>Wattfull</span>.
            </div>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: C.white,
            border: `1px solid ${C.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            zIndex: 50,
          }}
        >
          <ChevronUp size={20} color={C.text} />
        </button>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
        * { box-sizing: border-box; margin: 0; }
        ::selection { background: ${C.greenLight}; color: ${C.greenDark}; }
        input::placeholder { color: ${C.textLight}; }
        html { scroll-behavior: smooth; }
        table { table-layout: auto; }
      `}</style>
    </div>
  );
}