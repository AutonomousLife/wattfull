import { zipToState } from "@/lib/data/zipToState";
import { STATE_DATA } from "@/lib/data/stateData";

export function normalizeState(state) {
  if (!state) return null;
  const normalized = String(state).trim().toUpperCase();
  return STATE_DATA[normalized] ? normalized : null;
}

export function resolveStateFromZip(zip) {
  if (!/^\d{5}$/.test(zip ?? "")) return null;
  return zipToState(zip) ?? null;
}

export function resolveState({ zip, state } = {}) {
  return normalizeState(state) ?? resolveStateFromZip(zip) ?? null;
}

export function resolveClimateZone({ zip, state, fallback = "mild" } = {}) {
  const resolvedState = resolveState({ zip, state });
  return STATE_DATA[resolvedState]?.z ?? fallback;
}

export function getStateSeed(state) {
  const normalized = normalizeState(state);
  return normalized ? STATE_DATA[normalized] ?? null : null;
}

