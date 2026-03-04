// Local FAQ knowledge base for Wattbot.
// Each entry has keywords (any match scores it) and an answer.
// Higher keyword match count = better match.
export const FAQ = [
  {
    keywords: ["ev", "gas", "cost", "compare", "cheaper", "save", "savings", "money"],
    answer:
      "On average, EV owners spend 60–70% less on fuel than gas car owners. Electricity typically costs $0.03–0.05 per mile vs $0.12–0.18 per mile for gasoline. However, EVs often cost more upfront. Our EV Calculator uses your ZIP for exact numbers — including your state's actual electricity and gas prices.",
  },
  {
    keywords: ["electricity", "rate", "kwh", "price", "cost", "per kwh"],
    answer:
      "The U.S. average electricity rate is about 16¢/kWh (2024). Rates vary widely: Hawaii averages 37¢, while Idaho is under 10¢. Our calculator uses state-level averages from the EIA and lets you override with your actual rate. Check your utility bill for your exact rate.",
  },
  {
    keywords: ["charge", "charging", "station", "time", "fast", "level 2", "dcfc", "home charger"],
    answer:
      "Most EV owners charge at home overnight using a Level 2 charger (240V), adding 20–30 miles per hour. Public Level 2 stations add 10–25 mph. DC Fast Chargers (DCFC) can add 100–200+ miles in 20–40 minutes. Home charging is cheapest at $0.03–0.05/mi; DCFC can cost $0.25–0.45/kWh.",
  },
  {
    keywords: ["solar", "roi", "payback", "panel", "worth", "return"],
    answer:
      "Solar payback averages 6–10 years in the U.S., but can be as low as 4 years in high-sun, high-rate states like California or Arizona. Key factors: your electricity rate, sun hours, net metering policy, and system cost (~$3/watt after the 30% federal tax credit). Our Solar ROI Calculator gives state-specific estimates.",
  },
  {
    keywords: ["battery", "degradation", "degrade", "lifespan", "capacity", "age"],
    answer:
      "Modern EV batteries degrade slowly — typically 1–2% per year. After 8 years, most retain 80%+ capacity. Tesla, Hyundai/Kia, and GM offer 8-year/100,000-mile battery warranties. Extreme temperatures and frequent fast charging can slightly accelerate degradation, but real-world data shows batteries lasting 200,000+ miles.",
  },
  {
    keywords: ["efficiency", "mpge", "kwh", "100mi", "miles per kwh", "range"],
    answer:
      "EV efficiency is measured in kWh per 100 miles (or MPGe). The most efficient EVs use 21–26 kWh/100mi (Ioniq 6, Model 3). Trucks and SUVs use 35–50 kWh/100mi. Cold weather can reduce range 15–40%; heat has a smaller 5–15% impact. Our calculator includes a climate adjustment toggle.",
  },
  {
    keywords: ["maintenance", "repair", "oil change", "brake", "service", "cost"],
    answer:
      "EVs have significantly lower maintenance costs — no oil changes, fewer brake replacements (regenerative braking), no transmission fluid, no spark plugs. Typical EV annual maintenance: $500–900 vs $1,200–2,000 for gas vehicles. Our calculator lets you input your own maintenance estimates for an accurate comparison.",
  },
  {
    keywords: ["assumption", "assume", "calculator", "how", "work", "methodology"],
    answer:
      "Our EV calculator uses: (1) your ZIP to look up state electricity & gas prices from the EIA, (2) your selected vehicles' efficiency and MPG, (3) a charging mix you set (home/public/DCFC), (4) a climate penalty for cold/hot climates, and (5) optional federal/state incentives that default to OFF since eligibility varies. All assumptions are shown in the Assumptions panel.",
  },
  {
    keywords: ["tax credit", "incentive", "federal", "7500", "ira", "credit"],
    answer:
      "The federal EV tax credit is up to $7,500 under the Inflation Reduction Act. Eligibility depends on your income (MAGI limits: $150k single, $300k joint), vehicle MSRP ($55k cars, $80k trucks/SUVs), and vehicle assembly location. Our calculator defaults credits to OFF — toggle them on if you're confident you qualify.",
  },
  {
    keywords: ["net metering", "solar", "grid", "sell", "sell back", "utility"],
    answer:
      "Net metering lets you sell excess solar power back to the grid at retail rates. Full net metering (25+ states) maximizes ROI. Some states offer partial credit or 'net billing' at lower wholesale rates. A few states (like California post-NEM 3.0) have reduced rates significantly. Our solar calculator accounts for your state's net metering policy.",
  },
  {
    keywords: ["range anxiety", "range", "trip", "long distance", "highway"],
    answer:
      "Modern EVs offer 250–400+ miles of range on a full charge. The Supercharger (Tesla) and Electrify America networks cover most major highways. For long trips, plan 10–20 min DC fast charge stops every 150–200 miles. Apps like ABRP (A Better Route Planner) optimize charging stops automatically.",
  },
  {
    keywords: ["power station", "portable", "generator", "backup", "outage"],
    answer:
      "Portable power stations range from 256Wh (camping) to 4,000Wh+ (home backup). LiFePO4 chemistry lasts 3,000+ cycles vs 500 for standard lithium. For whole-home backup, look at the EcoFlow DELTA Pro Ultra or Jackery 3000 Pro. For car camping, 500–1,000Wh covers lights, fans, and devices easily.",
  },
];
