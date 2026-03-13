"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ToyotaPrius({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Prius - distinctive aerodynamic wedge hatchback */}
      <path
        d="M20 54 L20 46 Q20 42 24 42 L36 42 L42 26 Q44 20 48 20 L102 20 Q108 20 114 28 L118 40 L118 42 L140 42 Q144 42 144 46 L144 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Distinctive raked windshield */}
      <path d="M46 40 L50 22 L100 22 L112 38" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="78" y1="22" x2="78" y2="40" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="42" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <circle cx="122" cy="58" r="9" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="122" cy="58" r="4" fill={t.textLight} opacity="0.25" />
      <line x1="10" y1="67" x2="154" y2="67" stroke={t.border} strokeWidth="1" />
      {/* Small hybrid badge hint - tiny leaf */}
      <circle cx="14" cy="52" r="2.5" fill={t.textFaint} opacity="0.12" />
    </svg>
  );
}
