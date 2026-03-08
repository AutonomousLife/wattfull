"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

const STALE_THRESHOLDS = {
  electricity_rates: 35,
  gas_prices: 7,
};

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function formatNow() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DataFreshness() {
  const { t } = useTheme();
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data-status")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.datasets) setDatasets(payload.datasets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const derived = useMemo(() => {
    if (!datasets?.length) return null;
    const electric = datasets.find((item) => item.datasetName === "electricity_rates");
    const gas = datasets.find((item) => item.datasetName === "gas_prices");
    const elecAge = daysSince(electric?.lastSuccessAt);
    const gasAge = daysSince(gas?.lastSuccessAt);
    const isStale = elecAge > STALE_THRESHOLDS.electricity_rates || gasAge > STALE_THRESHOLDS.gas_prices;
    const lastUpdate = electric?.lastSuccessAt || gas?.lastSuccessAt;
    const formattedLastUpdate = formatDate(lastUpdate);
    return {
      isStale,
      hasRealTimestamp: Boolean(formattedLastUpdate),
      timestampLabel: formattedLastUpdate ?? formatNow(),
    };
  }, [datasets]);

  if (loading || !derived) return null;

  const badgeLabel = derived.hasRealTimestamp ? (derived.isStale ? "Estimated" : "Live data") : "Snapshot";
  const message = derived.hasRealTimestamp
    ? (derived.isStale ? `Rates may be stale. Last successful update: ${derived.timestampLabel}` : `Rates refreshed ${derived.timestampLabel}`)
    : `Rates snapshot checked ${derived.timestampLabel}`;
  const source = derived.hasRealTimestamp ? "Source: EIA and state fuel datasets" : "Source: fallback benchmark layer";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        padding: "8px 12px",
        borderRadius: 10,
        background: derived.isStale ? "rgba(245,158,11,0.10)" : "rgba(16,185,129,0.08)",
        border: `1px solid ${derived.isStale ? "rgba(245,158,11,0.28)" : "rgba(16,185,129,0.20)"}`,
        marginTop: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: derived.isStale ? "#b45309" : "#065f46",
            background: derived.isStale ? "#fef3c7" : "#d1fae5",
            borderRadius: 999,
            padding: "4px 8px",
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          {badgeLabel}
        </span>
        <span style={{ fontSize: 12, color: derived.isStale ? "#b45309" : t.green }}>
          {message}
        </span>
      </div>
      <div style={{ fontSize: 11, color: t.textLight }}>
        {source}
      </div>
    </div>
  );
}
