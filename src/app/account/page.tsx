import type { Metadata } from "next";
import { AccountTool } from "@/components/AccountTool";
import { archiveAssets, archiveCategories, archiveNetworks, catalogue, networkLabel } from "@/lib/catalogue";
import { toToolAsset } from "@/lib/catalogue-tools";

export const metadata: Metadata = { title: "Local account", description: "Review, export and manage the baskets and Blueprints saved on this device." };
export default function AccountPage() {
  return <section className="container section"><div className="page-intro"><p className="hero-label">Account · On this device</p><h1>Your plans, kept here.</h1><p>Return to your saved basket and Blueprint. Export a copy or explicitly remove the local records.</p></div><AccountTool assets={archiveAssets.map(toToolAsset)} categories={archiveCategories} networks={archiveNetworks.map((id) => ({ id, label: networkLabel(id) }))} snapshotAt={catalogue.snapshotAt} /></section>;
}
