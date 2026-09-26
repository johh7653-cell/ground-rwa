import test from "node:test";
import assert from "node:assert/strict";
import { defaultCatalogueFilters, readCatalogueFilters, serializeCatalogueFilters, searchParamsFromRecord } from "./catalogue-filters.ts";

const options = { categories: ["equities", "precious-metals"], networks: ["solana", "ethereum"], issuers: ["Backed Finance", "Centrifuge · Anemoy"], sources: ["dex pair", "issuer NAV", "unknown"] };

test("every shareable catalogue control round-trips, including encoded issuer/source names", () => {
  const filters = { q: "gold & silver", category: "precious-metals", network: "all", issuer: "Centrifuge · Anemoy", source: "issuer NAV", coverage: "priced", sort: "liquidity", view: "grid", page: 3 };
  assert.deepEqual(readCatalogueFilters(new URLSearchParams(serializeCatalogueFilters(filters)), options), filters);
});

test("default and watchlist views use explicit independent network defaults", () => {
  assert.deepEqual(readCatalogueFilters(new URLSearchParams(), options), defaultCatalogueFilters());
  assert.deepEqual(readCatalogueFilters(new URLSearchParams(), { ...options, defaultNetwork: "all" }), defaultCatalogueFilters("all"));
});

test("invalid enums and malformed page values fall back without hiding the catalogue", () => {
  for (const page of ["-1", "0", "1.5", "Infinity", "abc", "9007199254740992"]) {
    const result = readCatalogueFilters(new URLSearchParams(`category=bad&issuer=bad&network=bad&source=bad&coverage=bad&sort=bad&view=bad&page=${page}`), options);
    assert.deepEqual(result, defaultCatalogueFilters());
  }
});

test("legacy category aliases and repeated server parameters resolve consistently", () => {
  assert.equal(readCatalogueFilters(new URLSearchParams("category=gold"), options).category, "precious-metals");
  assert.equal(readCatalogueFilters(new URLSearchParams("category=companies"), options).category, "equities");
  assert.equal(searchParamsFromRecord({ q: ["Tesla", "Apple"], network: "all", absent: undefined }).get("q"), "Tesla");
});
