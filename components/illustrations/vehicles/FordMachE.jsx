"use client";
import { useTheme } from "@/lib/ThemeContext";

export function FordMachE({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sporty SUV profile with Mustang curves */}
      <path
        d="M16 54 L16 42 Q16 38 20 38 L36 38 L44 20 Q46 16 50 16 L110 16 Q114 16 116 20 L122 36 L142 38 Q146 38 146 42 L146 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Sloping roofline */}
      <path d="M48 36 L56 18 L108 18 L114 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="82" y1="18" x2="82" y2="36" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      <circle cx="40" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="124" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="8" y1="67" x2="156" y2="67" stroke={t.border} strokeWidth="1" />
      <path d="M134 30 L131 35 L135 35 L132 40" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
