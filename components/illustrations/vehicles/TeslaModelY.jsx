"use client";
import { useTheme } from "@/lib/ThemeContext";

export function TeslaModelY({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crossover profile - higher roofline */}
      <path
        d="M20 54 L20 44 Q20 40 24 40 L38 40 L48 22 Q50 18 54 18 L106 18 Q110 20 112 24 L122 40 L140 40 Q144 40 144 44 L144 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M52 38 L60 20 L100 20 L108 38" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="20" x2="80" y2="38" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="10" y1="67" x2="154" y2="67" stroke={t.border} strokeWidth="1" />
      <path d="M132 32 L129 37 L133 37 L130 42" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
