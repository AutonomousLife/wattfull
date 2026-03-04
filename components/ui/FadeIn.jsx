"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function FadeIn({ children, delay = 0 }) {
  const { t } = useTheme();
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
