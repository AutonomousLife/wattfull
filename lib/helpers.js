export const fmt = (n) => Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;
export const amazonLink = (q) => `https://www.amazon.com/s?k=${q}`;
