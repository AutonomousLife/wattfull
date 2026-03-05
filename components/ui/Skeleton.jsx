"use client";

/**
 * Skeleton — shimmer loading placeholder.
 *
 * Usage:
 *   <Skeleton width="100%" height={24} />
 *   <Skeleton width={120} height={14} radius="var(--r-sm)" />
 *
 * Shimmer animation is defined in globals.css (.wf-skeleton)
 */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = "var(--r-md)",
  style = {},
}) {
  return (
    <span
      className="wf-skeleton"
      style={{
        display: "block",
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText — renders N lines of skeleton text.
 */
export function SkeletonText({ lines = 3, lastWidth = "70%", height = 14, gap = 8 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          width={i === lines - 1 ? lastWidth : "100%"}
        />
      ))}
    </div>
  );
}
