/**
 * lib/core/calc.js
 * Wattfull canonical calculation engine.
 *
 * Shared by: server actions, SEO routes, and /api/ask.
 */

import { db } from "@/lib/db/index";
import { electricityRates, gasPrices, vehicles, incentives } from "@/lib/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { CLIMATE_PENALTIES, VEHICLES } from "@/lib/data/vehicles";
import { STATE_DATA } from "@/lib/data/stateData";
import { resolveClimateZone, resolveState } from "@/lib/geo";

const DEFAULTS = {
  milesPerYear: 12000,
  ownershipYears: 5,
  electricityRate: 16.0,
  gasPrice: 3.5,
  evMaint: 800,
  iceMaint: 1500,
  homePct: 85,
  publicPct: 10,
  dcfcPct: 5,
  driveStyle: "normal",
  applyClimateAdjustment: true,
};

const DRIVE_MULTIPLIERS = { efficient: 0.88, normal: 1.0, aggressive: 1.17 };
const ELECTRICITY_ESCALATION = 1.02;
const GAS_ESCALATION = 1.03;
const HAS_DATABASE_URL = Boolean(process.env.DATABASE_URL);

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clampYears(years) {
  const parsed = Number(years ?? DEFAULTS.ownershipYears);
  if (!Number.isFinite(parsed)) return DEFAULTS.ownershipYears;
  return Math.min(20, Math.max(1, Math.round(parsed)));
}

function normalizeMix(input) {
  const rawHome = Number(input.homePct ?? DEFAULTS.homePct);
  const rawPublic = Number(input.publicPct ?? DEFAULTS.publicPct);
  const rawDcfc = Number(input.dcfcPct ?? DEFAULTS.dcfcPct);
  const total = rawHome + rawPublic + rawDcfc;

  if (!Number.isFinite(total) || total <= 0) {
    return {
      homePct: DEFAULTS.homePct / 100,
      publicPct: DEFAULTS.publicPct / 100,
      dcfcPct: DEFAULTS.dcfcPct / 100,
      raw: { homePct: DEFAULTS.homePct, publicPct: DEFAULTS.publicPct, dcfcPct: DEFAULTS.dcfcPct, total: 100 },
      normalized: false,
    };
  }

  return {
    homePct: rawHome / total,
    publicPct: rawPublic / total,
    dcfcPct: rawDcfc / total,
    raw: { homePct: rawHome, publicPct: rawPublic, dcfcPct: rawDcfc, total },
    normalized: total !== 100,
  };
}

function normalizeVehicleRecord(record, fallback, typeHint) {
  const type = record?.type ?? fallback?.type ?? typeHint ?? null;
  const mpg = record?.mpgCombined ?? record?.mpgCity ?? fallback?.mpgCombined ?? fallback?.mpgCity ?? fallback?.mpg ?? null;
  const kwhPer100mi = record?.kwhPer100mi ?? fallback?.kwhPer100mi ?? fallback?.kwh ?? null;
  const federalCredit = record?.federalCredit ?? fallback?.federalCredit ?? fallback?.fc ?? 0;

  if (!record && !fallback) return null;

  return {
    id: record?.id ?? fallback?.id ?? null,
    slug: record?.slug ?? fallback?.slug ?? null,
    name: record?.name ?? fallback?.name ?? "Unknown vehicle",
    type,
    msrp: Number(record?.msrp ?? fallback?.msrp ?? 0),
    kwhPer100mi: kwhPer100mi != null ? Number(kwhPer100mi) : null,
    mpgCombined: mpg != null ? Number(mpg) : null,
    federalCredit: Number(federalCredit ?? 0),
    source: record?.source ?? fallback?.source ?? "static-seed",
    updatedAt: record?.updatedAt ?? null,
  };
}

function getStaticVehicle(vehicleId, typeHint) {
  const lists = [];
  if (!typeHint || typeHint === "ev") lists.push(...VEHICLES.ev.map((vehicle) => ({ ...vehicle, type: "ev" })));
  if (!typeHint || typeHint === "ice") lists.push(...VEHICLES.ice.map((vehicle) => ({ ...vehicle, type: "ice" })));
  return lists.find((vehicle) => vehicle.id === vehicleId) ?? null;
}

function getStaticEvFleet() {
  return VEHICLES.ev.map((vehicle) => normalizeVehicleRecord(null, { ...vehicle, type: "ev" }, "ev"));
}

async function safeDbCall(fn) {
  if (!HAS_DATABASE_URL) return null;
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function fetchVehicle(vehicleId, typeHint) {
  if (!vehicleId) return null;
  const fallback = getStaticVehicle(vehicleId, typeHint);
  const rows = await safeDbCall(() => db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1));
  return normalizeVehicleRecord(rows?.[0] ?? null, fallback, typeHint);
}

async function fetchVehicleBySlug(slug) {
  if (!slug) return null;
  const rows = await safeDbCall(() => db.select().from(vehicles).where(eq(vehicles.slug, slug)).limit(1));
  return rows?.[0] ?? null;
}

function getRateFallback(state, key, sourceLabel) {
  const seed = STATE_DATA[state ?? ""];
  if (!seed) return null;
  return {
    value: Number(seed[key]),
    timestamp: "static-seed",
    source: sourceLabel,
    confidence: "medium",
  };
}

async function getElectricityRate(zip, state) {
  if (zip) {
    const zipRows = await safeDbCall(() =>
      db.select().from(electricityRates).where(eq(electricityRates.zip, zip)).orderBy(desc(electricityRates.createdAt)).limit(1)
    );
    if (zipRows?.[0]) {
      return {
        rate: Number(zipRows[0].centsPerkwh),
        timestamp: zipRows[0].createdAt?.toISOString() ?? "unknown",
        source: zipRows[0].source ?? "EIA",
        confidence: "high",
      };
    }
  }

  if (state) {
    const stateRows = await safeDbCall(() =>
      db
        .select()
        .from(electricityRates)
        .where(and(eq(electricityRates.state, state), isNull(electricityRates.zip), isNull(electricityRates.utility)))
        .orderBy(desc(electricityRates.createdAt))
        .limit(1)
    );
    if (stateRows?.[0]) {
      return {
        rate: Number(stateRows[0].centsPerkwh),
        timestamp: stateRows[0].createdAt?.toISOString() ?? "unknown",
        source: stateRows[0].source ?? "EIA (state avg)",
        confidence: "medium",
      };
    }

    const seed = getRateFallback(state, "e", "Wattfull state seed");
    if (seed) {
      return {
        rate: seed.value,
        timestamp: seed.timestamp,
        source: seed.source,
        confidence: seed.confidence,
      };
    }
  }

  return {
    rate: DEFAULTS.electricityRate,
    timestamp: "national-fallback",
    source: "National average (EIA 2024)",
    confidence: "low",
  };
}

async function getGasPrice(zip, state) {
  if (zip) {
    const zipRows = await safeDbCall(() =>
      db.select().from(gasPrices)
        .where(and(eq(gasPrices.zip, zip), eq(gasPrices.grade, "regular")))
        .orderBy(desc(gasPrices.createdAt)).limit(1)
    );
    if (zipRows?.[0]) {
      return {
        price: Number(zipRows[0].dollarsPerGallon),
        timestamp: zipRows[0].createdAt?.toISOString() ?? "unknown",
        source: zipRows[0].source ?? "EIA",
        confidence: "high",
      };
    }
  }

  if (state) {
    const stateRows = await safeDbCall(() =>
      db.select().from(gasPrices)
        .where(and(eq(gasPrices.state, state), eq(gasPrices.grade, "regular")))
        .orderBy(desc(gasPrices.createdAt)).limit(1)
    );
    if (stateRows?.[0]) {
      return {
        price: Number(stateRows[0].dollarsPerGallon),
        timestamp: stateRows[0].createdAt?.toISOString() ?? "unknown",
        source: stateRows[0].source ?? "EIA (state avg)",
        confidence: "medium",
      };
    }

    const seed = getRateFallback(state, "g", "Wattfull state seed");
    if (seed) {
      return {
        price: seed.value,
        timestamp: seed.timestamp,
        source: seed.source,
        confidence: seed.confidence,
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

async function getStateIncentiveAmount(state) {
  if (!state) return 0;
  const rows = await safeDbCall(() =>
    db.select().from(incentives).where(and(eq(incentives.type, "state"), eq(incentives.jurisdiction, state))).limit(10)
  );
  if (rows?.length) {
    return rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  }
  return Number(STATE_DATA[state]?.ec ?? 0);
}

async function getIncentiveLineItems(evVehicle, state, includeIncentives) {
  const stateAmount = await getStateIncentiveAmount(state);
  const items = [];

  if ((evVehicle?.federalCredit ?? 0) > 0) {
    items.push({
      label: "Federal EV Tax Credit (IRA §30D)",
      amount: evVehicle.federalCredit,
      type: "federal",
      eligibilityFlag: includeIncentives
        ? "Included — verify eligibility at tax filing"
        : "Not applied (requires income + MSRP verification)",
      applied: includeIncentives,
    });
  }

  if (state && stateAmount > 0) {
    items.push({
      label: `${state} state EV incentive`,
      amount: stateAmount,
      type: "state",
      eligibilityFlag: includeIncentives
        ? "Included — verify current program eligibility"
        : "Not applied (program rules vary by buyer and vehicle)",
      applied: includeIncentives,
    });
  }

  return items;
}

function buildOperatingBreakdown({ years, evAnnualFuel, iceAnnualFuel, evMaint, iceMaint, incentivesApplied }) {
  const byYear = [];
  let evCum = 0;
  let iceCum = 0;
  let breakEvenYear = null;

  for (let year = 1; year <= years; year += 1) {
    evCum += evAnnualFuel + evMaint - (year === 1 ? incentivesApplied : 0);
    iceCum += iceAnnualFuel + iceMaint;
    const savings = iceCum - evCum;
    if (breakEvenYear === null && savings > 0) breakEvenYear = year;
    byYear.push({ year, evCum: Math.round(evCum), iceCum: Math.round(iceCum), savings: Math.round(savings) });
  }

  const horizonIndex = Math.min(5, byYear.length) - 1;
  return {
    byYear,
    totalEv: Math.round(evCum),
    totalIce: Math.round(iceCum),
    totalSavings: Math.round(iceCum - evCum),
    annualSavings: Math.round((iceAnnualFuel + iceMaint) - (evAnnualFuel + evMaint)),
    fiveYearSavings: horizonIndex >= 0 ? byYear[horizonIndex].savings : 0,
    breakEvenYear,
    incentivesApplied: Math.round(incentivesApplied),
  };
}

function buildOwnershipBreakdown({
  years, evMsrp, iceMsrp, evAnnualFuel, iceAnnualFuel, evMaint, iceMaint, incentivesApplied,
  batteryReplacementCost = 0, batteryReplacementYear = null,
  evResidualPct = 0, iceResidualPct = 0,
  evInsurancePerYear = 0, iceInsurancePerYear = 0,
}) {
  const byYear = [];
  let evCum = evMsrp - incentivesApplied;
  let iceCum = iceMsrp;
  let breakEvenYear = evCum < iceCum ? 0 : null;

  for (let year = 1; year <= years; year += 1) {
    const evFuelYear = evAnnualFuel * (ELECTRICITY_ESCALATION ** (year - 1));
    const iceFuelYear = iceAnnualFuel * (GAS_ESCALATION ** (year - 1));
    const batteryHit = (batteryReplacementYear && year === batteryReplacementYear) ? (batteryReplacementCost ?? 0) : 0;
    evCum += evFuelYear + evMaint + evInsurancePerYear + batteryHit;
    iceCum += iceFuelYear + iceMaint + iceInsurancePerYear;
    if (breakEvenYear === null && evCum < iceCum) breakEvenYear = year;
    byYear.push({ year, evCum: Math.round(evCum), iceCum: Math.round(iceCum) });
  }

  // Residual value reduces net cost (what you'd get selling the car)
  const evResidual = Math.round(evMsrp * (evResidualPct ?? 0));
  const iceResidual = Math.round(iceMsrp * (iceResidualPct ?? 0));
  const totalEv = Math.round(evCum) - evResidual;
  const totalIce = Math.round(iceCum) - iceResidual;

  return {
    byYear,
    totalEv,
    totalIce,
    totalSavings: Math.round(totalIce - totalEv),
    breakEvenYear,
    evFuelTotal: Math.round(byYear.reduce((sum, row, index) => sum + evAnnualFuel * (ELECTRICITY_ESCALATION ** index), 0)),
    iceFuelTotal: Math.round(byYear.reduce((sum, row, index) => sum + iceAnnualFuel * (GAS_ESCALATION ** index), 0)),
    evMaintTotal: Math.round(evMaint * years),
    iceMaintTotal: Math.round(iceMaint * years),
    evInsuranceTotal: Math.round(evInsurancePerYear * years),
    iceInsuranceTotal: Math.round(iceInsurancePerYear * years),
    batteryReplacementCost: Math.round(batteryReplacementCost ?? 0),
    evResidual,
    iceResidual,
  };
}

function buildAnalysisReasons({ electricityRate, gasPrice, miles, incentivesApplied, driveStyle }) {
  const reasons = [];
  const usAvgElec = DEFAULTS.electricityRate;

  if (electricityRate < usAvgElec - 1.5) reasons.push(`Low electricity rate (${electricityRate}¢/kWh vs ~${usAvgElec}¢ US avg) — charging is cheap here`);
  else if (electricityRate > usAvgElec + 2) reasons.push(`High electricity rate (${electricityRate}¢/kWh vs ~${usAvgElec}¢ US avg) — reduces EV advantage`);
  else reasons.push(`Near-average electricity rate (${electricityRate}¢/kWh)`);

  if (miles > 15000) reasons.push(`High annual mileage (${miles.toLocaleString()} mi) amplifies fuel savings`);
  else if (miles < 8000) reasons.push(`Lower mileage (${miles.toLocaleString()} mi/yr) limits total benefit`);

  if (gasPrice > 3.75) reasons.push(`Above-average gas price ($${gasPrice.toFixed(2)}/gal) favors the EV`);
  if (incentivesApplied > 0) reasons.push(`$${Math.round(incentivesApplied).toLocaleString()} in tax credits applied — lowers net EV cost`);
  if (driveStyle === "efficient") reasons.push("Efficient driving style improves effective range by ~12%");
  else if (driveStyle === "aggressive") reasons.push("Aggressive driving style reduces effective EV efficiency by ~17%");

  return reasons;
}

function buildOwnershipVerdict({ ownership, evVehicle, iceVehicle, confidenceLevel }) {
  const diff = ownership.totalSavings;
  const reasons = [];
  let verdict;

  if (diff > 0) {
    verdict = `Over the selected ownership period, the ${evVehicle.name} saves approximately $${Math.abs(diff).toLocaleString()} compared to the ${iceVehicle.name} when purchase price, fuel, maintenance, and incentives are included.`;
    reasons.push(`Lower total ownership cost by about $${Math.abs(diff).toLocaleString()}`);
    if (ownership.breakEvenYear !== null) reasons.push(`Ownership cost breakeven at year ${ownership.breakEvenYear}`);
    reasons.push("Lower routine maintenance costs for EV ownership");
  } else if (diff < 0) {
    verdict = `Over the selected ownership period, the ${iceVehicle.name} costs approximately $${Math.abs(diff).toLocaleString()} less than the ${evVehicle.name} in this scenario.`;
    reasons.push("Higher EV purchase price is not fully offset within this timeframe");
    if (ownership.breakEvenYear === null) reasons.push("No ownership-cost breakeven within the selected horizon");
  } else {
    verdict = `The ${evVehicle.name} and ${iceVehicle.name} have nearly equal total ownership costs over the selected period.`;
    reasons.push("Similar total cost of ownership in this scenario");
  }

  if (confidenceLevel === "low") reasons.push("Using national averages or seeded state data — enter a ZIP with live data for better precision");
  else if (confidenceLevel === "medium") reasons.push("Using state-level average rates rather than ZIP-level utility pricing");

  return { verdict, reasons };
}

function buildRankings({ miles, gasPrice, iceVehicle, evMaint, blendedRatePerKwh, climatePenalty, driveMultiplier, applyClimateAdjustment }) {
  if (!iceVehicle?.mpgCombined) return [];
  const iceAnnualFuel = (miles / iceVehicle.mpgCombined) * gasPrice;
  const iceAnnualCost = iceAnnualFuel + DEFAULTS.iceMaint;

  return getStaticEvFleet()
    .map((vehicle) => {
      const adjustedKwhPerMile = (vehicle.kwhPer100mi / 100) * (applyClimateAdjustment ? (1 + climatePenalty) : 1) * driveMultiplier;
      const evAnnualFuel = adjustedKwhPerMile * miles * blendedRatePerKwh;
      return {
        id: vehicle.id,
        name: vehicle.name,
        kwh: vehicle.kwhPer100mi,
        annSavings: Math.round(iceAnnualCost - (evAnnualFuel + evMaint)),
      };
    })
    .sort((a, b) => b.annSavings - a.annSavings);
}

function computeBreakEvenElec({ miles, iceAnnualFuel, iceMaint, evMaint, kwhPerMile, publicPct, dcfcPct, homePct }) {
  const blendRateCoeff = homePct * 1.12 / 100 + publicPct * 1.06 / 100;
  const blendConstant = publicPct * 0.18 * 1.06 + dcfcPct * 0.35;
  if (blendRateCoeff <= 0 || kwhPerMile <= 0 || miles <= 0) return null;

  const targetFuel = iceAnnualFuel + iceMaint - evMaint;
  const rawElectricity = (targetFuel / (kwhPerMile * miles) - blendConstant) / blendRateCoeff;
  if (rawElectricity <= 0 || rawElectricity >= 80) return null;
  return round(rawElectricity, 1);
}

export async function calculateComparison(input) {
  const state = resolveState({ zip: input.zip, state: input.state });
  const climateZone = input.climateZone ?? resolveClimateZone({ zip: input.zip, state });
  const climatePenalty = CLIMATE_PENALTIES[climateZone] ?? CLIMATE_PENALTIES.mild;
  const years = clampYears(input.ownershipYears);
  const miles = Number(input.milesPerYear ?? DEFAULTS.milesPerYear);
  const evMaint = Number(input.evMaintPerYear ?? DEFAULTS.evMaint);
  const iceMaint = Number(input.iceMaintPerYear ?? DEFAULTS.iceMaint);
  const driveStyle = input.driveStyle ?? DEFAULTS.driveStyle;
  const driveMultiplier = DRIVE_MULTIPLIERS[driveStyle] ?? DRIVE_MULTIPLIERS.normal;
  const applyClimateAdjustment = input.applyClimateAdjustment ?? true;
  const chargingMix = normalizeMix(input);

  const [evVehicle, iceVehicle] = await Promise.all([
    fetchVehicle(input.evId, "ev"),
    fetchVehicle(input.iceId, "ice"),
  ]);

  if (!evVehicle) throw new Error(`EV vehicle not found: ${input.evId}`);
  if (!iceVehicle) throw new Error(`ICE vehicle not found: ${input.iceId}`);

  const assumptions = [];
  const sources = [evVehicle.source ?? "vehicle seed", iceVehicle.source ?? "vehicle seed"];
  const dataTimestamps = {
    vehicleData: evVehicle.updatedAt?.toISOString?.() ?? "static-seed",
  };

  const electricityRateResult = input.electricityRateOverride != null
    ? {
        rate: Number(input.electricityRateOverride),
        timestamp: "user-provided",
        source: "User override",
        confidence: "high",
      }
    : await getElectricityRate(input.zip, state);

  const gasPriceResult = input.gasPriceOverride != null
    ? {
        price: Number(input.gasPriceOverride),
        timestamp: "user-provided",
        source: "User override",
        confidence: "high",
      }
    : await getGasPrice(input.zip, state);

  dataTimestamps.electricityRate = electricityRateResult.timestamp;
  dataTimestamps.gasPrice = gasPriceResult.timestamp;
  if (!sources.includes(electricityRateResult.source)) sources.push(electricityRateResult.source);
  if (!sources.includes(gasPriceResult.source)) sources.push(gasPriceResult.source);

  // TOU (time-of-use) support: blend off-peak and peak rates for home charging
  const baseElecRate = electricityRateResult.rate;
  const touOffPeakRate = input.touOffPeakRate != null ? Number(input.touOffPeakRate) : null;
  const touOffPeakHomePct = touOffPeakRate != null ? Math.min(1, Math.max(0, Number(input.touOffPeakHomePct ?? 0.8))) : 0;
  const effectiveHomeRatePerKwh = touOffPeakRate != null
    ? (touOffPeakHomePct * touOffPeakRate + (1 - touOffPeakHomePct) * baseElecRate) / 100
    : baseElecRate / 100;

  assumptions.push(`Electricity rate: ${round(baseElecRate, 1)}¢/kWh (${electricityRateResult.source})`);
  if (touOffPeakRate != null) {
    assumptions.push(`TOU off-peak rate: ${touOffPeakRate}¢/kWh (${Math.round(touOffPeakHomePct * 100)}% of home charging) — effective home rate ${round(effectiveHomeRatePerKwh * 100, 1)}¢/kWh`);
  }
  assumptions.push(`Gas price: $${round(gasPriceResult.price, 2).toFixed(2)}/gal (${gasPriceResult.source})`);
  assumptions.push(`Charging mix: ${round(chargingMix.homePct * 100)}% home / ${round(chargingMix.publicPct * 100)}% public L2 / ${round(chargingMix.dcfcPct * 100)}% DC fast charging`);
  assumptions.push(`Driving style multiplier: ${driveStyle} (${driveMultiplier.toFixed(2)}×)`);
  assumptions.push(`Climate adjustment: ${applyClimateAdjustment ? `${Math.round(climatePenalty * 100)}% (${climateZone})` : "disabled"}`);
  assumptions.push(`Annual mileage: ${miles.toLocaleString()} miles`);
  assumptions.push(`EV maintenance: $${Math.round(evMaint).toLocaleString()}/yr`);
  assumptions.push(`ICE maintenance: $${Math.round(iceMaint).toLocaleString()}/yr`);
  if (chargingMix.normalized) {
    assumptions.push(`Charging mix normalized from ${round(chargingMix.raw.total, 1)}% total to preserve ratios`);
  }

  const kwhPerMile = (Number(evVehicle.kwhPer100mi ?? 30) / 100) * (applyClimateAdjustment ? (1 + climatePenalty) : 1) * driveMultiplier;
  const blendedRatePerKwh =
    chargingMix.homePct * effectiveHomeRatePerKwh * 1.12 +
    chargingMix.publicPct * (baseElecRate / 100 + 0.18) * 1.06 +
    chargingMix.dcfcPct * 0.35;
  const evAnnualFuel = kwhPerMile * miles * blendedRatePerKwh;
  const iceAnnualFuel = (miles / Number(iceVehicle.mpgCombined ?? 28)) * gasPriceResult.price;

  assumptions.push(`EV efficiency used: ${round(kwhPerMile, 3).toFixed(3)} kWh/mile`);
  assumptions.push(`Blended charging rate: $${round(blendedRatePerKwh, 3).toFixed(3)}/kWh`);
  assumptions.push(`ICE efficiency used: ${Number(iceVehicle.mpgCombined ?? 28)} MPG combined`);

  const incentiveLineItems = await getIncentiveLineItems(evVehicle, state, Boolean(input.includeIncentives));
  const incentivesApplied = incentiveLineItems.reduce((sum, item) => sum + (item.applied ? Number(item.amount ?? 0) : 0), 0);

  const operating = buildOperatingBreakdown({
    years,
    evAnnualFuel,
    iceAnnualFuel,
    evMaint,
    iceMaint,
    incentivesApplied,
  });

  const ownership = buildOwnershipBreakdown({
    years,
    evMsrp: Number(evVehicle.msrp ?? 0),
    iceMsrp: Number(iceVehicle.msrp ?? 0),
    evAnnualFuel,
    iceAnnualFuel,
    evMaint,
    iceMaint,
    incentivesApplied,
    batteryReplacementCost: Number(input.batteryReplacementCost ?? 0),
    batteryReplacementYear: input.batteryReplacementYear ? Number(input.batteryReplacementYear) : null,
    evResidualPct: Number(input.evResidualPct ?? 0),
    iceResidualPct: Number(input.iceResidualPct ?? 0),
    evInsurancePerYear: Number(input.evInsurancePerYear ?? 0),
    iceInsurancePerYear: Number(input.iceInsurancePerYear ?? 0),
  });

  const annualSavings = operating.annualSavings;
  const verdictType = annualSavings > 600 ? "favorable" : annualSavings < -400 ? "unfavorable" : "neutral";
  const ownershipGap = ownership.totalIce - ownership.totalEv;
  const ownershipVerdictType = ownershipGap > 500 ? "favorable" : ownershipGap < -500 ? "unfavorable" : "neutral";
  const breakEvenElec = computeBreakEvenElec({
    miles,
    iceAnnualFuel,
    iceMaint,
    evMaint,
    kwhPerMile,
    homePct: chargingMix.homePct,
    publicPct: chargingMix.publicPct,
    dcfcPct: chargingMix.dcfcPct,
  });
  const savingsPer1kMi = Math.round((gasPriceResult.price / Number(iceVehicle.mpgCombined ?? 28) - kwhPerMile * blendedRatePerKwh) * 1000);
  const savingsPerGas10c = Math.round((miles / Number(iceVehicle.mpgCombined ?? 28)) * 0.1);
  const potentialCredits = input.includeIncentives ? 0 : Math.round(incentiveLineItems.reduce((sum, item) => sum + Number(item.amount ?? 0), 0));
  const analysisReasons = buildAnalysisReasons({
    electricityRate: round(electricityRateResult.rate, 1),
    gasPrice: round(gasPriceResult.price, 2),
    miles,
    incentivesApplied,
    driveStyle,
  });

  const confidenceLevel =
    electricityRateResult.confidence === "high" && gasPriceResult.confidence === "high"
      ? "high"
      : electricityRateResult.confidence === "low" || gasPriceResult.confidence === "low"
      ? "low"
      : "medium";

  const { verdict, reasons } = buildOwnershipVerdict({
    ownership,
    evVehicle,
    iceVehicle,
    confidenceLevel,
  });

  return {
    inputs: {
      zip: input.zip ?? null,
      state,
      milesPerYear: miles,
      ownershipYears: years,
      evId: evVehicle.id,
      iceId: iceVehicle.id,
      includeIncentives: Boolean(input.includeIncentives),
      driveStyle,
      applyClimateAdjustment,
      homePct: round(chargingMix.homePct * 100, 1),
      publicPct: round(chargingMix.publicPct * 100, 1),
      dcfcPct: round(chargingMix.dcfcPct * 100, 1),
      evMaintPerYear: evMaint,
      iceMaintPerYear: iceMaint,
    },
    location: {
      zip: input.zip ?? null,
      state,
      climateZone,
    },
    vehicles: {
      ev: evVehicle,
      ice: iceVehicle,
    },
    totalCostEv: ownership.totalEv,
    totalCostIce: ownership.totalIce,
    costPerMileEv: round(ownership.totalEv / (miles * years), 3),
    costPerMileIce: round(ownership.totalIce / (miles * years), 3),
    breakevenYear: ownership.breakEvenYear,
    breakdown: {
      evFuelTotal: ownership.evFuelTotal,
      evMaintTotal: ownership.evMaintTotal,
      evInsuranceTotal: ownership.evInsuranceTotal,
      batteryReplacementCost: ownership.batteryReplacementCost,
      evResidual: ownership.evResidual,
      evNet: ownership.totalEv,
      iceFuelTotal: ownership.iceFuelTotal,
      iceMaintTotal: ownership.iceMaintTotal,
      iceInsuranceTotal: ownership.iceInsuranceTotal,
      iceResidual: ownership.iceResidual,
      iceNet: ownership.totalIce,
      byYear: ownership.byYear,
    },
    operating: {
      byYear: operating.byYear,
      totalEv: operating.totalEv,
      totalIce: operating.totalIce,
      totalSavings: operating.totalSavings,
      annualSavings: operating.annualSavings,
      fiveYearSavings: operating.fiveYearSavings,
      breakEvenYear: operating.breakEvenYear,
      evFuelAnnual: Math.round(evAnnualFuel),
      iceFuelAnnual: Math.round(iceAnnualFuel),
      evMaintAnnual: Math.round(evMaint),
      iceMaintAnnual: Math.round(iceMaint),
      incentivesApplied: Math.round(incentivesApplied),
      evCostPerMile: round(operating.totalEv / (miles * years), 3),
      iceCostPerMile: round(operating.totalIce / (miles * years), 3),
    },
    analysis: {
      verdictType,
      ownershipVerdictType,
      reasons: analysisReasons,
      breakEvenElec,
      savingsPer1kMi,
      savingsPerGas10c,
      potentialCredits,
      rankings: buildRankings({
        miles,
        gasPrice: gasPriceResult.price,
        iceVehicle,
        evMaint,
        blendedRatePerKwh,
        climatePenalty,
        driveMultiplier,
        applyClimateAdjustment,
      }),
      kwhPerMile: round(kwhPerMile, 3),
      blendedRatePerKwh: round(blendedRatePerKwh, 3),
      climatePenaltyPct: Math.round(climatePenalty * 100),
    },
    incentiveLineItems,
    verdict,
    reasons,
    confidenceLevel,
    assumptionsUsed: assumptions,
    dataTimestamps,
    sources,
    ratesUsed: {
      electricityCentsPerKwh: round(electricityRateResult.rate, 1),
      gasDollarsPerGallon: round(gasPriceResult.price, 2),
    },
  };
}

export async function getTCO(vehicleId, opts = {}) {
  const vehicle = await fetchVehicle(vehicleId);
  if (!vehicle) return null;

  const years = clampYears(opts.ownershipYears);
  const miles = Number(opts.milesPerYear ?? DEFAULTS.milesPerYear);
  const state = resolveState({ zip: opts.zip, state: opts.state });

  if (vehicle.type === "ev") {
    const { rate } = await getElectricityRate(opts.zip, state);
    const climatePenalty = CLIMATE_PENALTIES[resolveClimateZone({ zip: opts.zip, state })] ?? CLIMATE_PENALTIES.mild;
    const kwhPer100mi = Number(vehicle.kwhPer100mi ?? 30) * (1 + climatePenalty);
    const annualFuel = miles * (kwhPer100mi / 100) * (rate / 100);
    const annualMaint = DEFAULTS.evMaint;
    const total = Math.round(Number(vehicle.msrp ?? 0) + annualFuel * years + annualMaint * years);
    return { vehicle, annualFuel, annualMaint, total, years, rateUsed: rate };
  }

  const { price } = await getGasPrice(opts.zip, state);
  const mpg = Number(vehicle.mpgCombined ?? 28);
  const annualFuel = (miles / mpg) * price;
  const annualMaint = DEFAULTS.iceMaint;
  const total = Math.round(Number(vehicle.msrp ?? 0) + annualFuel * years + annualMaint * years);
  return { vehicle, annualFuel, annualMaint, total, years, rateUsed: price };
}

export const __testables = {
  normalizeMix,
  buildOperatingBreakdown,
  buildOwnershipBreakdown,
  fetchVehicleBySlug,
};

