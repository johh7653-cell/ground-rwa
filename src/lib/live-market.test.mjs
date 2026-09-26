import test from "node:test";
import assert from "node:assert/strict";
import { MARKET_CACHE_MS, MARKET_STALE_MS, cacheTimeFresh, createConcurrencyLimit, createMarketCache, marketPairUrl, marketReferenceStale, marketTargetKey, parseMarketPairs, parseQuoteSlugs, providerChainFor, validMarketAddress } from "./live-market.ts";

const target = { slug: "example", symbol: "EX", chain: "solana", address: "So11111111111111111111111111111111111111112" };
const fetchedAt = "2026-09-26T12:00:00.000Z";
const pair = (changes = {}) => ({ chainId: "solana", dexId: "venue", baseToken: { address: target.address }, quoteToken: { address: "DifferentToken" }, pairAddress: "MixedCasePair", url: "https://dexscreener.com/solana/mixedcasepair", priceUsd: "12.5", liquidity: { usd: 1000 }, priceChange: { h24: -.25 }, volume: { h24: 0 }, ...changes });

test("only the target base token on the same chain is eligible", () => {
  assert.equal(parseMarketPairs([pair({ chainId: "ethereum" })], target, fetchedAt).status, "unavailable");
  assert.equal(parseMarketPairs([pair({ baseToken: { address: "OtherToken" }, quoteToken: { address: target.address } })], target, fetchedAt).status, "unavailable");
  assert.equal(parseMarketPairs([pair({ baseToken: { address: target.address.toLowerCase() } })], target, fetchedAt).status, "unavailable");
  const result = parseMarketPairs([pair()], target, fetchedAt);
  assert.equal(result.priceUsd, 12.5);
  assert.equal(result.pairUrl, "https://dexscreener.com/solana/mixedcasepair");
  assert.equal(result.fetchedAt, fetchedAt);
  assert.equal(result.providerQuoteAt, null);
  assert.equal(result.change24h, -.25);
  assert.equal(result.volume24h, 0);
});

test("choose the highest recorded liquidity only among valid priced matches", () => {
  const result = parseMarketPairs([
    pair({ priceUsd: "100", liquidity: { usd: 999999 }, baseToken: { address: "wrong" } }),
    pair({ priceUsd: null, liquidity: { usd: 999999 } }),
    pair({ priceUsd: "13", liquidity: { usd: 100 } }),
    pair({ priceUsd: "14", liquidity: { usd: 2000 } }),
    pair({ priceUsd: "15", liquidity: null }),
  ], target, fetchedAt);
  assert.equal(result.status, "available");
  assert.equal(result.priceUsd, 14);
  assert.equal(result.liquidityUsd, 2000);
  const missing = parseMarketPairs([pair({ liquidity: null, volume: null, priceChange: null })], target, fetchedAt);
  assert.equal(missing.liquidityUsd, null);
  assert.equal(missing.volume24h, null);
  assert.equal(missing.change24h, null);
});

test("empty, zero, negative and invalid prices never become a usable quote", () => {
  for (const priceUsd of [null, undefined, "", " ", "0", 0, -1, "-5", "Infinity", Infinity, NaN, "0x20", false]) {
    assert.equal(parseMarketPairs([pair({ priceUsd })], target, fetchedAt).reason, "no_matching_pair", String(priceUsd));
  }
  assert.equal(parseMarketPairs([pair({ priceUsd: ".0000001" })], target, fetchedAt).priceUsd, .0000001);
  assert.equal(parseMarketPairs([pair({ priceUsd: "1e-6" })], target, fetchedAt).priceUsd, .000001);
});

test("independent missing-address, network, no-pair and malformed-response states", () => {
  assert.equal(parseMarketPairs([], { ...target, address: null }, fetchedAt).reason, "no_address");
  assert.equal(parseMarketPairs([], { ...target, chain: "not-configured" }, fetchedAt).status, "unsupported");
  assert.equal(parseMarketPairs([], { ...target, address: "https://example.com/" }, fetchedAt).reason, "invalid_address");
  assert.equal(parseMarketPairs([], target, fetchedAt).reason, "no_matching_pair");
  assert.equal(parseMarketPairs({ pairs: [] }, target, fetchedAt).reason, "invalid_response");
  assert.equal(parseMarketPairs(null, target, fetchedAt).priceUsd, null);
});

test("EVM address matching ignores case, while network mapping never guesses", () => {
  const evm = { ...target, chain: "ethereum", address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" };
  assert.equal(parseMarketPairs([pair({ chainId: "ethereum", baseToken: { address: evm.address.toUpperCase() } })], evm, fetchedAt).status, "available");
  assert.equal(providerChainFor("bsc"), "bsc");
  assert.equal(providerChainFor("avalanche"), "avalanche");
  assert.equal(providerChainFor(null), null);
  assert.equal(providerChainFor("__proto__"), null);
  assert.equal(providerChainFor("SOLANA"), null);
  assert.equal(validMarketAddress("solana", target.address), true);
  assert.equal(validMarketAddress("ethereum", evm.address), true);
  assert.equal(validMarketAddress("ethereum", "0x1234"), false);
  const suiAddress = "0x" + "Ab".repeat(32);
  assert.equal(validMarketAddress("sui", suiAddress), true);
  assert.equal(marketTargetKey({ ...target, chain: "sui", address: suiAddress }), marketTargetKey({ ...target, chain: "sui", address: suiAddress.toLowerCase() }));
  assert.equal(marketTargetKey({ ...target, chain: "ethereum" }), null);
});

test("provider page links stay HTTPS, on the expected chain and on DEX Screener", () => {
  assert.equal(marketPairUrl("https://dexscreener.com/solana/mixedcasepair", "solana", "MixedCasePair"), "https://dexscreener.com/solana/mixedcasepair");
  for (const url of ["http://dexscreener.com/solana/mixedcasepair", "https://dexscreener.com.evil.test/solana/mixedcasepair", "https://user@dexscreener.com/solana/mixedcasepair", "https://dexscreener.com/ethereum/mixedcasepair", "https://dexscreener.com/solana/other", "javascript:alert(1)"]) assert.equal(marketPairUrl(url, "solana", "MixedCasePair"), null);
});

test("the slug-only API contract rejects arbitrary addresses, URLs and oversized batches", () => {
  assert.deepEqual(parseQuoteSlugs("spyx,nvdax,spyx"), { slugs: ["spyx", "nvdax"], error: null });
  for (const value of [null, "", "spyx,", "https://example.com/", target.address, Array.from({ length: 25 }, (_, index) => `asset-${index}`).join(",")]) assert.notEqual(parseQuoteSlugs(value).error, null, String(value));
  assert.equal(parseQuoteSlugs(Array.from({ length: 24 }, (_, index) => `asset-${index}`).join(",")).slugs.length, 24);
});

test("cache and stale boundaries are exact and reject future clock values", () => {
  const time = Date.parse(fetchedAt);
  assert.equal(cacheTimeFresh(time, time + MARKET_CACHE_MS - 1), true);
  assert.equal(cacheTimeFresh(time, time + MARKET_CACHE_MS), false);
  assert.equal(cacheTimeFresh(time, time - 1), false);
  assert.equal(cacheTimeFresh(NaN, time), false);
  assert.equal(marketReferenceStale(fetchedAt, time + MARKET_STALE_MS - 1), false);
  assert.equal(marketReferenceStale(fetchedAt, time + MARKET_STALE_MS), true);
  assert.equal(marketReferenceStale(null, time), true);
});

test("cache deduplicates overlapping in-flight identities and expires at 30 seconds", async () => {
  let now = 0;
  const cache = createMarketCache(MARKET_CACHE_MS, () => now);
  const calls = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const load = async (keys) => { calls.push(keys); await gate; return new Map(keys.map((key) => [key, `${key}-value`])); };
  const first = cache.getMany(["a", "b"], load);
  const second = cache.getMany(["b", "c"], load);
  await Promise.resolve();
  assert.deepEqual(calls, [["a", "b"], ["c"]]);
  now = 5000;
  release();
  assert.deepEqual(await first, ["a-value", "b-value"]);
  assert.deepEqual(await second, ["b-value", "c-value"]);
  now += MARKET_CACHE_MS - 1;
  await cache.getMany(["a", "b"], load);
  assert.equal(calls.length, 2);
  now++;
  await cache.getMany(["a"], load);
  assert.deepEqual(calls.at(-1), ["a"]);
});

test("a rejected loader releases its reservation and does not cache a rejection", async () => {
  const cache = createMarketCache();
  await assert.rejects(cache.getMany(["a"], async () => { throw new Error("failed"); }));
  assert.deepEqual(await cache.getMany(["a"], async () => new Map([["a", 2]])), [2]);
});

test("provider concurrency stays capped at four and releases failed slots", async () => {
  const run = createConcurrencyLimit(4);
  let active = 0, maximum = 0;
  const work = Array.from({ length: 15 }, (_, index) => run(async () => {
    active++;
    maximum = Math.max(maximum, active);
    try { await new Promise((resolve) => setTimeout(resolve, 2)); if (index === 3) throw new Error("failed"); return index; }
    finally { active--; }
  }));
  await Promise.allSettled(work);
  assert.equal(maximum, 4);
  assert.equal(active, 0);
  assert.equal(await run(async () => "next"), "next");
});
