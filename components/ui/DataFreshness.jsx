"use client";

/**
 * DataFreshness — displays when electricity/gas data was last updated.
 * Shows a subtle banner on calculator pages.
 * Fetches from /api/data-status on mount.
 */

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";

const STALE_THRESHOLDS = {
  electricity_rates: 35, // days
  gas_prices: 7,         // days
};

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function formatDate(dateStr) {
  if (!dateStr) return "never";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return "unknown";
  }
}

export default function DataFreshness() {
  const { t } = useTheme();
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data-status")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.datasets) setDatasets(d.datasets); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !datasets?.length) return null;

  const electric = datasets.find((d) => d.datasetName === "electricity_rates");
  const gas = datasets.find((d) => d.datasetName === "gas_prices");

  const elecAge = daysSince(electric?.lastSuccessAt);
  const gasAge = daysSince(gas?.lastSuccessAt);
  const isStale =
    elecAge > STALE_THRESHOLDS.electricity_rates ||
    gasAge > STALE_THRESHOLDS.gas_prices;

  const lastUpdate = electric?.lastSuccessAt || gas?.lastSuccessAt;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 8,
        background: isStale
          ? "rgba(245,158,11,0.1)"
          : "rgba(16,185,129,0.08)",
        border: `1px solid ${isStale ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.2)"}`,
        fontSize: 12,
        color: isStale ? "#b45309" : t.green,
        marginTop: 8,
      }}
    >
      <span>{isStale ? "⚠" : "⚡"}</span>
      <span>
        {isStale
          ? `Rates may be stale — last updated ${formatDate(lastUpdate)}`
          : `Rates updated ${formatDate(lastUpdate)} · Source: EIA`}
      </span>
      {isStale && (
        <a
          href="https://www.eia.gov/electricity/monthly/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", marginLeft: 4, opacity: 0.8 }}
        >
          EIA ↗
        </a>
      )}
    </div>
  );
}
