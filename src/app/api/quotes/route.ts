import { getArchivedAsset } from "@/lib/catalogue";
import { MARKET_CACHE_MS, parseQuoteSlugs, type MarketResponse } from "@/lib/live-market";
import { getMarketQuotes } from "@/lib/live-market-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestedAt = new Date().toISOString();
  const params = new URL(request.url).searchParams;
  const headers = { "Cache-Control": "no-store" };
  if ([...params.keys()].some((key) => key !== "slugs") || params.getAll("slugs").length !== 1) return Response.json({ code: "invalid_query", error: "Only one slugs parameter is accepted; addresses and external URLs are not accepted." }, { status: 400, headers });
  const parsed = parseQuoteSlugs(params.get("slugs"));
  if (parsed.error !== null) return Response.json({ code: "invalid_slugs", error: parsed.error }, { status: 400, headers });
  const unknownSlugs = parsed.slugs.filter((slug) => !getArchivedAsset(slug));
  if (unknownSlugs.length) return Response.json({ code: "unknown_asset", error: "One or more catalogue assets were not found.", unknownSlugs }, { status: 404, headers });
  const quotes = await getMarketQuotes(parsed.slugs.map((slug) => getArchivedAsset(slug)!));
  const fetched = quotes.map((quote) => quote.fetchedAt).filter((value): value is string => value !== null).sort();
  const response: MarketResponse = { provider: "dexscreener", mode: "market-reference", requestedAt, fetchedAt: fetched.at(-1) ?? null, cacheTtlSeconds: MARKET_CACHE_MS / 1000, quotes };
  return Response.json(response, { headers });
}
