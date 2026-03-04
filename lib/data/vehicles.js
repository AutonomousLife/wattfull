export const VEHICLES = {
  ev: [
    { id: "model3lr", name: "Tesla Model 3 LR", kwh: 25.0, msrp: 42490, fc: 7500, img: "model3lr" },
    { id: "modely", name: "Tesla Model Y LR", kwh: 27.5, msrp: 47990, fc: 7500, img: "modely" },
    { id: "ioniq5", name: "Hyundai Ioniq 5", kwh: 29.0, msrp: 43800, fc: 7500, img: "ioniq5" },
    { id: "bolt", name: "Chevy Equinox EV", kwh: 30.0, msrp: 34995, fc: 7500, img: "bolt" },
    { id: "mache", name: "Ford Mach-E", kwh: 32.0, msrp: 42995, fc: 3750, img: "mache" },
    { id: "id4", name: "VW ID.4", kwh: 31.0, msrp: 39735, fc: 7500, img: "id4" }
  ],
  ice: [
    { id: "camry", name: "Toyota Camry", mpg: 32, msrp: 29495 },
    { id: "civic", name: "Honda Civic", mpg: 36, msrp: 25945 },
    { id: "rav4", name: "Toyota RAV4", mpg: 30, msrp: 31380 },
    { id: "crv", name: "Honda CR-V", mpg: 30, msrp: 31450 },
    { id: "corolla", name: "Toyota Corolla", mpg: 35, msrp: 23495 }
  ]
};

export const CLIMATE_PENALTIES = { cold: 0.22, mild: 0.05, warm: 0.03, hot: 0.04 };
