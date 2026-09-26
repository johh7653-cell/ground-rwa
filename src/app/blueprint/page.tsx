import type { Metadata } from "next";
import { Blueprint } from "@/components/Blueprint";

export const metadata: Metadata = { title: "My blueprint", description: "Sketch a sample allocation across real-world asset categories. Planning only, with no live prices or trades." };

export default async function BlueprintPage({ searchParams }: { searchParams: Promise<{ asset?: string | string[] }> }) {
  const params = await searchParams;
  const initialAssetSlug = Array.isArray(params.asset) ? params.asset[0] : params.asset;
  return <section className="container section">
    <div className="page-intro"><p className="hero-label">My blueprint</p><h1>A blueprint, built by you.</h1><p>Set a sample budget. Shape your own allocation.</p></div>
    <Blueprint key={initialAssetSlug ?? "default"} initialAssetSlug={initialAssetSlug} />
  </section>;
}
