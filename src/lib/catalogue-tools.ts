import type { ArchivedAsset, ArchivedCurvePoint } from "./catalogue";

export const BASKET_STORAGE_KEY = "ground:basket:v1";
export const TOOL_STORAGE_EVENT = "ground-catalogue-storage";
export const MAX_TOOL_BUDGET = 50_000_000;
export const OUNCE_GRAMS = 31.1034768;

export type ToolAsset = Pick<ArchivedAsset, "slug" | "name" | "symbol" | "issuer" | "category" | "priceUsd" | "priceSource" | "chain" | "chains" | "quote" | "dex" | "unit" | "unitLabel" | "perOz" | "pairUrl"> & {
  curve: ArchivedCurvePoint[];
  probeAt: string | null;
  probeEngine: string | null;
  measured: boolean;
};
export interface ToolCategory { id: string; label: string; count: number }
export interface CatalogueToolProps { assets: ToolAsset[]; categories: ToolCategory[]; networks: { id: string; label: string }[]; snapshotAt: string }

/** Project only tool fields at the server boundary; do not ship issuer descriptions or addresses. */
export function toToolAsset(asset: ArchivedAsset): ToolAsset {
  return { slug: asset.slug, name: asset.name, symbol: asset.symbol, issuer: asset.issuer, category: asset.category, priceUsd: asset.priceUsd, priceSource: asset.priceSource, chain: asset.chain, chains: asset.chains, quote: asset.quote, dex: asset.dex, unit: asset.unit, unitLabel: asset.unitLabel, perOz: asset.perOz, pairUrl: asset.pairUrl, curve: asset.curve ?? [], probeAt: asset.probe?.probedAt ?? null, probeEngine: asset.probe?.engine ?? null, measured: asset.stamp.method === "probe" };
}

export function positiveAmount(value: string, maximum = MAX_TOOL_BUDGET, decimals = 8): number | null {
  if (!new RegExp(`^(?:\\d+(?:\\.\\d{0,${decimals}})?|\\.\\d{1,${decimals}})$`).test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= maximum ? amount : null;
}
export function percentToBps(value: string): number | null {
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  const bps = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isInteger(bps) && bps >= 0 && bps <= 10000 ? bps : null;
}
export function bpsToPercent(bps: number): string { return String(bps / 100); }
export function equalBasketWeights(slugs: string[]): Record<string, string> {
  const ids = [...new Set(slugs)];
  if (!ids.length) return {};
  const base = Math.floor(10000 / ids.length), remainder = 10000 % ids.length;
  return Object.fromEntries(ids.map((slug, index) => [slug, bpsToPercent(base + (index < remainder ? 1 : 0))]));
}
export interface BasketDraft { name: string; budget: string; slugs: string[]; weights: Record<string, string> }
export interface SavedBasket { version: 1; name: string; budgetUsd: number; items: { slug: string; weightBps: number }[]; savedAt: string }
export function createBasketDraft(slugs: string[] = ["spyx", "nvdax", "usdy"]): BasketDraft {
  const ids = [...new Set(slugs)];
  return { name: "My basket", budget: "1000", slugs: ids, weights: equalBasketWeights(ids) };
}
export function evaluateBasket(draft: BasketDraft) {
  const budget = positiveAmount(draft.budget, MAX_TOOL_BUDGET, 2);
  const weights = Object.fromEntries(draft.slugs.map((slug) => [slug, percentToBps(draft.weights[slug] ?? "")])) as Record<string, number | null>;
  const totalBps = draft.slugs.every((slug) => weights[slug] !== null) ? draft.slugs.reduce((sum, slug) => sum + weights[slug]!, 0) : null;
  return { budget, weights, totalBps, valid: budget !== null && draft.slugs.length > 0 && totalBps === 10000 };
}
export function addBasketAssets(draft: BasketDraft, additions: string[]): BasketDraft {
  const slugs = [...new Set([...draft.slugs, ...additions])];
  return slugs.length === draft.slugs.length ? draft : { ...draft, slugs, weights: equalBasketWeights(slugs) };
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function decodeBasket(raw: string, assetExists: (slug: string) => boolean): SavedBasket | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!record(value) || value.version !== 1 || typeof value.name !== "string" || value.name.length > 80 || typeof value.budgetUsd !== "number" || positiveAmount(String(value.budgetUsd), MAX_TOOL_BUDGET, 2) === null || typeof value.savedAt !== "string" || !Number.isFinite(Date.parse(value.savedAt)) || !Array.isArray(value.items) || value.items.length === 0 || value.items.length > 2000) return null;
  const items: SavedBasket["items"] = [], seen = new Set<string>();
  for (const item of value.items) {
    if (!record(item) || typeof item.slug !== "string" || !assetExists(item.slug) || seen.has(item.slug) || typeof item.weightBps !== "number" || !Number.isInteger(item.weightBps) || item.weightBps < 0 || item.weightBps > 10000) return null;
    seen.add(item.slug); items.push({ slug: item.slug, weightBps: item.weightBps });
  }
  if (items.reduce((sum, item) => sum + item.weightBps, 0) !== 10000) return null;
  return { version: 1, name: value.name, budgetUsd: value.budgetUsd, savedAt: value.savedAt, items };
}
export function basketToDraft(saved: SavedBasket): BasketDraft { return { name: saved.name, budget: String(saved.budgetUsd), slugs: saved.items.map((item) => item.slug), weights: Object.fromEntries(saved.items.map((item) => [item.slug, bpsToPercent(item.weightBps)])) }; }
export function prepareBasket(draft: BasketDraft, assetExists: (slug: string) => boolean, savedAt = new Date().toISOString()): SavedBasket | null {
  const result = evaluateBasket(draft);
  if (!result.valid) return null;
  return decodeBasket(JSON.stringify({ version: 1, name: draft.name.trim() || "My basket", budgetUsd: result.budget, items: draft.slugs.map((slug) => ({ slug, weightBps: result.weights[slug] })), savedAt }), assetExists);
}

export function unitPrice(asset: Pick<ToolAsset, "priceUsd" | "perOz">): number | null {
  const price = asset.priceUsd;
  return price !== null && Number.isFinite(price) && price > 0 ? price / (asset.perOz ? OUNCE_GRAMS : 1) : null;
}
export function snapshotUnits(asset: Pick<ToolAsset, "priceUsd" | "perOz">, amountUsd: number): number | null {
  const price = unitPrice(asset);
  return price === null || !Number.isFinite(amountUsd) || amountUsd < 0 ? null : amountUsd / price;
}
export function exactProbe(asset: Pick<ToolAsset, "curve" | "measured" | "probeAt">, sizeUsd: number): ArchivedCurvePoint | null {
  if (!asset.measured || !asset.probeAt || !Number.isFinite(sizeUsd) || sizeUsd <= 0) return null;
  return asset.curve.find((point) => point.sizeUsd === sizeUsd) ?? null;
}
export function recordedSampleUnits(asset: ToolAsset, sizeUsd: number): number | null {
  const sample = exactProbe(asset, sizeUsd), price = unitPrice(asset);
  return sample?.filled && sample.impact !== null && Number.isFinite(sample.impact) && sample.impact > -1 && price !== null ? sizeUsd / (price * (1 + sample.impact)) : null;
}
export function filterToolAssets(assets: ToolAsset[], query = "", category = "", network = "", pricedOnly = false) {
  const q = query.trim().toLowerCase();
  return assets.filter((asset) => (!category || asset.category === category) && (!network || asset.chains.includes(network) || asset.chain === network) && (!pricedOnly || unitPrice(asset) !== null) && (!q || [asset.name, asset.symbol, asset.slug, asset.issuer].some((value) => value.toLowerCase().includes(q))));
}
export function sampleWithoutReplacement<T>(pool: T[], count: number, random: () => number = Math.random): T[] {
  if (!Number.isInteger(count) || count < 1 || count > pool.length) return [];
  const copy = [...pool];
  for (let index = 0; index < count; index++) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Random source must return a value between 0 and 1");
    const chosen = index + Math.floor(value * (copy.length - index));
    [copy[index], copy[chosen]] = [copy[chosen], copy[index]];
  }
  return copy.slice(0, count);
}

const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 2 });
const quantityFormatter = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 7 });
export function toolMoney(value: number | null) { return value === null || !Number.isFinite(value) ? "—" : moneyFormatter.format(value); }
export function toolPrice(value: number | null) { return value === null || !Number.isFinite(value) ? "—" : value >= 1 ? moneyFormatter.format(value) : `$${quantityFormatter.format(value)}`; }
export function toolQuantity(value: number | null) { return value === null || !Number.isFinite(value) ? "—" : quantityFormatter.format(value); }
export function toolDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}
export function safeMarketUrl(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" && ["dexscreener.com", "www.dexscreener.com", "jup.ag", "realt.co"].includes(url.hostname) ? url.href : null; } catch { return null; }
}
