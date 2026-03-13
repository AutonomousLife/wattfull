"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ToyotaHighlander({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3-row SUV - tall, wide, long */}
      <path
        d="M14 54 L14 40 Q14 36 18 36 L34 36 L42 14 Q44 10 48 10 L112 10 Q116 10 118 14 L124 36 L146 36 Q150 36 150 40 L150 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M46 34 L52 12 L110 12 L116 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="82" y1="12" x2="82" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="38" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="38" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="128" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="128" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="4" y1="68" x2="160" y2="68" stroke={t.border} strokeWidth="1" />
      <circle cx="8" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
