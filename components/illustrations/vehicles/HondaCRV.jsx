"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HondaCRV({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 54 L18 40 Q18 36 22 36 L38 36 L48 18 Q50 14 54 14 L108 14 Q112 14 114 18 L120 36 L142 36 Q146 36 146 40 L146 54" fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M52 34 L60 16 L106 16 L112 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="82" y1="16" x2="82" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="122" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="8" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      <circle cx="12" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
