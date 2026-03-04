"use client";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function Tip({ text }) {
  const { t } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: 4 }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          background: "none",
          border: `1px solid ${t.border}`,
          borderRadius: "50%",
          width: 18,
          height: 18,
          fontSize: 11,
          color: t.textLight,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        ?
      </button>
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: t.text,
            color: t.bg,
            fontSize: 12,
            lineHeight: 1.5,
            padding: "8px 12px",
            borderRadius: 8,
            width: 220,
            zIndex: 10,
            boxShadow: `0 4px 16px ${t.shadow}`,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}
