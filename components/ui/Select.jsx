"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Tip } from "./Tip";

export function Select({ label, value, onChange, options, tip }) {
  const { t } = useTheme();

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.textMid,
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {label}
          {tip && <Tip text={tip} />}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          border: `1.5px solid ${t.border}`,
          borderRadius: 10,
          padding: "11px 12px",
          fontSize: 14,
          background: t.white,
          color: t.text,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
