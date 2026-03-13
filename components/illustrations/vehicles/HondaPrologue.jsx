"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HondaPrologue({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Midsize EV SUV - upright and spacious */}
      <path
        d="M16 54 L16 42 Q16 38 20 38 L36 38 L44 16 Q46 12 50 12 L112 12 Q116 12 118 16 L124 38 L144 38 Q148 38 148 42 L148 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M48 36 L56 14 L110 14 L116 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="84" y1="14" x2="84" y2="36" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="40" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <circle cx="126" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="126" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <line x1="6" y1="68" x2="158" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M136 26 L133 31 L137 31 L134 36" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
