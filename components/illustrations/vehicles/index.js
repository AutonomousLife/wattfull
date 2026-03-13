export { TeslaModel3 } from "./TeslaModel3";
export { TeslaModelY } from "./TeslaModelY";
export { HyundaiIoniq5 } from "./HyundaiIoniq5";
export { HyundaiIoniq6 } from "./HyundaiIoniq6";
export { ChevyEquinoxEV } from "./ChevyEquinoxEV";
export { FordMachE } from "./FordMachE";
export { VWID4 } from "./VWID4";
export { KiaEV6 } from "./KiaEV6";
export { KiaEV9 } from "./KiaEV9";
export { F150Lightning } from "./F150Lightning";
export { BMWI4 } from "./BMWI4";
export { Polestar2 } from "./Polestar2";
export { NissanAriya } from "./NissanAriya";
export { HondaPrologue } from "./HondaPrologue";
export { CadillacLyriq } from "./CadillacLyriq";
export { ToyotaCamry } from "./ToyotaCamry";
export { HondaCivic } from "./HondaCivic";
export { ToyotaRAV4 } from "./ToyotaRAV4";
export { HondaCRV } from "./HondaCRV";
export { ToyotaCorolla } from "./ToyotaCorolla";
export { HondaAccord } from "./HondaAccord";
export { F150Gas } from "./F150Gas";
export { ToyotaTacoma } from "./ToyotaTacoma";
export { NissanAltima } from "./NissanAltima";
export { MazdaCX5 } from "./MazdaCX5";
export { HyundaiTucson } from "./HyundaiTucson";
export { ToyotaPrius } from "./ToyotaPrius";
export { ToyotaHighlander } from "./ToyotaHighlander";
export { KiaSorento } from "./KiaSorento";
export { ChevySilverado } from "./ChevySilverado";

// Keyed by base vehicle ID (no year suffix). Look up with: id.replace(/-\d{4}$/, "")
export const vehicleIllustrations = {
  // Tesla Model 3 variants
  model3rwd: "TeslaModel3", model3lr: "TeslaModel3", model3perf: "TeslaModel3",
  // Tesla Model Y variants
  modelyrwd: "TeslaModelY", modely: "TeslaModelY", modelyperf: "TeslaModelY",
  // Tesla Model S / X (reuse sedan/SUV shapes)
  models: "TeslaModel3", modelx: "TeslaModelY",
  // Tesla Cybertruck / Cyberbeast
  cybertruck: "F150Lightning", cyberbeast: "F150Lightning",
  // Hyundai Ioniq 5 variants
  ioniq5rwd: "HyundaiIoniq5", ioniq5: "HyundaiIoniq5", ioniq5n: "HyundaiIoniq5",
  // Hyundai Ioniq 6 variants
  ioniq6rwd: "HyundaiIoniq6", ioniq6awd: "HyundaiIoniq6",
  // Hyundai Tucson
  tucson: "HyundaiTucson",
  // Hyundai Elantra
  elantra: "NissanAltima",
  // Hyundai Sonata
  sonata: "HondaAccord",
  // Kia EV6 variants
  ev6rwd: "KiaEV6", ev6awd: "KiaEV6", ev6gt: "KiaEV6",
  // Kia EV9 variants
  ev9: "KiaEV9", ev9awd: "KiaEV9",
  // Kia Sorento
  sorento: "KiaSorento",
  // Kia Telluride
  telluride: "ToyotaHighlander",
  // Kia Niro EL (compact hatchback EV)
  konael: "HyundaiIoniq5",
  // Chevy (Equinox EV, Bolt, Blazer EV)
  bolt: "ChevyEquinoxEV", equinoxev: "ChevyEquinoxEV", blazerev: "ChevyEquinoxEV",
  // Chevy Equinox Gas / Silverado
  equinoxgas: "MazdaCX5", silverado: "ChevySilverado",
  // GMC Sierra
  gmcsierra: "ChevySilverado",
  // Ford Mach-E variants
  mache: "FordMachE", macheawd: "FordMachE",
  // Ford F-150
  f150lightning: "F150Lightning", f150gas: "F150Gas",
  // RAM 1500
  ram1500: "F150Gas",
  // VW ID.4 variants
  id4: "VWID4", id4awd: "VWID4",
  // VW Jetta
  jetta: "NissanAltima",
  // BMW
  bmwi4: "BMWI4", bmwi4m50: "BMWI4", bmwi5: "BMWI4", bmwix: "ToyotaHighlander",
  bmw330i: "HondaAccord",
  // Audi Q4
  audiq4: "NissanAriya",
  // Mercedes EQB
  mercedeseqb: "NissanAriya",
  // Polestar 2
  polestar2: "Polestar2",
  // Nissan Ariya / Leaf / Altima
  nisanariya: "NissanAriya", leaf: "HyundaiIoniq5", altima: "NissanAltima",
  // Honda Prologue / Accord / Civic / CR-V / Escape
  hondaprologue: "HondaPrologue",
  accord: "HondaAccord", civic: "HondaCivic", crv: "HondaCRV",
  escape: "HyundaiTucson",
  // Cadillac Lyriq
  cadillaclyriq: "CadillacLyriq",
  // Hummer EV
  hummer: "F150Lightning",
  // Rivian R1T (truck) / R1S (large SUV)
  rivianr1t: "F150Lightning", rivianr1s: "ToyotaHighlander",
  // Lucid Air
  lucidair: "HyundaiIoniq6",
  // GV60
  gv60: "KiaEV6",
  // Subaru Solterra / Outback
  subarosolt: "NissanAriya", outback: "ToyotaRAV4",
  // Toyota bZ4X
  toyotabz4x: "NissanAriya",
  // Toyota
  camry: "ToyotaCamry", rav4: "ToyotaRAV4", rav4hybrid: "ToyotaRAV4",
  corolla: "ToyotaCorolla", prius: "ToyotaPrius",
  highlander: "ToyotaHighlander", tacoma: "ToyotaTacoma",
  "4runner": "ToyotaHighlander",
  // Mazda CX-5 / Mazda 3
  cx5: "MazdaCX5", mazda3: "NissanAltima",
  // Nissan Altima (duplicate key consolidated above via altima)
  // Grand Cherokee / 4Runner
  grandcherokee: "ToyotaHighlander",
};
