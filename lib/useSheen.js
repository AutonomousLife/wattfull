"use client";
import { useCallback, useMemo, useRef } from "react";

export function useSheen() {
  const rafId = useRef(null);

  const isCoarse = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const onPointerMove = useCallback((event) => {
    const el = event.currentTarget;
    if (!el || rafId.current) return;
    const clientX = event.clientX;
    const clientY = event.clientY;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!el || !el.isConnected) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x.toFixed(1)}%`);
      el.style.setProperty("--my", `${y.toFixed(1)}%`);
    });
  }, []);

  const onPointerLeave = useCallback((event) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    const el = event.currentTarget;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }, []);

  const onClick = useCallback((event) => {
    const el = event.currentTarget;
    if (!el) return;

    let clientX = event.clientX;
    let clientY = event.clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    }

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--cx", `${x.toFixed(1)}%`);
    el.style.setProperty("--cy", `${y.toFixed(1)}%`);
    el.classList.remove("wf-clicked");
    void el.offsetWidth;
    el.classList.add("wf-clicked");
    const tid = setTimeout(() => el.classList.remove("wf-clicked"), 360);
    el._sheenTid = tid;
  }, []);

  return {
    className: "wf-sheen",
    handlers: {
      onPointerMove: isCoarse ? undefined : onPointerMove,
      onPointerLeave: isCoarse ? undefined : onPointerLeave,
      onClick,
    },
  };
}
