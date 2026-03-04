"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Tip } from "./Tip";

export function Input({
  label,
  tip,
  value,
  onChange,
  type = "text",
  suffix,
  prefix,
  min,
  max,
  step,
  error,
  ...rest
}) {
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${error ? t.err : t.border}`,
          borderRadius: 10,
          background: t.white,
          overflow: "hidden",
          transition: "border-color .2s",
        }}
      >
        {prefix && (
          <span style={{ padding: "0 0 0 12px", color: t.textLight, fontSize: 14 }}>
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) =>
            onChange(
              type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value
            )
          }
          type={type}
          min={min}
          max={max}
          step={step}
          style={{
            border: "none",
            outline: "none",
            padding: "11px 12px",
            fontSize: 14,
            width: "100%",
            background: "transparent",
            color: t.text,
          }}
          {...rest}
        />
        {suffix && (
          <span
            style={{
              padding: "0 12px 0 0",
              color: t.textLight,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: t.err, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
