"use server";

/**
 * Server Actions bridge for the Wattfull calculation engine.
 * Import this in client components (not lib/core/calc directly).
 */
import { calculateComparison, getTCO } from "@/lib/core/calc";

export type CalcInput = {
  zip?: string;
  state?: string;
  milesPerYear?: number;
  evId: string;
  iceId: string;
  ownershipYears?: number;
  electricityRateOverride?: number;
  gasPriceOverride?: number;
  climateZone?: string;
  homePct?: number;
  publicPct?: number;
  dcfcPct?: number;
  evMaintPerYear?: number;
  iceMaintPerYear?: number;
  includeIncentives?: boolean;
  driveStyle?: "efficient" | "normal" | "aggressive";
  applyClimateAdjustment?: boolean;
  // TOU
  touOffPeakRate?: number;
  touOffPeakHomePct?: number;
  // Ownership extras
  batteryReplacementCost?: number;
  batteryReplacementYear?: number;
  evResidualPct?: number;
  iceResidualPct?: number;
  evInsurancePerYear?: number;
  iceInsurancePerYear?: number;
};

export type TCOInput = {
  vehicleId: string;
  zip?: string;
  state?: string;
  milesPerYear?: number;
  ownershipYears?: number;
};

export async function runCalc(input: CalcInput) {
  return calculateComparison(input as any);
}

export async function runTCO(input: TCOInput) {
  return getTCO(input.vehicleId, input as any);
}

