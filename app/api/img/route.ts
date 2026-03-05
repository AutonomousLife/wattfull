import { NextRequest, NextResponse } from "next/server";

/**
 * /api/img?asin=XXXXXXXXXX
 *
 * Server-side image proxy for Amazon product images.
 * Fetches from Amazon's CDN without a Referer header (server → CDN has no
 * browser referrer policy), bypassing hotlink protection.
 * Rejects tiny "blank" placeholder responses (< 2 KB) that Amazon returns
 * when a product image isn't found — these are HTTP 200 but invisible, so
 * the browser's onError never fires without this check.
 */
export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin") ?? "";

  // Validate: Amazon ASINs are exactly 10 alphanumeric characters
  if (!/^[A-Z0-9]{10}$/i.test(asin)) {
    return new NextResponse(null, { status: 400 });
  }

  const imgUrl = `https://m.media-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;

  try {
    const res = await fetch(imgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 404 });
    }

    const data = await res.arrayBuffer();

    // Amazon returns a ~800-byte transparent 1×1 GIF when the product image
    // is unavailable. Real product images are 20 KB+. Reject anything < 3 KB.
    if (data.byteLength < 3000) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        // Cache for 7 days on CDN, serve stale for 1 day while revalidating
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
