"use client";

export const STORAGE_KEYS = {
  profile: "wattfull_profile",
  evCalc: "wattfull_ev_calc_v2",
  solarCalc: "wattfull_solar_calc_v1",
  compareHistory: "wattfull_compare_history",
  solarHistory: "wattfull_solar_history",
  batteryHistory: "wattfull_battery_history",
  chargingHistory: "wattfull_charging_history",
  savedGear: "wattfull_saved_gear",
  savedStates: "wattfull_saved_states",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredJson(key, fallback) {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredJson(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function toggleStoredItem(key, item) {
  const current = getStoredJson(key, []);
  const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
  setStoredJson(key, next);
  return next;
}

export function pushStoredHistory(key, entry, limit = 8) {
  const current = getStoredJson(key, []);
  const deduped = current.filter((item) => JSON.stringify(item) !== JSON.stringify(entry));
  const next = [entry, ...deduped].slice(0, limit);
  setStoredJson(key, next);
  return next;
}

