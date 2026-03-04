"use client";
import { useTheme } from "@/lib/ThemeContext";

export function VWID4({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded crossover profile */}
      <path
        d="M18 54 L18 44 Q18 40 22 40 L38 40 L46 22 Q48 18 52 18 L108 18 Q114 18 116 22 L122 40 L142 40 Q146 40 146 44 L146 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M50 38 L58 20 L106 20 L114 38" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="82" y1="20" x2="82" y2="38" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Light bar */}
      <line x1="20" y1="40" x2="36" y2="40" stroke={t.blue} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="124" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="8" y1="67" x2="156" y2="67" stroke={t.border} strokeWidth="1" />
      <path d="M134 32 L131 37 L135 37 L132 42" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
