"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function Collapsible({ title, children, defaultOpen = false }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderTop: `1px solid ${t.borderLight}`, marginTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: t.textMid,
        }}
      >
        {title}
        <span
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
            fontSize: 12,
          }}
        >
          {"\u25BC"}
        </span>
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  );
}
