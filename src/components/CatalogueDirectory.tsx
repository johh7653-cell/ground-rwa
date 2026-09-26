"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import { useId, useState } from "react";
import type { ArchivedCategory, ArchivedIssuer } from "@/lib/catalogue";
import styles from "./CatalogueDirectory.module.css";

export interface DirectoryIssuer extends ArchivedIssuer {
  pricedCount: number;
  probeCount: number;
  solanaCount: number;
  networkLabels: string[];
  mediaUrl: string | null;
}

export function CatalogueDirectory({ issuers, categories, initialQuery = "" }: { issuers: DirectoryIssuer[]; categories: ArchivedCategory[]; initialQuery?: string }) {
  const fieldId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [network, setNetwork] = useState("all");
  const [sort, setSort] = useState("listings");
  const normalized = query.trim().toLowerCase();
  const hasFilters = normalized !== "" || category !== "all" || network !== "all";
  const categoryNames = new Map(categories.map((item) => [item.id, item.label]));
  const matches = issuers.filter((issuer) =>
    (category === "all" || issuer.categories.includes(category)) &&
    (network === "all" || issuer.solanaCount > 0) &&
    (!normalized || `${issuer.name} ${issuer.categories.map((id) => categoryNames.get(id) ?? id).join(" ")}`.toLowerCase().includes(normalized))
  ).sort((left, right) => sort === "name" ? left.name.localeCompare(right.name) : sort === "prices" ? right.pricedCount - left.pricedCount || left.name.localeCompare(right.name) : right.count - left.count || left.name.localeCompare(right.name));

  function clearFilters() { setQuery(""); setCategory("all"); setNetwork("all"); }

  return <div>
    <div className={styles.controls}>
      <div className={styles.searchField}><Search size={17} aria-hidden="true" /><label className={styles.srOnly} htmlFor={`${fieldId}-search`}>Search issuers or asset categories</label><input id={`${fieldId}-search`} type="search" value={query} placeholder="Search issuers or categories" onChange={(event) => setQuery(event.target.value)} />{query ? <button type="button" aria-label="Clear issuer search" onClick={() => setQuery("")}><X size={16} aria-hidden="true" /></button> : null}</div>
      <label className={styles.selectField}><span className={styles.srOnly}>Asset category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className={styles.selectField}><span className={styles.srOnly}>Issuer observation networks</span><select value={network} onChange={(event) => setNetwork(event.target.value)}><option value="all">All networks</option><option value="solana">Solana observations</option></select></label>
      <label className={styles.selectField}><span className={styles.srOnly}>Sort issuers</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="listings">Most listings</option><option value="prices">Most saved prices</option><option value="name">Name A–Z</option></select></label>
    </div>
    <div className={styles.resultLine}><p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? "issuer" : "issuers"} · {matches.reduce((sum, item) => sum + item.count, 0).toLocaleString("en-US")} archive listings</p>{hasFilters ? <button type="button" onClick={clearFilters}>Clear filters</button> : null}</div>
    {matches.length ? <div className={styles.issuerGrid}>{matches.map((issuer) => <article className={styles.issuerCard} key={issuer.name}>
      <div className={styles.issuerHeading}>{issuer.mediaUrl ? <Image className={styles.issuerLogo} src={issuer.mediaUrl} alt="" width={34} height={34} unoptimized /> : <span className={styles.issuerInitial} aria-hidden="true">{issuer.name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase()}</span>}<h2>{issuer.name}</h2><span className={styles.issuerCount}>{issuer.count.toLocaleString("en-US")}<small>listings</small></span></div>
      <p className={styles.issuerCategories}>{issuer.categories.map((id) => categoryNames.get(id) ?? id).join(" · ")}</p>
      <p className={styles.issuerNetworks}>{issuer.networkLabels.join(" · ") || "Network information unavailable"}</p>
      <dl className={styles.issuerFacts}><div><dt>Saved prices</dt><dd>{issuer.pricedCount.toLocaleString("en-US")}</dd></div><div><dt>Probe records</dt><dd>{issuer.probeCount.toLocaleString("en-US")}</dd></div><div><dt>Solana observations</dt><dd>{issuer.solanaCount.toLocaleString("en-US")}</dd></div></dl>
      <div className={styles.issuerActions}><Link href={`/assets/?issuer=${encodeURIComponent(issuer.name)}&network=all`}>Browse assets <ArrowRight size={15} aria-hidden="true" /></Link>{/^https:\/\//.test(issuer.site) ? <a href={issuer.site} target="_blank" rel="noopener noreferrer">Official site <ArrowUpRight size={14} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a> : <span className={styles.unknown}>Site unavailable</span>}</div>
    </article>)}</div> : <div className={styles.empty}><Search size={28} aria-hidden="true" /><h2>No matching issuers</h2><p>Try another name or a broader category.</p><button className="button secondary" type="button" onClick={clearFilters}>Clear filters</button></div>}
  </div>;
}
