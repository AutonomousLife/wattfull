"use client";
import { useTheme } from "@/lib/ThemeContext";

export function ICEIllustration({ size = 120 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Car body */}
      <path
        d="M18 72 L18 62 Q18 58 22 58 L32 58 L42 42 Q44 38 48 38 L78 38 Q82 38 84 42 L92 58 L102 58 Q106 58 106 62 L106 72"
        fill={t.textMid} opacity="0.1" stroke={t.textMid} strokeWidth="2" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M44 56 L50 42 L76 42 L82 56" fill={t.textLight} opacity="0.12" stroke={t.textLight} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Windows divider */}
      <line x1="63" y1="42" x2="63" y2="56" stroke={t.textLight} strokeWidth="1" opacity="0.4" />
      {/* Door line */}
      <line x1="63" y1="56" x2="63" y2="70" stroke={t.textMid} strokeWidth="1" opacity="0.3" />
      {/* Wheels */}
      <circle cx="35" cy="76" r="10" fill={t.textMid} opacity="0.2" stroke={t.textMid} strokeWidth="2" />
      <circle cx="35" cy="76" r="4" fill={t.textLight} opacity="0.3" />
      <circle cx="89" cy="76" r="10" fill={t.textMid} opacity="0.2" stroke={t.textMid} strokeWidth="2" />
      <circle cx="89" cy="76" r="4" fill={t.textLight} opacity="0.3" />
      {/* Ground line */}
      <line x1="10" y1="86" x2="114" y2="86" stroke={t.border} strokeWidth="1.5" />
      {/* Gas badge */}
      <rect x="46" y="60" width="18" height="8" rx="2" fill={t.textMid} opacity="0.2" />
      <text x="55" y="67" textAnchor="middle" fontSize="6" fontWeight="700" fill={t.textMid} fontFamily="system-ui">GAS</text>
      {/* Exhaust puffs */}
      <circle cx="10" cy="72" r="4" fill={t.textFaint} opacity="0.2" />
      <circle cx="5" cy="68" r="3" fill={t.textFaint} opacity="0.15" />
      <circle cx="1" cy="64" r="2.5" fill={t.textFaint} opacity="0.1" />
      {/* Exhaust pipe */}
      <rect x="14" y="72" width="6" height="3" rx="1" fill={t.textLight} opacity="0.3" />
    </svg>
  );
}
