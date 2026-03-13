"use client";
import { useTheme } from "@/lib/ThemeContext";

export function BMWI4({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sporty gran coupe - low fastback silhouette */}
      <path
        d="M20 54 L20 46 Q20 42 24 42 L36 42 L48 26 Q50 22 54 22 L102 22 Q108 22 112 28 L116 38 L118 44 L140 44 Q144 44 144 48 L144 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M52 40 L60 24 L100 24 L106 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="40" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="10" y1="67" x2="154" y2="67" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M128 34 L125 39 L129 39 L126 44" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
