export const fmt = (n) => Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;

/** Direct product link by ASIN with affiliate tag */
export const amazonDP = (asin) => `https://www.amazon.com/dp/${asin}/?tag=wattfull-20`;

/** Keyword search link with affiliate tag */
export const amazonLink = (q) => `https://www.amazon.com/s?k=${q}&tag=wattfull-20`;

/**
 * Resolve the best affiliate link for a product.
 * Priority: affiliateUrl (full SiteStripe URL) → asin → amazonSearch fallback
 */
export const productHref = (product) => {
  if (product.affiliateUrl) return product.affiliateUrl;
  if (product.asin) return amazonDP(product.asin);
  return amazonLink(product.amazonSearch);
};
