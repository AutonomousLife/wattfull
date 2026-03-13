"use client";
import { useTheme } from "@/lib/ThemeContext";

export function HyundaiIoniq6({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Aerodynamic fastback sedan - very swept, pontoon-style */}
      <path
        d="M20 54 L20 46 Q20 42 24 42 L34 42 L42 28 Q44 22 48 22 L106 22 Q114 26 118 36 L122 44 L140 44 Q144 44 144 48 L144 54"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Highly raked windshield */}
      <path d="M46 40 L52 24 L104 24 L112 36" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="40" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.green} opacity="0.3" />
      <line x1="10" y1="67" x2="154" y2="67" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M132 34 L129 39 L133 39 L130 44" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
