"use client";
import { useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

function buildSummary(title, value, subtitle, details) {
  const detailLines = details.map((item) => `${item.label}: ${item.value}`);
  return [title, value, subtitle, ...detailLines].filter(Boolean).join("\n");
}

export function ShareBadge({ title, value, subtitle, details = [] }) {
  const { t } = useTheme();
  const badgeRef = useRef();
  const [status, setStatus] = useState("idle");
  const summary = useMemo(() => buildSummary(title, value, subtitle, details), [title, value, subtitle, details]);

  async function saveImage() {
    setStatus("saving");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(badgeRef.current, { backgroundColor: null, scale: 2 });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "wattfull-result.png";
      link.click();
      URL.revokeObjectURL(url);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <div>
      <div
        ref={badgeRef}
        style={{
          background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`,
          borderRadius: 16,
          padding: 24,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 4 }}>Wattfull insight card</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 36, fontWeight: 800, marginTop: 6 }}>{value}</div>
        {subtitle ? <div style={{ fontSize: 14, opacity: 0.86, marginTop: 4 }}>{subtitle}</div> : null}
        {details.length > 0 ? (
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {details.map((detail) => (
              <div key={`${detail.label}-${detail.value}`} style={{ fontSize: 12, opacity: 0.86 }}>
                <span style={{ opacity: 0.65 }}>{detail.label}:</span> <b>{detail.value}</b>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ marginTop: 16, fontSize: 11, opacity: 0.58 }}>Wattfull | Data-driven energy decisions</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        <button
          onClick={saveImage}
          disabled={status === "saving"}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${t.green}`,
            background: "transparent",
            color: t.green,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            opacity: status === "saving" ? 0.7 : 1,
          }}
        >
          {status === "saving" ? "Saving..." : "Save image"}
        </button>
        <button
          onClick={copySummary}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${t.borderLight}`,
            background: t.card,
            color: t.text,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {status === "copied" ? "Copied" : "Copy summary"}
        </button>
      </div>

      {status === "saved" ? <div style={{ fontSize: 11, color: t.green, marginTop: 8 }}>Insight card saved.</div> : null}
      {status === "error" ? <div style={{ fontSize: 11, color: t.err, marginTop: 8 }}>Action failed. Try again.</div> : null}
    </div>
  );
}
