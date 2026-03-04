/**
 * Wattfull module-level data store.
 * Data lives in memory for the lifetime of the server process.
 * On Vercel, cold starts will reset this — which is acceptable for MVP.
 *
 * TODO: For production persistence, replace the arrays below with
 * Vercel KV calls (https://vercel.com/docs/storage/vercel-kv):
 *   import { kv } from '@vercel/kv';
 *   const referrals = await kv.lrange('referrals', 0, -1);
 *   await kv.lpush('referrals', JSON.stringify(newReferral));
 */

export interface Referral {
  id: number;
  type: string;
  name: string;
  code: string;
  desc: string;
  upvotes: number;
  date: string;
  status: "approved" | "pending";
}

export interface Email {
  email: string;
  ts: number;
  source: string;
}

// Seed from static data so the page works on first load
const SEED_REFERRALS: Referral[] = [
  { id: 1, type: "Tesla",    name: "Sarah M.", code: "sarah-tesla-ref",  desc: "Get $500 off + 3 months free Supercharging",    upvotes: 142, date: "2025-12", status: "approved" },
  { id: 2, type: "Tesla",    name: "Mike R.",  code: "mike-model-y",     desc: "$500 off any new Tesla + free charging credits", upvotes: 89,  date: "2025-11", status: "approved" },
  { id: 3, type: "SunPower", name: "James K.", code: "james-sunpower",   desc: "$500 off SunPower solar installation",           upvotes: 67,  date: "2025-12", status: "approved" },
  { id: 4, type: "Tesla",    name: "Lisa T.",  code: "lisa-tesla-2025",  desc: "$500 off + referral bonus charging",             upvotes: 54,  date: "2025-12", status: "approved" },
  { id: 5, type: "Enphase",  name: "Dave W.", code: "dave-enphase",     desc: "Free Enphase battery monitoring for 1 year",    upvotes: 38,  date: "2025-10", status: "approved" },
];

const store = {
  referrals: [...SEED_REFERRALS] as Referral[],
  emails: [] as Email[],
  nextId: SEED_REFERRALS.length + 1,
};

export default store;
