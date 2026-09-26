import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueExplorer } from "@/components/CatalogueExplorer";
import { readCatalogueFilters, searchParamsFromRecord } from "@/lib/catalogue-filters";
import { archiveAssets, archiveCategories, archiveIssuers, archiveNetworks, catalogue, networkLabel, sourceGroups } from "@/lib/catalogue";
import { assetMediaUrl } from "@/lib/catalogue-media";

export const metadata: Metadata = {
  title: "Explore assets",
  description: "Explore the complete 1,936-record asset catalogue, with issuer, network, source and historical market data filters.",
};

export default async function AssetsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initialFilters = readCatalogueFilters(searchParamsFromRecord(params), { categories: archiveCategories.map((item) => item.id), networks: archiveNetworks, issuers: archiveIssuers.map((item) => item.name), sources: sourceGroups.map((item) => item.id) });
  const rows = archiveAssets.map((asset) => ({ slug: asset.slug, name: asset.name, symbol: asset.symbol, issuer: asset.issuer, category: asset.category, chain: asset.chain, chains: asset.chains, priceUsd: asset.priceUsd, perOz: asset.perOz, priceSource: asset.priceSource, liquidityUsd: asset.liquidityUsd, routes: asset.routes, hasProbe: Boolean(asset.probe), stamp: asset.stamp.state, image: assetMediaUrl(asset) }));

  return (
    <div className="container assets-page">
      <div className="page-intro">
        <p className="eyebrow">Asset discovery</p>
        <h1>Find your real-world side.</h1>
        <p>The complete asset directory: stocks, funds, metals, property, credit and more. Start with Solana, or explore every recorded network.</p>
      </div>
      <div className="catalogue-meta"><span>{catalogue.stats.assets.toLocaleString("en-US")} assets</span><Link href="/issuers/">{catalogue.stats.issuers} issuers</Link><Link href="/markets/">{catalogue.stats.networks} networks</Link><Link href="/sources/">Data sources</Link><Link href="/stats/">Coverage</Link></div>
      <CatalogueExplorer key={JSON.stringify(initialFilters)} rows={rows} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} issuers={archiveIssuers.map((item) => item.name)} sources={sourceGroups.map((item) => ({ id: item.id, label: item.label }))} snapshotLabel="23 Sep 2026, 13:00 UTC" initialFilters={initialFilters} />
    </div>
  );
}
