"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ToyotaTacoma({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Midsize pickup truck cab + bed */}
      <path
        d="M14 54 L14 40 Q14 36 18 36 L32 36 L42 14 Q44 10 48 10 L84 10 Q88 10 88 14 L88 28 L134 26 L136 34 Q140 36 140 40 L140 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Cab windshield + side window */}
      <path d="M36 34 L44 12 L82 12 L82 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="63" y1="12" x2="63" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="36" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="36" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="114" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="114" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="4" y1="68" x2="152" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Exhaust */}
      <circle cx="16" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
