"use client";

/**
 * VoteBadge — shows vote count + "User Recommended" badge for a given item.
 * Allows users to vote up/down directly inline.
 *
 * Props:
 *   itemType: "product" | "vehicle" | "link"
 *   itemId:   string
 *   compact:  boolean (default false — show just badge, no vote buttons)
 */

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function VoteBadge({ itemType, itemId, compact = false }) {
  const { t } = useTheme();
  const [data, setData] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemType || !itemId) return;
    fetch(`/api/vote/count?itemType=${encodeURIComponent(itemType)}&itemId=${encodeURIComponent(itemId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, [itemType, itemId]);

  async function vote(direction) {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, direction }),
      });
      const d = await res.json();
      if (res.status === 429) {
        setVoted(true); // Already voted
        return;
      }
      if (d.ups !== undefined) {
        setData(d);
        setVoted(true);
      }
    } catch {}
    finally { setLoading(false); }
  }

  if (!data && !compact) return null;

  const recommended = data?.recommended;
  const total = data?.total ?? 0;
  const label = data?.label;

  if (compact) {
    if (!recommended) return null;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 12,
          padding: "2px 8px",
          fontSize: 11,
          color: t.green,
          fontWeight: 600,
        }}
      >
        ⭐ User Recommended
      </span>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {recommended && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 12,
            padding: "2px 8px",
            fontSize: 11,
            color: t.green,
            fontWeight: 600,
          }}
        >
          ⭐ User Recommended
        </span>
      )}

      {total > 0 && !recommended && (
        <span style={{ fontSize: 12, color: t.textMuted ?? t.text, opacity: 0.7 }}>
          {label ?? `${total} votes`}
        </span>
      )}

      {!voted && (
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => vote("up")}
            disabled={loading}
            title="Helpful"
            style={{
              border: "none",
              background: "transparent",
              cursor: loading ? "wait" : "pointer",
              fontSize: 16,
              padding: "2px 4px",
              borderRadius: 4,
              opacity: loading ? 0.5 : 1,
            }}
          >
            👍
          </button>
          <button
            onClick={() => vote("down")}
            disabled={loading}
            title="Not helpful"
            style={{
              border: "none",
              background: "transparent",
              cursor: loading ? "wait" : "pointer",
              fontSize: 16,
              padding: "2px 4px",
              borderRadius: 4,
              opacity: loading ? 0.5 : 1,
            }}
          >
            👎
          </button>
        </div>
      )}
      {voted && (
        <span style={{ fontSize: 11, color: t.green, opacity: 0.8 }}>✓ Thanks!</span>
      )}
    </div>
  );
}
