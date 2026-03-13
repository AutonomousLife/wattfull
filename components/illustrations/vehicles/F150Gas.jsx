"use client";
import { useTheme } from "@/lib/ThemeContext";

export function F150Gas({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Full-size pickup truck cab + bed */}
      <path
        d="M14 54 L14 40 Q14 36 18 36 L30 36 L40 12 Q42 8 46 8 L88 8 Q92 8 92 12 L92 26 L138 26 L140 34 Q144 36 144 40 L144 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Cab windshield + side window */}
      <path d="M36 34 L44 10 L86 10 L86 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="66" y1="10" x2="66" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="36" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="36" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="118" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="118" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="4" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Exhaust */}
      <circle cx="16" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
