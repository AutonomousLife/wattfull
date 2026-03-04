"use client";
import { useTheme } from "@/lib/ThemeContext";

export function SolarPanelIllustration({ size = 120 }) {
  const { t } = useTheme();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun rays */}
      <circle cx="95" cy="25" r="12" fill={t.accent} opacity="0.25" />
      <circle cx="95" cy="25" r="7" fill={t.accent} opacity="0.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1={95 + Math.cos(angle * Math.PI / 180) * 14}
          y1={25 + Math.sin(angle * Math.PI / 180) * 14}
          x2={95 + Math.cos(angle * Math.PI / 180) * 19}
          y2={25 + Math.sin(angle * Math.PI / 180) * 19}
          stroke={t.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      ))}
      {/* Panel body — angled */}
      <path d="M15 85 L35 35 L105 35 L85 85Z" fill={t.blue} opacity="0.15" stroke={t.blue} strokeWidth="2" />
      {/* Grid lines horizontal */}
      <line x1="20" y1="72.5" x2="90" y2="72.5" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      <line x1="25" y1="60" x2="95" y2="60" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="47.5" x2="100" y2="47.5" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      {/* Grid lines vertical */}
      <line x1="38" y1="37" x2="28" y2="83" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      <line x1="55" y1="35" x2="45" y2="85" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      <line x1="72" y1="35" x2="62" y2="85" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      <line x1="88" y1="37" x2="78" y2="83" stroke={t.blue} strokeWidth="1" opacity="0.3" />
      {/* Stand / mount */}
      <line x1="50" y1="85" x2="45" y2="105" stroke={t.textLight} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="85" x2="75" y2="105" stroke={t.textLight} strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="105" x2="82" y2="105" stroke={t.textLight} strokeWidth="2.5" strokeLinecap="round" />
      {/* Energy bolt */}
      <path d="M56 90 L52 97 L57 97 L54 104" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
