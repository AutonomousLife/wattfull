"use client";

import { useState } from "react";

export default function AdminActions({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        setDone(action);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span style={{ color: done === "approve" ? "#4ade80" : "#f87171", fontSize: 13, fontWeight: 600 }}>
        {done === "approve" ? "Approved" : done === "reject" ? "Rejected" : "Deleted"}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <button
        onClick={() => act("approve")}
        disabled={loading}
        style={{ padding: "6px 14px", borderRadius: 6, background: "#10b981", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}
      >
        Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading}
        style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", color: "#f87171", border: "1px solid #f87171", fontSize: 13, cursor: loading ? "wait" : "pointer" }}
      >
        Reject
      </button>
      <button
        onClick={() => act("delete")}
        disabled={loading}
        style={{ padding: "6px 10px", borderRadius: 6, background: "transparent", color: "#64748b", border: "1px solid #334155", fontSize: 13, cursor: loading ? "wait" : "pointer" }}
      >
        Delete
      </button>
    </div>
  );
}
