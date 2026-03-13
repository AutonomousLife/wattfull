export { TeslaModel3 } from "./TeslaModel3";
export { TeslaModelY } from "./TeslaModelY";
export { HyundaiIoniq5 } from "./HyundaiIoniq5";
export { ChevyEquinoxEV } from "./ChevyEquinoxEV";
export { FordMachE } from "./FordMachE";
export { VWID4 } from "./VWID4";
export { ToyotaCamry } from "./ToyotaCamry";
export { HondaCivic } from "./HondaCivic";
export { ToyotaRAV4 } from "./ToyotaRAV4";
export { HondaCRV } from "./HondaCRV";
export { ToyotaCorolla } from "./ToyotaCorolla";

// Keyed by base vehicle ID (no year suffix). Look up with: id.replace(/-\d{4}$/, "")
export const vehicleIllustrations = {
  // Tesla Model 3 variants
  model3rwd: "TeslaModel3", model3lr: "TeslaModel3", model3perf: "TeslaModel3",
  // Tesla Model Y variants
  modelyrwd: "TeslaModelY", modely: "TeslaModelY", modelyperf: "TeslaModelY",
  // Hyundai Ioniq 5 variants
  ioniq5rwd: "HyundaiIoniq5", ioniq5: "HyundaiIoniq5", "ioniq5n": "HyundaiIoniq5",
  // Chevy (old bolt id + new equinox ev id)
  bolt: "ChevyEquinoxEV", equinoxev: "ChevyEquinoxEV", blazerev: "ChevyEquinoxEV",
  // Ford Mach-E variants
  mache: "FordMachE", macheawd: "FordMachE",
  // VW ID.4 variants
  id4: "VWID4", id4awd: "VWID4",
  // Toyota
  camry: "ToyotaCamry",
  rav4: "ToyotaRAV4", rav4hybrid: "ToyotaRAV4",
  corolla: "ToyotaCorolla",
  // Honda
  civic: "HondaCivic",
  crv: "HondaCRV",
};
