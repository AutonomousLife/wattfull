import { NextRequest, NextResponse } from "next/server";
import { FAQ } from "@/lib/data/faq";
import { calculateComparison } from "@/lib/core/calc";

/**
 * POST /api/ask
 * Body: { query: string, zip?: string, evId?: string, iceId?: string }
 *
 * 1. FAQ keyword lookup first (fast, no DB)
 * 2. If zip + vehicle ids provided: run server-side calc for accurate ZIP answer
 * 3. Returns { answer, assumptionsUsed?, sources?, isCalcResult }
 */

type FaqEntry = { keywords: string[]; answer: string };

function faqLookup(query: string): string | null {
  const lower = query.toLowerCase();
  let best: { score: number; answer: string } | null = null;
  for (const entry of FAQ as FaqEntry[]) {
    const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (score >= 2 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }
  return best?.answer ?? null;
}

const DEFAULT_EV = "model3lr";
const DEFAULT_ICE = "camry";

export async function POST(req: NextRequest) {
  try {
    const { query, zip, evId, iceId } = await req.json();
    if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

    // ── FAQ lookup ──
    const faqAnswer = faqLookup(query);
    if (faqAnswer) {
      return NextResponse.json({
        answer: faqAnswer,
        isCalcResult: false,
        sources: ["Wattfull FAQ"],
      });
    }

    // ── ZIP-aware calculation ──
    if (zip && zip.length === 5) {
      try {
        const result = await calculateComparison({
          zip,
          evId: evId ?? DEFAULT_EV,
          iceId: iceId ?? DEFAULT_ICE,
          milesPerYear: 12000,
          ownershipYears: 5,
        });

        const savings = result.totalCostIce - result.totalCostEv;
        const cheaper = savings > 0 ? "EV" : "gas";
        const diff = Math.abs(savings).toLocaleString();

        const answer =
          `For ZIP ${zip}, the electricity rate is approximately ${result.ratesUsed.electricityCentsPerKwh}¢/kWh ` +
          `and gas is $${result.ratesUsed.gasDollarsPerGallon}/gal. ` +
          `Over 5 years, the ${cheaper} option saves about $${diff}. ` +
          (result.breakevenYear
            ? `The EV breaks even at year ${result.breakevenYear}. `
            : "") +
          result.verdict;

        return NextResponse.json({
          answer,
          isCalcResult: true,
          assumptionsUsed: result.assumptionsUsed,
          sources: result.sources,
          ratesUsed: result.ratesUsed,
          confidenceLevel: result.confidenceLevel,
        });
      } catch (calcErr) {
        // Calc failed — fall through to generic response
        console.error("[ask] calc error:", calcErr);
      }
    }

    // ── Generic fallback ──
    return NextResponse.json({
      answer:
        "I can give you specific rates and savings estimates if you enter your ZIP code in the calculator. Try the EV Cost Calculator or Compare tools for a full breakdown!",
      isCalcResult: false,
      sources: [],
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
