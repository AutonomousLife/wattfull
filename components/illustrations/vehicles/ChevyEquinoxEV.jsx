"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ChevyEquinoxEV({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Compact SUV profile */}
      <path
        d="M18 54 L18 42 Q18 38 22 38 L38 38 L46 20 Q48 16 52 16 L108 16 Q112 16 114 20 L120 38 L142 38 Q146 38 146 42 L146 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M50 36 L58 18 L106 18 L112 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="18" x2="80" y2="36" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <line x1="8" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      <path d="M134 30 L131 35 L135 35 L132 40" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
