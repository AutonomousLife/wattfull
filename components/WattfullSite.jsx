"use client";
import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { HomePage, EVCalcPage, SolarCalcPage, MarketplacePage, ComparePage, WhatCanIRunPage, CarbonPage, StatesPage, ReferralPage, MethodologyPage } from "@/components/pages";
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
            <span>No tracking</span>
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
  );
}
