"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { ChatWidget } from "@/components/widgets";

/**
 * SiteShell — persistent nav + footer wrapper for all (site) pages.
 * Uses Next.js <Link> and usePathname() so the browser URL bar and
 * history stack update on every navigation (back/forward/side buttons work).
 */
export function SiteShell({ children }) {
  const { t, dark, toggleDark } = useTheme();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: "background .4s ease, color .4s ease" }}>
      {/* Global resets + slider + responsive overrides */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${t.green}22;color:${t.green}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
        input[type=range]{height:6px;border-radius:3px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${t.green};cursor:pointer;margin-top:-6px}
        @media(max-width:768px){
          .detail-col{display:none}
          .nav-links{display:none!important}
          .mobile-menu-btn{display:flex!important}
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: t.navBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${t.borderLight}`, padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, maxWidth: 1200, margin: "0 auto" }}>
          {/* Logo */}
          <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.green }}>⚡</span> Wattfull
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Desktop nav links */}
            <div className="nav-links" style={{ display: "flex", gap: 2 }}>
              {NAV.filter((n) => n.id !== "home").map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    fontWeight: isActive(n.href) ? 700 : 500,
                    color: isActive(n.href) ? t.green : t.textMid,
                    background: isActive(n.href) ? t.greenLight : "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all .15s",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: t.textMid, marginLeft: 8 }}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenu((m) => !m)}
              style={{ display: "none", background: "none", border: "none", fontSize: 22, cursor: "pointer", color: t.text, marginLeft: 8, padding: 4, alignItems: "center", justifyContent: "center" }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div style={{ padding: "8px 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setMobileMenu(false)}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: isActive(n.href) ? 700 : 500,
                  color: isActive(n.href) ? t.green : t.textMid,
                  background: isActive(n.href) ? t.greenLight : "transparent",
                  borderRadius: 8,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(16px,4vw,48px)" }}>
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${t.borderLight}`, padding: "32px clamp(16px,4vw,48px)", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>⚡ Wattfull</div>
            <div style={{ fontSize: 12, color: t.textLight, marginTop: 4 }}>Independent energy analysis tools</div>
          </div>
          <div style={{ fontSize: 12, color: t.textLight, display: "flex", gap: 16, alignItems: "center" }}>
            <span>No tracking</span>
            <span>Open methodology</span>
            <Link href="/methodology" style={{ color: t.green, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
              How it works
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating chat widget */}
      <ChatWidget />
    </div>
  );
}
