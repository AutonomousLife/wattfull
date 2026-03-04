"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function VehicleSearch({ label, vehicles = [], value, onChange, popularIds = [] }) {
  const { t } = useTheme();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef();
  const inputRef = useRef();

  const selected = vehicles.find((v) => v.id === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const popular = popularIds.length
    ? vehicles.filter((v) => popularIds.includes(v.id))
    : vehicles.slice(0, 10);

  const filtered = query.trim()
    ? vehicles.filter((v) => v.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : null;

  const showItems = filtered ?? popular;
  const sectionLabel = filtered ? `Results for "${query}"` : "Popular Vehicles";

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (v) => {
    onChange(v.id);
    setQuery("");
    setOpen(false);
  };

  const effLabel = (v) =>
    v.kwh != null ? `${v.kwh} kWh/100mi` : v.mpg != null ? `${v.mpg} MPG` : "";

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMid, marginBottom: 4 }}>{label}</div>
      )}

      {/* Trigger button / collapsed state */}
      {!open && (
        <button
          onClick={handleOpen}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            background: t.bg,
            cursor: "pointer",
            fontSize: 14,
            color: selected ? t.text : t.textLight,
            textAlign: "left",
          }}
        >
          <span style={{ flex: 1 }}>{selected ? selected.name : "Select vehicle…"}</span>
          {selected && (
            <span style={{ fontSize: 11, color: t.textLight, marginRight: 8 }}>{effLabel(selected)}</span>
          )}
          <span style={{ color: t.textLight, fontSize: 11 }}>▼</span>
        </button>
      )}

      {/* Open state: search input */}
      {open && (
        <div
          style={{
            border: `1px solid ${t.green}`,
            borderRadius: 10,
            padding: "10px 12px",
            background: t.bg,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 13, color: t.textLight }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setOpen(false); setQuery(""); }
              if (e.key === "Enter" && showItems.length === 1) handleSelect(showItems[0]);
            }}
            placeholder="Type to search vehicles…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: t.text,
              background: "transparent",
            }}
          />
          <button
            onClick={() => { setOpen(false); setQuery(""); }}
            style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: t.white,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            boxShadow: `0 6px 24px ${t.shadow}`,
            zIndex: 100,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "6px 12px 4px",
              fontSize: 10,
              fontWeight: 700,
              color: t.textLight,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              borderBottom: `1px solid ${t.borderLight}`,
            }}
          >
            {sectionLabel}
          </div>

          {showItems.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: t.textMid, textAlign: "center" }}>
              No vehicles found
            </div>
          )}

          {showItems.map((v) => {
            const isSelected = v.id === value;
            return (
              <div
                key={v.id}
                onClick={() => handleSelect(v)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${t.borderLight}`,
                  background: isSelected ? t.greenLight + "55" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = t.card; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? t.greenLight + "55" : "transparent"; }}
              >
                <span style={{ fontSize: 13, color: t.text, fontWeight: isSelected ? 700 : 400 }}>
                  {v.name}
                </span>
                <span style={{ fontSize: 11, color: isSelected ? t.green : t.textLight }}>
                  {effLabel(v)}
                  {isSelected ? " ✓" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
