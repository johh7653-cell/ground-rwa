import type { Metadata } from "next";
import { CatalogueExplorer } from "@/components/CatalogueExplorer";
import { readCatalogueFilters, searchParamsFromRecord } from "@/lib/catalogue-filters";
import { archiveAssets, archiveCategories, archiveIssuers, archiveNetworks, networkLabel, sourceGroups } from "@/lib/catalogue";
import { assetMediaUrl } from "@/lib/catalogue-media";

export const metadata: Metadata = { title: "My watchlist", description: "Keep asset references for later research in a local watchlist. Filter your saved assets and return to their source information." };

export default async function WatchlistPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initialFilters = readCatalogueFilters(searchParamsFromRecord(params), { categories: archiveCategories.map((item) => item.id), networks: archiveNetworks, issuers: archiveIssuers.map((item) => item.name), sources: sourceGroups.map((item) => item.id), defaultNetwork: "all" });
  const rows = archiveAssets.map((asset) => ({ slug: asset.slug, name: asset.name, symbol: asset.symbol, issuer: asset.issuer, category: asset.category, chain: asset.chain, chains: asset.chains, priceUsd: asset.priceUsd, perOz: asset.perOz, priceSource: asset.priceSource, liquidityUsd: asset.liquidityUsd, routes: asset.routes, hasProbe: Boolean(asset.probe), stamp: asset.stamp.state, image: assetMediaUrl(asset) }));
  return <div className="container assets-page"><div className="page-intro"><p className="hero-label">My watchlist · On this device</p><h1>Keep a few assets in view.</h1><p>Save references from any part of the catalogue. Return to their issuer, source and archived market information when you want to look closer.</p></div><CatalogueExplorer key={JSON.stringify(initialFilters)} rows={rows} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} issuers={archiveIssuers.map((item) => item.name)} sources={sourceGroups.map((item) => ({ id: item.id, label: item.label }))} snapshotLabel="23 Sep 2026, 13:00 UTC" initialFilters={initialFilters} mode="watchlist" /></div>;
}
