"use client";
import { useEffect, useRef } from "react";

/**
 * Reveal — scroll-triggered reveal with stagger support.
 *
 * Wraps children in a div that fades in + rises when it enters the viewport.
 * On subsequent scrolls back, the element stays visible (fires once per session).
 *
 * Props:
 *   delay   — ms delay before the transition starts (for stagger: 50ms increments)
 *   type    — "fadeUp" | "fade" | "scale" (controls CSS class applied)
 *   as      — wrapper tag ("div", "section", "li", …)
 *   style   — extra styles on wrapper
 *   threshold — IntersectionObserver threshold (default 0.08)
 *
 * CSS animations defined in globals.css (.wf-reveal, .wf-reveal-fade, .wf-reveal-scale)
 */
export function Reveal({
  children,
  delay = 0,
  type = "fadeUp",
  as: Tag = "div",
  style = {},
  threshold = 0.08,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { el.style.opacity = 1; el.style.transform = "none"; return; }

    const cls = type === "fade" ? "wf-reveal-fade" : "wf-reveal";

    el.classList.add(cls);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("wf-visible");
          obs.disconnect(); // fire once
        }
      },
      { threshold, rootMargin: "0px 0px -24px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold, type]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
