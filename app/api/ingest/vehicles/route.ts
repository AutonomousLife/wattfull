import { NextRequest, NextResponse } from "next/server";
import { db, vehicles, dataStatus } from "@/lib/db/index";
import { eq } from "drizzle-orm";

/**
 * GET /api/ingest/vehicles
 * Called by Vercel Cron (monthly, 1st of month 7am UTC).
 * Auth: Authorization: Bearer ${CRON_SECRET}
 *
 * Fetches EPA vehicle efficiency data from fueleconomy.gov (free, no key required).
 * Updates kwhPer100mi and mpgCombined for EVs and ICE vehicles in the vehicles table.
 * Does NOT overwrite MSRPs (those come from seed data).
 */

// Target vehicles to fetch — make/model pairs across recent model years
const EV_TARGETS = [
  { make: "Tesla",          model: "Model 3" },
  { make: "Tesla",          model: "Model Y" },
  { make: "Tesla",          model: "Model S" },
  { make: "Tesla",          model: "Model X" },
  { make: "Tesla",          model: "Cybertruck" },
  { make: "Hyundai",        model: "Ioniq 5" },
  { make: "Hyundai",        model: "Ioniq 6" },
  { make: "Hyundai",        model: "Kona Electric" },
  { make: "Kia",            model: "EV6" },
  { make: "Kia",            model: "EV9" },
  { make: "Chevrolet",      model: "Bolt EV" },
  { make: "Chevrolet",      model: "Equinox EV" },
  { make: "Chevrolet",      model: "Blazer EV" },
  { make: "Ford",           model: "Mustang Mach-E" },
  { make: "Ford",           model: "F-150 Lightning" },
  { make: "Volkswagen",     model: "ID.4" },
  { make: "BMW",            model: "i4" },
  { make: "BMW",            model: "iX" },
  { make: "BMW",            model: "i5" },
  { make: "Polestar",       model: "2" },
  { make: "Rivian",         model: "R1T" },
  { make: "Rivian",         model: "R1S" },
  { make: "Nissan",         model: "Ariya" },
  { make: "Nissan",         model: "LEAF" },
  { make: "Subaru",         model: "Solterra" },
  { make: "Toyota",         model: "bZ4X" },
  { make: "Honda",          model: "Prologue" },
  { make: "Cadillac",       model: "LYRIQ" },
  { make: "Mercedes-Benz",  model: "EQB" },
  { make: "Audi",           model: "Q4 e-tron" },
  { make: "Genesis",        model: "GV60" },
  { make: "Lucid",          model: "Air" },
  { make: "GMC",            model: "Hummer EV" },
];

const ICE_TARGETS = [
  { make: "Toyota",     model: "Camry" },
  { make: "Toyota",     model: "Corolla" },
  { make: "Toyota",     model: "RAV4" },
  { make: "Toyota",     model: "RAV4 Hybrid" },
  { make: "Toyota",     model: "Prius" },
  { make: "Toyota",     model: "Tacoma" },
  { make: "Toyota",     model: "Highlander" },
  { make: "Toyota",     model: "4Runner" },
  { make: "Honda",      model: "Civic" },
  { make: "Honda",      model: "CR-V" },
  { make: "Honda",      model: "Accord" },
  { make: "Ford",       model: "F-150" },
  { make: "Ford",       model: "Escape" },
  { make: "Chevrolet",  model: "Silverado 1500" },
  { make: "Chevrolet",  model: "Equinox" },
  { make: "GMC",        model: "Sierra 1500" },
  { make: "Ram",        model: "1500" },
  { make: "Nissan",     model: "Altima" },
  { make: "Mazda",      model: "CX-5" },
  { make: "Mazda",      model: "Mazda3" },
  { make: "Hyundai",    model: "Tucson" },
  { make: "Hyundai",    model: "Sonata" },
  { make: "Hyundai",    model: "Elantra" },
  { make: "Kia",        model: "Sorento" },
  { make: "Kia",        model: "Telluride" },
  { make: "Jeep",       model: "Grand Cherokee" },
  { make: "Subaru",     model: "Outback" },
  { make: "BMW",        model: "3 Series" },
  { make: "Volkswagen", model: "Jetta" },
];

const MODEL_YEARS = [2021, 2022, 2023, 2024, 2025];
const EPA_BASE = "https://fueleconomy.gov/ws/rest";

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`EPA fetch failed ${res.status}: ${url}`);
  return res.json();
}

// kWh/100mi from MPGe: 1 gallon-equivalent = 33.705 kWh
function mpgeToKwh(mpge: number): number {
  return Math.round((3370.5 / mpge) * 10) / 10;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = "vehicles";
  const sourceUrl = EPA_BASE;
  const now = new Date();

  await db
    .insert(dataStatus)
    .values({ datasetName: dataset, lastAttemptAt: now, lastSourceUrl: sourceUrl })
    .onConflictDoUpdate({
      target: dataStatus.datasetName,
      set: { lastAttemptAt: now, lastSourceUrl: sourceUrl },
    });

  let upsertCount = 0;
  let errorCount = 0;

  const allTargets = [
    ...EV_TARGETS.map((t) => ({ ...t, type: "ev" as const })),
    ...ICE_TARGETS.map((t) => ({ ...t, type: "ice" as const })),
  ];

  try {
    for (const { make, model, type } of allTargets) {
      for (const year of MODEL_YEARS) {
        try {
          const optionsUrl = `${EPA_BASE}/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
          const optionsData = await fetchJson(optionsUrl);

          // EPA returns { menuItem: [...] } or { menuItem: { value, text } } for single result
          const raw = optionsData?.menuItem;
          if (!raw) continue;
          const items: Array<{ value: string; text: string }> = Array.isArray(raw) ? raw : [raw];

          for (const item of items) {
            const epaId = item.value;
            if (!epaId) continue;

            try {
              const vUrl = `${EPA_BASE}/vehicle/${epaId}`;
              const v = await fetchJson(vUrl);
              if (!v?.id) continue;

              const isElectric =
                v.fuelType1 === "Electricity" ||
                v.fuelType === "Electricity" ||
                (v.combE && !v.phevBlended);

              const trimText = item.text || v.trany || "";
              const vehicleId = `epa-${epaId}`;
              const name = `${year} ${make} ${model}${trimText ? ` ${trimText}` : ""}`;

              const mpgCombined = v.comb08 ? Number(v.comb08) : null;
              const mpgeElec = v.combE ? Number(v.combE) : null;
              const kwhPer100mi = mpgeElec ? mpgeToKwh(mpgeElec) : null;
              const rangeEv = v.rangE ? Number(v.rangE) : (v.range ? Number(v.range) : null);
              // basePrice is reported to EPA by manufacturers — use only if valid non-zero
              const msrp = v.basePrice && Number(v.basePrice) > 0 ? Math.round(Number(v.basePrice)) : null;

              await db
                .insert(vehicles)
                .values({
                  id: vehicleId,
                  slug: toSlug(name),
                  name,
                  type: isElectric ? "ev" : type,
                  make,
                  model,
                  year,
                  msrp,
                  kwhPer100mi,
                  mpgCombined: isElectric ? mpgeElec : mpgCombined,
                  mpgCity: v.city08 ? Number(v.city08) : null,
                  mpgHwy: v.highway08 ? Number(v.highway08) : null,
                  rangeMi: rangeEv,
                  source: "fueleconomy.gov",
                  updatedAt: now,
                })
                .onConflictDoUpdate({
                  target: vehicles.id,
                  set: {
                    // Only overwrite msrp if EPA provides a value; preserve seed data otherwise
                    ...(msrp ? { msrp } : {}),
                    kwhPer100mi,
                    mpgCombined: isElectric ? mpgeElec : mpgCombined,
                    mpgCity: v.city08 ? Number(v.city08) : null,
                    mpgHwy: v.highway08 ? Number(v.highway08) : null,
                    rangeMi: rangeEv,
                    source: "fueleconomy.gov",
                    updatedAt: now,
                  },
                });

              upsertCount++;
            } catch {
              errorCount++;
            }
          }
        } catch {
          errorCount++;
        }
      }
    }

    await db
      .update(dataStatus)
      .set({ lastSuccessAt: now, lastError: null, rowCount: upsertCount })
      .where(eq(dataStatus.datasetName, dataset));

    return NextResponse.json({ ok: true, upserted: upsertCount, errors: errorCount });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    await db
      .update(dataStatus)
      .set({ lastError: msg.slice(0, 500) })
      .where(eq(dataStatus.datasetName, dataset));
    return NextResponse.json({ ok: false, error: msg.slice(0, 200) });
  }
}
