import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wattfull.com";

// Top 50 most populated US zip codes (good starting seed for SEO pages)
const TOP_ZIPS = [
  "10001", "90001", "60601", "77001", "85001", "19101", "30301", "98101",
  "94101", "55401", "80201", "02101", "37201", "70001", "89101", "97201",
  "48201", "63101", "46201", "73101", "53201", "35201", "15201", "85701",
  "67201", "27601", "38101", "44101", "23201", "50301",
];

// Top EV vs ICE comparison pairs (slug format)
const TOP_COMPARISONS = [
  { zip: "94101", comparison: "tesla-model-3-long-range-vs-toyota-camry" },
  { zip: "90001", comparison: "tesla-model-y-long-range-vs-toyota-rav4" },
  { zip: "10001", comparison: "hyundai-ioniq-6-rwd-vs-honda-civic" },
  { zip: "77001", comparison: "ford-f-150-lightning-vs-ford-f-150-3-5l-v6" },
  { zip: "60601", comparison: "chevy-equinox-ev-vs-toyota-corolla" },
  { zip: "94101", comparison: "kia-ev6-rwd-vs-honda-cr-v" },
  { zip: "90001", comparison: "tesla-model-3-rwd-vs-honda-accord" },
  { zip: "10001", comparison: "vw-id-4-vs-mazda-cx-5" },
];

// EV vehicle slugs for cost-to-own pages
const EV_SLUGS = [
  "tesla-model-3-long-range",
  "tesla-model-y-long-range",
  "tesla-model-3-rwd",
  "tesla-model-y-rwd",
  "hyundai-ioniq-6-rwd",
  "hyundai-ioniq-5-awd",
  "kia-ev6-rwd",
  "kia-ev9",
  "chevy-equinox-ev",
  "ford-mustang-mach-e",
  "ford-f-150-lightning",
  "vw-id-4",
  "bmw-i4-edrive35",
  "polestar-2",
  "nissan-ariya",
  "honda-prologue",
  "rivian-r1t",
];

const ICE_SLUGS = [
  "toyota-camry",
  "toyota-corolla",
  "toyota-rav4",
  "toyota-prius",
  "honda-civic",
  "honda-cr-v",
  "honda-accord",
  "ford-f-150-3-5l-v6",
  "chevy-silverado-1500",
  "nissan-altima",
  "mazda-cx-5",
  "hyundai-tucson",
  "kia-sorento",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const zipRoutes: MetadataRoute.Sitemap = TOP_ZIPS.map((zip) => ({
    url: `${siteUrl}/ev-charging-cost/${zip}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const evCostRoutes: MetadataRoute.Sitemap = EV_SLUGS.map((slug) => ({
    url: `${siteUrl}/cost-to-own/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const iceCostRoutes: MetadataRoute.Sitemap = ICE_SLUGS.map((slug) => ({
    url: `${siteUrl}/cost-to-own/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const comparisonRoutes: MetadataRoute.Sitemap = TOP_COMPARISONS.map(({ zip, comparison }) => ({
    url: `${siteUrl}/ev-vs-gas/${zip}/${comparison}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    ...staticRoutes,
    ...comparisonRoutes,
    ...zipRoutes,
    ...evCostRoutes,
    ...iceCostRoutes,
  ];
}
