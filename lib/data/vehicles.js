export const POPULAR_EV_IDS = [
  "model3lr-2024", "modely-2024", "ioniq6rwd-2024", "ioniq5-2024", "ev6rwd-2024",
  "equinoxev-2024", "mache-2024", "id4-2024", "f150lightning-2024", "bmwi4-2024",
  "polestar2-2024", "nisanariya-2024", "hondaprologue-2024", "cadillaclyriq-2024", "ev9-2024",
];

export const POPULAR_ICE_IDS = [
  "camry-2024", "civic-2024", "corolla-2024", "rav4-2024", "crv-2024",
  "accord-2024", "f150gas-2024", "tacoma-2024", "altima-2024", "cx5-2024",
  "tucson-2024", "prius-2024", "highlander-2024", "sorento-2024", "silverado-2024",
];

// ─── EV Data ──────────────────────────────────────────────────────────────────
// kwh = EPA combined kWh/100mi  |  msrp = base MSRP  |  fc = federal tax credit
// range = EPA combined miles    |  make/model for grouping + year filter
const EV_RAW = [
  // ── Tesla Model 3 ──────────────────────────────────────────────
  { id:"model3rwd-2022", make:"Tesla", model:"Model 3", trim:"RWD",          year:2022, kwh:24.0, msrp:46990, fc:0,    range:358 },
  { id:"model3lr-2022",  make:"Tesla", model:"Model 3", trim:"Long Range",   year:2022, kwh:25.0, msrp:57990, fc:0,    range:358 },
  { id:"model3perf-2022",make:"Tesla", model:"Model 3", trim:"Performance",  year:2022, kwh:28.0, msrp:62990, fc:0,    range:315 },
  { id:"model3rwd-2023", make:"Tesla", model:"Model 3", trim:"RWD",          year:2023, kwh:25.0, msrp:40240, fc:7500, range:272 },
  { id:"model3lr-2023",  make:"Tesla", model:"Model 3", trim:"Long Range",   year:2023, kwh:25.0, msrp:47240, fc:7500, range:333 },
  { id:"model3perf-2023",make:"Tesla", model:"Model 3", trim:"Performance",  year:2023, kwh:27.0, msrp:50990, fc:7500, range:315 },
  { id:"model3rwd-2024", make:"Tesla", model:"Model 3", trim:"RWD",          year:2024, kwh:25.0, msrp:38990, fc:7500, range:272 },
  { id:"model3lr-2024",  make:"Tesla", model:"Model 3", trim:"Long Range",   year:2024, kwh:23.0, msrp:45990, fc:7500, range:341 },
  { id:"model3perf-2024",make:"Tesla", model:"Model 3", trim:"Performance",  year:2024, kwh:25.0, msrp:50990, fc:7500, range:315 },
  { id:"model3rwd-2025", make:"Tesla", model:"Model 3", trim:"RWD",          year:2025, kwh:25.0, msrp:34990, fc:7500, range:272 },
  { id:"model3lr-2025",  make:"Tesla", model:"Model 3", trim:"Long Range",   year:2025, kwh:23.0, msrp:42490, fc:7500, range:341 },

  // ── Tesla Model Y ──────────────────────────────────────────────
  { id:"modelyrwd-2022", make:"Tesla", model:"Model Y", trim:"RWD",          year:2022, kwh:27.0, msrp:65990, fc:0,    range:244 },
  { id:"modely-2022",    make:"Tesla", model:"Model Y", trim:"Long Range",   year:2022, kwh:28.0, msrp:62990, fc:0,    range:330 },
  { id:"modelyperf-2022",make:"Tesla", model:"Model Y", trim:"Performance",  year:2022, kwh:31.0, msrp:69990, fc:0,    range:303 },
  { id:"modelyrwd-2023", make:"Tesla", model:"Model Y", trim:"RWD",          year:2023, kwh:27.0, msrp:43990, fc:7500, range:260 },
  { id:"modely-2023",    make:"Tesla", model:"Model Y", trim:"Long Range",   year:2023, kwh:27.0, msrp:47990, fc:7500, range:330 },
  { id:"modelyperf-2023",make:"Tesla", model:"Model Y", trim:"Performance",  year:2023, kwh:30.0, msrp:54990, fc:7500, range:303 },
  { id:"modelyrwd-2024", make:"Tesla", model:"Model Y", trim:"RWD",          year:2024, kwh:26.0, msrp:42990, fc:7500, range:260 },
  { id:"modely-2024",    make:"Tesla", model:"Model Y", trim:"Long Range",   year:2024, kwh:27.0, msrp:47990, fc:7500, range:330 },
  { id:"modelyperf-2024",make:"Tesla", model:"Model Y", trim:"Performance",  year:2024, kwh:30.0, msrp:52990, fc:7500, range:303 },
  { id:"modelyrwd-2025", make:"Tesla", model:"Model Y", trim:"RWD",          year:2025, kwh:26.0, msrp:44990, fc:7500, range:260 },
  { id:"modely-2025",    make:"Tesla", model:"Model Y", trim:"Long Range",   year:2025, kwh:26.0, msrp:49990, fc:7500, range:330 },

  // ── Tesla Model S ──────────────────────────────────────────────
  { id:"models-2022",    make:"Tesla", model:"Model S", trim:"Dual Motor",   year:2022, kwh:27.0, msrp:94990, fc:0,    range:405 },
  { id:"models-2023",    make:"Tesla", model:"Model S", trim:"Dual Motor",   year:2023, kwh:27.0, msrp:74990, fc:0,    range:405 },
  { id:"models-2024",    make:"Tesla", model:"Model S", trim:"Dual Motor",   year:2024, kwh:27.0, msrp:74990, fc:0,    range:405 },
  { id:"models-2025",    make:"Tesla", model:"Model S", trim:"Dual Motor",   year:2025, kwh:27.0, msrp:79990, fc:0,    range:405 },

  // ── Tesla Model X ──────────────────────────────────────────────
  { id:"modelx-2022",    make:"Tesla", model:"Model X", trim:"Dual Motor",   year:2022, kwh:34.0, msrp:104990,fc:0,   range:348 },
  { id:"modelx-2023",    make:"Tesla", model:"Model X", trim:"Dual Motor",   year:2023, kwh:33.0, msrp:79990, fc:0,    range:348 },
  { id:"modelx-2024",    make:"Tesla", model:"Model X", trim:"Dual Motor",   year:2024, kwh:33.0, msrp:79990, fc:0,    range:348 },
  { id:"modelx-2025",    make:"Tesla", model:"Model X", trim:"Dual Motor",   year:2025, kwh:33.0, msrp:84990, fc:0,    range:348 },

  // ── Tesla Cybertruck ───────────────────────────────────────────
  { id:"cybertruck-2024",  make:"Tesla", model:"Cybertruck", trim:"AWD",       year:2024, kwh:46.0, msrp:79990, fc:0, range:340 },
  { id:"cyberbeast-2024",  make:"Tesla", model:"Cybertruck", trim:"Cyberbeast",year:2024, kwh:48.0, msrp:99990, fc:0, range:320 },
  { id:"cybertruck-2025",  make:"Tesla", model:"Cybertruck", trim:"AWD",       year:2025, kwh:46.0, msrp:79990, fc:0, range:340 },

  // ── Hyundai Ioniq 5 ───────────────────────────────────────────
  { id:"ioniq5rwd-2022", make:"Hyundai", model:"Ioniq 5", trim:"RWD",         year:2022, kwh:28.0, msrp:41450, fc:7500, range:266 },
  { id:"ioniq5-2022",    make:"Hyundai", model:"Ioniq 5", trim:"AWD",         year:2022, kwh:31.0, msrp:47950, fc:7500, range:266 },
  { id:"ioniq5rwd-2023", make:"Hyundai", model:"Ioniq 5", trim:"RWD",         year:2023, kwh:28.0, msrp:41450, fc:7500, range:266 },
  { id:"ioniq5-2023",    make:"Hyundai", model:"Ioniq 5", trim:"AWD",         year:2023, kwh:31.0, msrp:47450, fc:7500, range:266 },
  { id:"ioniq5rwd-2024", make:"Hyundai", model:"Ioniq 5", trim:"RWD",         year:2024, kwh:28.0, msrp:43450, fc:7500, range:303 },
  { id:"ioniq5-2024",    make:"Hyundai", model:"Ioniq 5", trim:"AWD",         year:2024, kwh:31.0, msrp:47950, fc:7500, range:266 },
  { id:"ioniq5n-2024",   make:"Hyundai", model:"Ioniq 5 N", trim:"AWD",       year:2024, kwh:31.0, msrp:67450, fc:7500, range:221 },
  { id:"ioniq5rwd-2025", make:"Hyundai", model:"Ioniq 5", trim:"RWD",         year:2025, kwh:28.0, msrp:44450, fc:7500, range:303 },

  // ── Hyundai Ioniq 6 ───────────────────────────────────────────
  { id:"ioniq6rwd-2023", make:"Hyundai", model:"Ioniq 6", trim:"RWD",         year:2023, kwh:21.0, msrp:38615, fc:7500, range:361 },
  { id:"ioniq6awd-2023", make:"Hyundai", model:"Ioniq 6", trim:"AWD",         year:2023, kwh:24.0, msrp:44615, fc:7500, range:316 },
  { id:"ioniq6rwd-2024", make:"Hyundai", model:"Ioniq 6", trim:"RWD",         year:2024, kwh:21.0, msrp:38615, fc:7500, range:361 },
  { id:"ioniq6awd-2024", make:"Hyundai", model:"Ioniq 6", trim:"AWD",         year:2024, kwh:24.0, msrp:44615, fc:7500, range:316 },
  { id:"ioniq6rwd-2025", make:"Hyundai", model:"Ioniq 6", trim:"RWD",         year:2025, kwh:21.0, msrp:39615, fc:7500, range:361 },

  // ── Hyundai Kona Electric ─────────────────────────────────────
  { id:"konael-2022",    make:"Hyundai", model:"Kona Electric", trim:"",       year:2022, kwh:27.0, msrp:34000, fc:7500, range:258 },
  { id:"konael-2023",    make:"Hyundai", model:"Kona Electric", trim:"",       year:2023, kwh:27.0, msrp:33550, fc:7500, range:258 },
  { id:"konael-2024",    make:"Hyundai", model:"Kona Electric", trim:"",       year:2024, kwh:27.0, msrp:33550, fc:7500, range:261 },

  // ── Kia EV6 ──────────────────────────────────────────────────
  { id:"ev6rwd-2022",    make:"Kia", model:"EV6", trim:"RWD",                 year:2022, kwh:27.0, msrp:40900, fc:7500, range:310 },
  { id:"ev6awd-2022",    make:"Kia", model:"EV6", trim:"AWD",                 year:2022, kwh:30.0, msrp:46600, fc:7500, range:274 },
  { id:"ev6rwd-2023",    make:"Kia", model:"EV6", trim:"RWD",                 year:2023, kwh:27.0, msrp:42600, fc:7500, range:310 },
  { id:"ev6awd-2023",    make:"Kia", model:"EV6", trim:"AWD",                 year:2023, kwh:30.0, msrp:47600, fc:7500, range:274 },
  { id:"ev6gt-2023",     make:"Kia", model:"EV6", trim:"GT",                  year:2023, kwh:30.0, msrp:62600, fc:7500, range:206 },
  { id:"ev6rwd-2024",    make:"Kia", model:"EV6", trim:"RWD",                 year:2024, kwh:27.0, msrp:42600, fc:7500, range:310 },
  { id:"ev6awd-2024",    make:"Kia", model:"EV6", trim:"AWD",                 year:2024, kwh:30.0, msrp:47600, fc:7500, range:274 },
  { id:"ev6gt-2024",     make:"Kia", model:"EV6", trim:"GT",                  year:2024, kwh:30.0, msrp:62600, fc:7500, range:206 },
  { id:"ev6rwd-2025",    make:"Kia", model:"EV6", trim:"RWD",                 year:2025, kwh:27.0, msrp:42600, fc:7500, range:310 },

  // ── Kia EV9 ──────────────────────────────────────────────────
  { id:"ev9-2024",       make:"Kia", model:"EV9", trim:"RWD",                 year:2024, kwh:35.0, msrp:54900, fc:7500, range:304 },
  { id:"ev9awd-2024",    make:"Kia", model:"EV9", trim:"AWD",                 year:2024, kwh:38.0, msrp:59900, fc:7500, range:280 },
  { id:"ev9-2025",       make:"Kia", model:"EV9", trim:"RWD",                 year:2025, kwh:35.0, msrp:54900, fc:7500, range:304 },

  // ── Chevrolet Bolt EV ──────────────────────────────────────────
  { id:"bolt-2022",      make:"Chevrolet", model:"Bolt EV", trim:"",          year:2022, kwh:28.0, msrp:31500, fc:7500, range:259 },
  { id:"bolt-2023",      make:"Chevrolet", model:"Bolt EV", trim:"",          year:2023, kwh:28.0, msrp:26500, fc:7500, range:259 },

  // ── Chevrolet Equinox EV ──────────────────────────────────────
  { id:"equinoxev-2024", make:"Chevrolet", model:"Equinox EV", trim:"RWD",    year:2024, kwh:29.0, msrp:34995, fc:7500, range:319 },
  { id:"equinoxev-2025", make:"Chevrolet", model:"Equinox EV", trim:"RWD",    year:2025, kwh:29.0, msrp:34995, fc:7500, range:319 },

  // ── Chevrolet Blazer EV ───────────────────────────────────────
  { id:"blazerev-2024",  make:"Chevrolet", model:"Blazer EV", trim:"RWD",     year:2024, kwh:30.0, msrp:44995, fc:7500, range:320 },
  { id:"blazerev-2025",  make:"Chevrolet", model:"Blazer EV", trim:"RWD",     year:2025, kwh:30.0, msrp:44995, fc:7500, range:320 },

  // ── GMC Hummer EV ──────────────────────────────────────────────
  { id:"hummer-2022",    make:"GMC", model:"Hummer EV", trim:"Edition 1",     year:2022, kwh:47.0, msrp:108700,fc:7500, range:329 },
  { id:"hummer-2023",    make:"GMC", model:"Hummer EV", trim:"3X",            year:2023, kwh:47.0, msrp:89900, fc:7500, range:329 },
  { id:"hummer-2024",    make:"GMC", model:"Hummer EV", trim:"3X",            year:2024, kwh:47.0, msrp:89900, fc:7500, range:329 },

  // ── Ford Mustang Mach-E ───────────────────────────────────────
  { id:"mache-2022",     make:"Ford", model:"Mustang Mach-E", trim:"SR RWD",  year:2022, kwh:30.0, msrp:43895, fc:3750, range:247 },
  { id:"mache-2023",     make:"Ford", model:"Mustang Mach-E", trim:"SR RWD",  year:2023, kwh:30.0, msrp:42995, fc:3750, range:247 },
  { id:"mache-2024",     make:"Ford", model:"Mustang Mach-E", trim:"SR RWD",  year:2024, kwh:30.0, msrp:42995, fc:3750, range:247 },
  { id:"macheawd-2024",  make:"Ford", model:"Mustang Mach-E", trim:"SR AWD",  year:2024, kwh:34.0, msrp:46000, fc:3750, range:224 },

  // ── Ford F-150 Lightning ───────────────────────────────────────
  { id:"f150lightning-2022",make:"Ford",model:"F-150 Lightning",trim:"SR",    year:2022, kwh:46.0, msrp:46974, fc:7500, range:230 },
  { id:"f150lightning-2023",make:"Ford",model:"F-150 Lightning",trim:"SR",    year:2023, kwh:46.0, msrp:59974, fc:7500, range:240 },
  { id:"f150lightning-2024",make:"Ford",model:"F-150 Lightning",trim:"SR",    year:2024, kwh:43.0, msrp:49995, fc:7500, range:240 },
  { id:"f150lightning-2025",make:"Ford",model:"F-150 Lightning",trim:"SR",    year:2025, kwh:43.0, msrp:49995, fc:7500, range:240 },

  // ── VW ID.4 ───────────────────────────────────────────────────
  { id:"id4-2022",       make:"Volkswagen", model:"ID.4", trim:"RWD",         year:2022, kwh:30.0, msrp:41230, fc:7500, range:280 },
  { id:"id4-2023",       make:"Volkswagen", model:"ID.4", trim:"RWD",         year:2023, kwh:30.0, msrp:38995, fc:7500, range:275 },
  { id:"id4-2024",       make:"Volkswagen", model:"ID.4", trim:"RWD",         year:2024, kwh:29.0, msrp:38995, fc:7500, range:291 },
  { id:"id4awd-2024",    make:"Volkswagen", model:"ID.4", trim:"AWD",         year:2024, kwh:32.0, msrp:43995, fc:7500, range:255 },
  { id:"id4-2025",       make:"Volkswagen", model:"ID.4", trim:"RWD",         year:2025, kwh:29.0, msrp:38995, fc:7500, range:291 },

  // ── BMW i4 ────────────────────────────────────────────────────
  { id:"bmwi4-2022",     make:"BMW", model:"i4", trim:"eDrive35",             year:2022, kwh:27.0, msrp:55400, fc:7500, range:301 },
  { id:"bmwi4-2023",     make:"BMW", model:"i4", trim:"eDrive35",             year:2023, kwh:27.0, msrp:52200, fc:7500, range:301 },
  { id:"bmwi4-2024",     make:"BMW", model:"i4", trim:"eDrive35",             year:2024, kwh:26.0, msrp:52200, fc:7500, range:318 },
  { id:"bmwi4m50-2024",  make:"BMW", model:"i4", trim:"M50",                  year:2024, kwh:31.0, msrp:72900, fc:7500, range:270 },
  { id:"bmwi4-2025",     make:"BMW", model:"i4", trim:"eDrive35",             year:2025, kwh:26.0, msrp:53200, fc:7500, range:318 },

  // ── BMW iX ────────────────────────────────────────────────────
  { id:"bmwix-2023",     make:"BMW", model:"iX", trim:"xDrive50",             year:2023, kwh:35.0, msrp:87100, fc:7500, range:324 },
  { id:"bmwix-2024",     make:"BMW", model:"iX", trim:"xDrive50",             year:2024, kwh:35.0, msrp:87100, fc:7500, range:324 },

  // ── Polestar 2 ────────────────────────────────────────────────
  { id:"polestar2-2022", make:"Polestar", model:"2", trim:"Single Motor",     year:2022, kwh:26.0, msrp:45900, fc:7500, range:270 },
  { id:"polestar2-2023", make:"Polestar", model:"2", trim:"Single Motor",     year:2023, kwh:26.0, msrp:47495, fc:7500, range:270 },
  { id:"polestar2-2024", make:"Polestar", model:"2", trim:"Single Motor",     year:2024, kwh:26.0, msrp:48400, fc:7500, range:275 },

  // ── Rivian R1T ────────────────────────────────────────────────
  { id:"rivianr1t-2022", make:"Rivian", model:"R1T", trim:"Adventure",        year:2022, kwh:48.0, msrp:67500, fc:7500, range:314 },
  { id:"rivianr1t-2023", make:"Rivian", model:"R1T", trim:"Adventure",        year:2023, kwh:47.0, msrp:73000, fc:7500, range:352 },
  { id:"rivianr1t-2024", make:"Rivian", model:"R1T", trim:"Dual Motor",       year:2024, kwh:46.0, msrp:69900, fc:7500, range:410 },
  { id:"rivianr1t-2025", make:"Rivian", model:"R1T", trim:"Dual Motor",       year:2025, kwh:46.0, msrp:69900, fc:7500, range:410 },

  // ── Rivian R1S ────────────────────────────────────────────────
  { id:"rivianr1s-2022", make:"Rivian", model:"R1S", trim:"Adventure",        year:2022, kwh:43.0, msrp:70000, fc:7500, range:321 },
  { id:"rivianr1s-2023", make:"Rivian", model:"R1S", trim:"Adventure",        year:2023, kwh:42.0, msrp:78000, fc:7500, range:321 },
  { id:"rivianr1s-2024", make:"Rivian", model:"R1S", trim:"Dual Motor",       year:2024, kwh:40.0, msrp:78000, fc:7500, range:393 },

  // ── Nissan Ariya ──────────────────────────────────────────────
  { id:"nisanariya-2023",make:"Nissan", model:"Ariya", trim:"FWD",            year:2023, kwh:30.0, msrp:39125, fc:7500, range:304 },
  { id:"nisanariya-2024",make:"Nissan", model:"Ariya", trim:"FWD",            year:2024, kwh:30.0, msrp:39125, fc:7500, range:304 },

  // ── Nissan LEAF ───────────────────────────────────────────────
  { id:"leaf-2022",      make:"Nissan", model:"LEAF", trim:"40 kWh",          year:2022, kwh:30.0, msrp:27800, fc:7500, range:149 },
  { id:"leaf-2023",      make:"Nissan", model:"LEAF", trim:"40 kWh",          year:2023, kwh:30.0, msrp:28895, fc:7500, range:149 },
  { id:"leaf-2024",      make:"Nissan", model:"LEAF", trim:"40 kWh",          year:2024, kwh:30.0, msrp:28895, fc:7500, range:149 },

  // ── Subaru Solterra ───────────────────────────────────────────
  { id:"subarosolt-2023",make:"Subaru", model:"Solterra", trim:"AWD",         year:2023, kwh:31.0, msrp:44995, fc:7500, range:228 },
  { id:"subarosolt-2024",make:"Subaru", model:"Solterra", trim:"AWD",         year:2024, kwh:31.0, msrp:44995, fc:7500, range:228 },

  // ── Toyota bZ4X ───────────────────────────────────────────────
  { id:"toyotabz4x-2023",make:"Toyota", model:"bZ4X", trim:"FWD",             year:2023, kwh:29.0, msrp:42000, fc:7500, range:252 },
  { id:"toyotabz4x-2024",make:"Toyota", model:"bZ4X", trim:"FWD",             year:2024, kwh:29.0, msrp:42990, fc:7500, range:252 },

  // ── Honda Prologue ────────────────────────────────────────────
  { id:"hondaprologue-2024",make:"Honda",model:"Prologue",trim:"AWD",         year:2024, kwh:30.0, msrp:47400, fc:7500, range:296 },
  { id:"hondaprologue-2025",make:"Honda",model:"Prologue",trim:"AWD",         year:2025, kwh:30.0, msrp:47400, fc:7500, range:296 },

  // ── Cadillac LYRIQ ────────────────────────────────────────────
  { id:"cadillaclyriq-2023",make:"Cadillac",model:"LYRIQ",trim:"RWD",        year:2023, kwh:27.0, msrp:58590, fc:7500, range:312 },
  { id:"cadillaclyriq-2024",make:"Cadillac",model:"LYRIQ",trim:"RWD",        year:2024, kwh:27.0, msrp:58590, fc:7500, range:314 },
  { id:"cadillaclyriq-2025",make:"Cadillac",model:"LYRIQ",trim:"RWD",        year:2025, kwh:27.0, msrp:58590, fc:7500, range:314 },

  // ── Mercedes EQB ──────────────────────────────────────────────
  { id:"mercedeseqb-2023",make:"Mercedes-Benz",model:"EQB",trim:"300 4MATIC", year:2023, kwh:34.0, msrp:54100, fc:7500, range:227 },
  { id:"mercedeseqb-2024",make:"Mercedes-Benz",model:"EQB",trim:"300 4MATIC", year:2024, kwh:34.0, msrp:54100, fc:7500, range:227 },

  // ── Audi Q4 e-tron ────────────────────────────────────────────
  { id:"audiq4-2022",    make:"Audi", model:"Q4 e-tron", trim:"RWD",          year:2022, kwh:31.0, msrp:44995, fc:7500, range:265 },
  { id:"audiq4-2023",    make:"Audi", model:"Q4 e-tron", trim:"RWD",          year:2023, kwh:31.0, msrp:44995, fc:7500, range:265 },
  { id:"audiq4-2024",    make:"Audi", model:"Q4 e-tron", trim:"RWD",          year:2024, kwh:31.0, msrp:44995, fc:7500, range:265 },

  // ── Genesis GV60 ──────────────────────────────────────────────
  { id:"gv60-2023",      make:"Genesis", model:"GV60", trim:"Standard Range", year:2023, kwh:27.0, msrp:42000, fc:7500, range:248 },
  { id:"gv60-2024",      make:"Genesis", model:"GV60", trim:"Standard Range", year:2024, kwh:27.0, msrp:42000, fc:7500, range:248 },

  // ── Lucid Air ─────────────────────────────────────────────────
  { id:"lucidair-2022",  make:"Lucid", model:"Air", trim:"Pure",              year:2022, kwh:23.0, msrp:69900, fc:7500, range:410 },
  { id:"lucidair-2023",  make:"Lucid", model:"Air", trim:"Pure",              year:2023, kwh:23.0, msrp:69900, fc:7500, range:410 },
  { id:"lucidair-2024",  make:"Lucid", model:"Air", trim:"Pure",              year:2024, kwh:23.0, msrp:69900, fc:7500, range:410 },

  // ── BMW i5 ────────────────────────────────────────────────────
  { id:"bmwi5-2024",     make:"BMW", model:"i5", trim:"eDrive40",             year:2024, kwh:26.0, msrp:67800, fc:7500, range:295 },
  { id:"bmwi5-2025",     make:"BMW", model:"i5", trim:"eDrive40",             year:2025, kwh:26.0, msrp:67800, fc:7500, range:295 },
];

// ─── ICE Data ─────────────────────────────────────────────────────────────────
// mpg = EPA combined  |  msrp = base MSRP
const ICE_RAW = [
  // ── Toyota Camry ──────────────────────────────────────────────
  { id:"camry-2021",     make:"Toyota", model:"Camry",     trim:"LE",         year:2021, mpg:32, msrp:25945 },
  { id:"camry-2022",     make:"Toyota", model:"Camry",     trim:"LE",         year:2022, mpg:32, msrp:26320 },
  { id:"camry-2023",     make:"Toyota", model:"Camry",     trim:"LE",         year:2023, mpg:32, msrp:26420 },
  { id:"camry-2024",     make:"Toyota", model:"Camry",     trim:"LE",         year:2024, mpg:32, msrp:27415 },
  { id:"camry-2025",     make:"Toyota", model:"Camry",     trim:"LE Hybrid",  year:2025, mpg:48, msrp:28400 },

  // ── Toyota Corolla ────────────────────────────────────────────
  { id:"corolla-2021",   make:"Toyota", model:"Corolla",   trim:"L",          year:2021, mpg:35, msrp:20075 },
  { id:"corolla-2022",   make:"Toyota", model:"Corolla",   trim:"L",          year:2022, mpg:35, msrp:20865 },
  { id:"corolla-2023",   make:"Toyota", model:"Corolla",   trim:"L",          year:2023, mpg:35, msrp:21550 },
  { id:"corolla-2024",   make:"Toyota", model:"Corolla",   trim:"L",          year:2024, mpg:35, msrp:22050 },
  { id:"corolla-2025",   make:"Toyota", model:"Corolla",   trim:"L",          year:2025, mpg:35, msrp:23050 },

  // ── Toyota RAV4 ───────────────────────────────────────────────
  { id:"rav4-2021",      make:"Toyota", model:"RAV4",      trim:"LE",         year:2021, mpg:30, msrp:26350 },
  { id:"rav4-2022",      make:"Toyota", model:"RAV4",      trim:"LE",         year:2022, mpg:30, msrp:27575 },
  { id:"rav4-2023",      make:"Toyota", model:"RAV4",      trim:"LE",         year:2023, mpg:30, msrp:28975 },
  { id:"rav4-2024",      make:"Toyota", model:"RAV4",      trim:"LE",         year:2024, mpg:30, msrp:29975 },

  // ── Toyota RAV4 Hybrid ────────────────────────────────────────
  { id:"rav4hybrid-2021",make:"Toyota", model:"RAV4 Hybrid",trim:"LE",        year:2021, mpg:40, msrp:28000 },
  { id:"rav4hybrid-2022",make:"Toyota", model:"RAV4 Hybrid",trim:"LE",        year:2022, mpg:40, msrp:31010 },
  { id:"rav4hybrid-2023",make:"Toyota", model:"RAV4 Hybrid",trim:"LE",        year:2023, mpg:40, msrp:32975 },
  { id:"rav4hybrid-2024",make:"Toyota", model:"RAV4 Hybrid",trim:"LE",        year:2024, mpg:40, msrp:33850 },

  // ── Toyota Prius ──────────────────────────────────────────────
  { id:"prius-2021",     make:"Toyota", model:"Prius",     trim:"L Eco",      year:2021, mpg:56, msrp:24525 },
  { id:"prius-2022",     make:"Toyota", model:"Prius",     trim:"L Eco",      year:2022, mpg:56, msrp:24525 },
  { id:"prius-2023",     make:"Toyota", model:"Prius",     trim:"LE",         year:2023, mpg:57, msrp:27450 },
  { id:"prius-2024",     make:"Toyota", model:"Prius",     trim:"LE",         year:2024, mpg:57, msrp:28450 },
  { id:"prius-2025",     make:"Toyota", model:"Prius",     trim:"LE",         year:2025, mpg:57, msrp:29200 },

  // ── Toyota Tacoma ─────────────────────────────────────────────
  { id:"tacoma-2021",    make:"Toyota", model:"Tacoma",    trim:"SR",         year:2021, mpg:21, msrp:26150 },
  { id:"tacoma-2022",    make:"Toyota", model:"Tacoma",    trim:"SR",         year:2022, mpg:21, msrp:26850 },
  { id:"tacoma-2023",    make:"Toyota", model:"Tacoma",    trim:"SR",         year:2023, mpg:21, msrp:30000 },
  { id:"tacoma-2024",    make:"Toyota", model:"Tacoma",    trim:"SR",         year:2024, mpg:22, msrp:32500 },
  { id:"tacoma-2025",    make:"Toyota", model:"Tacoma",    trim:"SR",         year:2025, mpg:22, msrp:33200 },

  // ── Toyota Highlander ─────────────────────────────────────────
  { id:"highlander-2021",make:"Toyota", model:"Highlander",trim:"L",          year:2021, mpg:24, msrp:35480 },
  { id:"highlander-2022",make:"Toyota", model:"Highlander",trim:"L",          year:2022, mpg:24, msrp:36340 },
  { id:"highlander-2023",make:"Toyota", model:"Highlander",trim:"L",          year:2023, mpg:24, msrp:37965 },
  { id:"highlander-2024",make:"Toyota", model:"Highlander",trim:"L",          year:2024, mpg:24, msrp:39220 },

  // ── Toyota 4Runner ────────────────────────────────────────────
  { id:"4runner-2021",   make:"Toyota", model:"4Runner",   trim:"SR5",        year:2021, mpg:17, msrp:36120 },
  { id:"4runner-2022",   make:"Toyota", model:"4Runner",   trim:"SR5",        year:2022, mpg:17, msrp:37265 },
  { id:"4runner-2023",   make:"Toyota", model:"4Runner",   trim:"SR5",        year:2023, mpg:17, msrp:38175 },
  { id:"4runner-2024",   make:"Toyota", model:"4Runner",   trim:"SR5",        year:2024, mpg:18, msrp:40720 },

  // ── Honda Civic ───────────────────────────────────────────────
  { id:"civic-2021",     make:"Honda",  model:"Civic",     trim:"LX",         year:2021, mpg:36, msrp:21700 },
  { id:"civic-2022",     make:"Honda",  model:"Civic",     trim:"LX",         year:2022, mpg:36, msrp:22550 },
  { id:"civic-2023",     make:"Honda",  model:"Civic",     trim:"LX",         year:2023, mpg:36, msrp:23950 },
  { id:"civic-2024",     make:"Honda",  model:"Civic",     trim:"LX",         year:2024, mpg:36, msrp:24950 },
  { id:"civic-2025",     make:"Honda",  model:"Civic",     trim:"LX",         year:2025, mpg:36, msrp:25500 },

  // ── Honda CR-V ────────────────────────────────────────────────
  { id:"crv-2021",       make:"Honda",  model:"CR-V",      trim:"LX",         year:2021, mpg:30, msrp:26400 },
  { id:"crv-2022",       make:"Honda",  model:"CR-V",      trim:"LX",         year:2022, mpg:30, msrp:28360 },
  { id:"crv-2023",       make:"Honda",  model:"CR-V",      trim:"LX",         year:2023, mpg:30, msrp:29650 },
  { id:"crv-2024",       make:"Honda",  model:"CR-V",      trim:"LX",         year:2024, mpg:30, msrp:31050 },
  { id:"crv-2025",       make:"Honda",  model:"CR-V",      trim:"LX",         year:2025, mpg:30, msrp:31850 },

  // ── Honda Accord ──────────────────────────────────────────────
  { id:"accord-2021",    make:"Honda",  model:"Accord",    trim:"LX",         year:2021, mpg:33, msrp:25970 },
  { id:"accord-2022",    make:"Honda",  model:"Accord",    trim:"LX",         year:2022, mpg:33, msrp:26520 },
  { id:"accord-2023",    make:"Honda",  model:"Accord",    trim:"LX",         year:2023, mpg:33, msrp:27895 },
  { id:"accord-2024",    make:"Honda",  model:"Accord",    trim:"LX",         year:2024, mpg:33, msrp:28895 },
  { id:"accord-2025",    make:"Honda",  model:"Accord",    trim:"LX",         year:2025, mpg:33, msrp:29200 },

  // ── Ford F-150 ────────────────────────────────────────────────
  { id:"f150gas-2021",   make:"Ford",   model:"F-150",     trim:"XL 3.3L",    year:2021, mpg:20, msrp:29290 },
  { id:"f150gas-2022",   make:"Ford",   model:"F-150",     trim:"XL 3.3L",    year:2022, mpg:20, msrp:30585 },
  { id:"f150gas-2023",   make:"Ford",   model:"F-150",     trim:"XL 3.3L",    year:2023, mpg:20, msrp:33695 },
  { id:"f150gas-2024",   make:"Ford",   model:"F-150",     trim:"XL 3.3L",    year:2024, mpg:20, msrp:35810 },
  { id:"f150gas-2025",   make:"Ford",   model:"F-150",     trim:"XL 3.3L",    year:2025, mpg:20, msrp:37000 },

  // ── Ford Escape ───────────────────────────────────────────────
  { id:"escape-2022",    make:"Ford",   model:"Escape",    trim:"S",          year:2022, mpg:30, msrp:26910 },
  { id:"escape-2023",    make:"Ford",   model:"Escape",    trim:"Active",     year:2023, mpg:31, msrp:28090 },
  { id:"escape-2024",    make:"Ford",   model:"Escape",    trim:"Active",     year:2024, mpg:31, msrp:29120 },

  // ── Chevy Silverado ───────────────────────────────────────────
  { id:"silverado-2021", make:"Chevrolet",model:"Silverado 1500",trim:"WT",   year:2021, mpg:18, msrp:29300 },
  { id:"silverado-2022", make:"Chevrolet",model:"Silverado 1500",trim:"WT",   year:2022, mpg:18, msrp:32500 },
  { id:"silverado-2023", make:"Chevrolet",model:"Silverado 1500",trim:"WT",   year:2023, mpg:18, msrp:35000 },
  { id:"silverado-2024", make:"Chevrolet",model:"Silverado 1500",trim:"WT",   year:2024, mpg:19, msrp:37295 },

  // ── Chevy Equinox (gas) ───────────────────────────────────────
  { id:"equinoxgas-2022",make:"Chevrolet",model:"Equinox",   trim:"LS",       year:2022, mpg:31, msrp:26200 },
  { id:"equinoxgas-2023",make:"Chevrolet",model:"Equinox",   trim:"LS",       year:2023, mpg:31, msrp:27995 },
  { id:"equinoxgas-2024",make:"Chevrolet",model:"Equinox",   trim:"LS",       year:2024, mpg:31, msrp:28990 },

  // ── GMC Sierra ────────────────────────────────────────────────
  { id:"gmcsierra-2022", make:"GMC",    model:"Sierra 1500",trim:"Regular",   year:2022, mpg:18, msrp:35400 },
  { id:"gmcsierra-2023", make:"GMC",    model:"Sierra 1500",trim:"Regular",   year:2023, mpg:18, msrp:38800 },
  { id:"gmcsierra-2024", make:"GMC",    model:"Sierra 1500",trim:"Regular",   year:2024, mpg:18, msrp:40100 },

  // ── Ram 1500 ──────────────────────────────────────────────────
  { id:"ram1500-2021",   make:"Ram",    model:"1500",       trim:"Tradesman", year:2021, mpg:17, msrp:35490 },
  { id:"ram1500-2022",   make:"Ram",    model:"1500",       trim:"Tradesman", year:2022, mpg:17, msrp:36995 },
  { id:"ram1500-2023",   make:"Ram",    model:"1500",       trim:"Tradesman", year:2023, mpg:17, msrp:38490 },
  { id:"ram1500-2024",   make:"Ram",    model:"1500",       trim:"Tradesman", year:2024, mpg:17, msrp:40090 },

  // ── Nissan Altima ─────────────────────────────────────────────
  { id:"altima-2021",    make:"Nissan", model:"Altima",     trim:"S",         year:2021, mpg:32, msrp:24550 },
  { id:"altima-2022",    make:"Nissan", model:"Altima",     trim:"S",         year:2022, mpg:32, msrp:25290 },
  { id:"altima-2023",    make:"Nissan", model:"Altima",     trim:"S",         year:2023, mpg:32, msrp:26480 },
  { id:"altima-2024",    make:"Nissan", model:"Altima",     trim:"S",         year:2024, mpg:32, msrp:27990 },

  // ── Mazda CX-5 ────────────────────────────────────────────────
  { id:"cx5-2021",       make:"Mazda",  model:"CX-5",       trim:"Sport",     year:2021, mpg:28, msrp:25370 },
  { id:"cx5-2022",       make:"Mazda",  model:"CX-5",       trim:"Sport",     year:2022, mpg:28, msrp:26700 },
  { id:"cx5-2023",       make:"Mazda",  model:"CX-5",       trim:"Sport",     year:2023, mpg:28, msrp:28025 },
  { id:"cx5-2024",       make:"Mazda",  model:"CX-5",       trim:"Sport",     year:2024, mpg:28, msrp:30100 },

  // ── Mazda3 ────────────────────────────────────────────────────
  { id:"mazda3-2022",    make:"Mazda",  model:"Mazda3",     trim:"2.5 S",     year:2022, mpg:35, msrp:21950 },
  { id:"mazda3-2023",    make:"Mazda",  model:"Mazda3",     trim:"2.5 S",     year:2023, mpg:35, msrp:23150 },
  { id:"mazda3-2024",    make:"Mazda",  model:"Mazda3",     trim:"2.5 S",     year:2024, mpg:35, msrp:24450 },

  // ── Hyundai Tucson ────────────────────────────────────────────
  { id:"tucson-2021",    make:"Hyundai",model:"Tucson",     trim:"SE",        year:2021, mpg:26, msrp:24950 },
  { id:"tucson-2022",    make:"Hyundai",model:"Tucson",     trim:"SE",        year:2022, mpg:29, msrp:26450 },
  { id:"tucson-2023",    make:"Hyundai",model:"Tucson",     trim:"SE",        year:2023, mpg:29, msrp:27425 },
  { id:"tucson-2024",    make:"Hyundai",model:"Tucson",     trim:"SE",        year:2024, mpg:29, msrp:29250 },
  { id:"tucson-2025",    make:"Hyundai",model:"Tucson",     trim:"SE",        year:2025, mpg:29, msrp:29750 },

  // ── Hyundai Sonata ────────────────────────────────────────────
  { id:"sonata-2021",    make:"Hyundai",model:"Sonata",     trim:"SE",        year:2021, mpg:35, msrp:24350 },
  { id:"sonata-2022",    make:"Hyundai",model:"Sonata",     trim:"SE",        year:2022, mpg:35, msrp:24900 },
  { id:"sonata-2023",    make:"Hyundai",model:"Sonata",     trim:"SE",        year:2023, mpg:35, msrp:25350 },
  { id:"sonata-2024",    make:"Hyundai",model:"Sonata",     trim:"SE",        year:2024, mpg:35, msrp:26000 },

  // ── Hyundai Elantra ───────────────────────────────────────────
  { id:"elantra-2021",   make:"Hyundai",model:"Elantra",    trim:"SE",        year:2021, mpg:37, msrp:19850 },
  { id:"elantra-2022",   make:"Hyundai",model:"Elantra",    trim:"SE",        year:2022, mpg:37, msrp:20350 },
  { id:"elantra-2023",   make:"Hyundai",model:"Elantra",    trim:"SE",        year:2023, mpg:37, msrp:20900 },
  { id:"elantra-2024",   make:"Hyundai",model:"Elantra",    trim:"SE",        year:2024, mpg:37, msrp:22000 },

  // ── Kia Sorento ───────────────────────────────────────────────
  { id:"sorento-2021",   make:"Kia",    model:"Sorento",    trim:"LX",        year:2021, mpg:27, msrp:29290 },
  { id:"sorento-2022",   make:"Kia",    model:"Sorento",    trim:"LX",        year:2022, mpg:27, msrp:29790 },
  { id:"sorento-2023",   make:"Kia",    model:"Sorento",    trim:"LX",        year:2023, mpg:27, msrp:30585 },
  { id:"sorento-2024",   make:"Kia",    model:"Sorento",    trim:"LX",        year:2024, mpg:27, msrp:31785 },

  // ── Kia Telluride ─────────────────────────────────────────────
  { id:"telluride-2021", make:"Kia",    model:"Telluride",  trim:"LX",        year:2021, mpg:22, msrp:32490 },
  { id:"telluride-2022", make:"Kia",    model:"Telluride",  trim:"LX",        year:2022, mpg:22, msrp:33090 },
  { id:"telluride-2023", make:"Kia",    model:"Telluride",  trim:"LX",        year:2023, mpg:22, msrp:35690 },
  { id:"telluride-2024", make:"Kia",    model:"Telluride",  trim:"LX",        year:2024, mpg:22, msrp:36490 },

  // ── Jeep Grand Cherokee ───────────────────────────────────────
  { id:"grandcherokee-2021",make:"Jeep",model:"Grand Cherokee",trim:"Laredo", year:2021, mpg:22, msrp:33585 },
  { id:"grandcherokee-2022",make:"Jeep",model:"Grand Cherokee",trim:"Laredo", year:2022, mpg:22, msrp:36995 },
  { id:"grandcherokee-2023",make:"Jeep",model:"Grand Cherokee",trim:"Laredo", year:2023, mpg:22, msrp:39290 },
  { id:"grandcherokee-2024",make:"Jeep",model:"Grand Cherokee",trim:"Laredo", year:2024, mpg:22, msrp:40890 },

  // ── Subaru Outback ────────────────────────────────────────────
  { id:"outback-2021",   make:"Subaru", model:"Outback",    trim:"Base",      year:2021, mpg:30, msrp:27655 },
  { id:"outback-2022",   make:"Subaru", model:"Outback",    trim:"Base",      year:2022, mpg:30, msrp:27895 },
  { id:"outback-2023",   make:"Subaru", model:"Outback",    trim:"Base",      year:2023, mpg:30, msrp:28895 },
  { id:"outback-2024",   make:"Subaru", model:"Outback",    trim:"Base",      year:2024, mpg:30, msrp:29495 },

  // ── BMW 3 Series ──────────────────────────────────────────────
  { id:"bmw330i-2021",   make:"BMW",    model:"3 Series",   trim:"330i",      year:2021, mpg:30, msrp:40750 },
  { id:"bmw330i-2022",   make:"BMW",    model:"3 Series",   trim:"330i",      year:2022, mpg:30, msrp:41450 },
  { id:"bmw330i-2023",   make:"BMW",    model:"3 Series",   trim:"330i",      year:2023, mpg:30, msrp:43700 },
  { id:"bmw330i-2024",   make:"BMW",    model:"3 Series",   trim:"330i",      year:2024, mpg:30, msrp:44400 },

  // ── VW Jetta ──────────────────────────────────────────────────
  { id:"jetta-2021",     make:"Volkswagen",model:"Jetta",   trim:"S",         year:2021, mpg:34, msrp:19995 },
  { id:"jetta-2022",     make:"Volkswagen",model:"Jetta",   trim:"S",         year:2022, mpg:34, msrp:20895 },
  { id:"jetta-2023",     make:"Volkswagen",model:"Jetta",   trim:"S",         year:2023, mpg:34, msrp:21895 },
  { id:"jetta-2024",     make:"Volkswagen",model:"Jetta",   trim:"S",         year:2024, mpg:34, msrp:22995 },
];

// ─── Build name and export ────────────────────────────────────────────────────
function evName(v) {
  return v.trim ? `${v.year} ${v.make} ${v.model} ${v.trim}` : `${v.year} ${v.make} ${v.model}`;
}
function iceName(v) {
  return `${v.year} ${v.make} ${v.model}`;
}

export const VEHICLES = {
  ev:  EV_RAW.map(v  => ({ ...v, name: evName(v)  })),
  ice: ICE_RAW.map(v => ({ ...v, name: iceName(v) })),
};

export const CLIMATE_PENALTIES = { cold: 0.22, mild: 0.05, warm: 0.03, hot: 0.04 };

// ─── Available model years ────────────────────────────────────────────────────
export const VEHICLE_YEARS = [2025, 2024, 2023, 2022, 2021];
