"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { ChatWidget } from "@/components/widgets";
import { Icon } from "@/components/ui/Icon";

/**
 * SiteShell — persistent nav + footer for all (site) pages.
 * - Glass nav with blur, no heavy border (just subtle bottom line)
 * - Lucide icons for dark-mode toggle + mobile menu (replaces emoji)
 * - Footer with credibility signals + methodology link
 */
export function SiteShell({ children }) {
  const { t, dark, toggleDark } = useTheme();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div style={{
      background: t.bg,
      color: t.text,
      minHeight: "100vh",
      transition: "background .4s ease, color .4s ease",
    }}>
      {/* Global resets */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${t.green}22;color:${t.green}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
        ::-webkit-scrollbar-track{background:transparent}
        @media(max-width:768px){
          .wf-nav-links{display:none!important}
          .wf-mobile-btn{display:flex!important}
        }
        @media(min-width:769px){
          .wf-mobile-menu{display:none!important}
        }
        .wf-nav-link{
          transition: color 160ms cubic-bezier(.2,.8,.2,1), background 160ms cubic-bezier(.2,.8,.2,1);
        }
        .wf-nav-link:hover{
          background: ${t.card}!important;
          color: ${t.text}!important;
        }
        .wf-dark-toggle:hover{
          background: ${t.greenGlass}!important;
          border-color: ${t.featuredBorder}!important;
        }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: t.navBg,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${t.navBorder}`,
        padding: "0 clamp(16px,4vw,48px)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          {/* Logo */}
          <Link href="/" style={{
            fontSize: 17,
            fontWeight: 800,
            color: t.text,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 7,
            letterSpacing: "-.025em",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "var(--r-sm)",
              background: t.green,
              boxShadow: `0 2px 8px ${t.green}55`,
            }}>
              <Icon name="Zap" size={16} color="#fff" strokeWidth={2.5} />
            </span>
            Wattfull
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Desktop nav links */}
            <div className="wf-nav-links" style={{ display: "flex", gap: 2 }}>
              {NAV.filter((n) => n.id !== "home").map((n) => {
                const active = isActive(n.href);
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    className="wf-nav-link"
                    style={{
                      padding: "6px 11px",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? t.green : t.textMid,
                      background: active ? t.greenGlass : "transparent",
                      borderRadius: "var(--r-md)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>

            {/* Dark mode toggle */}
            <button
              className="wf-dark-toggle"
              onClick={toggleDark}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: "none",
                border: `1px solid ${t.border}`,
                borderRadius: "var(--r-md)",
                cursor: "pointer",
                color: t.textMid,
                marginLeft: 8,
                transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
                flexShrink: 0,
              }}
            >
              <Icon name={dark ? "Sun" : "Moon"} size={16} color="currentColor" strokeWidth={1.75} />
            </button>

            {/* Mobile menu button */}
            <button
              className="wf-mobile-btn"
              onClick={() => setMobileMenu((m) => !m)}
              aria-label="Toggle menu"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: t.text,
                marginLeft: 4,
              }}
            >
              <Icon name={mobileMenu ? "X" : "Menu"} size={20} color="currentColor" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="wf-mobile-menu" style={{
            padding: "8px 0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderTop: `1px solid ${t.borderLight}`,
          }}>
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
                  background: isActive(n.href) ? t.greenGlass : "transparent",
                  borderRadius: "var(--r-md)",
                  textDecoration: "none",
                  display: "block",
                  transition: "background var(--dur-fast) var(--ease)",
                }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "36px clamp(16px,4vw,48px) 60px",
      }}>
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${t.borderLight}`,
        padding: "32px clamp(16px,4vw,48px) 40px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: t.green,
                }}>
                  <Icon name="Zap" size={14} color="#fff" strokeWidth={2.5} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: "-.02em" }}>Wattfull</span>
              </div>
              <div style={{ fontSize: 12, color: t.textLight, lineHeight: 1.6, maxWidth: 280 }}>
                Independent energy analysis tools. No ads, no affiliates, no tracking.
                Every assumption visible and editable.
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                  Tools
                </div>
                {[
                  { label: "EV Calculator", href: "/ev" },
                  { label: "Solar ROI", href: "/solar" },
                  { label: "Compare", href: "/compare" },
                  { label: "State Grades", href: "/states" },
                ].map(l => (
                  <div key={l.href} style={{ marginBottom: 6 }}>
                    <Link href={l.href} style={{ fontSize: 12, color: t.textMid, textDecoration: "none", transition: "color var(--dur-fast)" }}>
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                  About
                </div>
                {[
                  { label: "Methodology", href: "/methodology" },
                  { label: "Gear Reviews", href: "/gear" },
                  { label: "Referrals", href: "/referrals" },
                ].map(l => (
                  <div key={l.href} style={{ marginBottom: 6 }}>
                    <Link href={l.href} style={{ fontSize: 12, color: t.textMid, textDecoration: "none" }}>
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${t.borderLight}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: "Shield", text: "No tracking" },
                { icon: "Database", text: "EIA · EPA · NREL data" },
                { icon: "Eye", text: "Open methodology" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textLight }}>
                  <Icon name={icon} size={12} color={t.textFaint} strokeWidth={1.75} />
                  {text}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: t.textFaint }}>
              © {new Date().getFullYear()} Wattfull
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
