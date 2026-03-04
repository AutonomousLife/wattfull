export const POPULAR_EV_IDS = [
  "model3lr", "modely", "ioniq6rwd", "ioniq5", "ev6rwd",
  "bolt", "mache", "id4", "f150lightning", "bmwi4",
  "polestar2", "nisanariya", "hondaprologue", "cadillaclyriq", "ev9",
];

export const POPULAR_ICE_IDS = [
  "camry", "civic", "corolla", "rav4", "crv",
  "accord", "f150gas", "tacoma", "altima", "cx5",
  "tucson", "prius", "highlander", "sorento", "silverado",
];

export const VEHICLES = {
  ev: [
    // Tesla
    { id: "model3rwd",    name: "Tesla Model 3 RWD",             kwh: 25.0, msrp: 40240, fc: 7500 },
    { id: "model3lr",     name: "Tesla Model 3 Long Range",       kwh: 24.0, msrp: 45990, fc: 7500 },
    { id: "model3perf",   name: "Tesla Model 3 Performance",      kwh: 27.0, msrp: 50990, fc: 7500 },
    { id: "modelyrwd",    name: "Tesla Model Y RWD",              kwh: 26.0, msrp: 42990, fc: 7500 },
    { id: "modely",       name: "Tesla Model Y Long Range",       kwh: 27.0, msrp: 47990, fc: 7500 },
    { id: "modelyperf",   name: "Tesla Model Y Performance",      kwh: 30.0, msrp: 52990, fc: 7500 },
    { id: "models",       name: "Tesla Model S",                  kwh: 27.0, msrp: 74990, fc: 7500 },
    { id: "modelx",       name: "Tesla Model X",                  kwh: 33.0, msrp: 79990, fc: 7500 },
    // Hyundai
    { id: "ioniq5rwd",    name: "Hyundai Ioniq 5 RWD",           kwh: 28.0, msrp: 43450, fc: 7500 },
    { id: "ioniq5",       name: "Hyundai Ioniq 5 AWD",           kwh: 31.0, msrp: 47950, fc: 7500 },
    { id: "ioniq6rwd",    name: "Hyundai Ioniq 6 RWD",           kwh: 21.0, msrp: 38615, fc: 7500 },
    { id: "ioniq6awd",    name: "Hyundai Ioniq 6 AWD",           kwh: 24.0, msrp: 44615, fc: 7500 },
    { id: "konael",       name: "Hyundai Kona Electric",          kwh: 27.0, msrp: 33550, fc: 7500 },
    // Kia
    { id: "ev6rwd",       name: "Kia EV6 RWD",                   kwh: 27.0, msrp: 42600, fc: 7500 },
    { id: "ev6awd",       name: "Kia EV6 AWD",                   kwh: 30.0, msrp: 47600, fc: 7500 },
    { id: "ev6gt",        name: "Kia EV6 GT",                    kwh: 30.0, msrp: 62600, fc: 7500 },
    { id: "ev9",          name: "Kia EV9",                       kwh: 35.0, msrp: 54900, fc: 7500 },
    // Chevy / Ford
    { id: "bolt",         name: "Chevy Equinox EV",              kwh: 28.0, msrp: 34995, fc: 7500 },
    { id: "blazerev",     name: "Chevy Blazer EV",               kwh: 30.0, msrp: 44995, fc: 7500 },
    { id: "mache",        name: "Ford Mustang Mach-E",           kwh: 32.0, msrp: 42995, fc: 3750 },
    { id: "f150lightning",name: "Ford F-150 Lightning",          kwh: 46.0, msrp: 49995, fc: 7500 },
    // VW / BMW / Polestar
    { id: "id4",          name: "VW ID.4",                       kwh: 30.0, msrp: 38995, fc: 7500 },
    { id: "bmwi4",        name: "BMW i4 eDrive35",               kwh: 27.0, msrp: 52200, fc: 7500 },
    { id: "polestar2",    name: "Polestar 2",                    kwh: 26.0, msrp: 48400, fc: 7500 },
    // Rivian
    { id: "rivianr1t",    name: "Rivian R1T",                    kwh: 45.0, msrp: 69900, fc: 0 },
    { id: "rivianr1s",    name: "Rivian R1S",                    kwh: 40.0, msrp: 78000, fc: 0 },
    // Others
    { id: "nisanariya",   name: "Nissan Ariya",                  kwh: 30.0, msrp: 39125, fc: 7500 },
    { id: "subarosolt",   name: "Subaru Solterra",               kwh: 31.0, msrp: 44995, fc: 7500 },
    { id: "toyotabz4x",   name: "Toyota bZ4X",                   kwh: 29.0, msrp: 44990, fc: 7500 },
    { id: "hondaprologue",name: "Honda Prologue",                kwh: 30.0, msrp: 47400, fc: 7500 },
    { id: "cadillaclyriq",name: "Cadillac LYRIQ",                kwh: 27.0, msrp: 58590, fc: 7500 },
    { id: "mercedeseqb",  name: "Mercedes EQB 300",              kwh: 34.0, msrp: 54100, fc: 7500 },
  ],
  ice: [
    // Toyota
    { id: "camry",      name: "Toyota Camry",             mpg: 32, msrp: 29495 },
    { id: "corolla",    name: "Toyota Corolla",           mpg: 35, msrp: 23495 },
    { id: "rav4",       name: "Toyota RAV4",              mpg: 30, msrp: 31380 },
    { id: "rav4hybrid", name: "Toyota RAV4 Hybrid",       mpg: 40, msrp: 35000 },
    { id: "prius",      name: "Toyota Prius",             mpg: 57, msrp: 30000 },
    { id: "tacoma",     name: "Toyota Tacoma",            mpg: 22, msrp: 33200 },
    { id: "highlander", name: "Toyota Highlander",        mpg: 24, msrp: 40020 },
    // Honda
    { id: "civic",      name: "Honda Civic",              mpg: 36, msrp: 25945 },
    { id: "crv",        name: "Honda CR-V",               mpg: 30, msrp: 31450 },
    { id: "accord",     name: "Honda Accord",             mpg: 33, msrp: 28895 },
    // Ford / GM
    { id: "f150gas",    name: "Ford F-150 (3.5L V6)",     mpg: 20, msrp: 36870 },
    { id: "silverado",  name: "Chevy Silverado 1500",     mpg: 18, msrp: 37295 },
    { id: "gmcsierra",  name: "GMC Sierra 1500",          mpg: 18, msrp: 40100 },
    // Nissan / Mazda / Hyundai / Kia
    { id: "altima",     name: "Nissan Altima",            mpg: 32, msrp: 27990 },
    { id: "cx5",        name: "Mazda CX-5",               mpg: 28, msrp: 30100 },
    { id: "tucson",     name: "Hyundai Tucson",           mpg: 29, msrp: 29250 },
    { id: "sorento",    name: "Kia Sorento",              mpg: 27, msrp: 30485 },
    // BMW
    { id: "bmw330i",    name: "BMW 3 Series (330i)",      mpg: 30, msrp: 44400 },
  ],
};

export const CLIMATE_PENALTIES = { cold: 0.22, mild: 0.05, warm: 0.03, hot: 0.04 };
