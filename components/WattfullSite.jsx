"use client";
<<<<<<< ours
import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { HomePage } from "@/components/pages/HomePage";
import { EVCalcPage } from "@/components/pages/EVCalcPage";
import { SolarCalcPage } from "@/components/pages/SolarCalcPage";
import { MarketplacePage } from "@/components/pages/MarketplacePage";
import { ComparePage } from "@/components/pages/ComparePage";
import { WhatCanIRunPage } from "@/components/pages/WhatCanIRunPage";
import { CarbonPage } from "@/components/pages/CarbonPage";
import { StatesPageV2 as StatesPage } from "@/components/pages/StatesPageV2";
import { ReferralPage } from "@/components/pages/ReferralPage";
import { MethodologyPageV2 as MethodologyPage } from "@/components/pages/MethodologyPageV2";
import { ChatWidget } from "@/components/widgets";

function AppShell() {
  const { t, dark, toggleDark } = useTheme();
  const [page, setPage] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [navZip, setNavZip] = useState("");

  const navigate = useCallback((p, zip) => {
    setPage(p);
    if (zip) setNavZip(zip);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: "background .4s ease, color .4s ease" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::selection{background:${t.green}22;color:${t.green}}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}input[type=range]{height:6px;border-radius:3px}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${t.green};cursor:pointer;margin-top:-6px}@media(max-width:768px){.detail-col{display:none}.nav-links{display:none!important}.mobile-menu-btn{display:flex!important}}`}</style>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: t.navBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${t.borderLight}`, padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, maxWidth: 1200, margin: "0 auto" }}>
          <div onClick={() => navigate("home")} style={{ fontSize: 18, fontWeight: 800, color: t.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.green }}>⚡</span> Wattfull
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div className="nav-links" style={{ display: "flex", gap: 2 }}>
              {NAV.filter((n) => n.id !== "home").map((n) => (
                <button key={n.id} onClick={() => navigate(n.id)} style={{ padding: "6px 12px", fontSize: 13, fontWeight: page === n.id ? 700 : 500, color: page === n.id ? t.green : t.textMid, background: page === n.id ? t.greenLight : "transparent", border: "none", borderRadius: 8, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}>
                  {n.label}
                </button>
              ))}
            </div>
            <button onClick={toggleDark} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: t.textMid, marginLeft: 8 }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: "none", background: "none", border: "none", fontSize: 22, cursor: "pointer", color: t.text, marginLeft: 8, padding: 4, alignItems: "center", justifyContent: "center" }}>
              ☰
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div style={{ padding: "8px 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => navigate(n.id)} style={{ padding: "10px 14px", fontSize: 14, fontWeight: page === n.id ? 700 : 500, color: page === n.id ? t.green : t.textMid, background: page === n.id ? t.greenLight : "transparent", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                {n.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(16px,4vw,48px)" }}>
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "ev" && <EVCalcPage initialZip={navZip} />}
        {page === "solar" && <SolarCalcPage />}
        {page === "marketplace" && <MarketplacePage />}
        {page === "compare" && <ComparePage />}
        {page === "runtime" && <WhatCanIRunPage />}
        {page === "carbon" && <CarbonPage />}
        {page === "states" && <StatesPage />}
        {page === "referrals" && <ReferralPage />}
        {page === "methodology" && <MethodologyPage />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.borderLight}`, padding: "32px clamp(16px,4vw,48px)", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>⚡ Wattfull</div>
            <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>Independent energy analysis tools</div>
          </div>
          <div style={{ fontSize: 12, color: t.textLight, display: "flex", gap: 16, alignItems: "center" }}>
            <span>Open methodology</span>
            <button onClick={() => navigate("methodology")} style={{ background: "none", border: "none", color: t.green, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>How it works</button>
          </div>
        </div>
      </footer>

      <ChatWidget navigate={navigate} />
    </div>
  );
}

export default function WattfullSite() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
=======

import { useMemo, useState } from "react";

const T = {
  light: { bg: "#f7f7f2", panel: "#fff", soft: "#eef2e9", text: "#172117", mid: "#4f5e52", border: "#dbe4d5", brand: "#2f7a4b", brand2: "#3e9d63" },
  dark: { bg: "#101513", panel: "#1a211e", soft: "#25302b", text: "#edf5ee", mid: "#a6b5a9", border: "#2f3a34", brand: "#73d595", brand2: "#91e3ad" },
};

const EVS = [
  { id: "m3", name: "Tesla Model 3", kwh100: 26, msrp: 38990 },
  { id: "ioniq", name: "Hyundai Ioniq 5", kwh100: 29, msrp: 42900 },
  { id: "mache", name: "Ford Mustang Mach-E", kwh100: 33, msrp: 39995 },
];
const ICE = [
  { id: "camry", name: "Toyota Camry", mpg: 32, msrp: 29495 },
  { id: "civic", name: "Honda Civic", mpg: 36, msrp: 25950 },
  { id: "rav4", name: "Toyota RAV4", mpg: 30, msrp: 31380 },
];
const STATIONS = [
  { id: 1, name: "Anker SOLIX C1000", capacity: 1056, output: 1800, price: 699, brand: "Anker", amazon: "Anker+SOLIX+C1000" },
  { id: 2, name: "EcoFlow Delta 2", capacity: 1024, output: 1800, price: 899, brand: "EcoFlow", amazon: "EcoFlow+Delta+2" },
  { id: 3, name: "BLUETTI AC70", capacity: 768, output: 1000, price: 549, brand: "BLUETTI", amazon: "BLUETTI+AC70" },
];
const PANELS = [
  { id: 11, name: "Renogy 200W", watts: 200, price: 299, brand: "Renogy", amazon: "Renogy+200W+solar+panel" },
  { id: 12, name: "SolarSaga 100", watts: 100, price: 249, brand: "Jackery", amazon: "Jackery+SolarSaga+100" },
  { id: 13, name: "BigBlue 28W", watts: 28, price: 65, brand: "BigBlue", amazon: "BigBlue+28W+solar+charger" },
];
const APPLIANCES = [
  { name: "Mini Fridge", watts: 120 },
  { name: "WiFi Router", watts: 12 },
  { name: "Laptop", watts: 75 },
  { name: "LED Lights (5)", watts: 30 },
  { name: "CPAP", watts: 40 },
  { name: "Coffee Maker", watts: 900 },
];

const amazon = (q) => `https://www.amazon.com/s?k=${q}`;
const card = (t, extra = {}) => ({ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 18, padding: 18, ...extra });

function SVG({ type }) {
  const palette = {
    solar: ["#60a5fa", "#2563eb"],
    station: ["#5eead4", "#0f766e"],
    ev: ["#fcd34d", "#b45309"],
    ice: ["#fda4af", "#be123c"],
  }[type];
  return (
    <svg viewBox="0 0 240 120" width="100%" height="120" role="img" aria-label={`${type} illustration`}>
      <defs><linearGradient id={`grad-${type}`} x1="0" x2="1"><stop offset="0" stopColor={palette[0]} /><stop offset="1" stopColor={palette[1]} /></linearGradient></defs>
      <rect x="8" y="8" width="224" height="104" rx="18" fill={`url(#grad-${type})`} opacity="0.2" />
      <rect x="26" y="32" width="188" height="54" rx="12" fill={`url(#grad-${type})`} opacity="0.75" />
      <circle cx="82" cy="94" r="10" fill="#1f2937" opacity=".6" />
      <circle cx="158" cy="94" r="10" fill="#1f2937" opacity=".6" />
    </svg>
  );
}

function ChatWidget({ t }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [log, setLog] = useState([{ from: "bot", text: "Hey — ask me about EV savings, power stations, runtime, or solar." }]);
  const answer = (text) => {
    const x = text.toLowerCase();
    if (x.includes("compare") || x.includes("vs")) return "Use Compare: EV efficiency vs MPG + side-by-side station specs.";
    if (x.includes("run") || x.includes("runtime")) return "Pick a station first by output watts, then by capacity for duration.";
    if (x.includes("carbon") || x.includes("co2")) return "Carbon tab converts avoided gas into trees and equivalent miles.";
    if (x.includes("referral")) return "Referral page UI is wired for provider + code/link submissions.";
    return "Try: ‘Can C1000 run a mini fridge?’ or ‘Model 3 vs Camry savings’.";
  };

  if (!open) return <button onClick={() => setOpen(true)} style={{ position: "fixed", right: 20, bottom: 18, zIndex: 40, border: 0, borderRadius: 999, padding: "12px 16px", background: t.brand, color: "#fff", cursor: "pointer" }}>⚡ Chat</button>;
  return (
    <div style={{ position: "fixed", right: 18, bottom: 18, width: 340, maxWidth: "calc(100vw - 36px)", ...card(t), zIndex: 40 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Wattbot (local decision tree)</div>
      <div style={{ maxHeight: 180, overflowY: "auto", display: "grid", gap: 8, marginBottom: 8 }}>
        {log.map((m, i) => <div key={i} style={{ fontSize: 13, color: m.from === "bot" ? t.mid : t.text }}>{m.text}</div>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question" style={{ flex: 1, borderRadius: 10, border: `1px solid ${t.border}`, background: t.soft, color: t.text, padding: 8 }} />
        <button onClick={() => { if (!q.trim()) return; setLog((l) => [...l, { from: "you", text: q }, { from: "bot", text: answer(q) }]); setQ(""); }} style={{ border: 0, borderRadius: 10, padding: "8px 12px", background: t.brand, color: "#fff" }}>Send</button>
      </div>
      <button onClick={() => setOpen(false)} style={{ marginTop: 8, border: 0, background: "transparent", color: t.mid }}>Close</button>
    </div>
  );
}

export default function WattfullSite() {
  const [mode, setMode] = useState("light");
  const [page, setPage] = useState("home");
  const t = T[mode];

  const [evSel, setEvSel] = useState(EVS[0].id);
  const [iceSel, setIceSel] = useState(ICE[0].id);
  const [stA, setStA] = useState(STATIONS[0].id);
  const [stB, setStB] = useState(STATIONS[1].id);

  const [runStation, setRunStation] = useState(STATIONS[0].id);
  const [picked, setPicked] = useState(["Mini Fridge", "WiFi Router"]);

  const [miles, setMiles] = useState(12000);
  const [years, setYears] = useState(5);

  const station = STATIONS.find((s) => s.id === runStation);
  const load = APPLIANCES.filter((a) => picked.includes(a.name)).reduce((sum, a) => sum + a.watts, 0);
  const hours = load > 0 ? Math.round((station.capacity / load) * 10) / 10 : 0;
  const overload = load > station.output;

  const ev = EVS.find((e) => e.id === evSel);
  const ice = ICE.find((i) => i.id === iceSel);
  const fuelSavings = Math.round((miles / ice.mpg) * 3.6 - (miles / 100) * ev.kwh100 * 0.16);
  const co2 = (miles / ice.mpg) * 8.887 * years / 1000;
  const trees = Math.round(co2 / 0.022);
  const share = useMemo(() => `I could save about $${fuelSavings.toLocaleString()}/yr by switching to ${ev.name}.`, [fuelSavings, ev.name]);

  return (
    <main style={{ minHeight: "100vh", background: t.bg, color: t.text, transition: "background-color .45s ease, color .45s ease", padding: "20px clamp(14px,3.2vw,44px) 96px" }}>
      <header style={{ ...card(t, { marginBottom: 18, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }) }}>
        <div style={{ fontWeight: 800 }}>⚡ Wattfull</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["home", "ev", "solar", "products", "compare", "runtime", "carbon", "referrals"].map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ border: `1px solid ${t.border}`, borderRadius: 999, padding: "7px 12px", background: page === p ? t.soft : t.panel, color: t.text }}>{p}</button>
          ))}
          <button onClick={() => setMode(mode === "light" ? "dark" : "light")} style={{ border: 0, borderRadius: 999, padding: "7px 12px", background: t.brand, color: "#fff" }}>{mode === "light" ? "Dark" : "Light"}</button>
        </div>
      </header>

      {page === "home" && (
        <section style={{ display: "grid", gap: 16 }}>
          <div style={{ ...card(t, { padding: "28px" }) }}>
            <h1 style={{ margin: 0, fontSize: "clamp(30px,5.2vw,54px)", lineHeight: 1.05 }}>Energy decisions, done right.</h1>
            <p style={{ color: t.mid, maxWidth: 720 }}>Cleaner layout, softer motion, and practical tools — not flashy AI chrome. Use the calculators, compare options, then share the result.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            <div style={card(t)}><h3>Newsletter signup</h3><input placeholder="Email address" style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${t.border}`, background: t.soft, color: t.text }} /><button style={{ marginTop: 10, border: 0, borderRadius: 10, background: t.brand, color: "#fff", padding: "10px 12px" }}>Subscribe</button></div>
            <div style={card(t)}><h3>Savings share badge</h3><p style={{ color: t.mid }}>{share}</p><button onClick={() => navigator.clipboard?.writeText(share)} style={{ border: 0, borderRadius: 10, background: t.brand, color: "#fff", padding: "10px 12px" }}>Copy share result</button></div>
          </div>
        </section>
      )}

      {page === "ev" && (
        <section style={card(t)}>
          <h2>EV Savings quick calculator</h2>
          <p style={{ color: t.mid }}>Estimate annual fuel savings from current ICE MPG and selected EV efficiency.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
            <label>EV model<select value={evSel} onChange={(e) => setEvSel(e.target.value)}>{EVS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label>Current ICE<select value={iceSel} onChange={(e) => setIceSel(e.target.value)}>{ICE.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label>Annual miles<input type="range" min="6000" max="30000" step="1000" value={miles} onChange={(e) => setMiles(Number(e.target.value))} /></label>
          </div>
          <h3>Estimated savings: ${fuelSavings.toLocaleString()} / year</h3>
        </section>
      )}

      {page === "solar" && (
        <section style={card(t)}>
          <h2>Solar ROI snapshot</h2>
          <p style={{ color: t.mid }}>A lightweight placeholder for your detailed solar model: system size, incentives, payback, and long-term curve.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            <div style={card(t, { background: t.soft })}><div style={{ color: t.mid, fontSize: 12 }}>Estimated system</div><b>7.2 kW</b></div>
            <div style={card(t, { background: t.soft })}><div style={{ color: t.mid, fontSize: 12 }}>Net cost after credits</div><b>$14,700</b></div>
            <div style={card(t, { background: t.soft })}><div style={{ color: t.mid, fontSize: 12 }}>Simple payback</div><b>8.5 years</b></div>
          </div>
        </section>
      )}

      {page === "products" && (
        <section style={{ display: "grid", gap: 14 }}>
          <h2>Product categories + clean SVG illustrations</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            <div style={card(t)}><h4>Solar panels</h4><SVG type="solar" />{PANELS.map((p) => <div key={p.id} style={{ marginTop: 8 }}>{p.brand} {p.name} · ${p.price} · <a href={amazon(p.amazon)} target="_blank" rel="noreferrer">Amazon search</a></div>)}</div>
            <div style={card(t)}><h4>Power stations</h4><SVG type="station" />{STATIONS.map((s) => <div key={s.id} style={{ marginTop: 8 }}>{s.brand} {s.name} · ${s.price} · <a href={amazon(s.amazon)} target="_blank" rel="noreferrer">Amazon search</a></div>)}</div>
            <div style={card(t)}><h4>Car model placeholders</h4><SVG type="ev" /><SVG type="ice" /></div>
          </div>
        </section>
      )}

      {page === "compare" && (
        <section style={{ display: "grid", gap: 12 }}>
          <h2>Comparison tool</h2>
          <div style={{ ...card(t), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={evSel} onChange={(e) => setEvSel(e.target.value)}>{EVS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <select value={iceSel} onChange={(e) => setIceSel(e.target.value)}>{ICE.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <div>{ev.name}: {ev.kwh100} kWh/100mi</div>
            <div>{ice.name}: {ice.mpg} MPG</div>
          </div>
          <div style={{ ...card(t), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={stA} onChange={(e) => setStA(Number(e.target.value))}>{STATIONS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <select value={stB} onChange={(e) => setStB(Number(e.target.value))}>{STATIONS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <div>{STATIONS.find((x) => x.id === stA)?.capacity}Wh / {STATIONS.find((x) => x.id === stA)?.output}W</div>
            <div>{STATIONS.find((x) => x.id === stB)?.capacity}Wh / {STATIONS.find((x) => x.id === stB)?.output}W</div>
          </div>
        </section>
      )}

      {page === "runtime" && (
        <section style={card(t)}>
          <h2>“What can I run?” calculator</h2>
          <select value={runStation} onChange={(e) => setRunStation(Number(e.target.value))}>{STATIONS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8, margin: "10px 0" }}>
            {APPLIANCES.map((a) => <label key={a.name}><input type="checkbox" checked={picked.includes(a.name)} onChange={() => setPicked((p) => p.includes(a.name) ? p.filter((x) => x !== a.name) : [...p, a.name])} /> {a.name} ({a.watts}W)</label>)}
          </div>
          <div style={{ ...card(t, { background: overload ? "#7f1d1d" : t.brand, color: "#fff" }) }}>
            <b>{overload ? `Overload: ${load}W > ${station.output}W output` : `Load ${load}W · Runtime ${hours}h on ${station.capacity}Wh`}</b>
          </div>
        </section>
      )}

      {page === "carbon" && (
        <section style={card(t)}>
          <h2>Carbon impact visualizer</h2>
          <label>Annual miles <input type="range" min="6000" max="30000" step="1000" value={miles} onChange={(e) => setMiles(Number(e.target.value))} /></label>
          <label>Years <input type="range" min="1" max="12" value={years} onChange={(e) => setYears(Number(e.target.value))} /></label>
          <p>{co2.toFixed(1)} metric tons CO₂ avoided ≈ {trees.toLocaleString()} trees planted.</p>
          <p>Equivalent driving impact: {(co2 * 2500).toLocaleString()} miles.</p>
          <button onClick={() => navigator.share?.({ title: "Wattfull impact", text: `I can avoid ${co2.toFixed(1)} tCO₂ over ${years} years.` })} style={{ border: 0, borderRadius: 10, padding: "10px 12px", background: t.brand, color: "#fff" }}>Share result</button>
        </section>
      )}

      {page === "referrals" && (
        <section style={card(t)}>
          <h2>Referral links page (UI ready)</h2>
          <p style={{ color: t.mid }}>Supabase schema handled separately. UI scaffold is ready for wiring.</p>
          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <input placeholder="Provider (Tesla, Enphase, SunPower...)" style={{ padding: 10, borderRadius: 10, border: `1px solid ${t.border}`, background: t.soft, color: t.text }} />
            <input placeholder="Referral link or code" style={{ padding: 10, borderRadius: 10, border: `1px solid ${t.border}`, background: t.soft, color: t.text }} />
            <textarea placeholder="Optional notes" rows={3} style={{ padding: 10, borderRadius: 10, border: `1px solid ${t.border}`, background: t.soft, color: t.text }} />
            <button style={{ border: 0, borderRadius: 10, padding: "10px 12px", background: t.brand, color: "#fff" }}>Submit referral</button>
          </div>
        </section>
      )}

      <ChatWidget t={t} />
    </main>
>>>>>>> theirs
  );
}
