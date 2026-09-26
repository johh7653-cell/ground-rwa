#!/usr/bin/env node
// Read-only checks against a running local server. No wallet, order or storage writes.
// Usage: node scripts/verify-catalogue-api.mjs [http://127.0.0.1:4345]
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const base = (process.argv[2] ?? process.env.GROUND_API_BASE_URL ?? "http://127.0.0.1:4345").replace(/\/$/, "");
const local = JSON.parse(readFileSync(new URL("../src/data/catalogue.json", import.meta.url), "utf8"));
let requests = 0;

function equal(actual, expected, label) {
  assert.ok(isDeepStrictEqual(actual, expected), label);
}
async function get(path, expectedStatus = 200) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20_000), redirect: "error" });
  requests++;
  assert.equal(response.status, expectedStatus, `${path}: HTTP status`);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/, `${path}: JSON content type`);
  return { response, body: await response.json() };
}
async function batch(items, callback, size = 4) {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...await Promise.all(items.slice(index, index + size).map(callback)));
  }
  return results;
}
function pathFor(params) { return `/api/assets?${new URLSearchParams(params)}`; }
async function filtered(params, expected, label) {
  const { body } = await get(pathFor({ ...params, limit: "100" }));
  assert.equal(body.mode, "archive", `${label}: archive mode`);
  assert.equal(body.snapshotAt, local.snapshotAt, `${label}: snapshot date`);
  assert.equal(body.total, expected.length, `${label}: total count`);
  equal(body.assets, expected.slice(0, 100), `${label}: exact saved records and order`);
  return body;
}

try {
  const { body: remote, response } = await get("/api/catalogue");
  assert.equal(remote.assets.length, 1936, "catalogue: 1,936 assets");
  assert.equal(remote.issuers.length, 50, "catalogue: 50 issuers");
  assert.equal(remote.categories.length, 16, "catalogue: 16 categories");
  assert.equal(remote.networks.length, 16, "catalogue: 16 networks");
  assert.equal(new Set(remote.assets.map((asset) => asset.slug)).size, remote.assets.length, "catalogue: unique slugs");
  assert.ok(remote.assets.every((asset) => typeof asset.slug === "string" && asset.slug.length), "catalogue: nonempty slugs");
  equal(remote, local, "catalogue: every field deeply equals the local archive, including nulls, prices and probes");
  assert.match(response.headers.get("cache-control") ?? "", /public.*max-age=3600/, "catalogue: cache header");

  const { body: downloaded, response: downloadResponse } = await get("/api/catalogue?download=1");
  assert.equal(downloadResponse.headers.get("content-disposition"), "attachment; filename=ground-catalogue-2026-09-23.json", "catalogue: download disposition");
  equal(downloaded, local, "catalogue: download does not change data");

  // Fetch every record through pagination; an omitted or duplicated page must fail.
  const offsets = Array.from({ length: Math.ceil(local.assets.length / 100) }, (_, index) => index * 100);
  const pages = await batch(offsets, async (offset) => {
    const { body } = await get(pathFor({ limit: "100", offset: String(offset) }));
    assert.equal(body.total, 1936, `page ${offset}: total`);
    assert.equal(body.limit, 100, `page ${offset}: limit`);
    assert.equal(body.offset, offset, `page ${offset}: offset`);
    assert.equal(body.mode, "archive", `page ${offset}: archive mode`);
    assert.equal(body.snapshotAt, local.snapshotAt, `page ${offset}: date`);
    equal(body.assets, local.assets.slice(offset, offset + 100), `page ${offset}: original records and order`);
    return body.assets;
  });
  equal(pages.flat(), local.assets, "asset pagination: all 1,936 records are available exactly once");

  const { body: defaultPage } = await get("/api/assets");
  assert.equal(defaultPage.limit, 24, "asset pagination: default page size");
  assert.equal(defaultPage.offset, 0, "asset pagination: default offset");
  equal(defaultPage.assets, local.assets.slice(0, 24), "asset pagination: default records");
  const { body: boundaryPage } = await get(pathFor({ limit: "1", offset: "1935" }));
  equal(boundaryPage.assets, local.assets.slice(-1), "asset pagination: last record");
  const { body: emptyPage } = await get(pathFor({ limit: "100", offset: "1936" }));
  equal(emptyPage.assets, [], "asset pagination: exhausted page is empty");
  assert.equal(emptyPage.total, 1936, "asset pagination: exhausted page retains total");

  const solana = local.assets.filter((asset) => asset.chain === "solana");
  const unknown = local.assets.filter((asset) => asset.priceSource === null);
  const realtPrices = local.assets.filter((asset) => asset.priceSource === "issuer price");
  const realtIssuer = local.assets.filter((asset) => asset.issuer === "RealT");
  assert.equal(solana.length, 1042, "Solana observed-price network: 1,042");
  assert.equal(unknown.length, 928, "unknown price source: 928");
  assert.equal(realtPrices.length, 805, "RealT issuer-price records: 805");
  assert.equal(realtIssuer.length, 806, "RealT issuer records: 805 products plus the RealT Holdings entry");
  await Promise.all([
    filtered({ network: "solana" }, solana, "Solana primary observation filter"),
    filtered({ source: "unknown" }, unknown, "unknown price source filter"),
    filtered({ source: "issuer price" }, realtPrices, "issuer-price filter"),
    filtered({ issuer: "RealT" }, realtIssuer, "RealT issuer filter"),
  ]);
  await batch(local.categories, (category) => filtered({ category: category.id }, local.assets.filter((asset) => asset.category === category.id), `category ${category.id}`));
  await filtered({ q: "usdy" }, local.assets.filter((asset) => [asset.name, asset.symbol, asset.issuer, asset.slug].some((value) => value.toLowerCase().includes("usdy"))), "search filter");
  await filtered({ network: "solana", source: "unknown" }, local.assets.filter((asset) => asset.chain === "solana" && asset.priceSource === null), "combined filters");

  // Detail endpoint samples cover every category, plus metal, RealT, last and USDY records.
  const slugs = [...new Set([
    ...local.categories.map((category) => local.assets.find((asset) => asset.category === category.id)?.slug),
    ...local.assets.filter((asset) => asset.perOz).slice(0, 3).map((asset) => asset.slug),
    local.assets[0]?.slug, local.assets.at(-1)?.slug,
    realtPrices[0]?.slug, realtIssuer[0]?.slug,
    "usdy", "spyx", "nvdax",
  ].filter(Boolean))];
  await batch(slugs, async (slug) => {
    const expected = local.assets.find((asset) => asset.slug === slug);
    const { body } = await get(`/api/assets/${encodeURIComponent(slug)}`);
    assert.equal(body.mode, "archive", `${slug}: detail mode`);
    assert.equal(body.snapshotAt, local.snapshotAt, `${slug}: detail snapshot date`);
    equal(body.asset, expected, `${slug}: detail record keeps every saved field`);
    if (slug === "usdy") {
      assert.equal(body.asset.chain, "ethereum", "USDY: observed quote remains Ethereum");
      assert.ok(body.asset.chains.includes("solana"), "USDY: supported Solana deployment is separately retained");
    }
  });

  const invalidQueries = [
    { limit: "0" }, { limit: "101" }, { limit: "-1" }, { limit: "1.5" }, { limit: "NaN" }, { limit: "" },
    { offset: "-1" }, { offset: "1.5" }, { offset: "NaN" }, { offset: "9007199254740992" },
  ];
  await batch(invalidQueries, async (params) => {
    const { body } = await get(pathFor(params), 400);
    assert.equal(typeof body.error, "string", "invalid pagination: explanatory JSON error");
  });
  const { body: notFound } = await get("/api/assets/ground-api-test-not-a-real-asset", 404);
  assert.equal(notFound.error, "Asset not found", "unknown slug: 404 JSON error");

  const [{ body: issuers }, { body: sources }] = await Promise.all([get("/api/issuers"), get("/api/sources")]);
  assert.equal(issuers.snapshotAt, local.snapshotAt, "issuers: snapshot date");
  assert.equal(issuers.mode, "archive", "issuers: archive mode");
  equal(issuers.issuers, local.issuers, "issuers: all 50 exact saved records");
  for (const issuer of issuers.issuers) assert.equal(issuer.count, local.assets.filter((asset) => asset.issuer === issuer.name).length, `${issuer.name}: issuer count matches assets`);
  assert.equal(issuers.issuers.reduce((sum, issuer) => sum + issuer.count, 0), 1936, "issuer counts cover the whole archive");
  assert.equal(sources.snapshotAt, local.snapshotAt, "sources: snapshot date");
  assert.equal(sources.mode, "archive", "sources: archive mode");
  const sourceCounts = {};
  for (const asset of local.assets) { const id = asset.priceSource ?? "unknown"; sourceCounts[id] = (sourceCounts[id] ?? 0) + 1; }
  equal(Object.fromEntries(sources.sources.map((source) => [source.id, source.count])), sourceCounts, "sources: all source counts are derived from the saved records");
  assert.equal(sources.sources.reduce((sum, source) => sum + source.count, 0), 1936, "source counts cover the whole archive");
  console.log(`PASS · ${requests} read-only HTTP requests · catalogue 1,936 assets / 50 issuers / 16 categories / 16 networks`);
  console.log(`PASS · all asset pages match archive · ${slugs.length} detail samples · Solana 1,042 / unknown 928 / RealT prices 805 (issuer entries 806)`);
  console.log("PASS · filters, invalid pagination 400, unknown slug 404, download headers, issuer/source counts, USDY Ethereum context");
} catch (error) {
  console.error(`FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
