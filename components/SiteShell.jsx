"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { ChatWidget } from "@/components/widgets";
import { Icon } from "@/components/ui/Icon";

export function SiteShell({ children }) {
  const { t, dark, toggleDark } = useTheme();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        minHeight: "100vh",
        transition: "background .4s ease, color .4s ease",
      }}
    >
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

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: t.navBg,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${t.navBorder}`,
          padding: "0 clamp(16px,4vw,48px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: t.text,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 7,
              letterSpacing: "-.025em",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "var(--r-sm)",
                background: t.green,
                boxShadow: `0 2px 8px ${t.green}55`,
              }}
            >
              <Icon name="Zap" size={16} color="#fff" strokeWidth={2.5} />
            </span>
            Wattfull
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="wf-nav-links" style={{ display: "flex", gap: 2 }}>
              {NAV.filter((item) => item.id !== "home").map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
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
                    {item.label}
                  </Link>
                );
              })}
            </div>

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

            <button
              className="wf-mobile-btn"
              onClick={() => setMobileMenu((current) => !current)}
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

        {mobileMenu ? (
          <div
            className="wf-mobile-menu"
            style={{
              padding: "8px 0 16px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderTop: `1px solid ${t.borderLight}`,
            }}
          >
            {NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenu(false)}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: isActive(item.href) ? 700 : 500,
                  color: isActive(item.href) ? t.green : t.textMid,
                  background: isActive(item.href) ? t.greenGlass : "transparent",
                  borderRadius: "var(--r-md)",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px clamp(16px,4vw,48px) 60px" }}>{children}</main>

      <footer style={{ borderTop: `1px solid ${t.borderLight}`, padding: "32px clamp(16px,4vw,48px) 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 6, background: t.green }}>
                  <Icon name="Zap" size={14} color="#fff" strokeWidth={2.5} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: "-.02em" }}>Wattfull</span>
              </div>
              <div style={{ fontSize: 12, color: t.textLight, lineHeight: 1.6, maxWidth: 280 }}>
                Real-world energy calculators powered by transparent assumptions and public data.
              </div>
            </div>

            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Tools</div>
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "EV Calculator", href: "/ev" },
                  { label: "Solar ROI", href: "/solar" },
                  { label: "Compare", href: "/compare" },
                  { label: "Charging", href: "/charging" },
                  { label: "Battery", href: "/battery" },
                ].map((item) => (
                  <div key={item.href} style={{ marginBottom: 6 }}>
                    <Link href={item.href} style={{ fontSize: 12, color: t.textMid, textDecoration: "none" }}>{item.label}</Link>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textLight, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Trust</div>
                {[
                  { label: "States", href: "/states" },
                  { label: "Methodology", href: "/methodology" },
                  { label: "Gear Reviews", href: "/gear" },
                  { label: "Referrals", href: "/referrals" },
                ].map((item) => (
                  <div key={item.href} style={{ marginBottom: 6 }}>
                    <Link href={item.href} style={{ fontSize: 12, color: t.textMid, textDecoration: "none" }}>{item.label}</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 16, borderTop: `1px solid ${t.borderLight}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: "Database", text: "EIA | EPA | NREL inputs" },
                { icon: "Eye", text: "Open methodology" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.textLight }}>
                  <Icon name={icon} size={12} color={t.textFaint} strokeWidth={1.75} />
                  {text}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: t.textFaint }}>© 2026 Wattfull</div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}




