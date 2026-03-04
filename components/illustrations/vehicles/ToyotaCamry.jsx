"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ToyotaCamry({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 54 L20 46 Q20 42 24 42 L38 42 L50 26 Q52 22 56 22 L106 22 Q110 24 112 28 L120 42 L140 42 Q144 42 144 46 L144 54" fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M54 40 L62 24 L100 24 L108 40" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="40" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <line x1="10" y1="67" x2="154" y2="67" stroke={t.border} strokeWidth="1" />
      <circle cx="14" cy="54" r="3" fill={t.textFaint} opacity="0.15" />
      <circle cx="10" cy="50" r="2" fill={t.textFaint} opacity="0.1" />
    </svg>
  );
}
