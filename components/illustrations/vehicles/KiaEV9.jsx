"use client";
import { useTheme } from "@/lib/ThemeContext";

export function KiaEV9({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3-row EV SUV - tall, wide, very upright */}
      <path
        d="M14 54 L14 40 Q14 36 18 36 L32 36 L40 12 Q42 8 46 8 L114 8 Q118 8 120 12 L126 36 L146 36 Q150 36 150 40 L150 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M44 34 L50 10 L112 10 L118 34" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="84" y1="10" x2="84" y2="34" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="36" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="36" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <circle cx="128" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="128" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <line x1="4" y1="68" x2="160" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M138 24 L135 29 L139 29 L136 34" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
