"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { THEME } from "@/lib/data/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Lazy initializer: read from localStorage/system preference synchronously
  // so the VERY FIRST React render uses the correct theme — no flash.
  // The inline script in layout.tsx already set data-theme on <html>;
  // here we just match it so React inline styles agree from frame 1.
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false; // SSR: default light
    const saved = localStorage.getItem("wattfull-dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Simple vs advanced mode. Default is simple — new users see a focused
  // homepage and a minimal nav. Advanced unlocks the full tool grid and all
  // secondary nav items. Persisted to localStorage under "wattfull-advanced".
  const [advanced, setAdvanced] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("wattfull-advanced") === "true";
  });

  useEffect(() => {
    localStorage.setItem("wattfull-dark", String(dark));
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("wattfull-advanced", String(advanced));
  }, [advanced]);

  const toggleDark = useCallback(() => setDark(d => !d), []);
  const toggleAdvanced = useCallback(() => setAdvanced(a => !a), []);
  const t = dark ? THEME.dark : THEME.light;

  return (
    <ThemeContext.Provider value={{ t, dark, toggleDark, advanced, toggleAdvanced }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
