import Link from "next/link";
import { ArrowUpRight, Database } from "lucide-react";
import { archiveIssuers, catalogue, categoryLabel, formatArchivedPrice, networkLabel, type ArchivedAsset } from "@/lib/catalogue";
import styles from "./SavedMarketData.module.css";

const amount = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
const safeUrl = (value: string | null | undefined) => value && /^https:\/\//.test(value) ? value : null;

export function SavedMarketData({ asset }: { asset: ArchivedAsset }) {
  const issuer = archiveIssuers.find((item) => item.name === asset.issuer);
  const facts = [
    ["Category", categoryLabel(asset.category)],
    ["Quote network", networkLabel(asset.chain)],
    ["Listed networks", asset.chains.map(networkLabel).join(", ")],
    ["Saved price", formatArchivedPrice(asset.priceUsd) + (asset.perOz && asset.priceUsd !== null ? " / troy oz" : "")],
    ["Price basis", asset.perOz ? "Per troy ounce; display quantities use grams" : "Per recorded reference unit"],
    ["Price source", asset.priceSource ?? "No saved price"],
    ["Saved liquidity", amount(asset.liquidityUsd)],
    ["Quote reserve estimate", amount(asset.quoteReservesUsd)],
    ["Saved market cap", amount(asset.marketCap)],
    ["Saved fully diluted value", amount(asset.fdv)],
    ["Recorded DEX", asset.dex ?? "—"],
    ["Quote currency", asset.quote ?? "—"],
    ["Recorded routes", String(asset.routes)],
    ["Recorded holders", asset.holders == null ? "—" : asset.holders.toLocaleString("en-US")],
    ["Display unit", asset.unitLabel],
    ["Discovery source", asset.source ?? "Base catalogue"],
  ];
  const urls = [
    { label: "Issuer website", url: safeUrl(issuer?.site) },
    { label: "Issuer product record", url: safeUrl(asset.permalink) },
    { label: "DEX Screener reference", url: safeUrl(asset.pairUrl) },
  ].filter((item): item is {label:string;url:string} => item.url !== null);
  return <section className={styles.section} aria-labelledby="saved-market-title">
    <div className={styles.heading}><div><span><Database size={15} aria-hidden="true" />Saved market data</span><h2 id="saved-market-title">The full record behind {asset.symbol}.</h2></div><time dateTime={catalogue.snapshotAt}>23 Sep 2026, 13:00 UTC</time></div>
    <div className={styles.grid}>
      <dl className={styles.facts}>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <aside className={styles.sources}><h3>Identity &amp; sources</h3><p>Asset address on {networkLabel(asset.chain)}</p><code>{asset.address ?? "No address saved for this record"}</code><div>{urls.map((item) => <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer">{item.label}<ArrowUpRight size={15} aria-hidden="true" /></a>)}</div><Link className="text-link" href={"/issuers/?q=" + encodeURIComponent(asset.issuer)}>More from {asset.issuer}</Link><p className={styles.note}>The DEX reference may index a token address rather than a verified pair. Source links preserve the original record.</p></aside>
    </div>
    <div className={styles.mark}><span>Archived mark <strong>{asset.stamp.state}</strong></span><p>{asset.stamp.reason}</p><span>Saved clean-size estimate: {amount(asset.stamp.cleanToUsd)}{asset.stamp.atLeast ? " or more at capture" : ""}</span><Link href="/docs/#marks">How the archive marks were assigned<ArrowUpRight size={14} /></Link></div>
    {asset.probe ? <div className={styles.probe}><h3>Saved probe provenance</h3><dl>{[["Engine", asset.probe.engine], ["Version", asset.probe.engineVersion], ["Coverage", asset.probe.coverage], ["Venue", asset.probe.venue ?? "—"], ["Hops", asset.probe.hops ?? "—"], ["Block reference", asset.probe.blockRef ?? "—"], ["Captured", asset.probe.probedAt], ["Filled rungs", asset.probe.filledRungs]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div> : null}
    <p className={styles.note}>All values above are dated archive observations. The quote-reserve figure is the archive’s liquidity-based estimate. Recorded routes and marks do not establish current execution, eligibility or available liquidity. Missing values remain unavailable.</p>
  </section>;
}
