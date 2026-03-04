import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const voteDirectionEnum = pgEnum("vote_direction", ["up", "down"]);

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "ev" | "ice"
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  msrp: integer("msrp"),
  federalCredit: integer("federal_credit").default(0),
  kwhPer100mi: real("kwh_per_100mi"), // EV efficiency
  mpgCity: real("mpg_city"), // ICE
  mpgHwy: real("mpg_hwy"), // ICE
  mpgCombined: real("mpg_combined"), // ICE — used as primary
  batteryKwh: real("battery_kwh"), // EV
  rangeMi: integer("range_mi"), // EV
  source: text("source").default("hardcoded"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Electricity Rates ────────────────────────────────────────────────────────
export const electricityRates = pgTable("electricity_rates", {
  id: serial("id").primaryKey(),
  zip: text("zip"),
  state: text("state").notNull(),
  utility: text("utility"),
  centsPerkwh: real("cents_per_kwh").notNull(),
  effectiveDate: text("effective_date"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Gas Prices ───────────────────────────────────────────────────────────────
export const gasPrices = pgTable("gas_prices", {
  id: serial("id").primaryKey(),
  zip: text("zip"),
  state: text("state"),
  region: text("region"),
  dollarsPerGallon: real("dollars_per_gallon").notNull(),
  grade: text("grade").default("regular"),
  effectiveDate: text("effective_date"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Incentives ───────────────────────────────────────────────────────────────
export const incentives = pgTable("incentives", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "federal" | "state" | "utility"
  jurisdiction: text("jurisdiction"), // "US" | state abbr | utility name
  vehicleFilter: text("vehicle_filter"), // JSON string — eligible vehicle ids / rules
  amount: real("amount").notNull(),
  amountType: text("amount_type").default("flat"), // "flat" | "percent"
  eligibilityNotes: text("eligibility_notes"),
  incomeLimit: integer("income_limit"),
  effectiveFrom: text("effective_from"),
  effectiveTo: text("effective_to"),
  source: text("source"),
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Votes ────────────────────────────────────────────────────────────────────
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").notNull(), // "product" | "vehicle" | "link"
  itemId: text("item_id").notNull(),
  direction: voteDirectionEnum("direction").notNull(),
  weight: real("weight").default(1),
  ipHash: text("ip_hash").notNull(),
  deviceHash: text("device_hash").notNull(),
  flagged: boolean("flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Community / User-submitted Links ─────────────────────────────────────────
export const userLinks = pgTable("user_links", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "Tesla" | "SunPower" | "Enphase" | "Other"
  title: text("title").notNull(),
  url: text("url"),
  code: text("code"),
  submittedBy: text("submitted_by"),
  ipHash: text("ip_hash"),
  status: statusEnum("status").default("pending"),
  reportCount: integer("report_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// ─── Email Subscribers ────────────────────────────────────────────────────────
export const emailSubscribers = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  sourcePage: text("source_page").default("newsletter"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Data Pipeline Status ─────────────────────────────────────────────────────
export const dataStatus = pgTable("data_status", {
  id: serial("id").primaryKey(),
  datasetName: text("dataset_name").notNull().unique(),
  lastSuccessAt: timestamp("last_success_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  lastError: text("last_error"),
  lastSourceUrl: text("last_source_url"),
  rowCount: integer("row_count"),
});

// ─── Type exports ─────────────────────────────────────────────────────────────
export type Vehicle = typeof vehicles.$inferSelect;
export type ElectricityRate = typeof electricityRates.$inferSelect;
export type GasPrice = typeof gasPrices.$inferSelect;
export type Incentive = typeof incentives.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type UserLink = typeof userLinks.$inferSelect;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type DataStatus = typeof dataStatus.$inferSelect;
