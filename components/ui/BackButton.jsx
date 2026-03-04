"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

/**
 * BackButton — calls router.back() to use the real browser history stack.
 * Works because every navigation in Wattfull now pushes a real URL entry.
 */
export function BackButton({ label = "← Back" }) {
  const router = useRouter();
  const { t } = useTheme();

  return (
    <button
      onClick={() => router.back()}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = t.text;
        e.currentTarget.style.borderColor = t.green + "88";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = t.textMid;
        e.currentTarget.style.borderColor = t.border;
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        padding: "5px 12px",
        fontSize: 13,
        color: t.textMid,
        cursor: "pointer",
        marginBottom: 20,
        transition: "color .15s, border-color .15s",
      }}
    >
      {label}
    </button>
  );
}
