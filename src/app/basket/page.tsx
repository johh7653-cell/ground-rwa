import type { Metadata } from "next";
import { BasketTool } from "@/components/BasketTool";
import { archiveAssets, archiveCategories, archiveNetworks, catalogue, networkLabel } from "@/lib/catalogue";
import { toToolAsset } from "@/lib/catalogue-tools";

export const metadata: Metadata = { title: "Basket", description: "Build and save a basket from the full asset catalogue using dated price observations." };
export default async function BasketPage({ searchParams }: { searchParams: Promise<{ asset?: string | string[]; budget?: string | string[] }> }) {
  const query = await searchParams;
  const initialAssetSlugs = (Array.isArray(query.asset) ? query.asset : query.asset ? [query.asset] : []).flatMap((value) => value.split(","));
  const initialBudget = Array.isArray(query.budget) ? query.budget[0] : query.budget;
  return <section className="container section"><div className="page-intro"><p className="hero-label">Basket · Local planner</p><h1>Several assets. Your own split.</h1><p>Search the full catalogue, choose weights and compare what your sample budget represents.</p></div><BasketTool key={`${initialAssetSlugs.join(",")}:${initialBudget ?? ""}`} assets={archiveAssets.map(toToolAsset)} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} snapshotAt={catalogue.snapshotAt} initialAssetSlugs={initialAssetSlugs} initialBudget={initialBudget} /></section>;
}
