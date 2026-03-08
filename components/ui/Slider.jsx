"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Tip } from "./Tip";

const INTERVAL_FACTORS = {
  year: 1,
  week: 52,
  day: 365,
};

function formatDisplayValue(value, suffix) {
  return `${typeof value === "number" ? value.toLocaleString() : value}${suffix}`;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  tip,
  editable = false,
  inputModes = null,
  inputPrefix = "",
}) {
  const { t } = useTheme();
  const pct = ((value - min) / (max - min)) * 100;
  const [mode, setMode] = useState(inputModes?.[0] ?? "year");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editable) return;
    const factor = INTERVAL_FACTORS[mode] ?? 1;
    setDraft(String(Math.max(0, Math.round(value / factor))));
  }, [value, mode, editable]);

  function commitDraft(raw) {
    const numeric = Number(String(raw).replace(/,/g, ""));
    if (!Number.isFinite(numeric)) return;
    const factor = INTERVAL_FACTORS[mode] ?? 1;
    const annualized = Math.min(max, Math.max(min, Math.round((numeric * factor) / step) * step));
    onChange(annualized);
    setDraft(String(Math.round(annualized / factor)));
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: t.textMid, display: "flex", alignItems: "center", gap: 4 }}>
          {label}
          {tip && <Tip text={tip} />}
        </label>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
          {formatDisplayValue(value, suffix)}
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
      {editable ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "8px 10px" }}>
            {inputPrefix ? <span style={{ fontSize: 12, color: t.textLight }}>{inputPrefix}</span> : null}
            <input
              type="number"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commitDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitDraft(e.currentTarget.value);
                  e.currentTarget.blur();
                }
              }}
              style={{ width: 84, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 13, fontWeight: 600 }}
            />
            <span style={{ fontSize: 12, color: t.textLight }}>
              {mode === "year" ? suffix || "/year" : mode === "week" ? "/week" : "/day"}
            </span>
          </div>
          {inputModes?.length ? (
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ background: t.card, border: `1px solid ${t.borderLight}`, borderRadius: 10, padding: "8px 10px", color: t.text, fontSize: 12, fontWeight: 600 }}
            >
              {inputModes.map((option) => (
                <option key={option} value={option}>{option === "year" ? "per year" : option === "week" ? "per week" : "per day"}</option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
