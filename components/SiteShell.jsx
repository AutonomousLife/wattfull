"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { NAV } from "@/lib/data";
import { ChatWidget } from "@/components/widgets";
import { Icon } from "@/components/ui/Icon";

export function SiteShell({ children }) {
  const { t, dark, toggleDark, advanced, toggleAdvanced } = useTheme();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [experimentalUnlocked, setExperimentalUnlocked] = useState(false);
  const [animeVisible, setAnimeVisible] = useState(false);
  const [animeMuted, setAnimeMuted] = useState(false);
  const animeAudio = useRef(null);

  const stopAnimeAudio = () => {
    if (animeAudio.current) {
      animeAudio.current.close().catch(() => {});
      animeAudio.current = null;
    }
  };

  const playAnimeAudio = () => {
    stopAnimeAudio();
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    animeAudio.current = context;
    const master = context.createGain();
    master.gain.value = 0.055;
    master.connect(context.destination);
    const now = context.currentTime;
    for (let beat = 0; beat < 32; beat++) {
      const time = now + beat * .25;
      const kick = context.createOscillator(), kickGain = context.createGain();
      kick.type = "sine"; kick.frequency.setValueAtTime(104, time); kick.frequency.exponentialRampToValueAtTime(46, time + .11);
      kickGain.gain.setValueAtTime(.9, time); kickGain.gain.exponentialRampToValueAtTime(.0001, time + .12);
      kick.connect(kickGain); kickGain.connect(master); kick.start(time); kick.stop(time + .13);
      if (beat % 2 === 1) {
        const clap = context.createOscillator(), clapGain = context.createGain();
        clap.type = "triangle"; clap.frequency.value = 420;
        clapGain.gain.setValueAtTime(.24, time); clapGain.gain.exponentialRampToValueAtTime(.0001, time + .08);
        clap.connect(clapGain); clapGain.connect(master); clap.start(time); clap.stop(time + .09);
      }
    }
    [659, 784, 988, 784, 587, 659, 784, 988].forEach((frequency, index) => {
      const time = now + index * .5 + .12, lead = context.createOscillator(), leadGain = context.createGain();
      lead.type = "square"; lead.frequency.value = frequency;
      leadGain.gain.setValueAtTime(.0001, time); leadGain.gain.exponentialRampToValueAtTime(.13, time + .025); leadGain.gain.exponentialRampToValueAtTime(.0001, time + .22);
      lead.connect(leadGain); leadGain.connect(master); lead.start(time); lead.stop(time + .24);
    });
    window.setTimeout(() => { if (animeAudio.current === context) stopAnimeAudio(); }, 8100);
  };

  const openAnimeDance = () => {
    setAnimeVisible(true);
    if (!animeMuted) playAnimeAudio();
  };

  const closeAnimeDance = () => {
    setAnimeVisible(false);
    stopAnimeAudio();
  };

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const baseNav = advanced ? NAV : NAV.filter((item) => item.core);
  const visibleNav = experimentalUnlocked
    ? [...baseNav, { id: "experimental", label: "Experimental", href: "/experimental" }]
    : baseNav;

  useEffect(() => {
    let typed = "";
    const unlockExperimental = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
      typed = `${typed}${event.key.toLowerCase()}`.slice(-6);
      if (pathname === "/" && typed === "silver") {
        setExperimentalUnlocked(true);
        typed = "";
      }
      if (typed.endsWith("anime")) { typed = ""; openAnimeDance(); }
    };

    const escapeDance = (event) => { if (event.key === "Escape" && animeVisible) closeAnimeDance(); };

    window.addEventListener("keydown", unlockExperimental);
    window.addEventListener("keydown", escapeDance);
    return () => { window.removeEventListener("keydown", unlockExperimental); window.removeEventListener("keydown", escapeDance); };
  }, [pathname, animeVisible, animeMuted]);

  useEffect(() => () => stopAnimeAudio(), []);

  return (
    <div
      className="wf-site-shell"
      style={{
        backgroundColor: t.bg,
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
        .wf-experimental-tab{
          animation: wf-experimental-tab-in 460ms cubic-bezier(.16,1,.3,1) both;
          transform-origin: right center;
        }
        @keyframes wf-experimental-tab-in{
          0%{opacity:0;transform:translateX(12px) scale(.88);filter:blur(3px)}
          70%{opacity:1;transform:translateX(-2px) scale(1.03);filter:blur(0)}
          100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}
        }
        .wf-anime-stage{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:rgba(5,8,14,.84);backdrop-filter:blur(8px);animation:wf-anime-fade-in .24s ease-out both}
        .wf-anime-card{position:relative;width:min(560px,100%);min-height:min(700px,calc(100vh - 48px));display:grid;place-items:end center;overflow:hidden;border:1px solid rgba(119,214,202,.5);background:linear-gradient(155deg,#132229,#1b1732 52%,#302038);box-shadow:0 24px 80px rgba(0,0,0,.5)}
        .wf-anime-card:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(110deg,transparent 0 28px,rgba(109,230,218,.11) 29px 30px);pointer-events:none}
        .wf-anime-dancer{position:relative;z-index:1;display:block;width:min(94%,510px);max-height:calc(100vh - 90px);object-fit:contain;object-position:bottom;filter:drop-shadow(0 18px 15px rgba(0,0,0,.45));animation:wf-anime-dance 1.1s cubic-bezier(.45,0,.55,1) infinite alternate}
        .wf-anime-title{position:absolute;z-index:2;top:24px;left:26px;margin:0;color:#e9fbf8;font-size:clamp(22px,5vw,38px);line-height:.95;letter-spacing:.08em;text-transform:uppercase;text-shadow:0 2px 0 #203a3c}.wf-anime-title small{display:block;margin-top:9px;color:#91ded6;font-size:11px;letter-spacing:.18em}
        .wf-anime-actions{position:absolute;z-index:3;right:16px;top:16px;display:flex;gap:8px}.wf-anime-actions button{border:1px solid rgba(224,255,251,.45);background:rgba(9,16,23,.56);color:#effffb;border-radius:999px;padding:7px 11px;font-size:12px;cursor:pointer}
        @keyframes wf-anime-fade-in{from{opacity:0}to{opacity:1}}@keyframes wf-anime-dance{0%{transform:translate(-9px,3px) rotate(-2deg) scale(1)}45%{transform:translate(8px,-12px) rotate(2deg) scale(1.018)}100%{transform:translate(-3px,0) rotate(-1deg) scale(1)}}
        @media(prefers-reduced-motion:reduce){.wf-anime-dancer,.wf-anime-stage{animation:none}}
      `}</style>

      <a href="#main-content" className="wf-skip">Skip to content</a>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: t.navBg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
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
                boxShadow: "none",
              }}
            >
              <Icon name="Zap" size={16} color="#fff" strokeWidth={2.5} />
            </span>
            Wattfull
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="wf-nav-links" style={{ display: "flex", gap: 2 }}>
              {visibleNav.filter((item) => item.id !== "home").map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`wf-nav-link ${item.id === "experimental" ? "wf-experimental-tab" : ""}`}
                    style={{
                      padding: "6px 11px",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? t.green : t.textMid,
                      background: "transparent",
                      borderRadius: 0,
                      borderBottom: `1px solid ${active ? t.green : "transparent"}`,
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
              onClick={toggleAdvanced}
              aria-pressed={advanced}
              aria-label={advanced ? "Switch to simple mode" : "Switch to advanced mode (unlock all tools)"}
              title={advanced ? "Simple mode: focused homepage + core tools" : "Advanced mode: unlock all tools and nav items"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                marginLeft: 8,
                background: advanced ? t.greenGlass : "transparent",
                border: `1px solid ${advanced ? t.featuredBorder : t.border}`,
                borderRadius: "999px",
                cursor: "pointer",
                color: advanced ? t.green : t.textMid,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".02em",
                whiteSpace: "nowrap",
                transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease)",
              }}
            >
              <Icon name={advanced ? "SlidersHorizontal" : "Compass"} size={13} color="currentColor" strokeWidth={2} />
              {advanced ? "Advanced" : "Simple"}
            </button>

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
            {visibleNav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenu(false)}
                className={item.id === "experimental" ? "wf-experimental-tab" : ""}
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

      <main id="main-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px clamp(16px,4vw,48px) 48px" }}>{children}</main>

      <footer style={{ borderTop: `1px solid ${t.borderLight}`, padding: "24px clamp(16px,4vw,48px) 32px" }}>
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
      {animeVisible ? (
        <div className="wf-anime-stage" role="dialog" aria-modal="true" aria-label="Anime dance" onClick={closeAnimeDance}>
          <div className="wf-anime-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="wf-anime-title">Dance break<small>Type anime anywhere · Esc to close</small></h2>
            <div className="wf-anime-actions">
              <button onClick={() => { const muted = !animeMuted; setAnimeMuted(muted); if (muted) stopAnimeAudio(); else playAnimeAudio(); }}>{animeMuted ? "Play sound" : "Mute"}</button>
              <button onClick={closeAnimeDance}>Close</button>
            </div>
            <img className="wf-anime-dancer" src="/anime-dancer.png" alt="Anime dancer performing an upbeat pose" />
          </div>
        </div>
      ) : null}
    </div>
  );
}




