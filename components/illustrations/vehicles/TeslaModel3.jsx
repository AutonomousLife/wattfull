"use client";
import { useTheme } from "@/lib/ThemeContext";

export function TeslaModel3({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sleek sedan profile */}
      <path
        d="M20 52 L20 46 Q20 42 24 42 L38 42 L50 26 Q52 22 56 22 L104 22 Q108 24 110 28 L120 42 L140 42 Q144 42 144 46 L144 52"
        fill={t.green} opacity="0.1" stroke={t.green} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Roof line - very sleek */}
      <path d="M52 24 L58 22 L102 22 L108 26" stroke={t.green} strokeWidth="1" opacity="0.5" fill="none" />
      {/* Windshield */}
      <path d="M54 40 L62 24 L96 24 L104 40" fill={t.blue} opacity="0.12" stroke={t.blue} strokeWidth="1" />
      <line x1="80" y1="24" x2="80" y2="40" stroke={t.blue} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="42" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="56" r="4" fill={t.green} opacity="0.3" />
      <circle cx="122" cy="56" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="56" r="4" fill={t.green} opacity="0.3" />
      {/* Ground */}
      <line x1="10" y1="65" x2="154" y2="65" stroke={t.border} strokeWidth="1" />
      {/* Bolt */}
      <path d="M132 34 L129 39 L133 39 L130 44" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
