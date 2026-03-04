"use client";
import { useTheme } from "@/lib/ThemeContext";

export function PowerStationIllustration({ size = 120 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="20" y="30" width="80" height="60" rx="10" fill={t.green} opacity="0.12" stroke={t.green} strokeWidth="2" />
      {/* Handle */}
      <path d="M40 30 L40 20 Q40 15 45 15 L75 15 Q80 15 80 20 L80 30" stroke={t.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Display screen */}
      <rect x="32" y="40" width="36" height="20" rx="4" fill={t.green} opacity="0.2" stroke={t.green} strokeWidth="1.5" />
      {/* Display text */}
      <text x="50" y="53" textAnchor="middle" fontSize="10" fontWeight="700" fill={t.green} fontFamily="system-ui">100%</text>
      {/* Ports row */}
      <rect x="76" y="42" width="14" height="7" rx="2" fill={t.textLight} opacity="0.25" stroke={t.textLight} strokeWidth="1" />
      <rect x="76" y="53" width="14" height="7" rx="2" fill={t.textLight} opacity="0.25" stroke={t.textLight} strokeWidth="1" />
      {/* USB ports */}
      <rect x="34" y="68" width="8" height="5" rx="1.5" fill={t.blue} opacity="0.4" stroke={t.blue} strokeWidth="1" />
      <rect x="46" y="68" width="8" height="5" rx="1.5" fill={t.blue} opacity="0.4" stroke={t.blue} strokeWidth="1" />
      <rect x="58" y="68" width="8" height="5" rx="1.5" fill={t.accent} opacity="0.4" stroke={t.accent} strokeWidth="1" />
      {/* LED indicators */}
      {[36, 44, 52, 60].map((x, i) => (
        <circle key={i} cx={x} cy="80" r="2" fill={i < 3 ? t.green : t.textFaint} opacity={i < 3 ? 0.7 : 0.3} />
      ))}
      {/* Bolt */}
      <path d="M82 72 L78 79 L83 79 L80 86" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Base shadow */}
      <ellipse cx="60" cy="100" rx="35" ry="4" fill={t.shadow} opacity="0.5" />
    </svg>
  );
}
