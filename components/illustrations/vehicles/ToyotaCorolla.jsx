"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ToyotaCorolla({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Compact sedan */}
      <path d="M22 54 L22 46 Q22 42 26 42 L40 42 L52 28 Q54 24 58 24 L104 24 Q108 26 110 30 L118 42 L138 42 Q142 42 142 46 L142 54" fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M56 40 L62 26 L98 26 L106 40" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="78" y1="26" x2="78" y2="40" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="44" cy="58" r="8" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="44" cy="58" r="3.5" fill={t.textLight} opacity="0.25" />
      <circle cx="120" cy="58" r="8" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="120" cy="58" r="3.5" fill={t.textLight} opacity="0.25" />
      <line x1="12" y1="66" x2="152" y2="66" stroke={t.border} strokeWidth="1" />
      <circle cx="16" cy="54" r="2.5" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
