import assert from "node:assert/strict";

import geoModule from "../lib/geo.js";
import calcModule from "../lib/core/calc.js";

const { resolveClimateZone, resolveState, resolveStateFromZip } = geoModule;
const { calculateComparison, getTCO } = calcModule;
const checks = [];

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    checks.push({ name, ok: false, error });
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await check("resolveStateFromZip uses the shared ZIP map", () => {
  assert.equal(resolveStateFromZip("94101"), "CA");
  assert.equal(resolveStateFromZip("10001"), "NY");
  assert.equal(resolveStateFromZip("bad-zip"), null);
});

await check("resolveState prefers explicit valid state over ZIP inference", () => {
  assert.equal(resolveState({ zip: "94101", state: "tx" }), "TX");
  assert.equal(resolveState({ zip: "94101" }), "CA");
  assert.equal(resolveState({ state: "??" }), null);
});

await check("resolveClimateZone reads from shared state seed data", () => {
  assert.equal(resolveClimateZone({ zip: "94101" }), "mild");
  assert.equal(resolveClimateZone({ state: "MN" }), "cold");
  assert.equal(resolveClimateZone({}), "mild");
});

await check("calculateComparison falls back to shared static datasets when DB data is unavailable", async () => {
  const result = await calculateComparison({
    zip: "94101",
    evId: "model3lr",
    iceId: "camry",
    milesPerYear: 12000,
    ownershipYears: 5,
    homePct: 85,
    publicPct: 10,
    dcfcPct: 5,
    includeIncentives: true,
    driveStyle: "normal",
    applyClimateAdjustment: true,
  });

  assert.equal(result.location.state, "CA");
  assert.equal(result.location.climateZone, "mild");
  assert.equal(result.ratesUsed.electricityCentsPerKwh, 27.3);
  assert.equal(result.ratesUsed.gasDollarsPerGallon, 4.85);
  assert.equal(result.operating.byYear.length, 5);
  assert.equal(result.breakdown.byYear.length, 5);
  assert.equal(result.operating.totalSavings, result.operating.byYear.at(-1).savings);
  assert.equal(result.totalCostEv, result.breakdown.evNet);
  assert.equal(result.totalCostIce, result.breakdown.iceNet);
  assert.ok(result.analysis.rankings.length > 5);
});

await check("drive style changes canonical EV fuel results", async () => {
  const baseInput = {
    zip: "60601",
    evId: "model3lr",
    iceId: "camry",
    milesPerYear: 12000,
    ownershipYears: 5,
  };

  const efficient = await calculateComparison({ ...baseInput, driveStyle: "efficient" });
  const aggressive = await calculateComparison({ ...baseInput, driveStyle: "aggressive" });

  assert.ok(aggressive.operating.evFuelAnnual > efficient.operating.evFuelAnnual);
  assert.ok(aggressive.analysis.kwhPerMile > efficient.analysis.kwhPerMile);
});

await check("getTCO uses the same shared rate resolution path", async () => {
  const tco = await getTCO("camry", { zip: "10001", milesPerYear: 12000, ownershipYears: 5 });

  assert.equal(tco?.vehicle.id, "camry");
  assert.equal(tco?.rateUsed, 3.35);
  assert.ok((tco?.total ?? 0) > 0);
});

const passed = checks.filter((check) => check.ok).length;
console.log(`\n${passed}/${checks.length} checks passed`);

