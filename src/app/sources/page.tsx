import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Database } from "lucide-react";
import { CatalogueFootnote, CataloguePageIntro, DirectoryMetrics, archiveDate, catalogueHref } from "@/components/CataloguePage";
import { archiveAssets, archiveIssuers, catalogue, sourceGroups } from "@/lib/catalogue";
import { issuerMediaUrl } from "@/lib/catalogue-media";
import styles from "@/components/CatalogueDirectory.module.css";

export const metadata: Metadata = { title: "Data sources", description: "The provenance behind the catalogue: saved DEX and Jupiter prices, issuer product prices and NAVs, probe records and official issuer links." };

export default function SourcesPage() {
  const probes = archiveAssets.filter((asset) => asset.probe !== undefined);
  const marketLinks = archiveAssets.filter((asset) => asset.pairUrl !== null);
  const priceCount = archiveAssets.filter((asset) => asset.priceUsd !== null && Number.isFinite(asset.priceUsd)).length;
  const engineVersions = [...new Set(probes.map((asset) => asset.probe!.engineVersion))];
  return <div className={`container ${styles.page}`}>
    <CataloguePageIntro active="/sources/" title="Keep the source beside the number.">Explore the original price-source labels, saved market references and issuer websites. The saved sources remain attached to the archive. Current market references can also be fetched separately from DEX Screener.</CataloguePageIntro>
    <DirectoryMetrics metrics={[{ label: "Saved prices", value: priceCount }, { label: "Source groups", value: sourceGroups.length }, { label: "Market-reference links", value: marketLinks.length, note: "Includes token discovery pages" }, { label: "Saved probe records", value: probes.length }]} />
    <div className={styles.sourceGrid}>{sourceGroups.map((source) => <article className={styles.sourceCard} key={source.id}>
      <div className={styles.sourceRecord}><Database size={22} strokeWidth={1.5} aria-hidden="true" /><span>{source.count.toLocaleString("en-US")} records</span></div>
      <h2>{source.label}</h2><p>{source.description}</p>
      <div className={styles.sourceLinks}><Link href={catalogueHref({ source: source.id })}>Browse records <ArrowRight size={14} aria-hidden="true" /></Link>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">Source site <ArrowUpRight size={13} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a> : null}</div>
    </article>)}</div>

    <section className={styles.probePanel} aria-labelledby="fetched-market-source"><h2 id="fetched-market-source">Market data you can fetch now.</h2><p>Asset details and Trade can request current DEX Screener data for a saved token address on its recorded network. The app matches the base token and network, then selects the priced pair with the highest reported liquidity. Price, pair liquidity, 24-hour volume and price change come from that indexed pair.</p><p>Fetch time shows when this application received the data. The provider does not supply an individual quote timestamp. Responses can be reused for 30 seconds; a reference older than two minutes is marked stale. Missing pairs and provider errors remain visible without replacing the saved archive.</p><div className={styles.sourceLinks}><Link href="/trade/">Open Trade preview <ArrowRight size={14}/></Link><a href="https://docs.dexscreener.com/api/reference" target="_blank" rel="noopener noreferrer">Provider documentation <ArrowUpRight size={14}/></a><Link href="/docs/#market">Read market-data fields <ArrowRight size={14}/></Link></div></section>
    <section className={styles.probePanel} aria-labelledby="probe-provenance">
      <h2 id="probe-provenance">The saved Jupiter probe.</h2>
      <p>{probes.length} asset records retain a Jupiter probe alongside their order-size and price-impact samples. Each record can include the router version, venue, hops, block reference and observation time. These measurements are separate from an asset’s headline price and from its price performance.</p>
      <p>Some listings retain a pool-based estimate instead of a measured probe. The archive defines quote reserves as half the recorded pool liquidity. Its “clean size” estimate or interpolated 2% reference size is historical methodology, not a promise that an order can execute today.</p>
      <Link className="text-link" href="/stats/">Inspect archive coverage <ArrowRight size={15} aria-hidden="true" /></Link>
      <dl className={styles.factGrid}><div><dt>Probe records</dt><dd>{probes.length}</dd></div><div><dt>Saved engine version</dt><dd>{engineVersions.join(" · ") || "—"}</dd></div><div><dt>Archive probe capture</dt><dd><time dateTime={catalogue.probedAt}>{archiveDate(catalogue.probedAt)}</time></dd></div><div><dt>Impact threshold in archive</dt><dd>{catalogue.rule.impactCap * 100}%</dd></div></dl>
    </section>

    <section className={styles.section} aria-labelledby="source-readings"><div className={styles.sectionHeading}><h2 id="source-readings">Different sources answer different questions.</h2></div>
      <dl className={styles.definitionList}>
        <div><dt>Product documents</dt><dd>The issuer’s descriptions explain the asset, backing and holder rights. They are separate from prices or secondary-market availability.</dd></div>
        <div><dt>Market references</dt><dd>A DEX Screener link may index a trading pair or a token address. A token discovery page alone does not establish a pool, usable liquidity or an executable route.</dd></div>
        <div><dt>Observation networks</dt><dd>Each saved price, pool record and token address belongs to its recorded network. A multichain product does not have one universal onchain price.</dd></div>
        <div><dt>Missing observations</dt><dd>No saved price, market cap, pool field or probe is shown as zero. A missing field stays unavailable. Route counts and saved classifications describe archive metadata.</dd></div>
      </dl>
    </section>

    <section className={styles.section} aria-labelledby="official-issuer-sources"><div className={styles.sectionHeading}><h2 id="official-issuer-sources">Official issuer sources.</h2><Link href="/issuers/">Search all issuers <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <p className={styles.explanation}>The {archiveIssuers.length} issuer websites retained in the original catalogue. These are public reference links, not GROUND partners or integrated services. Current terms and product availability should be read at the source.</p>
      <div className={styles.officialGrid}>{archiveIssuers.filter((issuer) => /^https:\/\//.test(issuer.site)).map((issuer) => { const mediaUrl = issuerMediaUrl(issuer.name); return <a href={issuer.site} key={issuer.name} target="_blank" rel="noopener noreferrer">{mediaUrl ? <Image className={styles.sourceLogo} src={mediaUrl} alt="" width={28} height={28} unoptimized /> : null}<span><strong>{issuer.name}</strong><small>{new URL(issuer.site).hostname.replace(/^www\./, "")}</small></span><ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>; })}</div>
    </section>
    <CatalogueFootnote />
  </div>;
}
