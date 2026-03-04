"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { THEME } from "@/lib/data/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wattfull-dark");
    if (saved !== null) setDark(saved === "true");
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("wattfull-dark", String(dark));
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = useCallback(() => setDark(d => !d), []);
  const t = dark ? THEME.dark : THEME.light;

  return (
    <ThemeContext.Provider value={{ t, dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
