import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Plus } from "lucide-react";
import { CategoryGlyph } from "@/components/AssetCard";
import { HistoricalCurve } from "@/components/HistoricalCurve";
import { ArchivedAssetDetail } from "@/components/ArchivedAssetDetail";
import { SavedMarketData } from "@/components/SavedMarketData";
import { LiveMarket } from "@/components/LiveMarket";
import { WatchlistButton } from "@/components/WatchlistButton";
import { getArchivedAsset } from "@/lib/catalogue";
import { assets, formatSnapshotTime, formatUsd, getAsset, getCategory } from "@/lib/assets";
import styles from "./AssetDetail.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return assets.map((asset) => ({ slug: asset.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const asset = getAsset(slug) ?? getArchivedAsset(slug);
  if (!asset) return { title: "Product not found" };
  return { title: `${asset.symbol} · Product reference`, description: "summary" in asset ? asset.summary : asset.desc };
}

export default async function AssetDetailPage({ params }: Props) {
  const { slug } = await params;
  const asset = getAsset(slug);
  const archivedAsset = getArchivedAsset(slug);
  if (!asset) {
    if (!archivedAsset) notFound();
    return <ArchivedAssetDetail asset={archivedAsset} />;
  }
  const category = getCategory(asset.categoryId);
  const hasSnapshot = asset.snapshotPrice !== null && asset.snapshotAt !== null;
  const facts = [
    { label: "What it tracks", content: asset.underlying },
    { label: "Product issuer", content: asset.issuer },
    { label: "Product structure", content: asset.structure },
    { label: "Holder rights", content: asset.rights },
    { label: "Backing and custody", content: asset.backing },
    { label: "Eligibility", content: asset.eligibility },
    { label: "Redemption", content: asset.redemption },
  ];

  return (
    <div className={`container ${styles.main}`}>
      <Link href="/assets/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Back to assets</Link>
      <div className={styles.hero}>
        <div className={styles.intro}>
          <div className={styles.category}><CategoryGlyph category={asset.categoryId} size={24} /><span>{category.name} <span aria-hidden="true">/</span> {asset.network}</span></div>
          <p className={styles.symbol}>{asset.symbol}</p>
          <h1>{asset.name}</h1>
          <p className={styles.summary}>{asset.summary}</p>
          <div className={styles.actions}>
            {archivedAsset?.chain === "solana" ? <Link href={`/trade/?asset=${asset.slug}`} className="button primary">Trade preview<ArrowUpRight size={16} aria-hidden="true" /></Link> : null}
            <Link href={`/blueprint/?asset=${asset.slug}`} className="button secondary"><Plus size={16} aria-hidden="true" />Add to blueprint</Link>
            <Link href={`/basket/?asset=${asset.slug}`} className="button secondary">Add to basket<Plus size={16} aria-hidden="true" /></Link>
            <a href={asset.officialUrl} target="_blank" rel="noopener noreferrer" className="button secondary">Issuer information<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
          <WatchlistButton slug={asset.slug} symbol={asset.symbol}/>
          <p className={styles.planningNote}>A planning reference. Adding it creates no trade or holding.</p>
        </div>

        <aside className={styles.pricePanel} aria-label="Price information">
          <p className={styles.status}><span aria-hidden="true" />{hasSnapshot ? "Saved snapshot" : "Research only"}</p>
          <h2>{hasSnapshot ? "Historical reference price" : "Product information only"}</h2>
          <p className={styles.price}>{hasSnapshot ? formatUsd(asset.snapshotPrice!) : "—"}</p>
          {hasSnapshot ? <>
            <p className={styles.timestamp}><time dateTime={asset.snapshotAt!}>{formatSnapshotTime(asset.snapshotAt!)}</time></p>
            <p className={styles.priceNote}>A saved catalogue observation, not a current price or executable quote. The capture time is shown; an individual price timestamp was not saved.</p>
          </> : <>
            <p className={styles.timestamp}>Solana quote unavailable</p>
            <p className={styles.priceNote}>No Solana price was saved for this product. A price from another network has not been substituted.</p>
          </>}
          <div className={styles.priceFooter}><span>Trading connection</span><strong>Not connected</strong></div>
        </aside>
      </div>

      {archivedAsset ? <LiveMarket slug={archivedAsset.slug} symbol={archivedAsset.symbol} chain={archivedAsset.chain} addressAvailable={archivedAsset.address!==null}/> : null}

      <div className={styles.informationGrid}>
        <section className={styles.productInformation} aria-labelledby="product-information">
          <p className={styles.eyebrow}>Know what you hold</p>
          <h2 id="product-information">Look behind the token.</h2>
          <dl className={styles.facts}>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.content}</dd></div>)}</dl>
        </section>

        <aside className={styles.sources} aria-labelledby="source-information">
          <BookOpen size={25} strokeWidth={1.5} aria-hidden="true" />
          <h2 id="source-information">Start at the source.</h2>
          <p>These summaries come from issuer information. They do not certify the product or establish a GROUND partnership.</p>
          <ul>
            <li><a href={asset.officialUrl} target="_blank" rel="noopener noreferrer">Product documents<ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a></li>
            <li><a href={asset.rightsSourceUrl} target="_blank" rel="noopener noreferrer">Structure and holder rights<ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a></li>
            <li><a href={asset.deploymentSourceUrl} target="_blank" rel="noopener noreferrer">Solana product identity<ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a></li>
          </ul>
          <p className={styles.sourceDate}>Sources checked <time dateTime={asset.sourceCheckedAt}>26 Sep 2026</time>. Terms can change.</p>
          <Link href="/approach/" className="text-link">How we organize the references<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </aside>
      </div>

      {archivedAsset ? <SavedMarketData asset={archivedAsset} /> : null}
      {asset.historicalCurve ? <div style={{marginTop:36}}><HistoricalCurve data={asset.historicalCurve} symbol={asset.symbol} /></div> : <section className={styles.noSamples} style={{marginTop:30}}>
        <h2>Historical samples unavailable.</h2>
        <p>No Solana price-impact observations were saved for {asset.symbol}. This reference focuses on the product’s structure and issuer documents.</p>
      </section>}
      <p className={styles.disclosure}>GROUND provides product discovery and allocation planning. It does not execute purchases, hold these assets or grant rights to their underlying assets or income.</p>
    </div>
  );
}
