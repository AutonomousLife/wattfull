// Local FAQ knowledge base for Wattbot.
// Each entry has keywords (any match scores it) and an answer.
// Higher keyword match count = better match (threshold: 2 keywords).
export const FAQ = [
  /* ── EV Savings / Cost ─────────────────────────────────────────── */
  {
    keywords: ["ev", "gas", "cost", "compare", "cheaper", "save", "savings", "money", "worth"],
    answer:
      "On average, EV owners spend 60–70% less on fuel than gas car owners. Electricity typically costs $0.03–0.05 per mile vs $0.12–0.18 per mile for gasoline. EVs also have lower maintenance costs — no oil changes, longer brake life thanks to regen braking. Our EV Calculator uses your ZIP for exact numbers including state electricity and gas prices.",
  },
  {
    keywords: ["electricity", "rate", "kwh", "price", "cost", "per kwh", "utility bill"],
    answer:
      "The U.S. average electricity rate is about 16¢/kWh (2025). Rates vary widely: Hawaii averages 37¢, while Idaho is under 10¢. Our calculator uses state-level EIA averages and lets you override with your actual rate. Check your utility bill — look for the \"energy charge\" or \"per kWh\" line.",
  },
  {
    keywords: ["charge", "charging", "station", "time", "fast", "level 2", "dcfc", "home charger", "overnight"],
    answer:
      "Most EV owners charge at home overnight with a Level 2 charger (240V), adding 20–30 miles per hour of charge. Public Level 2 adds 10–25 mph. DC Fast Chargers (DCFC) add 100–200+ miles in 20–40 minutes. Home charging costs $0.03–0.05/mi — the cheapest option. DCFC at public stations runs $0.25–0.45/kWh.",
  },
  {
    keywords: ["time of use", "tou", "off peak", "peak", "night rate", "schedule"],
    answer:
      "Time-of-Use (TOU) rates charge less for electricity at night (typically 9pm–6am). EV owners who charge overnight can cut fuel costs further — some utilities offer rates as low as 5–8¢/kWh at night. Check your utility's website for EV-specific TOU plans. PG&E, SCE, and Xcel all have EV night rate programs.",
  },

  /* ── Solar ──────────────────────────────────────────────────────── */
  {
    keywords: ["solar", "roi", "payback", "panel", "worth", "return", "system"],
    answer:
      "Solar payback averages 6–10 years in the U.S., but can be as low as 4 years in high-sun, high-rate states like California or Arizona. Key factors: your electricity rate, local sun hours, net metering policy, and system cost (~$3/watt after the 30% federal tax credit). Our Solar ROI Calculator gives state-specific estimates.",
  },
  {
    keywords: ["net metering", "sell back", "grid", "export", "utility", "credit"],
    answer:
      "Net metering lets you sell excess solar power back to the grid at retail rates. Full net metering (25+ states) maximizes ROI. Some states offer partial credit or 'net billing' at lower wholesale rates. California's NEM 3.0 reduced export rates significantly — batteries make more sense there now. Our solar calculator accounts for your state's policy.",
  },
  {
    keywords: ["solar panel", "install", "installer", "roof", "quote", "cost per watt", "system size"],
    answer:
      "A typical home solar system is 6–10 kW and costs $18,000–30,000 before incentives, or $12,000–21,000 after the 30% federal tax credit. Get at least 3 quotes — prices vary by 15–20%. Rooftop systems last 25–30 years. South-facing panels at your latitude's angle produce the most power.",
  },
  {
    keywords: ["battery storage", "powerwall", "home battery", "backup", "tesla powerwall", "enphase"],
    answer:
      "Home batteries like the Tesla Powerwall (13.5 kWh, ~$11,500 installed) or Enphase IQ Battery (10.5 kWh, ~$10,000) let you use solar power at night and ride out outages. Payback from battery alone is 8–15 years — their real value is backup power and TOU rate arbitrage. Most qualify for the 30% federal tax credit.",
  },

  /* ── EV Incentives ──────────────────────────────────────────────── */
  {
    keywords: ["tax credit", "incentive", "federal", "7500", "ira", "credit", "$7500", "rebate"],
    answer:
      "The federal EV tax credit is up to $7,500 under the Inflation Reduction Act. Eligibility depends on: income (MAGI ≤$150k single / $300k joint), vehicle MSRP (≤$55k cars, ≤$80k trucks/SUVs), and North American final assembly. Used EVs qualify for up to $4,000 if income ≤$75k single. Our calculator defaults to OFF — toggle on if you qualify.",
  },
  {
    keywords: ["state", "incentive", "rebate", "state credit", "ev credit", "local"],
    answer:
      "On top of the federal credit, many states offer additional EV incentives: Colorado ($5,000), California (up to $7,500 total with state rebate), New York ($2,000), and others. Utilities like PG&E and Xcel offer $500–1,000 charging equipment rebates too. Check pluginamerica.org for a full state-by-state list.",
  },

  /* ── EV Battery & Technology ────────────────────────────────────── */
  {
    keywords: ["battery", "degradation", "degrade", "lifespan", "capacity", "age", "health"],
    answer:
      "Modern EV batteries degrade slowly — typically 1–2% per year. After 8 years, most retain 80%+ capacity. Tesla, Hyundai/Kia, and GM offer 8-year/100,000-mile battery warranties. Extreme temperatures and frequent fast charging can slightly accelerate degradation, but real-world data shows batteries lasting 200,000+ miles.",
  },
  {
    keywords: ["efficiency", "mpge", "kwh", "100mi", "miles per kwh", "range", "consumption"],
    answer:
      "EV efficiency is measured in kWh per 100 miles (or MPGe). Most efficient: Hyundai Ioniq 6 (24 kWh/100mi), Tesla Model 3 RWD (25 kWh/100mi). Least efficient: large trucks and SUVs (40–50 kWh/100mi). Cold weather reduces range 15–40%; heat has a smaller 5–15% impact. Our calculator includes a climate adjustment toggle.",
  },
  {
    keywords: ["range anxiety", "range", "trip", "long distance", "highway", "road trip"],
    answer:
      "Modern EVs offer 250–400+ miles of range on a full charge. Tesla's Supercharger network covers most major highways. Electrify America serves non-Tesla EVs. For long trips, plan 15–25 min DC fast charge stops every 150–200 miles. Apps like ABRP (A Better Route Planner) automatically optimize charging stops.",
  },
  {
    keywords: ["used ev", "used electric", "pre-owned", "certified", "second hand", "buy used"],
    answer:
      "Used EVs can be excellent value — a 2021–2022 Chevy Bolt can be found for $15,000–20,000 with 80–90% battery remaining. Used EVs with under 50,000 miles typically have minimal degradation. Federal used EV tax credit gives up to $4,000 (income ≤$75k single). Check battery health reports and ask for a dealer battery diagnostic.",
  },

  /* ── EV Maintenance & Reliability ──────────────────────────────── */
  {
    keywords: ["maintenance", "repair", "oil change", "brake", "service", "cost", "mechanic"],
    answer:
      "EVs have significantly lower maintenance costs — no oil changes, fewer brake replacements (regenerative braking handles most stopping), no transmission fluid, no spark plugs. Typical EV annual maintenance: $500–900 vs $1,200–2,000 for gas vehicles. Over 5 years, EV owners save $3,000–6,000 in maintenance alone.",
  },
  {
    keywords: ["reliability", "recall", "problem", "issue", "reliable", "repair cost"],
    answer:
      "EVs have fewer moving parts and generally fewer mechanical failures. Consumer Reports data shows Tesla and Rivian have above-average problems, while Hyundai/Kia EVs score well. The most common EV issues are software-related (fixed OTA) and charging port problems. GM and Ford EVs had some early reliability issues that have improved.",
  },

  /* ── Specific Vehicles ──────────────────────────────────────────── */
  {
    keywords: ["tesla model 3", "model 3", "model3"],
    answer:
      "The Tesla Model 3 RWD starts at ~$38,990 and gets ~350 miles of range. It's among the most efficient EVs at 25 kWh/100mi. Qualifies for the $7,500 federal tax credit (standard range, below MSRP cap). The Long Range AWD adds range but pushes the price toward $45k. Supercharger network is a major perk for road tripping.",
  },
  {
    keywords: ["hyundai ioniq 6", "ioniq 6", "ioniq6"],
    answer:
      "The Ioniq 6 is one of the most efficient EVs on the market (24 kWh/100mi), with up to 361 miles of range on the RWD model. Starts around $38,615. Supports 800V ultra-fast charging — 10–80% in about 18 minutes. Qualifies for the federal tax credit. Strong value if you primarily charge at home or use public DCFC.",
  },
  {
    keywords: ["chevy bolt", "chevrolet bolt", "bolt ev"],
    answer:
      "The Chevy Bolt EV is one of the best values in EVs — around $26,500 new and frequently qualifies for the $7,500 federal credit, putting the effective price near $19,000. Gets 259 miles of range with solid efficiency. Charging is limited to 55 kW DCFC (slower than newer EVs) but is perfect for city driving and daily commutes.",
  },
  {
    keywords: ["ford f-150 lightning", "lightning", "f150 lightning"],
    answer:
      "The F-150 Lightning starts at ~$49,995 and offers 240–320 miles of range. Its Pro Power Onboard feature can power a job site or run your home during an outage (with the optional transfer switch). Heavy towing reduces range significantly — factor in a 40–50% range drop when towing at max capacity.",
  },

  /* ── How Wattfull Works ─────────────────────────────────────────── */
  {
    keywords: ["assumption", "calculator", "how", "work", "methodology", "accurate", "data"],
    answer:
      "Our EV calculator uses: (1) your ZIP to look up EIA state electricity & gas prices, (2) your selected vehicles' efficiency and MPG from EPA data, (3) a charging mix you set (home/public/DCFC), (4) climate penalties for cold or hot regions, and (5) optional federal/state incentives (defaulted to OFF). All assumptions are shown and editable in the Assumptions panel.",
  },
  {
    keywords: ["zip code", "zip", "location", "local", "my area"],
    answer:
      "Entering your ZIP code lets us pull your state's actual electricity rate and gas price from EIA data — much more accurate than national averages. California at 26¢/kWh vs Texas at 13¢/kWh makes a big difference in your savings estimate. You can always override the rate if you know your exact utility rate.",
  },
  {
    keywords: ["wattfull", "site", "about", "who", "company", "made", "trust"],
    answer:
      "Wattfull is an independent energy decision tool — our data comes from the EIA (Energy Information Administration), EPA fuel economy database, NREL solar irradiance data, and state policy databases. We update rates quarterly. Our methodology page walks through every calculation. We use affiliate links to Amazon and Amazon Associates for gear reviews.",
  },

  /* ── Power Stations & Gear ──────────────────────────────────────── */
  {
    keywords: ["power station", "portable", "generator", "backup", "outage", "camping"],
    answer:
      "Portable power stations range from 256Wh (camping lights + phone) to 4,000Wh+ (home backup). LiFePO4 chemistry lasts 3,000+ cycles vs ~500 for NMC. For most people: Anker SOLIX C1000 (~$500 sale) is the best all-around value. For home backup: EcoFlow DELTA 2 Max or Jackery 3000 Pro. Ultra-portable: EcoFlow River 3 Plus.",
  },
  {
    keywords: ["solar panel", "portable panel", "foldable", "camping solar", "renogy", "jackery", "ecoflow"],
    answer:
      "Portable solar panels for power stations typically range from 100–400W. Renogy makes the most reliable budget panels. Jackery and EcoFlow panels pair seamlessly with their power stations. For camping or RV, a 200W foldable panel ($200–350) paired with a 1,000Wh station covers most loads. Efficiency matters more in cloudy climates — look for 22%+ mono panels.",
  },
  {
    keywords: ["lifepo4", "lithium iron phosphate", "nmc", "battery chemistry", "cycle life"],
    answer:
      "LiFePO4 (lithium iron phosphate) batteries offer 3,000–5,000 charge cycles vs ~500 for NMC (nickel manganese cobalt). They're also safer (no thermal runaway risk), work better in cold, and last longer. The tradeoff is lower energy density — they're heavier for the same capacity. For home backup or frequent use, LiFePO4 is almost always the better choice.",
  },

  /* ── Carbon & Environment ───────────────────────────────────────── */
  {
    keywords: ["carbon", "emissions", "co2", "environment", "green", "renewable", "clean"],
    answer:
      "Even charged from the average U.S. grid (about 40% renewable), an EV produces roughly half the lifecycle CO₂ of a gas car. In states with clean grids like California, Washington, or Vermont, the emissions advantage is 70–80%. As the grid gets cleaner, your existing EV automatically gets greener over time — unlike a gas car.",
  },
  {
    keywords: ["grid", "renewable", "coal", "clean energy", "percent renewable", "utility"],
    answer:
      "The U.S. grid averages about 42% renewable energy (2025), up from 20% in 2010. State grids vary widely — Washington and Idaho run on nearly 100% hydro, while some Midwest states still rely heavily on gas and coal. Our States page shows each state's grid mix. You can check your utility's annual report for their specific mix.",
  },
];
