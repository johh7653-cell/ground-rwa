import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Coins, FileText, Globe2, Landmark, Layers3, Leaf, Package, Radio, Warehouse } from "lucide-react";
import { CatalogueFootnote, CataloguePageIntro, DirectoryMetrics, catalogueHref } from "@/components/CataloguePage";
import { archiveAssets, archiveCategories, archiveIssuers, archiveNetworks, networkLabel } from "@/lib/catalogue";
import { assetMediaUrl } from "@/lib/catalogue-media";
import styles from "@/components/CatalogueDirectory.module.css";

export const metadata: Metadata = { title: "Market directory", description: "Explore the complete archived real-world asset catalogue by category and network, with source coverage and dated market observations." };

const categoryDetails: Record<string, { description: string; icon: typeof Coins }> = {
  treasuries: { description: "Treasury-related funds, notes and tokenized exposure.", icon: Landmark },
  "money-markets": { description: "Money-market and cash-management product references.", icon: Coins },
  bonds: { description: "Government and corporate debt product references.", icon: FileText },
  equities: { description: "Company-linked tokens and equity tracker products.", icon: Building2 },
  etfs: { description: "Fund-linked exposure to broader markets and indices.", icon: Layers3 },
  "private-credit": { description: "Private lending products and credit-related instruments.", icon: BookOpen },
  "private-equity": { description: "Private-company and private-market fund references.", icon: Building2 },
  "real-estate": { description: "Property-linked products and real-estate interests.", icon: Warehouse },
  "precious-metals": { description: "Gold, silver and other precious-metal products.", icon: Coins },
  commodities: { description: "Commodity-linked tokens and product references.", icon: Package },
  carbon: { description: "Carbon-credit and environmental product references.", icon: Leaf },
  "art-collectibles": { description: "Art-linked interests and collectible product records.", icon: BookOpen },
  "trading-cards": { description: "Tokenized trading cards and collectible inventories.", icon: Layers3 },
  royalties: { description: "Music and other royalty-related product references.", icon: Radio },
  "trade-finance": { description: "Trade and receivable-related financing products.", icon: FileText },
  infrastructure: { description: "Network and infrastructure-related token references.", icon: Globe2 },
};

export default function MarketsPage() {
  const solanaRows = archiveAssets.filter((asset) => asset.chain === "solana").length;
  return <div className={`container ${styles.page}`}>
    <CataloguePageIntro active="/markets/" title="A wider view of real-world assets.">Explore the complete catalogue by what an asset represents and where its saved observation was recorded. Solana is the starting point; the wider archive remains available.</CataloguePageIntro>
    <DirectoryMetrics metrics={[{ label: "Archive listings", value: archiveAssets.length }, { label: "Asset categories", value: archiveCategories.length }, { label: "Issuers", value: archiveIssuers.length }, { label: "Solana observations", value: solanaRows, note: "Primary observation network" }]} />
    <div className={styles.sectionHeading}><h2>Explore by asset category.</h2><Link href={catalogueHref({ network: "solana" })}>Browse Solana assets <ArrowRight size={15} aria-hidden="true" /></Link></div>
    <div className={styles.categoryGrid}>{archiveCategories.map((category) => {
      const entries = archiveAssets.filter((asset) => asset.category === category.id);
      const priced = entries.filter((asset) => asset.priceUsd !== null && Number.isFinite(asset.priceUsd)).length;
      const solana = entries.filter((asset) => asset.chain === "solana").length;
      const details = categoryDetails[category.id] ?? { description: "Archived product and market references.", icon: Layers3 };
      const Icon = details.icon;
      const samples = [...entries].sort((left, right) => Number(right.priceUsd !== null) - Number(left.priceUsd !== null)).slice(0, 3);
      return <article className={styles.marketCard} key={category.id}>
        <div className={styles.cardTop}><Icon size={23} strokeWidth={1.6} aria-hidden="true" /><span>{entries.length.toLocaleString("en-US")} listings</span></div>
        <h3><Link href={catalogueHref({ category: category.id })}>{category.label}</Link></h3><p>{details.description}</p>
        <div className={styles.sampleProducts} aria-label={`Example ${category.label} listings`}>{samples.map((asset) => { const mediaUrl = assetMediaUrl(asset); return <Link href={`/assets/${asset.slug}/`} key={asset.slug}>{mediaUrl ? <Image src={mediaUrl} alt="" width={22} height={22} unoptimized /> : null}<span>{asset.symbol}</span></Link>; })}</div>
        <div className={styles.marketCounts}><span><strong>{priced.toLocaleString("en-US")}</strong>saved prices</span><span><strong>{solana.toLocaleString("en-US")}</strong>Solana rows</span></div>
        <div className={styles.cardLinks}><Link href={catalogueHref({ category: category.id })}>All assets <ArrowRight size={14} aria-hidden="true" /></Link>{solana > 0 ? <Link href={catalogueHref({ category: category.id, network: "solana" })}>On Solana</Link> : null}</div>
      </article>;
    })}</div>

    <section className={styles.section} aria-labelledby="network-directory">
      <div className={styles.sectionHeading}><h2 id="network-directory">Explore by network.</h2><p>{archiveNetworks.length} network labels in the archive</p></div>
      <p className={styles.explanation}>An observation belongs to the network saved with its price and market fields. A product may also list other supported networks. Their coverage counts can overlap; another network’s price is not substituted for a Solana quote.</p>
      <div className={styles.networkGrid}>{archiveNetworks.map((network) => {
        const observed = archiveAssets.filter((asset) => asset.chain === network).length;
        const coverage = archiveAssets.filter((asset) => asset.chain === network || asset.chains.includes(network)).length;
        return <article className={styles.networkCard} key={network}><h3>{networkLabel(network)}<Globe2 size={16} aria-hidden="true" /></h3><p><strong>{observed.toLocaleString("en-US")}</strong> observation rows</p><p><strong>{coverage.toLocaleString("en-US")}</strong> product coverage records</p><Link href={catalogueHref({ network })}>View observations <ArrowUpRight size={13} aria-hidden="true" /></Link></article>;
      })}</div>
    </section>
    <div className={styles.notice}><h2>The product matters as much as its category.</h2><p>A category can contain several legal structures. An equity tracker, fund token, physical-gold token or royalty interest can give its holder different rights. Asset details keep the issuer, backing description, source and historical market fields together.</p></div>
    <CatalogueFootnote />
  </div>;
}
