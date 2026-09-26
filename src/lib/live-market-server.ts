import "server-only";
import { createConcurrencyLimit, createMarketCache, emptyMarketQuote, marketTargetKey, parseMarketPairs, providerChainFor, type MarketQuote, type MarketReason, type MarketTarget } from "./live-market";

const API_ORIGIN = "https://api.dexscreener.com";
const TIMEOUT_MS = 8_000;
const runProviderRequest = createConcurrencyLimit(4);
const cache = createMarketCache<MarketQuote>();

async function loadBatch(targets: MarketTarget[]): Promise<MarketQuote[]> {
  return runProviderRequest(async () => {
    const chain = providerChainFor(targets[0].chain)!;
    const addresses = targets.map((target) => encodeURIComponent(target.address!)).join(",");
    const url = new URL(`/tokens/v1/${chain}/${addresses}`, API_ORIGIN);
    let reason: MarketReason = "provider_error";
    let message = "The market-data source could not be reached. Try again shortly.";
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store", redirect: "error", headers: { Accept: "application/json" } });
      if (!response.ok) {
        if (response.status === 429) { reason = "provider_rate_limit"; message = "The market-data source is temporarily rate limited. Try again shortly."; }
        throw new Error("Provider request failed");
      }
      const raw = await response.text();
      if (raw.length > 4_000_000) { reason = "invalid_response"; throw new Error("Provider response too large"); }
      let payload: unknown;
      try { payload = JSON.parse(raw); } catch { reason = "invalid_response"; throw new Error("Invalid provider JSON"); }
      const fetchedAt = new Date().toISOString();
      return targets.map((target) => parseMarketPairs(payload, target, fetchedAt));
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) { reason = "provider_timeout"; message = "The market-data source did not respond in time. Try again shortly."; }
      if (reason === "invalid_response") message = "The source returned an invalid market-data response.";
      // A failed attempt did not produce a market reference, so its fetch time
      // is unavailable rather than presented as a successful observation.
      return targets.map((target) => emptyMarketQuote(target, "error", reason, message));
    }
  });
}

/** Inputs are resolved from the catalogue by the API route, never from a URL. */
export async function getMarketQuotes(targets: MarketTarget[]): Promise<MarketQuote[]> {
  const usable = new Map<string, MarketTarget>();
  for (const target of targets) { const key = marketTargetKey(target); if (key) usable.set(key, target); }
  const keys = [...usable.keys()];
  const keysBySlug = new Map([...usable].map(([key, target]) => [target.slug, key]));
  const loaded = await cache.getMany(keys, async (missing) => {
    const groups = new Map<string, MarketTarget[]>();
    for (const key of missing) { const target = usable.get(key)!; const chain = providerChainFor(target.chain)!; groups.set(chain, [...(groups.get(chain) ?? []), target]); }
    const batches: MarketTarget[][] = [];
    for (const group of groups.values()) for (let offset = 0; offset < group.length; offset += 24) batches.push(group.slice(offset, offset + 24));
    const results = (await Promise.all(batches.map(loadBatch))).flat();
    return new Map(results.map((quote) => [keysBySlug.get(quote.slug)!, quote]));
  });
  const byKey = new Map(keys.map((key, index) => [key, loaded[index]]));
  return targets.map((target) => {
    const key = marketTargetKey(target);
    if (key) return { ...byKey.get(key)!, slug: target.slug, symbol: target.symbol, chain: target.chain };
    if (!target.address) return emptyMarketQuote(target, "unavailable", "no_address", "No token address is saved for this record.");
    if (!providerChainFor(target.chain)) return emptyMarketQuote(target, "unsupported", "unsupported_network", "This network is not enabled for this market-data source.");
    return emptyMarketQuote(target, "unavailable", "invalid_address", "The saved address is not usable for this network.");
  });
}
