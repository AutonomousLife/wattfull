"use client";
import { useTheme } from "@/lib/ThemeContext";

export function CadillacLyriq({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Luxury fastback SUV - sleek sloping rear */}
      <path
        d="M18 54 L18 42 Q18 38 22 38 L36 38 L44 18 Q46 14 50 14 L108 14 Q114 16 118 22 L122 36 L122 38 L142 38 Q146 38 146 42 L146 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M48 36 L56 16 L106 16 L112 34" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="82" y1="16" x2="82" y2="36" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="40" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <circle cx="124" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="124" cy="58" r="4.5" fill={t.green} opacity="0.3" />
      <line x1="8" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M134 30 L131 35 L135 35 L132 40" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
