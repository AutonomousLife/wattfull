/**
 * Central URL route map.
 * Every in-app link uses these paths — keep them in sync with the
 * app/(site)/ directory structure.
 */
export const HREF_MAP: Record<string, string> = {
  home:        "/",
  ev:          "/ev",
  solar:       "/solar",
  marketplace: "/gear",      // URL is /gear, not /marketplace
  compare:     "/compare",
  runtime:     "/runtime",
  carbon:      "/carbon",
  states:      "/states",
  referrals:   "/referrals",
  methodology: "/methodology",
};

/** Convert a legacy page-ID (from old navigate() calls) to a URL path. */
export function idToHref(id: string): string {
  return HREF_MAP[id] ?? `/${id}`;
}
