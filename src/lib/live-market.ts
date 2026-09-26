export const MARKET_CACHE_MS = 30_000;
export const MARKET_STALE_MS = 120_000;
export const MAX_QUOTE_SLUGS = 24;

export type MarketStatus = "available" | "unavailable" | "unsupported" | "error";
export type MarketReason = "no_address" | "invalid_address" | "no_matching_pair" | "unsupported_network" | "provider_timeout" | "provider_rate_limit" | "provider_error" | "invalid_response";
export interface MarketTarget { slug: string; symbol: string; chain: string | null; address: string | null }
export interface MarketQuote {
  slug: string;
  symbol: string;
  chain: string | null;
  status: MarketStatus;
  reason: MarketReason | null;
  priceUsd: number | null;
  liquidityUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  dexId: string | null;
  pairAddress: string | null;
  pairUrl: string | null;
  fetchedAt: string | null;
  providerQuoteAt: null;
  error: string | null;
}
export interface MarketResponse {
  provider: "dexscreener";
  mode: "market-reference";
  requestedAt: string;
  fetchedAt: string | null;
  cacheTtlSeconds: number;
  quotes: MarketQuote[];
}

// Explicitly configured networks. Unsupported networks keep their archive.
const providerChains: Record<string, string> = {
  solana: "solana", ethereum: "ethereum", arbitrum: "arbitrum",
  avalanche: "avalanche", base: "base", bsc: "bsc", celo: "celo",
  gnosis: "gnosis", mantle: "mantle", polygon: "polygon", sui: "sui",
  plume: "plume", xdc: "xdc",
};
const caseSensitiveChains = new Set(["solana"]);
export function providerChainFor(chain: string | null): string | null {
  return chain !== null && Object.hasOwn(providerChains, chain) ? providerChains[chain] : null;
}
export function normalizedAddress(chain: string, address: string): string {
  return caseSensitiveChains.has(chain) ? address : address.toLowerCase();
}
export function validMarketAddress(chain: string, address: string): boolean {
  if (chain === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  if (chain === "sui") return /^0x[0-9a-fA-F]{64}$/.test(address);
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
export function marketTargetKey(target: MarketTarget): string | null {
  const chain = providerChainFor(target.chain);
  return chain && target.address && validMarketAddress(chain, target.address) ? `${chain}:${normalizedAddress(chain, target.address)}` : null;
}
export function parseQuoteSlugs(value: string | null): { slugs: string[]; error: null } | { slugs: null; error: string } {
  if (value === null || value.length > 2048) return { slugs: null, error: "Provide 1–24 catalogue slugs in the slugs parameter." };
  const parts = value.split(",").map((slug) => slug.trim());
  if (parts.length > MAX_QUOTE_SLUGS || parts.some((slug) => !/^[a-z0-9-]+$/.test(slug))) return { slugs: null, error: "Provide 1–24 valid catalogue slugs, separated by commas." };
  return { slugs: [...new Set(parts)], error: null };
}
export function emptyMarketQuote(target: MarketTarget, status: Exclude<MarketStatus, "available">, reason: MarketReason, error: string, fetchedAt: string | null = null): MarketQuote {
  return { slug: target.slug, symbol: target.symbol, chain: target.chain, status, reason, priceUsd: null, liquidityUsd: null, change24h: null, volume24h: null, dexId: null, pairAddress: null, pairUrl: null, fetchedAt, providerQuoteAt: null, error };
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function nonNegative(value: unknown): number | null { const parsed = finiteNumber(value); return parsed !== null && parsed >= 0 ? parsed : null; }
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
export function marketPairUrl(value: unknown, chain: string, pairAddress: string): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    // DEX Screener lowercases its page URLs, including Solana pair page paths.
    // Token matching above/below remains case-sensitive on Solana.
    return url.protocol === "https:" && url.hostname === "dexscreener.com" && !url.username && !url.password && segments.length === 2 && segments[0] === chain && segments[1].toLowerCase() === pairAddress.toLowerCase() ? url.href : null;
  } catch { return null; }
}

/** Select only the target base token on its recorded network. */
export function parseMarketPairs(payload: unknown, target: MarketTarget, fetchedAt: string): MarketQuote {
  if (!target.address) return emptyMarketQuote(target, "unavailable", "no_address", "No token address is saved for this record.");
  const chain = providerChainFor(target.chain);
  if (!chain) return emptyMarketQuote(target, "unsupported", "unsupported_network", "This network is not enabled for this market-data source.");
  if (!validMarketAddress(chain, target.address)) return emptyMarketQuote(target, "unavailable", "invalid_address", "The saved address is not usable for this network.");
  if (!Array.isArray(payload)) return emptyMarketQuote(target, "error", "invalid_response", "The source returned an invalid market-data response.", fetchedAt);
  let best: MarketQuote | null = null;
  for (const pair of payload) {
    if (!record(pair) || pair.chainId !== chain || !record(pair.baseToken) || typeof pair.baseToken.address !== "string" || normalizedAddress(chain, pair.baseToken.address) !== normalizedAddress(chain, target.address)) continue;
    const price = finiteNumber(pair.priceUsd);
    const pairAddress = text(pair.pairAddress);
    if (price === null || price <= 0 || pairAddress === null) continue;
    const liquidity = record(pair.liquidity) ? nonNegative(pair.liquidity.usd) : null;
    if (best && (best.liquidityUsd ?? -1) >= (liquidity ?? -1)) continue;
    best = { slug: target.slug, symbol: target.symbol, chain: target.chain, status: "available", reason: null, priceUsd: price, liquidityUsd: liquidity, change24h: record(pair.priceChange) ? finiteNumber(pair.priceChange.h24) : null, volume24h: record(pair.volume) ? nonNegative(pair.volume.h24) : null, dexId: text(pair.dexId), pairAddress, pairUrl: marketPairUrl(pair.url, chain, pairAddress), fetchedAt, providerQuoteAt: null, error: null };
  }
  return best ?? emptyMarketQuote(target, "unavailable", "no_matching_pair", "No priced pair matched this asset as the base token on its recorded network.", fetchedAt);
}
export function cacheTimeFresh(storedAt: number, now: number, ttlMs = MARKET_CACHE_MS): boolean {
  return Number.isFinite(storedAt) && Number.isFinite(now) && Number.isFinite(ttlMs) && ttlMs > 0 && now >= storedAt && now - storedAt < ttlMs;
}
export function marketReferenceStale(fetchedAt: string | null, now: number): boolean {
  const timestamp = fetchedAt === null ? NaN : Date.parse(fetchedAt);
  return !Number.isFinite(timestamp) || !Number.isFinite(now) || now < timestamp || now - timestamp >= MARKET_STALE_MS;
}

/** Provider-independent cache: TTL begins when a batch finishes, not at request start. */
export function createMarketCache<T>(ttlMs = MARKET_CACHE_MS, now: () => number = Date.now) {
  const values = new Map<string, { value: T; storedAt: number }>();
  const pending = new Map<string, Promise<T>>();
  return {
    async getMany(keys: string[], loader: (missing: string[]) => Promise<Map<string, T>>): Promise<T[]> {
      const work = new Map<string, Promise<T>>();
      const missing: string[] = [];
      for (const key of new Set(keys)) {
        const cached = values.get(key);
        if (cached && cacheTimeFresh(cached.storedAt, now(), ttlMs)) work.set(key, Promise.resolve(cached.value));
        else if (pending.has(key)) work.set(key, pending.get(key)!);
        else { values.delete(key); missing.push(key); }
      }
      if (missing.length) {
        // Defer execution so all identities are reserved before a provider runs.
        const batch = Promise.resolve().then(() => loader(missing));
        for (const key of missing) {
          const request = batch.then((result) => {
            if (!result.has(key)) throw new Error("Market batch omitted a requested identity");
            const value = result.get(key)!;
            values.set(key, { value, storedAt: now() });
            return value;
          }).finally(() => { pending.delete(key); });
          pending.set(key, request);
          work.set(key, request);
        }
      }
      return Promise.all(keys.map((key) => work.get(key)!));
    },
  };
}
export function createConcurrencyLimit(maximum: number) {
  if (!Number.isInteger(maximum) || maximum < 1) throw new Error("Concurrency must be a positive integer");
  let active = 0;
  const waiting: (() => void)[] = [];
  return async function run<T>(task: () => Promise<T>): Promise<T> {
    if (active < maximum) active++;
    else await new Promise<void>((resolve) => waiting.push(resolve));
    try { return await task(); }
    finally { const next = waiting.shift(); if (next) next(); else active--; }
  };
}
