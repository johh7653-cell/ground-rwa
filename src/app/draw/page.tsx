import type { Metadata } from "next";
import { DrawTool } from "@/components/DrawTool";
import { archiveAssets, archiveCategories, archiveNetworks, catalogue, networkLabel } from "@/lib/catalogue";
import { toToolAsset } from "@/lib/catalogue-tools";

export const metadata: Metadata = { title: "Draw", description: "Explore a random selection of real catalogue assets, filtered by category and supported network." };
export default function DrawPage() {
  return <section className="container section"><div className="page-intro"><p className="hero-label">Draw · Asset discovery</p><h1>Let the catalogue surprise you.</h1><p>Filter the pool, draw distinct assets and take your selection into a basket.</p></div><DrawTool assets={archiveAssets.map(toToolAsset)} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} snapshotAt={catalogue.snapshotAt} /></section>;
}
