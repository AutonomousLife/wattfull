"use client";
import { useTheme } from "@/lib/ThemeContext";

export function EVIllustration({ size = 120 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Car body */}
      <path
        d="M18 72 L18 62 Q18 58 22 58 L32 58 L42 42 Q44 38 48 38 L78 38 Q82 38 84 42 L92 58 L102 58 Q106 58 106 62 L106 72"
        fill={t.green} opacity="0.12" stroke={t.green} strokeWidth="2" strokeLinejoin="round"
      />
      {/* Windshield */}
      <path d="M44 56 L50 42 L76 42 L82 56" fill={t.blue} opacity="0.15" stroke={t.blue} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Windows divider */}
      <line x1="63" y1="42" x2="63" y2="56" stroke={t.blue} strokeWidth="1" opacity="0.4" />
      {/* Door line */}
      <line x1="63" y1="56" x2="63" y2="70" stroke={t.green} strokeWidth="1" opacity="0.3" />
      {/* Wheels */}
      <circle cx="35" cy="76" r="10" fill={t.textMid} opacity="0.2" stroke={t.textMid} strokeWidth="2" />
      <circle cx="35" cy="76" r="4" fill={t.textLight} opacity="0.3" />
      <circle cx="89" cy="76" r="10" fill={t.textMid} opacity="0.2" stroke={t.textMid} strokeWidth="2" />
      <circle cx="89" cy="76" r="4" fill={t.textLight} opacity="0.3" />
      {/* Ground line */}
      <line x1="10" y1="86" x2="114" y2="86" stroke={t.border} strokeWidth="1.5" />
      {/* Charging port bolt */}
      <path d="M96 52 L93 57 L97 57 L94 62" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* EV badge */}
      <rect x="46" y="60" width="18" height="8" rx="2" fill={t.green} opacity="0.25" />
      <text x="55" y="67" textAnchor="middle" fontSize="6" fontWeight="700" fill={t.green} fontFamily="system-ui">EV</text>
      {/* Clean air swoosh */}
      <path d="M8 60 Q4 55 8 50" stroke={t.green} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M12 63 Q7 58 12 53" stroke={t.green} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
    </svg>
  );
}
