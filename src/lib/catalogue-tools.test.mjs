import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addBasketAssets, basketToDraft, createBasketDraft, decodeBasket, equalBasketWeights, evaluateBasket, exactProbe, filterToolAssets, OUNCE_GRAMS, percentToBps, positiveAmount, prepareBasket, recordedSampleUnits, safeMarketUrl, sampleWithoutReplacement, snapshotUnits, toToolAsset, toolPrice, unitPrice } from "./catalogue-tools.ts";

const known = new Set(["a", "b", "c", "usdy", "spyx", "nvdax"]);
const assetExists = (slug) => known.has(slug);
const asset = (changes = {}) => ({ slug: "a", name: "Example company", symbol: "EX", issuer: "Issuer A", category: "equity", priceUsd: 10, priceSource: "issuer NAV", chain: "ethereum", chains: ["ethereum", "solana"], quote: "USDC", dex: null, unit: "token", unitLabel: "tokens", perOz: false, pairUrl: null, curve: [], probeAt: null, probeEngine: null, measured: false, ...changes });
const observedAt = "2026-09-23T12:00:00Z";

test("USD inputs and percentages reject invalid states rather than clamp or normalize", () => {
  for (const value of ["", "NaN", "Infinity", "-1", "0", "1e2", "50,000", "50000001", "1.001"]) assert.equal(positiveAmount(value, 50_000_000, 2), null, value);
  assert.equal(positiveAmount(".01", 50_000_000, 2), .01);
  assert.equal(positiveAmount("50000000.00", 50_000_000, 2), 50_000_000);
  assert.equal(percentToBps("33.34"), 3334);
  assert.equal(percentToBps(".25"), 25);
  assert.equal(percentToBps("0"), 0);
  for (const value of ["", "-1", "100.01", "33.333", "NaN", "1e2"]) assert.equal(percentToBps(value), null, value);
  const draft = createBasketDraft(["a", "b"]);
  assert.equal(evaluateBasket({ ...draft, weights: { a: "40", b: "40" } }).totalBps, 8000);
  assert.equal(evaluateBasket({ ...draft, weights: { a: "70", b: "70" } }).valid, false);
  assert.equal(evaluateBasket({ ...draft, weights: { a: "", b: "100" } }).totalBps, null);
});

test("equal weights add to exactly 100% for three and 1,936 assets", () => {
  assert.deepEqual(equalBasketWeights(["a", "b", "c", "a"]), { a: "33.34", b: "33.33", c: "33.33" });
  const slugs = Array.from({ length: 1936 }, (_, index) => `asset-${index}`);
  const weights = equalBasketWeights(slugs);
  assert.equal(Object.keys(weights).length, 1936);
  assert.equal(Object.values(weights).reduce((sum, value) => sum + percentToBps(value), 0), 10000);
  assert.equal(evaluateBasket(createBasketDraft([])).valid, false);
});

test("adding an existing asset preserves manual weights; new assets rebalance explicitly and retain the budget", () => {
  const original = { ...createBasketDraft(["a", "b"]), budget: "725.50", name: "Personal plan", weights: { a: "70", b: "30" } };
  assert.equal(addBasketAssets(original, ["b", "a"]), original);
  const added = addBasketAssets(original, ["c", "c"]);
  assert.deepEqual(added.slugs, ["a", "b", "c"]);
  assert.equal(added.budget, "725.50");
  assert.equal(added.name, "Personal plan");
  assert.deepEqual(added.weights, { a: "33.34", b: "33.33", c: "33.33" });
});

test("local basket schema round-trips and rejects corrupt, unknown or inconsistent records", () => {
  const draft = { ...createBasketDraft(["a", "b"]), budget: "725.50", weights: { a: "75", b: "25" } };
  const saved = prepareBasket(draft, assetExists, observedAt);
  assert.ok(saved);
  assert.equal(saved.budgetUsd, 725.5);
  assert.deepEqual(saved.items, [{ slug: "a", weightBps: 7500 }, { slug: "b", weightBps: 2500 }]);
  assert.deepEqual(decodeBasket(JSON.stringify(saved), assetExists), saved);
  assert.deepEqual(basketToDraft(saved).weights, draft.weights);
  for (const changed of [
    { ...saved, version: 2 },
    { ...saved, budgetUsd: -1 },
    { ...saved, budgetUsd: 0 },
    { ...saved, budgetUsd: 1.001 },
    { ...saved, savedAt: "yesterday" },
    { ...saved, items: [{ slug: "unknown", weightBps: 10000 }] },
    { ...saved, items: [{ slug: "a", weightBps: 5000 }, { slug: "a", weightBps: 5000 }] },
    { ...saved, items: [{ slug: "a", weightBps: 5000 }] },
    { ...saved, items: [{ slug: "a", weightBps: 10000.5 }] },
    { ...saved, items: [] },
  ]) assert.equal(decodeBasket(JSON.stringify(changed), assetExists), null);
  assert.equal(decodeBasket("not json", assetExists), null);
  assert.equal(prepareBasket({ ...draft, weights: { a: "70", b: "20" } }, assetExists), null);
  assert.equal(prepareBasket(createBasketDraft(["unknown"]), assetExists), null);
});

test("unknown prices stay unknown and ounce-priced records use the original gram equivalent", () => {
  for (const priceUsd of [null, 0, -1, NaN, Infinity]) {
    assert.equal(unitPrice(asset({ priceUsd })), null);
    assert.equal(snapshotUnits(asset({ priceUsd }), 100), null);
  }
  assert.equal(snapshotUnits(asset(), 100), 10);
  assert.equal(snapshotUnits(asset(), -1), null);
  assert.equal(unitPrice(asset({ perOz: true, priceUsd: OUNCE_GRAMS * 100 })), 100);
  assert.equal(snapshotUnits(asset({ perOz: true, priceUsd: OUNCE_GRAMS * 100 }), 1000), 10);
  assert.notEqual(toolPrice(.000001), "$0.00");
});

test("recorded mode uses only exact dated measured rungs, never interpolation or unfilled outputs", () => {
  const measured = asset({ measured: true, probeAt: observedAt, curve: [
    { sizeUsd: 100, impact: .02, filled: true },
    { sizeUsd: 1000, impact: .2, filled: true },
    { sizeUsd: 10000, impact: null, filled: false },
  ] });
  assert.equal(exactProbe(measured, 100)?.impact, .02);
  assert.equal(recordedSampleUnits(measured, 100), 100 / (10 * 1.02));
  for (const size of [50, 150, 999, 1001, 10000, 100000, 0, NaN]) assert.equal(recordedSampleUnits(measured, size), null, String(size));
  assert.equal(exactProbe({ ...measured, measured: false }, 100), null);
  assert.equal(exactProbe({ ...measured, probeAt: null }, 100), null);
  assert.equal(recordedSampleUnits({ ...measured, priceUsd: null }, 100), null);
  assert.equal(recordedSampleUnits({ ...measured, curve: [{ sizeUsd: 100, impact: -1, filled: true }] }, 100), null);
});

test("network filters use supported deployments without changing the observed price network", () => {
  const usdy = asset({ slug: "usdy", name: "US Dollar Yield", category: "treasuries" });
  const other = asset({ slug: "b", name: "Another asset", chain: "base", chains: ["base"], priceUsd: null });
  const results = filterToolAssets([usdy, other], "", "treasuries", "solana");
  assert.deepEqual(results, [usdy]);
  assert.equal(results[0].chain, "ethereum");
  assert.deepEqual(filterToolAssets([usdy, other], "issuer a", "", "", true), [usdy]);
  assert.deepEqual(filterToolAssets([usdy, other], "does not exist"), []);
});

test("draws have no duplicate assets, stay inside the selected pool and reject invalid sizes", () => {
  const pool = ["a", "b", "c", "d"];
  assert.deepEqual(sampleWithoutReplacement(pool, 3, () => 0), ["a", "b", "c"]);
  assert.deepEqual(sampleWithoutReplacement(pool, 4, () => .999), ["d", "a", "b", "c"]);
  assert.deepEqual(pool, ["a", "b", "c", "d"]);
  for (const count of [0, -1, 1.2, 5, NaN]) assert.deepEqual(sampleWithoutReplacement(pool, count), []);
  assert.throws(() => sampleWithoutReplacement(pool, 1, () => 1));
  assert.throws(() => sampleWithoutReplacement(pool, 1, () => NaN));
});

test("archive projection retains actual dated sample and price-chain fields", () => {
  const catalogue = JSON.parse(readFileSync(new URL("../data/catalogue.json", import.meta.url), "utf8"));
  assert.equal(catalogue.assets.length, 1936);
  const usdy = toToolAsset(catalogue.assets.find((item) => item.slug === "usdy"));
  assert.equal(usdy.chain, "ethereum");
  assert.ok(usdy.chains.includes("solana"));
  const all = catalogue.assets.map(toToolAsset);
  assert.equal(all.filter((item) => item.measured && item.probeAt).length, 80);
  for (const item of all.filter((entry) => entry.measured && entry.probeAt)) {
    const point = item.curve.find((entry) => entry.filled && entry.impact !== null);
    if (point) assert.equal(exactProbe(item, point.sizeUsd), point);
  }
  const missing = all.find((item) => item.priceUsd === null);
  assert.ok(missing);
  assert.equal(snapshotUnits(missing, 1000), null);
});

test("source links allow the saved market hosts but reject executable or arbitrary URL schemes", () => {
  assert.equal(safeMarketUrl("https://dexscreener.com/solana/example"), "https://dexscreener.com/solana/example");
  assert.equal(safeMarketUrl("https://jup.ag/tokens/example"), "https://jup.ag/tokens/example");
  for (const value of [null, "javascript:alert(1)", "https://dexscreener.com.evil.test/", "http://dexscreener.com/", "https://grailassets.com/"]) assert.equal(safeMarketUrl(value), null);
});
