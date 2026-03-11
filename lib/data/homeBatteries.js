/**
 * Home battery catalog.
 * Prices are typical installed costs (hardware + labor) from installer quotes, 2024–2025.
 * Excludes federal ITC (30%) which most buyers can claim.
 */
export const HOME_BATTERIES = [
  {
    id: "powerwall3",
    name: "Tesla Powerwall 3",
    capacityKwh: 13.5,
    outputKw: 11.5,
    includedInverter: true,
    typicalInstalledCost: 12000,
    priceRange: "$10,000–$14,000 installed",
    bestFor: "Whole-home backup, solar pairing, simple single-unit install",
    brand: "Tesla",
    warranty: "10 years",
    notes: "Includes integrated inverter. Requires Tesla-certified installer.",
  },
  {
    id: "enphase5p",
    name: "Enphase IQ Battery 5P",
    capacityKwh: 5.0,
    outputKw: 3.84,
    includedInverter: true,
    typicalInstalledCost: 8500,
    priceRange: "$7,000–$10,000 installed",
    bestFor: "Modular expansion, microinverter solar systems, partial-home backup",
    brand: "Enphase",
    warranty: "10 years",
    notes: "Stackable — multiple units can be combined. Pairs naturally with Enphase solar.",
  },
  {
    id: "lgresu16",
    name: "LG RESU Prime 16H",
    capacityKwh: 16.0,
    outputKw: 7.0,
    includedInverter: false,
    typicalInstalledCost: 14000,
    priceRange: "$12,000–$16,000 installed",
    bestFor: "High-capacity backup, compatible with most third-party inverters",
    brand: "LG Energy Solution",
    warranty: "10 years",
    notes: "Requires separate inverter. Wide inverter compatibility.",
  },
  {
    id: "generacpwrcell",
    name: "Generac PWRcell 9",
    capacityKwh: 9.0,
    outputKw: 9.0,
    includedInverter: true,
    typicalInstalledCost: 11000,
    priceRange: "$9,500–$13,000 installed",
    bestFor: "Whole-home backup, generator-replacement use cases",
    brand: "Generac",
    warranty: "10 years",
    notes: "Modular design (3 kWh modules). Strong whole-home backup output.",
  },
  {
    id: "panasonicevervolt",
    name: "Panasonic EverVolt 11.4",
    capacityKwh: 11.4,
    outputKw: 7.6,
    includedInverter: false,
    typicalInstalledCost: 10500,
    priceRange: "$9,000–$12,000 installed",
    bestFor: "Flexible AC or DC coupling, broad installer availability",
    brand: "Panasonic",
    warranty: "10 years",
    notes: "Available in AC-coupled or DC-coupled configurations.",
  },
];

/**
 * Returns the closest-matching home batteries for a given capacity target.
 */
export function matchHomeBatteries(targetKwh, count = 3) {
  return [...HOME_BATTERIES]
    .sort((a, b) => Math.abs(a.capacityKwh - targetKwh) - Math.abs(b.capacityKwh - targetKwh))
    .slice(0, count);
}
