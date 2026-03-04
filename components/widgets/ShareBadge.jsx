"use client";
import { useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function ShareBadge({ title, value, subtitle, details = [] }) {
  const { t } = useTheme();
  const badgeRef = useRef();
  const [status, setStatus] = useState("idle"); // idle | generating | done | error

  const generate = async () => {
    setStatus("generating");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "wattfull-result.png", { type: "image/png" })] })) {
        await navigator.share({
          title: "My Wattfull Results",
          files: [new File([blob], "wattfull-result.png", { type: "image/png" })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "wattfull-result.png";
        a.click();
        URL.revokeObjectURL(url);
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div>
      {/* Badge to capture */}
      <div ref={badgeRef} style={{ background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, borderRadius: 16, padding: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 36, fontWeight: 800 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{subtitle}</div>}
        {details.length > 0 && (
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {details.map((d, i) => (
              <div key={i} style={{ fontSize: 12, opacity: 0.8 }}>
                <span style={{ opacity: 0.6 }}>{d.label}:</span> <b>{d.value}</b>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16, fontSize: 11, opacity: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
          ⚡ Wattfull — wattfull.com
        </div>
      </div>

      {/* Share button */}
      <button onClick={generate} disabled={status === "generating"} style={{ marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 10, border: `1.5px solid ${t.green}`, background: "transparent", color: t.green, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: status === "generating" ? 0.6 : 1 }}>
        {status === "generating" ? "Generating..." : status === "done" ? "✓ Saved!" : status === "error" ? "Failed — try again" : "📸 Share Results"}
      </button>
    </div>
  );
}
