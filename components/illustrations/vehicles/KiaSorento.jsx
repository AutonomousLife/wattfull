"use client";
import { useTheme } from "@/lib/ThemeContext";

export function KiaSorento({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Midsize 3-row SUV */}
      <path
        d="M16 54 L16 40 Q16 36 20 36 L36 36 L44 16 Q46 12 50 12 L112 12 Q116 12 118 16 L124 36 L144 36 Q148 36 148 40 L148 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M48 34 L54 14 L110 14 L116 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="82" y1="14" x2="82" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="40" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="126" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="126" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="6" y1="68" x2="158" y2="68" stroke={t.border} strokeWidth="1" />
      <circle cx="10" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
