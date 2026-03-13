"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HyundaiTucson({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Compact SUV - angular styling */}
      <path
        d="M16 54 L16 40 Q16 36 20 36 L36 36 L44 18 Q46 14 50 14 L110 14 Q114 14 116 18 L122 36 L142 36 Q146 36 146 40 L146 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M48 34 L56 16 L108 16 L114 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="82" y1="16" x2="82" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="40" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="124" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="6" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      <circle cx="10" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
