"use client";
import { useTheme } from "@/lib/ThemeContext";
import { Tip } from "./Tip";

export function Slider({ label, value, onChange, min, max, step = 1, suffix = "", tip }) {
  const { t } = useTheme();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: t.textMid, display: "flex", alignItems: "center", gap: 4 }}>
          {label}
          {tip && <Tip text={tip} />}
        </label>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
          {typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="wf-slider"
        style={{
          "--wf-slider-color": t.green,
          "--wf-slider-pct": `${pct}%`,
        }}
      />
    </div>
  );
}
