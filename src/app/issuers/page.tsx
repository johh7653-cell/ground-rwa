import type { Metadata } from "next";
import { CatalogueDirectory, type DirectoryIssuer } from "@/components/CatalogueDirectory";
import { CatalogueFootnote, CataloguePageIntro, DirectoryMetrics } from "@/components/CataloguePage";
import { archiveAssets, archiveCategories, archiveIssuers, networkLabel } from "@/lib/catalogue";
import { issuerMediaUrl } from "@/lib/catalogue-media";
import styles from "@/components/CatalogueDirectory.module.css";

export const metadata: Metadata = { title: "Issuer directory", description: "Search all issuers in the archived catalogue, explore their asset categories and network coverage, and open their official source sites." };

export default async function IssuersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const issuers: DirectoryIssuer[] = archiveIssuers.map((issuer) => {
    const entries = archiveAssets.filter((asset) => asset.issuer === issuer.name);
    const networks = new Set(entries.flatMap((asset) => [...asset.chains, ...(asset.chain ? [asset.chain] : [])]));
    return { ...issuer, mediaUrl: issuerMediaUrl(issuer.name), pricedCount: entries.filter((asset) => asset.priceUsd !== null && Number.isFinite(asset.priceUsd)).length, probeCount: entries.filter((asset) => asset.probe !== undefined).length, solanaCount: entries.filter((asset) => asset.chain === "solana").length, networkLabels: [...networks].map(networkLabel).sort() };
  });
  return <div className={`container ${styles.page}`}>
    <CataloguePageIntro active="/issuers/" title="Who stands behind each listing.">Every issuer from the archive, the products attributed to them and the source sites saved with their records. Search the full directory or narrow it by asset category.</CataloguePageIntro>
    <DirectoryMetrics metrics={[{ label: "Issuer records", value: issuers.length }, { label: "Archive listings", value: archiveAssets.length }, { label: "Issuers with saved prices", value: issuers.filter((issuer) => issuer.pricedCount > 0).length }, { label: "Issuers with Solana observations", value: issuers.filter((issuer) => issuer.solanaCount > 0).length }]} />
    <CatalogueDirectory key={initialQuery} issuers={issuers} categories={archiveCategories} initialQuery={initialQuery} />
    <CatalogueFootnote />
  </div>;
}
