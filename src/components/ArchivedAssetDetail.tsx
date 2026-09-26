import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import { archiveIssuers, categoryLabel, formatArchivedPrice, networkLabel, type ArchivedAsset } from "@/lib/catalogue";
import { HistoricalCurve } from "./HistoricalCurve";
import { SavedMarketData } from "./SavedMarketData";
import { LiveMarket } from "./LiveMarket";
import { WatchlistButton } from "./WatchlistButton";
import styles from "@/app/assets/[slug]/AssetDetail.module.css";

export function ArchivedAssetDetail({ asset }: { asset: ArchivedAsset }) {
  const issuer = archiveIssuers.find((item) => item.name === asset.issuer);
  const officialUrl = asset.permalink ?? issuer?.site;
  return <div className={"container " + styles.main}>
    <Link href="/assets/" className="back-link"><ArrowLeft size={16} />Back to assets</Link>
    <div className={styles.hero}><div className={styles.intro}><div className={styles.category}>{categoryLabel(asset.category)} / {networkLabel(asset.chain)}</div><p className={styles.symbol}>{asset.symbol}</p><h1>{asset.name}</h1><p className={styles.summary}>{asset.desc}</p><div className={styles.actions}>{asset.chain === "solana" ? <Link className="button primary" href={"/trade/?asset="+asset.slug}>Trade preview<ArrowUpRight size={16}/></Link> : null}<Link className="button secondary" href={"/basket/?asset=" + encodeURIComponent(asset.slug)}><Plus size={16} />Add to basket</Link><Link className="button secondary" href={"/swap/?asset=" + encodeURIComponent(asset.slug)}>Compare assets<ArrowUpRight size={16} /></Link></div><WatchlistButton slug={asset.slug} symbol={asset.symbol}/><p className={styles.planningNote}>Explore a saved product record. No holding or trade is created.</p></div><aside className={styles.pricePanel}><p className={styles.status}>Saved catalogue</p><h2>Historical reference price · {networkLabel(asset.chain)}</h2><p className={styles.price}>{formatArchivedPrice(asset.priceUsd)}</p>{asset.perOz && asset.priceUsd !== null ? <p className={styles.priceNote}>Per troy ounce · quantities are displayed in grams.</p> : null}<p className={styles.timestamp}>23 Sep 2026, 13:00 UTC</p><p className={styles.priceNote}>{asset.priceUsd === null ? "This record had no price saved. Its identity and source information are preserved." : "Saved source: " + (asset.priceSource ?? "unavailable") + ". This is not a current executable quote."}</p><div className={styles.priceFooter}><span>Issuer</span><strong>{asset.issuer}</strong></div></aside></div>
    <LiveMarket slug={asset.slug} symbol={asset.symbol} chain={asset.chain} addressAvailable={asset.address!==null}/>
    <div className={styles.informationGrid}><section className={styles.productInformation}><p className={styles.eyebrow}>Product context</p><h2>What the record describes.</h2><dl className={styles.facts}><div><dt>Recorded backing</dt><dd>{asset.backing}</dd></div><div><dt>Issuer</dt><dd>{asset.issuer}</dd></div><div><dt>Display unit</dt><dd>{asset.unitLabel}</dd></div><div><dt>Listed networks</dt><dd>{asset.chains.map(networkLabel).join(", ")}</dd></div></dl></section><aside className={styles.sources}><h2>Read the issuer’s terms.</h2><p>The catalogue description preserves the saved product information. Consult the issuer for current holder rights, access rules and redemption conditions.</p>{officialUrl && /^https:\/\//.test(officialUrl) ? <a href={officialUrl} className="text-link" target="_blank" rel="noopener noreferrer">Issuer product information<ArrowUpRight size={16} /></a> : null}<Link href="/sources/" className="text-link">All data sources<ArrowUpRight size={16} /></Link></aside></div>
    <SavedMarketData asset={asset} />
    {asset.curve && asset.probe ? <div style={{marginTop:36}}><HistoricalCurve data={{ observedAt: asset.probe.probedAt, engine: asset.probe.engine, points: asset.curve }} symbol={asset.symbol} /></div> : <section className={styles.noSamples} style={{marginTop:30}}><h2>No saved probe curve.</h2><p>This asset’s issuer, source and market fields remain available. Missing probe observations are not filled with generated values.</p></section>}
  </div>;
}
