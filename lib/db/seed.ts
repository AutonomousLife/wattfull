/**
 * One-time seed script: populates vehicles and state-level rate fallbacks.
 * Run with: npx tsx lib/db/seed.ts
 *
 * Requires DATABASE_URL in environment (set in .env.local or shell).
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// ── Inline vehicle data (mirrors lib/data/vehicles.js) ──────────────────────
const EV_VEHICLES = [
  { id: "model3rwd",    name: "Tesla Model 3 RWD",          kwh: 25.0, msrp: 40240, fc: 7500 },
  { id: "model3lr",     name: "Tesla Model 3 Long Range",    kwh: 24.0, msrp: 45990, fc: 7500 },
  { id: "model3perf",   name: "Tesla Model 3 Performance",   kwh: 27.0, msrp: 50990, fc: 7500 },
  { id: "modelyrwd",    name: "Tesla Model Y RWD",           kwh: 26.0, msrp: 42990, fc: 7500 },
  { id: "modely",       name: "Tesla Model Y Long Range",    kwh: 27.0, msrp: 47990, fc: 7500 },
  { id: "modelyperf",   name: "Tesla Model Y Performance",   kwh: 30.0, msrp: 52990, fc: 7500 },
  { id: "models",       name: "Tesla Model S",               kwh: 27.0, msrp: 74990, fc: 7500 },
  { id: "modelx",       name: "Tesla Model X",               kwh: 33.0, msrp: 79990, fc: 7500 },
  { id: "ioniq5rwd",    name: "Hyundai Ioniq 5 RWD",        kwh: 28.0, msrp: 43450, fc: 7500 },
  { id: "ioniq5",       name: "Hyundai Ioniq 5 AWD",        kwh: 31.0, msrp: 47950, fc: 7500 },
  { id: "ioniq6rwd",    name: "Hyundai Ioniq 6 RWD",        kwh: 21.0, msrp: 38615, fc: 7500 },
  { id: "ioniq6awd",    name: "Hyundai Ioniq 6 AWD",        kwh: 24.0, msrp: 44615, fc: 7500 },
  { id: "konael",       name: "Hyundai Kona Electric",       kwh: 27.0, msrp: 33550, fc: 7500 },
  { id: "ev6rwd",       name: "Kia EV6 RWD",                kwh: 27.0, msrp: 42600, fc: 7500 },
  { id: "ev6awd",       name: "Kia EV6 AWD",                kwh: 30.0, msrp: 47600, fc: 7500 },
  { id: "ev6gt",        name: "Kia EV6 GT",                 kwh: 30.0, msrp: 62600, fc: 7500 },
  { id: "ev9",          name: "Kia EV9",                    kwh: 35.0, msrp: 54900, fc: 7500 },
  { id: "bolt",         name: "Chevy Equinox EV",           kwh: 28.0, msrp: 34995, fc: 7500 },
  { id: "blazerev",     name: "Chevy Blazer EV",            kwh: 30.0, msrp: 44995, fc: 7500 },
  { id: "mache",        name: "Ford Mustang Mach-E",        kwh: 32.0, msrp: 42995, fc: 3750 },
  { id: "f150lightning",name: "Ford F-150 Lightning",       kwh: 46.0, msrp: 49995, fc: 7500 },
  { id: "id4",          name: "VW ID.4",                    kwh: 30.0, msrp: 38995, fc: 7500 },
  { id: "bmwi4",        name: "BMW i4 eDrive35",            kwh: 27.0, msrp: 52200, fc: 7500 },
  { id: "polestar2",    name: "Polestar 2",                 kwh: 26.0, msrp: 48400, fc: 7500 },
  { id: "rivianr1t",    name: "Rivian R1T",                 kwh: 45.0, msrp: 69900, fc: 0 },
  { id: "rivianr1s",    name: "Rivian R1S",                 kwh: 40.0, msrp: 78000, fc: 0 },
  { id: "nisanariya",   name: "Nissan Ariya",               kwh: 30.0, msrp: 39125, fc: 7500 },
  { id: "subarosolt",   name: "Subaru Solterra",            kwh: 31.0, msrp: 44995, fc: 7500 },
  { id: "toyotabz4x",   name: "Toyota bZ4X",                kwh: 29.0, msrp: 44990, fc: 7500 },
  { id: "hondaprologue",name: "Honda Prologue",             kwh: 30.0, msrp: 47400, fc: 7500 },
  { id: "cadillaclyriq",name: "Cadillac LYRIQ",             kwh: 27.0, msrp: 58590, fc: 7500 },
  { id: "mercedeseqb",  name: "Mercedes EQB 300",           kwh: 34.0, msrp: 54100, fc: 7500 },
];

const ICE_VEHICLES = [
  { id: "camry",      name: "Toyota Camry",             mpg: 32, msrp: 29495 },
  { id: "corolla",    name: "Toyota Corolla",           mpg: 35, msrp: 23495 },
  { id: "rav4",       name: "Toyota RAV4",              mpg: 30, msrp: 31380 },
  { id: "rav4hybrid", name: "Toyota RAV4 Hybrid",       mpg: 40, msrp: 35000 },
  { id: "prius",      name: "Toyota Prius",             mpg: 57, msrp: 30000 },
  { id: "tacoma",     name: "Toyota Tacoma",            mpg: 22, msrp: 33200 },
  { id: "highlander", name: "Toyota Highlander",        mpg: 24, msrp: 40020 },
  { id: "civic",      name: "Honda Civic",              mpg: 36, msrp: 25945 },
  { id: "crv",        name: "Honda CR-V",               mpg: 30, msrp: 31450 },
  { id: "accord",     name: "Honda Accord",             mpg: 33, msrp: 28895 },
  { id: "f150gas",    name: "Ford F-150 (3.5L V6)",     mpg: 20, msrp: 36870 },
  { id: "silverado",  name: "Chevy Silverado 1500",     mpg: 18, msrp: 37295 },
  { id: "gmcsierra",  name: "GMC Sierra 1500",          mpg: 18, msrp: 40100 },
  { id: "altima",     name: "Nissan Altima",            mpg: 32, msrp: 27990 },
  { id: "cx5",        name: "Mazda CX-5",               mpg: 28, msrp: 30100 },
  { id: "tucson",     name: "Hyundai Tucson",           mpg: 29, msrp: 29250 },
  { id: "sorento",    name: "Kia Sorento",              mpg: 27, msrp: 30485 },
  { id: "bmw330i",    name: "BMW 3 Series (330i)",      mpg: 30, msrp: 44400 },
];

// ── State-level electricity + gas fallbacks ──────────────────────────────────
// Format: [state, cents_per_kwh, dollars_per_gallon, climate_zone]
const STATE_RATES: [string, number, number, string][] = [
  ["AL",13.86,2.89,"hot"],["AK",24.21,3.82,"cold"],["AZ",13.62,3.32,"hot"],
  ["AR",12.45,2.78,"warm"],["CA",27.28,4.85,"mild"],["CO",14.79,3.15,"cold"],
  ["CT",25.63,3.25,"cold"],["DE",14.08,3.05,"mild"],["FL",14.17,3.18,"hot"],
  ["GA",13.45,2.95,"hot"],["HI",43.18,4.65,"hot"],["ID",10.92,3.35,"cold"],
  ["IL",15.24,3.45,"cold"],["IN",14.52,3.15,"cold"],["IA",14.46,3.05,"cold"],
  ["KS",14.11,2.85,"warm"],["KY",12.56,2.92,"warm"],["LA",12.09,2.82,"hot"],
  ["ME",21.72,3.28,"cold"],["MD",15.82,3.18,"mild"],["MA",25.46,3.22,"cold"],
  ["MI",18.35,3.15,"cold"],["MN",14.48,3.05,"cold"],["MS",13.12,2.75,"hot"],
  ["MO",13.38,2.88,"warm"],["MT",12.45,3.25,"cold"],["NE",12.11,3.02,"cold"],
  ["NV",13.15,3.85,"hot"],["NH",22.18,3.18,"cold"],["NJ",17.96,3.12,"mild"],
  ["NM",14.55,3.08,"hot"],["NY",22.58,3.35,"cold"],["NC",12.85,2.98,"warm"],
  ["ND",11.85,3.08,"cold"],["OH",14.72,3.02,"cold"],["OK",12.18,2.75,"warm"],
  ["OR",12.45,3.68,"mild"],["PA",16.82,3.22,"cold"],["RI",24.85,3.18,"cold"],
  ["SC",14.08,2.85,"warm"],["SD",13.02,3.05,"cold"],["TN",12.48,2.82,"warm"],
  ["TX",13.95,2.72,"hot"],["UT",11.58,3.28,"cold"],["VT",20.15,3.25,"cold"],
  ["VA",13.52,3.02,"mild"],["WA",11.32,3.85,"mild"],["WV",12.85,2.95,"cold"],
  ["WI",16.12,3.08,"cold"],["WY",11.55,3.18,"cold"],
];

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Add it to .env.local or export it.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding vehicles...");
  for (const v of EV_VEHICLES) {
    await db
      .insert(schema.vehicles)
      .values({
        id: v.id,
        slug: toSlug(v.name),
        name: v.name,
        type: "ev",
        msrp: v.msrp,
        federalCredit: v.fc,
        kwhPer100mi: v.kwh,
        source: "hardcoded-v1",
      })
      .onConflictDoUpdate({
        target: schema.vehicles.id,
        set: { name: v.name, msrp: v.msrp, federalCredit: v.fc, kwhPer100mi: v.kwh },
      });
  }

  for (const v of ICE_VEHICLES) {
    await db
      .insert(schema.vehicles)
      .values({
        id: v.id,
        slug: toSlug(v.name),
        name: v.name,
        type: "ice",
        msrp: v.msrp,
        mpgCombined: v.mpg,
        mpgCity: v.mpg * 0.9,
        mpgHwy: v.mpg * 1.1,
        source: "hardcoded-v1",
      })
      .onConflictDoUpdate({
        target: schema.vehicles.id,
        set: { name: v.name, msrp: v.msrp, mpgCombined: v.mpg },
      });
  }
  console.log(`  ✓ ${EV_VEHICLES.length} EVs + ${ICE_VEHICLES.length} ICE vehicles seeded`);

  console.log("🌱 Seeding state electricity rates...");
  for (const [state, cents, , ] of STATE_RATES) {
    await db
      .insert(schema.electricityRates)
      .values({
        state,
        centsPerkwh: cents,
        effectiveDate: "2024-01",
        source: "stateData-fallback",
      })
      .onConflictDoNothing();
  }

  console.log("🌱 Seeding state gas prices...");
  for (const [state, , gal, ] of STATE_RATES) {
    await db
      .insert(schema.gasPrices)
      .values({
        state,
        dollarsPerGallon: gal,
        grade: "regular",
        effectiveDate: "2024-01",
        source: "stateData-fallback",
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${STATE_RATES.length} state rate rows seeded`);

  console.log("🌱 Seeding federal incentive (IRA §30D)...");
  await db
    .insert(schema.incentives)
    .values({
      type: "federal",
      jurisdiction: "US",
      amount: 7500,
      amountType: "flat",
      eligibilityNotes:
        "IRA §30D credit: MSRP cap ($80k trucks/vans/SUVs, $55k other). Income limit: $150k single/$300k joint. Vehicle must have final assembly in North America. Eligibility requires verification at tax filing.",
      incomeLimit: 150000,
      effectiveFrom: "2023-01-01",
      source: "IRS Rev. Proc. 2023-33",
    })
    .onConflictDoNothing();

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
