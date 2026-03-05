import { NextRequest, NextResponse } from "next/server";

/**
 * /api/img?asin=XXXXXXXXXX
 *
 * Server-side Amazon product image resolver.
 *
 * Problem: The shortcut URL `m.media-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`
 * returns a tiny 1×1 placeholder (HTTP 200) for many ASINs — not an error, just
 * invisible. Client-side onError never fires.
 *
 * Solution: Fetch the actual Amazon product page, extract the real
 * `m.media-amazon.com/images/I/<id>.jpg` URL from the page HTML (Amazon embeds
 * this in multiple JSON blobs / data attributes), then fetch and stream that image.
 *
 * In-memory cache keeps resolved URLs across warm Vercel function instances.
 */

// module-level cache: asin → resolved image URL (or null = "not found")
const _resolved = new Map<string, string | null>();

async function resolveImageUrl(asin: string): Promise<string | null> {
  if (_resolved.has(asin)) return _resolved.get(asin) ?? null;

  let url: string | null = null;

  try {
    const res = await fetch(`https://www.amazon.com/dp/${asin}`, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        // identity encoding avoids having to decompress gzip/brotli in Node
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) {
      _resolved.set(asin, null);
      return null;
    }

    const html = await res.text();

    // ── Pattern 1: hiRes from colorImages JSON blob ─────────────────────
    url ??=
      html.match(
        /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/
      )?.[1] ?? null;

    // ── Pattern 2: large from colorImages ──────────────────────────────
    url ??=
      html.match(
        /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/
      )?.[1] ?? null;

    // ── Pattern 3: data-old-hires attribute ────────────────────────────
    url ??=
      html.match(
        /data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/
      )?.[1] ?? null;

    // ── Pattern 4: data-a-dynamic-image (HTML-encoded JSON) ─────────────
    if (!url) {
      const raw = html.match(/data-a-dynamic-image="([^"]+)"/)?.[1];
      if (raw) {
        const decoded = raw
          .replace(/&quot;/g, '"')
          .replace(/&#34;/g, '"')
          .replace(/\\u0022/g, '"');
        url =
          decoded.match(
            /"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\._[^"]+\.jpg)"/
          )?.[1] ?? null;
      }
    }

    // ── Pattern 5: landingImageUrl ────────────────────────────────────
    url ??=
      html.match(
        /"landingImageUrl"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/
      )?.[1] ?? null;

    // ── Pattern 6: srcset / src fallback ─────────────────────────────
    url ??=
      html.match(
        /src="(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%+._-]{10,}\._[^"]*\.jpg)"/
      )?.[1] ?? null;

  } catch {
    // network / parse error — fall through with url = null
  }

  _resolved.set(asin, url);
  return url;
}

export async function GET(req: NextRequest) {
  const asin = (req.nextUrl.searchParams.get("asin") ?? "").toUpperCase();

  // Validate: Amazon ASINs are exactly 10 alphanumeric chars
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return new NextResponse(null, { status: 400 });
  }

  const imgUrl = await resolveImageUrl(asin);
  if (!imgUrl) return new NextResponse(null, { status: 404 });

  try {
    const imgRes = await fetch(imgUrl, { cache: "no-store" });

    if (!imgRes.ok) return new NextResponse(null, { status: 404 });

    const ct = imgRes.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return new NextResponse(null, { status: 404 });

    const buf = await imgRes.arrayBuffer();

    // Reject blank/placeholder images (real product photos are 20 KB+)
    if (buf.byteLength < 3000) return new NextResponse(null, { status: 404 });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        // Cache aggressively — product images don't change often
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
