"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ChevySilverado({ size = 80 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Full-size pickup - taller, more upright cab than F150 */}
      <path
        d="M12 54 L12 40 Q12 36 16 36 L28 36 L36 10 Q38 6 42 6 L90 6 Q94 6 94 10 L94 26 L140 26 L142 34 Q146 36 146 40 L146 54"
        fill={t.textMid} opacity="0.08" stroke={t.textMid} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Cab windshield + side window */}
      <path d="M34 34 L40 8 L88 8 L88 34" fill={t.textLight} opacity="0.1" stroke={t.textLight} strokeWidth="1" />
      <line x1="64" y1="8" x2="64" y2="34" stroke={t.textLight} strokeWidth="0.8" opacity="0.3" />
      {/* Wheels */}
      <circle cx="34" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="34" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <circle cx="118" cy="58" r="10" fill={t.textMid} opacity="0.15" stroke={t.textMid} strokeWidth="1.5" />
      <circle cx="118" cy="58" r="4.5" fill={t.textLight} opacity="0.25" />
      <line x1="2" y1="68" x2="156" y2="68" stroke={t.border} strokeWidth="1" />
      {/* Exhaust */}
      <circle cx="14" cy="52" r="3" fill={t.textFaint} opacity="0.15" />
    </svg>
  );
}
