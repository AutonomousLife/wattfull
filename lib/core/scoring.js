/**
 * lib/core/scoring.js
 * Statistical scoring utilities — Wilson score confidence interval + vote helpers.
 * Used by: /api/vote, /api/vote/count, comparison engine
 */

/**
 * Wilson score lower bound for a binomial proportion.
 * Gives a conservative estimate of "true quality" that favors items with more votes.
 *
 * @param {number} ups    Number of positive votes
 * @param {number} total  Total votes (up + down)
 * @param {number} [z]    Z-score for confidence level (1.96 = 95%)
 * @returns {number} Wilson score 0-1
 */
export function wilsonScore(ups, total, z = 1.96) {
  if (total === 0) return 0;
  const p = ups / total;
  const n = total;
  const z2 = z * z;
  return (
    (p + z2 / (2 * n) - z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) /
    (1 + z2 / n)
  );
}

/**
 * Time-decay weight: newer votes count at full weight; old votes fade slightly.
 * Returns a multiplier 0.7–1.0 based on age in days.
 *
 * @param {Date} createdAt
 * @returns {number}
 */
export function timeDecayWeight(createdAt) {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0.7, 1 - ageDays / 365);
}

/**
 * Returns true if an item meets the "User Recommended" threshold.
 * Requires at least 5 votes and a Wilson score ≥ 0.65.
 *
 * @param {number} ups
 * @param {number} total
 * @returns {boolean}
 */
export function isRecommended(ups, total) {
  return total >= 5 && wilsonScore(ups, total) >= 0.65;
}

/**
 * Format vote counts into a display-ready object.
 *
 * @param {{ ups: number, downs: number }} counts
 * @returns {{ ups, downs, total, score, recommended, label }}
 */
export function formatVoteResult({ ups, downs }) {
  const total = ups + downs;
  const score = wilsonScore(ups, total);
  const recommended = isRecommended(ups, total);
  return {
    ups,
    downs,
    total,
    score: Math.round(score * 100) / 100,
    recommended,
    label: recommended ? "User Recommended" : total > 0 ? `${ups} found helpful` : null,
  };
}

/**
 * SHA-256 hash (using Web Crypto — works in Node 18+ and Edge runtime).
 *
 * @param {string} str
 * @returns {Promise<string>} hex string
 */
export async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
