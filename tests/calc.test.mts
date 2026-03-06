import test from "node:test";
import assert from "node:assert/strict";

import { calculateComparison, getTCO } from "../lib/core/calc.js";

test("calculateComparison falls back to shared static datasets when DB data is unavailable", async () => {
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

test("drive style changes canonical EV fuel results", async () => {
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

test("getTCO uses the same shared rate resolution path", async () => {
  const tco = await getTCO("camry", { zip: "10001", milesPerYear: 12000, ownershipYears: 5 });

  assert.equal(tco?.vehicle.id, "camry");
  assert.equal(tco?.rateUsed, 3.35);
  assert.ok((tco?.total ?? 0) > 0);
});

