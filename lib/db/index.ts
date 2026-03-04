import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

// Lazy initialization — DB is only created on first access (not at module load time).
// This allows `npm run build` to succeed without DATABASE_URL set at build time.
// In production/dev, DATABASE_URL must be set before any DB call.
let _db: DB | null = null;

function getDb(): DB {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (dev) or Vercel environment variables (production)."
      );
    }
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Proxy defers getDb() until first property access so import is safe at build time.
export const db: DB = new Proxy({} as DB, {
  get(_, prop: string | symbol) {
    return (getDb() as any)[prop];
  },
});

// Re-export schema for convenience
export * from "./schema";
