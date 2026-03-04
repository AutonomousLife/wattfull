import type { ReactNode } from "react";

export default function CostToOwnLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc" }}>
        <header style={{ borderBottom: "1px solid #e2e8f0", background: "#fff", padding: "14px 24px" }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>Wattfull</span>
          </a>
        </header>
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>{children}</main>
        <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          <a href="/methodology" style={{ color: "#10b981", textDecoration: "none" }}>Open Methodology</a>
          {" · "}
          <a href="/" style={{ color: "#10b981", textDecoration: "none" }}>All Tools</a>
          {" · "}
          Data: EIA.gov
        </footer>
      </body>
    </html>
  );
}
