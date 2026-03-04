"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Tip } from "./Tip";

export function Toggle({ label, value, onChange, tip }) {
  const { t } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: "6px 0",
      }}
    >
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: t.textMid,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
        {tip && <Tip text={tip} />}
      </label>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background .2s",
          background: value ? t.green : t.border,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "#fff",
            position: "absolute",
            top: 2,
            transition: "left .2s",
            left: value ? 22 : 2,
            boxShadow: "0 1px 4px rgba(0,0,0,.15)",
          }}
        />
      </button>
    </div>
  );
}
