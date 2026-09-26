import type { Metadata } from "next";
import { SwapTool } from "@/components/SwapTool";
import { archiveAssets, archiveCategories, archiveNetworks, catalogue, networkLabel } from "@/lib/catalogue";
import { toToolAsset } from "@/lib/catalogue-tools";

export const metadata: Metadata = { title: "Compare assets", description: "Compare dated asset values and exact saved samples. This offline tool does not execute swaps." };
export default async function SwapPage({ searchParams }: { searchParams: Promise<{ asset?: string | string[] }> }) {
  const query = await searchParams;
  const initialAssetSlug = Array.isArray(query.asset) ? query.asset[0] : query.asset;
  return <section className="container section"><div className="page-intro"><p className="hero-label">Swap view · Offline comparison</p><h1>The same value, in another asset.</h1><p>Compare saved prices and measured sample sizes. Every figure retains its date and network context.</p></div><SwapTool key={initialAssetSlug ?? "default"} assets={archiveAssets.map(toToolAsset)} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} snapshotAt={catalogue.snapshotAt} initialAssetSlug={initialAssetSlug} /></section>;
}
