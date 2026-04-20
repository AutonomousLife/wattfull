// Model years. When the same nameplate appears across multiple years, we keep
// an entry per year so users can pick the exact trim/year they're considering.
// MSRP reflects that year's base price; kWh/100mi and MPG track EPA spec where
// available and manufacturer/NHTSA estimates otherwise.

export const POPULAR_EV_IDS = [
  "model3lr_2025", "modely_2025", "ioniq6rwd_2025", "ioniq5_2025", "ev6rwd_2025",
  "equinoxev_2025", "mache_2025", "id4_2025", "f150lightning_2025", "bmwi4_2025",
  "polestar2_2025", "nisanariya_2025", "hondaprologue_2025", "cadillaclyriq_2025", "ev9_2025",
];

export const POPULAR_ICE_IDS = [
  "camry_2025", "civic_2025", "corolla_2025", "rav4_2025", "crv_2025",
  "accord_2025", "f150gas_2025", "tacoma_2025", "altima_2025", "cx5_2025",
  "tucson_2025", "prius_2025", "highlander_2025", "sorento_2025", "silverado_2025",
];

// ── Back-compat IDs: legacy bare ids still resolve to the current-year variant.
export const LEGACY_ID_MAP = {
  model3rwd: "model3rwd_2025", model3lr: "model3lr_2025", model3perf: "model3perf_2025",
  modelyrwd: "modelyrwd_2025", modely: "modely_2025", modelyperf: "modelyperf_2025",
  models: "models_2025", modelx: "modelx_2025",
  ioniq5rwd: "ioniq5rwd_2025", ioniq5: "ioniq5_2025", ioniq6rwd: "ioniq6rwd_2025",
  ioniq6awd: "ioniq6awd_2025", konael: "konael_2025",
  ev6rwd: "ev6rwd_2025", ev6awd: "ev6awd_2025", ev6gt: "ev6gt_2025", ev9: "ev9_2025",
  bolt: "equinoxev_2025", blazerev: "blazerev_2025",
  mache: "mache_2025", f150lightning: "f150lightning_2025",
  id4: "id4_2025", bmwi4: "bmwi4_2025", polestar2: "polestar2_2025",
  rivianr1t: "rivianr1t_2025", rivianr1s: "rivianr1s_2025",
  nisanariya: "nisanariya_2025", subarosolt: "subarosolt_2025",
  toyotabz4x: "toyotabz4x_2025", hondaprologue: "hondaprologue_2025",
  cadillaclyriq: "cadillaclyriq_2025", mercedeseqb: "mercedeseqb_2025",
  camry: "camry_2025", corolla: "corolla_2025", rav4: "rav4_2025",
  rav4hybrid: "rav4hybrid_2025", prius: "prius_2025", tacoma: "tacoma_2025",
  highlander: "highlander_2025", civic: "civic_2025", crv: "crv_2025",
  accord: "accord_2025", f150gas: "f150gas_2025", silverado: "silverado_2025",
  gmcsierra: "gmcsierra_2025", altima: "altima_2025", cx5: "cx5_2025",
  tucson: "tucson_2025", sorento: "sorento_2025", bmw330i: "bmw330i_2025",
};

// Helper to expand a nameplate across several model years.
// For each year, we provide the year-specific price; kWh/MPG can vary too.
function years(base, variants) {
  // variants: { year: { msrp, kwh?, mpg?, fc? } }
  return Object.entries(variants).map(([year, spec]) => ({
    id: `${base.id}_${year}`,
    name: `${year} ${base.name}`,
    year: Number(year),
    ...base.defaults,
    ...spec,
  }));
}

export const VEHICLES = {
  ev: [
    // ── Tesla Model 3 (RWD / LR / Performance) 2021-2025
    ...years({ id: "model3rwd", name: "Tesla Model 3 RWD", defaults: { fc: 7500 } }, {
      2021: { kwh: 25.0, msrp: 38990, fc: 0 },
      2022: { kwh: 25.0, msrp: 46990, fc: 0 },
      2023: { kwh: 25.0, msrp: 40240, fc: 7500 },
      2024: { kwh: 25.0, msrp: 38990, fc: 7500 },
      2025: { kwh: 25.0, msrp: 40240, fc: 7500 },
    }),
    ...years({ id: "model3lr", name: "Tesla Model 3 Long Range", defaults: { fc: 7500 } }, {
      2021: { kwh: 24.0, msrp: 46990, fc: 0 },
      2022: { kwh: 24.0, msrp: 53990, fc: 0 },
      2023: { kwh: 24.0, msrp: 47240, fc: 7500 },
      2024: { kwh: 24.0, msrp: 45990, fc: 7500 },
      2025: { kwh: 24.0, msrp: 45990, fc: 7500 },
    }),
    ...years({ id: "model3perf", name: "Tesla Model 3 Performance", defaults: { fc: 7500 } }, {
      2022: { kwh: 27.0, msrp: 62990, fc: 0 },
      2023: { kwh: 27.0, msrp: 52240, fc: 7500 },
      2024: { kwh: 27.0, msrp: 52990, fc: 7500 },
      2025: { kwh: 27.0, msrp: 52990, fc: 7500 },
    }),
    // ── Tesla Model Y 2021-2025
    ...years({ id: "modelyrwd", name: "Tesla Model Y RWD", defaults: { fc: 7500 } }, {
      2023: { kwh: 26.0, msrp: 43990, fc: 7500 },
      2024: { kwh: 26.0, msrp: 42990, fc: 7500 },
      2025: { kwh: 26.0, msrp: 44990, fc: 7500 },
    }),
    ...years({ id: "modely", name: "Tesla Model Y Long Range", defaults: { fc: 7500 } }, {
      2021: { kwh: 27.0, msrp: 49990, fc: 0 },
      2022: { kwh: 27.0, msrp: 58990, fc: 0 },
      2023: { kwh: 27.0, msrp: 52240, fc: 7500 },
      2024: { kwh: 27.0, msrp: 47990, fc: 7500 },
      2025: { kwh: 27.0, msrp: 48990, fc: 7500 },
    }),
    ...years({ id: "modelyperf", name: "Tesla Model Y Performance", defaults: { fc: 7500 } }, {
      2022: { kwh: 30.0, msrp: 67990, fc: 0 },
      2023: { kwh: 30.0, msrp: 56240, fc: 7500 },
      2024: { kwh: 30.0, msrp: 52990, fc: 7500 },
      2025: { kwh: 30.0, msrp: 52990, fc: 7500 },
    }),
    // ── Tesla Model S / X 2021-2025
    ...years({ id: "models", name: "Tesla Model S", defaults: { fc: 7500 } }, {
      2022: { kwh: 27.0, msrp: 104990, fc: 0 },
      2023: { kwh: 27.0, msrp: 87490, fc: 0 },
      2024: { kwh: 27.0, msrp: 74990, fc: 0 },
      2025: { kwh: 27.0, msrp: 74990, fc: 0 },
    }),
    ...years({ id: "modelx", name: "Tesla Model X", defaults: { fc: 7500 } }, {
      2023: { kwh: 33.0, msrp: 97490, fc: 0 },
      2024: { kwh: 33.0, msrp: 79990, fc: 0 },
      2025: { kwh: 33.0, msrp: 79990, fc: 0 },
    }),
    // ── Hyundai Ioniq 5 / 6 / Kona 2022-2025
    ...years({ id: "ioniq5rwd", name: "Hyundai Ioniq 5 RWD", defaults: { fc: 7500 } }, {
      2022: { kwh: 28.0, msrp: 39950, fc: 0 },
      2023: { kwh: 28.0, msrp: 41450, fc: 0 },
      2024: { kwh: 28.0, msrp: 41800, fc: 7500 },
      2025: { kwh: 28.0, msrp: 43450, fc: 7500 },
    }),
    ...years({ id: "ioniq5", name: "Hyundai Ioniq 5 AWD", defaults: { fc: 7500 } }, {
      2022: { kwh: 31.0, msrp: 43650, fc: 0 },
      2023: { kwh: 31.0, msrp: 45500, fc: 0 },
      2024: { kwh: 31.0, msrp: 46300, fc: 7500 },
      2025: { kwh: 31.0, msrp: 47950, fc: 7500 },
    }),
    ...years({ id: "ioniq6rwd", name: "Hyundai Ioniq 6 RWD", defaults: { fc: 7500 } }, {
      2023: { kwh: 21.0, msrp: 41600, fc: 0 },
      2024: { kwh: 21.0, msrp: 37500, fc: 7500 },
      2025: { kwh: 21.0, msrp: 38615, fc: 7500 },
    }),
    ...years({ id: "ioniq6awd", name: "Hyundai Ioniq 6 AWD", defaults: { fc: 7500 } }, {
      2023: { kwh: 24.0, msrp: 45500, fc: 0 },
      2024: { kwh: 24.0, msrp: 43500, fc: 7500 },
      2025: { kwh: 24.0, msrp: 44615, fc: 7500 },
    }),
    ...years({ id: "konael", name: "Hyundai Kona Electric", defaults: { fc: 7500 } }, {
      2022: { kwh: 28.0, msrp: 34000, fc: 0 },
      2023: { kwh: 28.0, msrp: 33550, fc: 0 },
      2024: { kwh: 27.0, msrp: 32675, fc: 0 },
      2025: { kwh: 27.0, msrp: 33550, fc: 0 },
    }),
    // ── Kia EV6 / EV9 2022-2025
    ...years({ id: "ev6rwd", name: "Kia EV6 RWD", defaults: { fc: 7500 } }, {
      2022: { kwh: 27.0, msrp: 40900, fc: 0 },
      2023: { kwh: 27.0, msrp: 42600, fc: 0 },
      2024: { kwh: 27.0, msrp: 42600, fc: 7500 },
      2025: { kwh: 27.0, msrp: 42600, fc: 7500 },
    }),
    ...years({ id: "ev6awd", name: "Kia EV6 AWD", defaults: { fc: 7500 } }, {
      2022: { kwh: 30.0, msrp: 45900, fc: 0 },
      2023: { kwh: 30.0, msrp: 47600, fc: 0 },
      2024: { kwh: 30.0, msrp: 47600, fc: 7500 },
      2025: { kwh: 30.0, msrp: 47600, fc: 7500 },
    }),
    ...years({ id: "ev6gt", name: "Kia EV6 GT", defaults: { fc: 7500 } }, {
      2023: { kwh: 30.0, msrp: 61600, fc: 0 },
      2024: { kwh: 30.0, msrp: 62600, fc: 7500 },
      2025: { kwh: 30.0, msrp: 62600, fc: 7500 },
    }),
    ...years({ id: "ev9", name: "Kia EV9", defaults: { fc: 7500 } }, {
      2024: { kwh: 35.0, msrp: 54900, fc: 7500 },
      2025: { kwh: 35.0, msrp: 54900, fc: 7500 },
    }),
    // ── Chevy / Ford
    ...years({ id: "boltev", name: "Chevy Bolt EV", defaults: { fc: 7500 } }, {
      2021: { kwh: 28.0, msrp: 31995, fc: 0 },
      2022: { kwh: 28.0, msrp: 31995, fc: 0 },
      2023: { kwh: 28.0, msrp: 26500, fc: 7500 },
    }),
    ...years({ id: "equinoxev", name: "Chevy Equinox EV", defaults: { fc: 7500 } }, {
      2024: { kwh: 28.0, msrp: 34995, fc: 7500 },
      2025: { kwh: 28.0, msrp: 34995, fc: 7500 },
    }),
    ...years({ id: "blazerev", name: "Chevy Blazer EV", defaults: { fc: 7500 } }, {
      2024: { kwh: 30.0, msrp: 48800, fc: 7500 },
      2025: { kwh: 30.0, msrp: 44995, fc: 7500 },
    }),
    ...years({ id: "mache", name: "Ford Mustang Mach-E", defaults: { fc: 3750 } }, {
      2021: { kwh: 32.0, msrp: 42895, fc: 7500 },
      2022: { kwh: 32.0, msrp: 43995, fc: 0 },
      2023: { kwh: 32.0, msrp: 42995, fc: 0 },
      2024: { kwh: 32.0, msrp: 42995, fc: 3750 },
      2025: { kwh: 32.0, msrp: 42995, fc: 3750 },
    }),
    ...years({ id: "f150lightning", name: "Ford F-150 Lightning", defaults: { fc: 7500 } }, {
      2022: { kwh: 46.0, msrp: 39974, fc: 7500 },
      2023: { kwh: 46.0, msrp: 49995, fc: 7500 },
      2024: { kwh: 46.0, msrp: 54995, fc: 7500 },
      2025: { kwh: 46.0, msrp: 49995, fc: 7500 },
    }),
    // ── VW / BMW / Polestar
    ...years({ id: "id4", name: "VW ID.4", defaults: { fc: 7500 } }, {
      2021: { kwh: 32.0, msrp: 39995, fc: 7500 },
      2022: { kwh: 32.0, msrp: 40760, fc: 7500 },
      2023: { kwh: 30.0, msrp: 38995, fc: 7500 },
      2024: { kwh: 30.0, msrp: 39735, fc: 7500 },
      2025: { kwh: 30.0, msrp: 38995, fc: 7500 },
    }),
    ...years({ id: "bmwi4", name: "BMW i4 eDrive35", defaults: { fc: 7500 } }, {
      2023: { kwh: 27.0, msrp: 52200, fc: 0 },
      2024: { kwh: 27.0, msrp: 52200, fc: 0 },
      2025: { kwh: 27.0, msrp: 52200, fc: 0 },
    }),
    ...years({ id: "polestar2", name: "Polestar 2", defaults: { fc: 7500 } }, {
      2022: { kwh: 28.0, msrp: 48400, fc: 0 },
      2023: { kwh: 26.0, msrp: 49900, fc: 0 },
      2024: { kwh: 26.0, msrp: 49900, fc: 0 },
      2025: { kwh: 26.0, msrp: 48400, fc: 0 },
    }),
    // ── Rivian
    ...years({ id: "rivianr1t", name: "Rivian R1T", defaults: { fc: 0 } }, {
      2022: { kwh: 48.0, msrp: 67500, fc: 0 },
      2023: { kwh: 48.0, msrp: 73000, fc: 0 },
      2024: { kwh: 45.0, msrp: 69900, fc: 0 },
      2025: { kwh: 45.0, msrp: 69900, fc: 0 },
    }),
    ...years({ id: "rivianr1s", name: "Rivian R1S", defaults: { fc: 0 } }, {
      2022: { kwh: 45.0, msrp: 70000, fc: 0 },
      2023: { kwh: 45.0, msrp: 78000, fc: 0 },
      2024: { kwh: 40.0, msrp: 76000, fc: 0 },
      2025: { kwh: 40.0, msrp: 78000, fc: 0 },
    }),
    // ── Others
    ...years({ id: "nisanariya", name: "Nissan Ariya", defaults: { fc: 7500 } }, {
      2023: { kwh: 32.0, msrp: 43190, fc: 0 },
      2024: { kwh: 30.0, msrp: 39590, fc: 0 },
      2025: { kwh: 30.0, msrp: 39125, fc: 7500 },
    }),
    ...years({ id: "subarosolt", name: "Subaru Solterra", defaults: { fc: 7500 } }, {
      2023: { kwh: 34.0, msrp: 44995, fc: 0 },
      2024: { kwh: 31.0, msrp: 44995, fc: 7500 },
      2025: { kwh: 31.0, msrp: 44995, fc: 7500 },
    }),
    ...years({ id: "toyotabz4x", name: "Toyota bZ4X", defaults: { fc: 7500 } }, {
      2023: { kwh: 32.0, msrp: 42000, fc: 0 },
      2024: { kwh: 29.0, msrp: 43070, fc: 0 },
      2025: { kwh: 29.0, msrp: 44990, fc: 7500 },
    }),
    ...years({ id: "hondaprologue", name: "Honda Prologue", defaults: { fc: 7500 } }, {
      2024: { kwh: 30.0, msrp: 47400, fc: 7500 },
      2025: { kwh: 30.0, msrp: 47400, fc: 7500 },
    }),
    ...years({ id: "cadillaclyriq", name: "Cadillac LYRIQ", defaults: { fc: 7500 } }, {
      2023: { kwh: 28.0, msrp: 62990, fc: 7500 },
      2024: { kwh: 27.0, msrp: 58590, fc: 7500 },
      2025: { kwh: 27.0, msrp: 58590, fc: 7500 },
    }),
    ...years({ id: "mercedeseqb", name: "Mercedes EQB 300", defaults: { fc: 7500 } }, {
      2023: { kwh: 36.0, msrp: 55550, fc: 0 },
      2024: { kwh: 34.0, msrp: 54200, fc: 0 },
      2025: { kwh: 34.0, msrp: 54100, fc: 0 },
    }),
  ],
  ice: [
    // ── Toyota
    ...years({ id: "camry", name: "Toyota Camry" }, {
      2021: { mpg: 32, msrp: 25045 },
      2022: { mpg: 32, msrp: 25945 },
      2023: { mpg: 32, msrp: 26420 },
      2024: { mpg: 32, msrp: 26420 },
      2025: { mpg: 51, msrp: 29495 }, // 2025 went hybrid-only
    }),
    ...years({ id: "corolla", name: "Toyota Corolla" }, {
      2021: { mpg: 32, msrp: 20025 },
      2022: { mpg: 35, msrp: 20425 },
      2023: { mpg: 35, msrp: 21550 },
      2024: { mpg: 35, msrp: 22050 },
      2025: { mpg: 35, msrp: 23495 },
    }),
    ...years({ id: "rav4", name: "Toyota RAV4" }, {
      2021: { mpg: 30, msrp: 26250 },
      2022: { mpg: 30, msrp: 27325 },
      2023: { mpg: 30, msrp: 28475 },
      2024: { mpg: 30, msrp: 29225 },
      2025: { mpg: 30, msrp: 31380 },
    }),
    ...years({ id: "rav4hybrid", name: "Toyota RAV4 Hybrid" }, {
      2023: { mpg: 40, msrp: 31125 },
      2024: { mpg: 40, msrp: 32950 },
      2025: { mpg: 40, msrp: 35000 },
    }),
    ...years({ id: "prius", name: "Toyota Prius" }, {
      2022: { mpg: 52, msrp: 25075 },
      2023: { mpg: 57, msrp: 27450 },
      2024: { mpg: 57, msrp: 28600 },
      2025: { mpg: 57, msrp: 30000 },
    }),
    ...years({ id: "tacoma", name: "Toyota Tacoma" }, {
      2021: { mpg: 20, msrp: 26500 },
      2022: { mpg: 20, msrp: 27250 },
      2023: { mpg: 20, msrp: 28550 },
      2024: { mpg: 22, msrp: 31500 },
      2025: { mpg: 22, msrp: 33200 },
    }),
    ...years({ id: "highlander", name: "Toyota Highlander" }, {
      2023: { mpg: 24, msrp: 38035 },
      2024: { mpg: 24, msrp: 39420 },
      2025: { mpg: 24, msrp: 40020 },
    }),
    // ── Honda
    ...years({ id: "civic", name: "Honda Civic" }, {
      2021: { mpg: 36, msrp: 21250 },
      2022: { mpg: 36, msrp: 22350 },
      2023: { mpg: 36, msrp: 23950 },
      2024: { mpg: 36, msrp: 24250 },
      2025: { mpg: 36, msrp: 25945 },
    }),
    ...years({ id: "crv", name: "Honda CR-V" }, {
      2021: { mpg: 30, msrp: 25750 },
      2022: { mpg: 30, msrp: 26800 },
      2023: { mpg: 30, msrp: 29500 },
      2024: { mpg: 30, msrp: 30000 },
      2025: { mpg: 30, msrp: 31450 },
    }),
    ...years({ id: "accord", name: "Honda Accord" }, {
      2022: { mpg: 33, msrp: 26520 },
      2023: { mpg: 33, msrp: 27295 },
      2024: { mpg: 33, msrp: 28295 },
      2025: { mpg: 33, msrp: 28895 },
    }),
    // ── Ford / GM
    ...years({ id: "f150gas", name: "Ford F-150 (3.5L V6)" }, {
      2021: { mpg: 20, msrp: 29290 },
      2022: { mpg: 20, msrp: 32445 },
      2023: { mpg: 20, msrp: 34585 },
      2024: { mpg: 20, msrp: 36770 },
      2025: { mpg: 20, msrp: 36870 },
    }),
    ...years({ id: "silverado", name: "Chevy Silverado 1500" }, {
      2022: { mpg: 18, msrp: 32495 },
      2023: { mpg: 18, msrp: 36300 },
      2024: { mpg: 18, msrp: 36800 },
      2025: { mpg: 18, msrp: 37295 },
    }),
    ...years({ id: "gmcsierra", name: "GMC Sierra 1500" }, {
      2023: { mpg: 18, msrp: 38700 },
      2024: { mpg: 18, msrp: 39400 },
      2025: { mpg: 18, msrp: 40100 },
    }),
    // ── Nissan / Mazda / Hyundai / Kia
    ...years({ id: "altima", name: "Nissan Altima" }, {
      2022: { mpg: 32, msrp: 25400 },
      2023: { mpg: 32, msrp: 25990 },
      2024: { mpg: 32, msrp: 26240 },
      2025: { mpg: 32, msrp: 27990 },
    }),
    ...years({ id: "cx5", name: "Mazda CX-5" }, {
      2022: { mpg: 28, msrp: 26250 },
      2023: { mpg: 28, msrp: 27000 },
      2024: { mpg: 28, msrp: 29300 },
      2025: { mpg: 28, msrp: 30100 },
    }),
    ...years({ id: "tucson", name: "Hyundai Tucson" }, {
      2022: { mpg: 28, msrp: 25500 },
      2023: { mpg: 29, msrp: 26900 },
      2024: { mpg: 29, msrp: 28475 },
      2025: { mpg: 29, msrp: 29250 },
    }),
    ...years({ id: "sorento", name: "Kia Sorento" }, {
      2022: { mpg: 26, msrp: 29990 },
      2023: { mpg: 27, msrp: 30090 },
      2024: { mpg: 27, msrp: 31990 },
      2025: { mpg: 27, msrp: 30485 },
    }),
    // ── BMW
    ...years({ id: "bmw330i", name: "BMW 3 Series (330i)" }, {
      2023: { mpg: 30, msrp: 43295 },
      2024: { mpg: 30, msrp: 44295 },
      2025: { mpg: 30, msrp: 44400 },
    }),
  ],
};

export const CLIMATE_PENALTIES = { cold: 0.22, mild: 0.05, warm: 0.03, hot: 0.04 };
