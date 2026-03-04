"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HondaCivic({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 54 L18 46 Q18 42 22 42 L36 42 L48 26 Q50 22 54 22 L108 22 Q112 24 114 28 L122 42 L142 42 Q146 42 146 46 L146 54" fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M52 40 L60 24 L102 24 L110 40" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="40" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="40" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <circle cx="124" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <line x1="8" y1="67" x2="156" y2="67" stroke={t.border} strokeWidth="1" />
      <circle cx="12" cy="54" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
