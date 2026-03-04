"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HyundaiIoniq5({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Angular hatchback profile */}
      <path
        d="M18 54 L18 44 Q18 40 22 40 L36 40 L46 22 Q48 18 52 18 L108 18 Q112 18 114 22 L118 40 L142 40 Q146 40 146 44 L146 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Sharp angular windshield */}
      <path d="M50 38 L58 20 L106 20 L112 38" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="82" y1="20" x2="82" y2="38" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Pixel-style tail light */}
      <rect x="138" y="38" width="6" height="3" rx="1" fill={t.err} opacity="0.4" />
      <circle cx="40" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="124" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="8" y1="67" x2="156" y2="67" stroke={t.border} strokeWidth="1" />
      <path d="M134 32 L131 37 L135 37 L132 42" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
