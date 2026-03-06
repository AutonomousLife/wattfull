import test from "node:test";
import assert from "node:assert/strict";

import { resolveClimateZone, resolveState, resolveStateFromZip } from "../lib/geo.js";

test("resolveStateFromZip uses the shared ZIP map", () => {
  assert.equal(resolveStateFromZip("94101"), "CA");
  assert.equal(resolveStateFromZip("10001"), "NY");
  assert.equal(resolveStateFromZip("bad-zip"), null);
});

test("resolveState prefers explicit valid state over ZIP inference", () => {
  assert.equal(resolveState({ zip: "94101", state: "tx" }), "TX");
  assert.equal(resolveState({ zip: "94101" }), "CA");
  assert.equal(resolveState({ state: "??" }), null);
});

test("resolveClimateZone reads from shared state seed data", () => {
  assert.equal(resolveClimateZone({ zip: "94101" }), "mild");
  assert.equal(resolveClimateZone({ state: "MN" }), "cold");
  assert.equal(resolveClimateZone({}), "mild");
});

