"use client";
import { useTheme } from "@/lib/ThemeContext";

export function Polestar2({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fastback hatchback - smooth sloping roofline */}
      <path
        d="M18 52 L18 42 Q18 38 22 38 L38 38 L48 22 Q50 18 54 18 L100 18 Q106 18 112 26 L116 38 L140 40 Q144 40 144 44 L144 52"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M52 36 L60 20 L98 20 L106 34" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="20" x2="80" y2="36" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="42" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="56" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="56" r="4" fill={t.green} opacity="0.3" />
      <line x1="8" y1="65" x2="156" y2="65" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M128 30 L125 35 L129 35 L126 40" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
