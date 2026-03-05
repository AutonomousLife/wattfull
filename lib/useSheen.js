"use client";
import { useCallback, useRef } from "react";

/**
 * useSheen — cursor-follow specular highlight effect.
 *
 * Spread the returned object onto any element that should have the sheen:
 *   const sheen = useSheen();
 *   <button className={`wf-sheen ${sheen.className}`} {...sheen.handlers} />
 *
 * CSS in globals.css handles the visual via ::before (hover sheen)
 * and ::after + .wf-clicked (click reflection).
 *
 * The hook is a no-op on coarse pointers (touch-only devices) for hover
 * events, though click reflection still fires on tap.
 */
export function useSheen() {
  const rafId = useRef(null);

  // Throttle pointer tracking with rAF
  const onPointerMove = useCallback((e) => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      el.style.setProperty("--mx", `${x.toFixed(1)}%`);
      el.style.setProperty("--my", `${y.toFixed(1)}%`);
    });
  }, []);

  const onPointerLeave = useCallback((e) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    // Reset to center so sheen doesn't snap on next hover
    const el = e.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }, []);

  // Click reflection — works on both mouse and touch
  const onClick = useCallback((e) => {
    const el = e.currentTarget;
    let x, y;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const rect = el.getBoundingClientRect();
      x = ((e.changedTouches[0].clientX - rect.left) / rect.width)  * 100;
      y = ((e.changedTouches[0].clientY - rect.top)  / rect.height) * 100;
    } else {
      const rect = el.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width)  * 100;
      y = ((e.clientY - rect.top)  / rect.height) * 100;
    }
    el.style.setProperty("--cx", `${x.toFixed(1)}%`);
    el.style.setProperty("--cy", `${y.toFixed(1)}%`);
    el.classList.remove("wf-clicked");
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add("wf-clicked");
    const tid = setTimeout(() => el.classList.remove("wf-clicked"), 520);
    el._sheenTid = tid; // store for cleanup
  }, []);

  // Detect coarse pointer — disable hover tracking but keep click reflection
  const isCoarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return {
    className: "wf-sheen",
    handlers: {
      onPointerMove: isCoarse ? undefined : onPointerMove,
      onPointerLeave: isCoarse ? undefined : onPointerLeave,
      onClick,
    },
  };
}
