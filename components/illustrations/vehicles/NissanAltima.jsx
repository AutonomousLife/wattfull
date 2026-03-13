"use client";
import { useTheme } from "@/lib/ThemeContext";

export function NissanAltima({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Compact sedan */}
      <path
        d="M20 52 L20 44 Q20 40 24 40 L38 40 L48 26 Q50 22 54 22 L106 22 Q110 24 114 28 L122 40 L140 40 Q144 40 144 44 L144 52"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M52 38 L60 24 L102 24 L110 38" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="38" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="56" r="4" fill={t.textLight} opacity="0.25" />
      <circle cx="124" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="56" r="4" fill={t.textLight} opacity="0.25" />
      <line x1="10" y1="65" x2="154" y2="65" stroke={t.border} strokeWidth="1" />
      <circle cx="14" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
