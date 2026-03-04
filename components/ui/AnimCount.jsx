"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function AnimCount({ end, prefix = "", suffix = "", duration = 1200 }) {
  const { t } = useTheme();
  const [value, setValue] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = performance.now();
          const animate = () => {
            const progress = Math.min((performance.now() - start) / duration, 1);
            setValue(Math.round(end * progress * progress));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span
      ref={ref}
      style={{
        fontWeight: 800,
        color: t.text,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
