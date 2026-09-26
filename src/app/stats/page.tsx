import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueFootnote, CataloguePageIntro, DirectoryMetrics, catalogueHref } from "@/components/CataloguePage";
import { archiveAssets, archiveCategories, archiveIssuers, archiveNetworks, categoryLabel, networkLabel, sourceGroups } from "@/lib/catalogue";
import styles from "@/components/CatalogueDirectory.module.css";

export const metadata: Metadata = { title: "Catalogue statistics", description: "Coverage computed from the archived catalogue: listings, issuers, sources, network observations, missing prices and historical liquidity and probe metadata." };

function hasNumber(value: number | null | undefined): value is number { return typeof value === "number" && Number.isFinite(value); }
function compactUsd(value: number | null) { return value === null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(value); }

function CoverageList({ rows, maximum }: { rows: { label: string; count: number; href: string }[]; maximum: number }) {
  return <ul className={styles.coverageList}>{rows.map((row) => <li key={row.label}><div><Link href={row.href}>{row.label}</Link><strong>{row.count.toLocaleString("en-US")}</strong></div><div className={styles.bar} aria-hidden="true"><i style={{ width: `${maximum > 0 ? row.count / maximum * 100 : 0}%` }} /></div></li>)}</ul>;
}

export default function StatsPage() {
  const total = archiveAssets.length;
  const priced = archiveAssets.filter((asset) => hasNumber(asset.priceUsd)).length;
  const probes = archiveAssets.filter((asset) => asset.probe !== undefined);
  const sampleCount = probes.reduce((sum, asset) => sum + (asset.curve?.length ?? 0), 0);
  const liquidity = archiveAssets.map((asset) => asset.liquidityUsd).filter(hasNumber).sort((left, right) => left - right);
  const midpoint = Math.floor(liquidity.length / 2);
  const medianLiquidity = liquidity.length ? liquidity.length % 2 ? liquidity[midpoint] : (liquidity[midpoint - 1] + liquidity[midpoint]) / 2 : null;
  const reserveCount = archiveAssets.filter((asset) => hasNumber(asset.quoteReservesUsd)).length;
  const routeRows = archiveAssets.filter((asset) => asset.routes > 0).length;
  const sourceRows = sourceGroups.map((source) => ({ label: source.label, count: source.count, href: catalogueHref({ source: source.id }) })).sort((left, right) => right.count - left.count);
  const categoryRows = archiveCategories.map((category) => ({ label: categoryLabel(category.id), count: archiveAssets.filter((asset) => asset.category === category.id).length, href: catalogueHref({ category: category.id }) })).sort((left, right) => right.count - left.count);
  const networkRows = archiveNetworks.map((network) => ({ label: networkLabel(network), count: archiveAssets.filter((asset) => asset.chain === network).length, coverage: archiveAssets.filter((asset) => asset.chain === network || asset.chains.includes(network)).length, href: catalogueHref({ network }) })).sort((left, right) => right.count - left.count);
  const unknownNetwork = archiveAssets.filter((asset) => asset.chain === null).length;
  const states = ["OPEN", "THIN", "WATCH"].map((state) => ({ state, count: archiveAssets.filter((asset) => asset.stamp.state === state).length }));

  return <div className={`container ${styles.page}`}>
    <CataloguePageIntro active="/stats/" title="The catalogue, by the numbers.">Coverage computed from the saved asset records. See where the archive has prices, pool fields and measured probes, and where information is missing.</CataloguePageIntro>
    <DirectoryMetrics metrics={[{ label: "Archive listings", value: total }, { label: "Issuer records", value: archiveIssuers.length }, { label: "Network labels", value: archiveNetworks.length }, { label: "Saved prices", value: priced, note: `${(priced / total * 100).toFixed(1)}% of archive listings` }]} />
    <div className={styles.statsGrid}>
      <section className={styles.statsPanel} aria-labelledby="price-coverage"><h2 id="price-coverage">Price-source coverage.</h2><p>Source labels from the archive. Product prices and NAVs are different from secondary-market quotes.</p><CoverageList rows={sourceRows} maximum={Math.max(...sourceRows.map((row) => row.count))} /></section>
      <section className={styles.statsPanel} aria-labelledby="observation-coverage"><h2 id="observation-coverage">What was recorded.</h2><p>Presence of a field describes this snapshot. It does not imply a live connection or current liquidity.</p>
        <dl className={styles.statFacts}><div><dt>Listings with saved prices</dt><dd>{priced.toLocaleString("en-US")}</dd></div><div><dt>Listings without saved prices</dt><dd>{(total - priced).toLocaleString("en-US")}</dd></div><div><dt>Pool-liquidity observations</dt><dd>{liquidity.length.toLocaleString("en-US")}</dd></div><div><dt>Quote-reserve fields</dt><dd>{reserveCount.toLocaleString("en-US")}</dd></div><div><dt>Listings with route metadata</dt><dd>{routeRows.toLocaleString("en-US")}</dd></div><div><dt>Measured probe records</dt><dd>{probes.length.toLocaleString("en-US")}</dd></div><div><dt>Saved probe ladder points</dt><dd>{sampleCount.toLocaleString("en-US")}</dd></div></dl>
      </section>
      <section className={styles.statsPanel} aria-labelledby="network-coverage"><h2 id="network-coverage">Observation networks.</h2><p>Observed counts use the saved primary chain. Coverage includes any supported-chain label and may overlap across networks.</p>
        <table className={styles.dataTable}><caption>Network counts in the catalogue snapshot</caption><thead><tr><th scope="col">Network</th><th scope="col">Observed</th><th scope="col">Coverage</th></tr></thead><tbody>{networkRows.map((row) => <tr key={row.label}><td><Link href={row.href}>{row.label}</Link></td><td>{row.count.toLocaleString("en-US")}</td><td>{row.coverage.toLocaleString("en-US")}</td></tr>)}{unknownNetwork ? <tr><td>Not recorded</td><td>{unknownNetwork.toLocaleString("en-US")}</td><td>—</td></tr> : null}</tbody></table>
      </section>
      <section className={styles.statsPanel} aria-labelledby="category-coverage"><h2 id="category-coverage">Asset categories.</h2><p>All {archiveCategories.length} categories from the original directory. Select a category to inspect its listings.</p><CoverageList rows={categoryRows} maximum={Math.max(...categoryRows.map((row) => row.count))} /></section>
      <section className={styles.statsPanel} aria-labelledby="pool-observations"><h2 id="pool-observations">Historical pool observations.</h2><p>Statistics across recorded pool fields. Values are not a current market total, asset reserves or backing; rows can reference related or overlapping markets.</p>
        <dl className={styles.statFacts}><div><dt>Recorded liquidity fields</dt><dd>{liquidity.length.toLocaleString("en-US")}</dd></div><div><dt>Median recorded pool liquidity</dt><dd>{compactUsd(medianLiquidity)}</dd></div><div><dt>Smallest recorded pool value</dt><dd>{compactUsd(liquidity[0] ?? null)}</dd></div><div><dt>Largest recorded pool value</dt><dd>{compactUsd(liquidity.at(-1) ?? null)}</dd></div></dl>
      </section>
      <section className={styles.statsPanel} aria-labelledby="archive-states"><h2 id="archive-states">Saved route classifications.</h2><p>The original Open, Thin and Watch classifications are preserved as archive metadata. They do not certify an executable route or current eligibility.</p><table className={styles.dataTable}><caption>Archived classifications, not live status</caption><thead><tr><th scope="col">Saved state</th><th scope="col">Listings</th></tr></thead><tbody>{states.map((row) => <tr key={row.state}><td>{row.state === "OPEN" ? "Open" : row.state === "THIN" ? "Thin" : "Watch"}</td><td>{row.count.toLocaleString("en-US")}</td></tr>)}</tbody></table><p className={styles.explanation} style={{ marginTop: 22, marginBottom: 0 }}>Measured probes and pool-based estimates use different methods. Details and source labels belong beside the underlying numbers.</p></section>
    </div>
    <div className={styles.notice}><h2>These are catalogue statistics.</h2><p>GROUND has no connected trading volume, buyer counts, fees or realized-fill scoreboard. The figures here come from the imported asset archive and describe its coverage. Missing observations are not replaced with invented market activity.</p></div>
    <CatalogueFootnote />
  </div>;
}
