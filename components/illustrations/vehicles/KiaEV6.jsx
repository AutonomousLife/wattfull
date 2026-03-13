"use client";
import { useTheme } from "@/lib/ThemeContext";

export function KiaEV6({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sporty crossover fastback */}
      <path
        d="M18 54 L18 44 Q18 40 22 40 L36 40 L46 20 Q48 16 52 16 L104 16 Q110 16 114 24 L120 40 L140 40 Q144 40 144 44 L144 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M50 38 L58 18 L102 18 L110 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="18" x2="80" y2="38" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="40" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="40" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="8" y1="67" x2="156" y2="67" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M132 28 L129 33 L133 33 L130 38" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
