CREATE TYPE status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vote_direction AS ENUM ('up', 'down');

CREATE TABLE IF NOT EXISTS vehicles (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL,
  make text,
  model text,
  year integer,
  msrp integer,
  federal_credit integer DEFAULT 0,
  kwh_per_100mi real,
  mpg_city real,
  mpg_hwy real,
  mpg_combined real,
  battery_kwh real,
  range_mi integer,
  source text DEFAULT 'hardcoded',
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS electricity_rates (
  id serial PRIMARY KEY,
  zip text,
  state text NOT NULL,
  utility text,
  cents_per_kwh real NOT NULL,
  effective_date text,
  source text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gas_prices (
  id serial PRIMARY KEY,
  zip text,
  state text,
  region text,
  dollars_per_gallon real NOT NULL,
  grade text DEFAULT 'regular',
  effective_date text,
  source text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incentives (
  id serial PRIMARY KEY,
  type text NOT NULL,
  jurisdiction text,
  vehicle_filter text,
  amount real NOT NULL,
  amount_type text DEFAULT 'flat',
  eligibility_notes text,
  income_limit integer,
  effective_from text,
  effective_to text,
  source text,
  last_verified timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id serial PRIMARY KEY,
  item_type text NOT NULL,
  item_id text NOT NULL,
  direction vote_direction NOT NULL,
  weight real DEFAULT 1,
  ip_hash text NOT NULL,
  device_hash text NOT NULL,
  flagged boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_links (
  id serial PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  url text,
  code text,
  submitted_by text,
  ip_hash text,
  status status DEFAULT 'pending',
  report_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  reviewed_at timestamp
);

CREATE TABLE IF NOT EXISTS email_subscribers (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source_page text DEFAULT 'newsletter',
  confirmed_at timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_status (
  id serial PRIMARY KEY,
  dataset_name text NOT NULL UNIQUE,
  last_success_at timestamp,
  last_attempt_at timestamp,
  last_error text,
  last_source_url text,
  row_count integer
);
