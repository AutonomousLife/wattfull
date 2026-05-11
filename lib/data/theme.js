export const THEME = {
  light: {
    /* Base surfaces — warm parchment */
    bg:          "#F3F1EC",
    bg2:         "#EBE8E1",
    white:       "#FFFEF9",   // was #FFFFFF — slightly warm so cards don't clash with bg
    card:        "#F0EDE6",

    /* Glass surfaces */
    glass:       "rgba(255,254,249,0.82)",
    glassBorder: "rgba(255,255,255,0.60)",
    glassMid:    "rgba(243,241,236,0.94)",

    /* Text — clear 4-level hierarchy */
    text:        "#171717",
    textMid:     "#555555",   // was #3F3F3F — more separation from text
    textLight:   "#787878",   // was #676767
    textFaint:   "#A0A0A0",   // was #8E8E8E

    /* Brand */
    green:       "#4A7C59",
    greenLight:  "#E6EFE9",
    greenDark:   "#2F5A3C",
    greenGlass:  "rgba(74,124,89,0.08)",
    accent:      "#E8B830",
    accentLight: "rgba(232,184,48,0.12)",

    /* Semantic */
    border:      "#D8D3C8",
    borderLight: "#E4DFD4",
    warn:        "#C97B2A",
    warnBg:      "#FFF8EF",
    err:         "#B5403A",
    errBg:       "#FFF0EF",
    blue:        "#4A6FA5",
    blueBg:      "#EEF3FA",
    star:        "#D4A017",

    /* Nav */
    navBg:       "rgba(243,241,236,.95)",
    navBorder:   "rgba(216,211,200,0.88)",

    /* Shadows */
    shadow:      "rgba(0,0,0,.07)",
    shadowMd:    "0 4px 16px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)",
    shadowLg:    "0 12px 40px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.05)",
    shadowXl:    "0 24px 64px rgba(0,0,0,.11), 0 8px 24px rgba(0,0,0,.06)",

    /* Featured */
    featuredBg:     "rgba(74,124,89,0.05)",
    featuredBorder: "rgba(74,124,89,0.18)",
  },

  dark: {
    /* Base surfaces — warm-neutral dark (no blue tint) */
    bg:          "#111110",   // was #111113 — removed blue cast
    bg2:         "#191917",   // was #1A1A1E
    white:       "#1F1F1D",   // was #1E1E22
    card:        "#242422",   // was #232328

    /* Glass surfaces */
    glass:       "rgba(30,30,28,0.82)",
    glassBorder: "rgba(255,255,255,0.07)",
    glassMid:    "rgba(17,17,16,0.94)",

    /* Text */
    text:        "#EDECEA",   // was #E8E8EC — warmer, easier on eyes
    textMid:     "#A0A09A",   // was #A0A0A8 — removed blue tint
    textLight:   "#6E6E68",   // was #6E6E78
    textFaint:   "#4A4A46",   // was #4A4A52

    /* Brand — green pops cleanly against warm-neutral dark */
    green:       "#6AAF7B",
    greenLight:  "#1A2E20",
    greenDark:   "#8CD49A",
    greenGlass:  "rgba(106,175,123,0.10)",
    accent:      "#E8B830",
    accentLight: "rgba(232,184,48,0.14)",

    /* Semantic */
    border:      "#2C2C28",   // was #2A2A30 — removed blue tint
    borderLight: "#242420",   // was #222228
    warn:        "#E0993A",
    warnBg:      "#2A2218",
    err:         "#E06060",
    errBg:       "#2A1A1A",
    blue:        "#6A9FD5",
    blueBg:      "#1A2230",
    star:        "#E8B830",

    /* Nav */
    navBg:       "rgba(17,17,16,.93)",
    navBorder:   "rgba(44,44,40,0.92)",

    /* Shadows — deeper in dark mode */
    shadow:      "rgba(0,0,0,.32)",
    shadowMd:    "0 4px 16px rgba(0,0,0,.40), 0 1px 4px rgba(0,0,0,.24)",
    shadowLg:    "0 12px 40px rgba(0,0,0,.50), 0 4px 12px rgba(0,0,0,.30)",
    shadowXl:    "0 24px 64px rgba(0,0,0,.58), 0 8px 24px rgba(0,0,0,.34)",

    /* Featured */
    featuredBg:     "rgba(106,175,123,0.07)",
    featuredBorder: "rgba(106,175,123,0.22)",
  },
};
