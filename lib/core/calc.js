/**
 * lib/core/calc.js
 * Wattfull Canonical Calculation Engine
 *
 * Single source of truth for ALL cost comparisons.
 * Used by: EVCalcPage, ComparePage, SEO routes, ChatWidget /api/ask.
 *
 * SERVER-ONLY — do NOT import from client components directly.
 * Use the Server Action in app/actions/calc.ts instead.
 */

import { db } from "@/lib/db/index";
import { electricityRates, gasPrices, vehicles, incentives } from "@/lib/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} CalcInput
 * @property {string}  [zip]                     5-digit US ZIP
 * @property {string}  [state]                   State abbreviation (fallback if no zip)
 * @property {number}  milesPerYear              Annual miles driven (default: 12000)
 * @property {string}  evId                      Vehicle ID from vehicles table
 * @property {string}  iceId                     Vehicle ID from vehicles table
 * @property {number}  ownershipYears            1–20 (default: 5)
 * @property {number}  [electricityRateOverride]  cents/kWh — user override
 * @property {number}  [gasPriceOverride]         $/gal — user override
 * @property {string}  [climateZone]             "cold"|"mild"|"warm"|"hot"
 * @property {number}  [homePct]                 % of charging at home (0-100, default: 80)
 * @property {number}  [evMaintPerYear]           $/yr EV maintenance (default: 800)
 * @property {number}  [iceMaintPerYear]          $/yr ICE maintenance (default: 1500)
 * @property {boolean} [includeIncentives]        Apply known incentives to EV cost (default: false)
 */

/**
 * @typedef {Object} IncentiveLineItem
 * @property {string}  label
 * @property {number}  amount
 * @property {string}  type          "federal"|"state"|"utility"
 * @property {string}  eligibilityFlag  "" | "Not applied (requires verification)"
 * @property {boolean} applied       Whether this amount was subtracted from EV cost
 */

/**
 * @typedef {Object} WattfullResult
 * @property {number}   totalCostEv
 * @property {number}   totalCostIce
 * @property {number}   costPerMileEv
 * @property {number}   costPerMileIce
 * @property {number|null} breakevenYear   null if EV never cheaper over ownershipYears
 * @property {Object}   breakdown
 * @property {number}   breakdown.evFuelTotal
 * @property {number}   breakdown.evMaintTotal
 * @property {number}   breakdown.evNet           after incentives
 * @property {number}   breakdown.iceFuelTotal
 * @property {number}   breakdown.iceMaintTotal
 * @property {number}   breakdown.iceNet
 * @property {Array}    breakdown.byYear          [{year, evCum, iceCum}]
 * @property {IncentiveLineItem[]} incentiveLineItems
 * @property {string}   verdict
 * @property {string[]} reasons
 * @property {"high"|"medium"|"low"} confidenceLevel
 * @property {string[]} assumptionsUsed
 * @property {Object}   dataTimestamps
 * @property {string[]} sources
 * @property {Object}   ratesUsed
 * @property {number}   ratesUsed.electricityCentsPerKwh
 * @property {number}   ratesUsed.gasDollarsPerGallon
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULTS = {
  milesPerYear: 12000,
  ownershipYears: 5,
  electricityRate: 16.0,   // cents/kWh — national avg fallback
  gasPrice: 3.50,          // $/gal — national avg fallback
  evMaint: 800,            // $/yr
  iceMaint: 1500,          // $/yr
  homePct: 80,             // % charging at home
};

/** Public DCFC surcharge ($/kWh equivalent, on top of electricity rate) */
const DCFC_SURCHARGE = 0.15;

/** Climate zone efficiency penalties for EVs (fraction of extra kWh used) */
const CLIMATE_PENALTIES = { cold: 0.22, mild: 0.05, warm: 0.03, hot: 0.04 };

/** Zip prefix → state mapping for quick lookups (abbreviated) */
const ZIP_STATE_PREFIXES = {
  "0": null, "1": "NY", "2": "DC", "3": "FL", "4": "MI", "5": "MN",
  "6": "IL", "7": "TX", "8": "CO", "9": "CA",
};

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Run a full EV vs ICE cost comparison.
 * @param {CalcInput} input
 * @returns {Promise<WattfullResult>}
 */
export async function calculateComparison(input) {
  const assumptions = [];
  const sources = [];
  const ts = {};

  // ── Resolve inputs + apply defaults ──
  const miles = input.milesPerYear ?? DEFAULTS.milesPerYear;
  const years = input.ownershipYears ?? DEFAULTS.ownershipYears;
  const homePct = (input.homePct ?? DEFAULTS.homePct) / 100;
  const evMaint = input.evMaintPerYear ?? DEFAULTS.evMaint;
  const iceMaint = input.iceMaintPerYear ?? DEFAULTS.iceMaint;

  if (input.evMaintPerYear == null) assumptions.push(`EV maintenance: $${DEFAULTS.evMaint}/yr (national avg)`);
  if (input.iceMaintPerYear == null) assumptions.push(`ICE maintenance: $${DEFAULTS.iceMaint}/yr (national avg)`);
  if (input.homePct == null) assumptions.push(`Home charging: ${DEFAULTS.homePct}% (national avg)`);

  // ── Resolve state from zip (simple prefix heuristic; full map in stateData) ──
  const state = input.state ?? inferStateFromZip(input.zip ?? "");

  // ── Fetch vehicle data ──
  const [evData, iceData] = await Promise.all([
    fetchVehicle(input.evId),
    fetchVehicle(input.iceId),
  ]);

  if (!evData) throw new Error(`EV vehicle not found: ${input.evId}`);
  if (!iceData) throw new Error(`ICE vehicle not found: ${input.iceId}`);
  ts.vehicleData = evData.updatedAt?.toISOString() ?? "seeded";
  sources.push("Wattfull vehicle database");

  // ── Resolve electricity rate ──
  let elecRate, elecTimestamp, elecSource, elecConfidence;
  if (input.electricityRateOverride != null) {
    elecRate = input.electricityRateOverride;
    elecTimestamp = "user-provided";
    elecSource = "User override";
    elecConfidence = "high";
    assumptions.push(`Electricity rate: ${elecRate}¢/kWh (user provided)`);
  } else {
    const rateResult = await getElectricityRate(input.zip, state);
    elecRate = rateResult.rate;
    elecTimestamp = rateResult.timestamp;
    elecSource = rateResult.source;
    elecConfidence = rateResult.confidence;
    assumptions.push(`Electricity rate: ${elecRate.toFixed(1)}¢/kWh (${rateResult.source})`);
  }
  ts.electricityRate = elecTimestamp;
  if (!sources.includes(elecSource)) sources.push(elecSource);

  // ── Resolve gas price ──
  let gasPrice, gasTimestamp, gasSource, gasConfidence;
  if (input.gasPriceOverride != null) {
    gasPrice = input.gasPriceOverride;
    gasTimestamp = "user-provided";
    gasSource = "User override";
    gasConfidence = "high";
    assumptions.push(`Gas price: $${gasPrice.toFixed(2)}/gal (user provided)`);
  } else {
    const gasResult = await getGasPrice(input.zip, state);
    gasPrice = gasResult.price;
    gasTimestamp = gasResult.timestamp;
    gasSource = gasResult.source;
    gasConfidence = gasResult.confidence;
    assumptions.push(`Gas price: $${gasPrice.toFixed(2)}/gal (${gasResult.source})`);
  }
  ts.gasPrice = gasTimestamp;
  if (!sources.includes(gasSource)) sources.push(gasSource);

  // ── Climate zone adjustment ──
  const climateZone = input.climateZone ?? inferClimate(state);
  const climatePenalty = CLIMATE_PENALTIES[climateZone] ?? CLIMATE_PENALTIES.mild;
  if (input.climateZone == null && state) {
    assumptions.push(`Climate zone: "${climateZone}" (inferred from state ${state})`);
  } else if (input.climateZone == null) {
    assumptions.push(`Climate zone: "mild" (national fallback)`);
  }
  assumptions.push(`EV cold-weather efficiency penalty: ${(climatePenalty * 100).toFixed(0)}% added to energy use`);

  // ── EV: annual fuel cost ──
  // kWh/100mi → kWh/mi, adjusted for climate
  const evKwhPer100mi = (evData.kwhPer100mi ?? 30) * (1 + climatePenalty);
  const evKwhPerMile = evKwhPer100mi / 100;

  // Blended electricity rate: home vs. public DCFC
  const publicPct = 1 - homePct;
  const blendedElecRate = homePct * (elecRate / 100) + publicPct * (elecRate / 100 + DCFC_SURCHARGE);
  // $/yr
  const evAnnualFuel = miles * evKwhPerMile * blendedElecRate * 100; // rate in $/kWh after /100

  if (publicPct > 0) {
    assumptions.push(`Public charging (${(publicPct * 100).toFixed(0)}%): adds $${DCFC_SURCHARGE}/kWh DCFC surcharge`);
  }
  assumptions.push(`EV efficiency: ${evKwhPer100mi.toFixed(1)} kWh/100mi (adjusted for climate)`);

  // ── ICE: annual fuel cost ──
  const mpg = iceData.mpgCombined ?? iceData.mpgCity ?? 28;
  const iceAnnualFuel = (miles / mpg) * gasPrice;
  assumptions.push(`ICE efficiency: ${mpg} MPG (combined)`);

  // ── Multi-year breakdown ──
  const evMsrp = evData.msrp ?? 0;
  const iceMsrp = iceData.msrp ?? 0;
  const byYear = [];
  let evCum = evMsrp;
  let iceCum = iceMsrp;
  let breakevenYear = null;
  let previousEvCum = evMsrp;
  let previousIceCum = iceMsrp;

  for (let y = 1; y <= years; y++) {
    // Small annual fuel price escalation: 2% electricity, 3% gas
    const evFuelY = evAnnualFuel * Math.pow(1.02, y - 1);
    const iceFuelY = iceAnnualFuel * Math.pow(1.03, y - 1);
    evCum += evFuelY + evMaint;
    iceCum += iceFuelY + iceMaint;
    byYear.push({ year: y, evCum: Math.round(evCum), iceCum: Math.round(iceCum) });
    if (breakevenYear === null && previousEvCum >= previousIceCum && evCum < iceCum) {
      breakevenYear = y;
    }
    previousEvCum = evCum;
    previousIceCum = iceCum;
  }
  assumptions.push("Fuel price escalation: 2%/yr electricity, 3%/yr gas");

  // ── Incentives ──
  const incentiveItems = await getIncentiveLineItems(input.evId, state, evData.federalCredit ?? 0, input.includeIncentives ?? false);
  const incentivesApplied = incentiveItems.reduce((s, i) => s + (i.applied ? i.amount : 0), 0);

  // ── Final totals ──
  const evFuelTotal = Math.round(evAnnualFuel * years);
  const evMaintTotal = Math.round(evMaint * years);
  const iceNetTotal = Math.round(iceMsrp + iceAnnualFuel * years + iceMaint * years);
  const evNetTotal = Math.round(evMsrp + evAnnualFuel * years + evMaint * years - incentivesApplied);

  const costPerMileEv = evNetTotal / (miles * years);
  const costPerMileIce = iceNetTotal / (miles * years);

  // ── Confidence level ──
  const confidenceLevel =
    elecConfidence === "high" && gasConfidence === "high"
      ? "high"
      : elecConfidence === "low" || gasConfidence === "low"
      ? "low"
      : "medium";

  // ── Verdict ──
  const { verdict, reasons } = buildVerdict({
    evNetTotal, iceNetTotal, breakevenYear, years,
    evAnnualFuel, iceAnnualFuel, incentivesApplied,
    evVehicleName: evData.name, iceVehicleName: iceData.name,
    confidenceLevel,
  });

  return {
    totalCostEv: evNetTotal,
    totalCostIce: iceNetTotal,
    costPerMileEv: Math.round(costPerMileEv * 1000) / 1000,
    costPerMileIce: Math.round(costPerMileIce * 1000) / 1000,
    breakevenYear,
    breakdown: {
      evFuelTotal,
      evMaintTotal,
      evNet: evNetTotal,
      iceFuelTotal: Math.round(iceAnnualFuel * years),
      iceMaintTotal: Math.round(iceMaint * years),
      iceNet: iceNetTotal,
      byYear,
    },
    incentiveLineItems: incentiveItems,
    verdict,
    reasons,
    confidenceLevel,
    assumptionsUsed: assumptions,
    dataTimestamps: ts,
    sources,
    ratesUsed: {
      electricityCentsPerKwh: Math.round(elecRate * 10) / 10,
      gasDollarsPerGallon: Math.round(gasPrice * 100) / 100,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @param {string} vehicleId @returns {Promise<import("../db/schema").Vehicle|null>} */
async function fetchVehicle(vehicleId) {
  if (!vehicleId) return null;
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Electricity rate: zip-level → state-level → national fallback.
 * @param {string|undefined} zip
 * @param {string|undefined} state
 */
async function getElectricityRate(zip, state) {
  // Try zip-level first
  if (zip) {
    const rows = await db
      .select()
      .from(electricityRates)
      .where(eq(electricityRates.zip, zip))
      .orderBy(desc(electricityRates.createdAt))
      .limit(1);
    if (rows[0]) {
      return {
        rate: rows[0].centsPerkwh,
        timestamp: rows[0].createdAt?.toISOString() ?? "unknown",
        source: rows[0].source ?? "EIA",
        confidence: "high",
      };
    }
  }
  // Try state-level
  if (state) {
    const rows = await db
      .select()
      .from(electricityRates)
      .where(and(eq(electricityRates.state, state), isNull(electricityRates.zip)))
      .orderBy(desc(electricityRates.createdAt))
      .limit(1);
    if (rows[0]) {
      return {
        rate: rows[0].centsPerkwh,
        timestamp: rows[0].createdAt?.toISOString() ?? "unknown",
        source: rows[0].source ?? "EIA (state avg)",
        confidence: "medium",
      };
    }
    // Try by state without null zip constraint (for seeded rows)
    const rows2 = await db
      .select()
      .from(electricityRates)
      .where(eq(electricityRates.state, state))
      .orderBy(desc(electricityRates.createdAt))
      .limit(1);
    if (rows2[0]) {
      return {
        rate: rows2[0].centsPerkwh,
        timestamp: rows2[0].createdAt?.toISOString() ?? "unknown",
        source: rows2[0].source ?? "EIA (state avg)",
        confidence: "medium",
      };
    }
  }
  // National fallback
  return {
    rate: DEFAULTS.electricityRate,
    timestamp: "national-fallback",
    source: "National average (EIA 2024)",
    confidence: "low",
  };
}

/**
 * Gas price: zip-level → state-level → national fallback.
 * @param {string|undefined} zip
 * @param {string|undefined} state
 */
async function getGasPrice(zip, state) {
  if (zip) {
    const rows = await db
      .select()
      .from(gasPrices)
      .where(eq(gasPrices.zip, zip))
      .orderBy(desc(gasPrices.createdAt))
      .limit(1);
    if (rows[0]) {
      return {
        price: rows[0].dollarsPerGallon,
        timestamp: rows[0].createdAt?.toISOString() ?? "unknown",
        source: rows[0].source ?? "EIA",
        confidence: "high",
      };
    }
  }
  if (state) {
    const rows = await db
      .select()
      .from(gasPrices)
      .where(eq(gasPrices.state, state))
      .orderBy(desc(gasPrices.createdAt))
      .limit(1);
    if (rows[0]) {
      return {
        price: rows[0].dollarsPerGallon,
        timestamp: rows[0].createdAt?.toISOString() ?? "unknown",
        source: rows[0].source ?? "EIA (state avg)",
        confidence: "medium",
      };
    }
  }
  return {
    price: DEFAULTS.gasPrice,
    timestamp: "national-fallback",
    source: "National average (EIA 2024)",
    confidence: "low",
  };
}

/**
 * Build incentive line items. Federal credit is NEVER applied by default —
 * user must explicitly opt in AND eligibility cannot be guaranteed.
 *
 * @param {string} evId
 * @param {string|undefined} state
 * @param {number} vehicleFederalCredit  from vehicle record
 * @param {boolean} includeIncentives
 * @returns {Promise<IncentiveLineItem[]>}
 */
async function getIncentiveLineItems(evId, state, vehicleFederalCredit, includeIncentives) {
  const items = [];

  // Federal credit
  if (vehicleFederalCredit > 0) {
    items.push({
      label: "Federal EV Tax Credit (IRA §30D)",
      amount: vehicleFederalCredit,
      type: "federal",
      eligibilityFlag: includeIncentives
        ? "Included — verify eligibility at tax filing"
        : "Not applied (requires income + MSRP verification)",
      applied: includeIncentives,
    });
  } else {
    items.push({
      label: "Federal EV Tax Credit",
      amount: 0,
      type: "federal",
      eligibilityFlag: "Not applicable for this vehicle",
      applied: false,
    });
  }

  // State incentive from incentives table
  if (state) {
    const stateRows = await db
      .select()
      .from(incentives)
      .where(and(eq(incentives.type, "state"), eq(incentives.jurisdiction, state)))
      .limit(5);
    for (const row of stateRows) {
      items.push({
        label: row.eligibilityNotes ? `${state} State Incentive` : `${state} Incentive`,
        amount: row.amount,
        type: "state",
        eligibilityFlag: row.eligibilityNotes ?? "",
        applied: includeIncentives,
      });
    }
  }

  return items;
}

/**
 * Build a human-readable verdict + bullet reasons.
 */
function buildVerdict({ evNetTotal, iceNetTotal, breakevenYear, years, evAnnualFuel, iceAnnualFuel, incentivesApplied, evVehicleName, iceVehicleName, confidenceLevel }) {
  const diff = iceNetTotal - evNetTotal;
  const annualFuelSavings = Math.round(iceAnnualFuel - evAnnualFuel);
  const reasons = [];
  let verdict = "";

  if (diff > 0) {
    // EV cheaper overall
    verdict = `Over ${years} years, the ${evVehicleName} saves approximately $${Math.abs(diff).toLocaleString()} compared to the ${iceVehicleName} when accounting for purchase price, fuel, and maintenance costs.`;
    reasons.push(`$${Math.abs(annualFuelSavings).toLocaleString()}/year estimated fuel savings`);
    if (breakevenYear) reasons.push(`Cost breakeven at year ${breakevenYear}`);
    if (incentivesApplied > 0) reasons.push(`$${incentivesApplied.toLocaleString()} in applied incentives`);
    reasons.push("Lower routine maintenance costs for EV (no oil changes, fewer brake services)");
  } else if (diff < 0) {
    // ICE cheaper
    verdict = `Over ${years} years, the ${iceVehicleName} costs approximately $${Math.abs(diff).toLocaleString()} less than the ${evVehicleName} in this scenario.`;
    reasons.push("Higher EV purchase price not offset by fuel savings within this timeframe");
    if (!breakevenYear) reasons.push(`No cost breakeven within ${years} years at current rates`);
    reasons.push("Consider longer ownership period or available incentives to improve EV economics");
  } else {
    verdict = `The ${evVehicleName} and ${iceVehicleName} have nearly equal total ownership costs over ${years} years.`;
    reasons.push("Similar total cost of ownership in this scenario");
  }

  if (confidenceLevel === "low") {
    reasons.push("⚠ Using national average rates — enter your ZIP for more accurate local data");
  } else if (confidenceLevel === "medium") {
    reasons.push("Using state-level rate averages (enter ZIP for zip-level accuracy)");
  }

  return { verdict, reasons };
}

/**
 * Infer US state abbreviation from ZIP code prefix (fast heuristic).
 * Returns undefined if ZIP is invalid or unknown.
 * @param {string} zip
 * @returns {string|undefined}
 */
function inferStateFromZip(zip) {
  if (!zip || zip.length < 5) return undefined;
  // Full zip-to-state mapping would be ideal; this is a best-effort prefix approach
  // A production app would import the full zipToState.js lookup
  const prefix3 = zip.substring(0, 3);
  const ZIP3_TO_STATE = {
    // Sample mappings — expanded in zipToState.js
    "941": "CA", "900": "CA", "100": "NY", "600": "IL", "770": "TX",
    "331": "FL", "606": "IL", "480": "MI", "550": "MN", "800": "CO",
    "020": "MA", "190": "PA", "301": "GA", "631": "MO", "850": "AZ",
    "971": "OR", "980": "WA", "700": "LA", "300": "GA", "378": "TN",
  };
  return ZIP3_TO_STATE[prefix3];
}

/**
 * Infer climate zone from state abbreviation.
 * @param {string|undefined} state
 * @returns {"cold"|"mild"|"warm"|"hot"}
 */
function inferClimate(state) {
  const HOT = new Set(["FL", "TX", "AZ", "NV", "HI", "LA", "MS", "AL", "GA", "SC", "NM", "OK", "AR"]);
  const COLD = new Set(["MN", "ND", "SD", "WI", "MI", "ME", "VT", "NH", "MT", "WY", "CO", "ID", "AK", "NY", "PA", "OH", "IN", "IA", "IL", "CT", "RI", "MA", "NJ", "WV"]);
  const MILD = new Set(["CA", "OR", "WA", "MD", "DE", "VA", "KY", "MO"]);
  if (!state) return "mild";
  if (HOT.has(state)) return "hot";
  if (COLD.has(state)) return "cold";
  if (MILD.has(state)) return "mild";
  return "warm";
}

// ─── Single-vehicle TCO helper (used by SEO cost-to-own pages) ────────────────

/**
 * @param {string} vehicleId
 * @param {Object} [opts]
 * @param {string} [opts.state]
 * @param {string} [opts.zip]
 * @param {number} [opts.milesPerYear]
 * @param {number} [opts.ownershipYears]
 */
export async function getTCO(vehicleId, opts = {}) {
  const vehicle = await fetchVehicle(vehicleId);
  if (!vehicle) return null;

  const miles = opts.milesPerYear ?? DEFAULTS.milesPerYear;
  const years = opts.ownershipYears ?? DEFAULTS.ownershipYears;
  const state = opts.state ?? inferStateFromZip(opts.zip ?? "");

  if (vehicle.type === "ev") {
    const { rate } = await getElectricityRate(opts.zip, state);
    const climatePenalty = CLIMATE_PENALTIES[inferClimate(state)] ?? CLIMATE_PENALTIES.mild;
    const kwhPer100mi = (vehicle.kwhPer100mi ?? 30) * (1 + climatePenalty);
    const annualFuel = miles * (kwhPer100mi / 100) * (rate / 100);
    const annualMaint = DEFAULTS.evMaint;
    const total = (vehicle.msrp ?? 0) + annualFuel * years + annualMaint * years;
    return { vehicle, annualFuel, annualMaint, total, years, rateUsed: rate };
  } else {
    const { price } = await getGasPrice(opts.zip, state);
    const mpg = vehicle.mpgCombined ?? 28;
    const annualFuel = (miles / mpg) * price;
    const annualMaint = DEFAULTS.iceMaint;
    const total = (vehicle.msrp ?? 0) + annualFuel * years + annualMaint * years;
    return { vehicle, annualFuel, annualMaint, total, years, rateUsed: price };
  }
}
