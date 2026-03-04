"use client";
import { useTheme } from "@/lib/ThemeContext";

export function Badge({ type = "info", children }) {
  const { t } = useTheme();

  const styles = {
    estimated: { bg: t.warnBg, color: t.warn },
    real: { bg: t.greenLight, color: t.greenDark },
    info: { bg: t.blueBg, color: t.blue },
    tag: { bg: t.greenLight, color: t.greenDark },
  };

  const c = styles[type] || styles.info;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 4,
        background: c.bg,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
