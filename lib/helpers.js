export const fmt = (n) => Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "wattfull-20";

/** Direct product link by ASIN with affiliate tag */
export const amazonDP = (asin) => `https://www.amazon.com/dp/${asin}/?tag=${TAG}`;

/** Keyword search link with affiliate tag */
export const amazonLink = (q) => `https://www.amazon.com/s?k=${q}&tag=${TAG}`;

/**
 * Resolve the best affiliate link for a product.
 * Priority: affiliateUrl → amazonSearch (search always resolves even if ASIN changes) → asin dp link
 */
export const productHref = (product) => {
  if (product.affiliateUrl) return product.affiliateUrl;
  if (product.amazonSearch) return amazonLink(product.amazonSearch);
  if (product.asin) return amazonDP(product.asin);
  return `https://www.amazon.com/?tag=${TAG}`;
};
