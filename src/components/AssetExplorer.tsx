"use client";

import { useId, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { assets, categories, featuredSlugs, type CategoryId } from "@/lib/assets";
import { AssetCard } from "./AssetCard";
import styles from "./AssetExplorer.module.css";

type InformationFilter = "all" | "snapshot" | "research";

interface AssetExplorerProps {
  featured?: boolean;
  initialCategory?: CategoryId | "all";
}

export function AssetExplorer({ featured = false, initialCategory = "all" }: AssetExplorerProps) {
  const controlId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(initialCategory);
  const [information, setInformation] = useState<InformationFilter>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = normalizedQuery !== "" || category !== "all" || information !== "all";
  const pool = featured && !hasFilters ? assets.filter((asset) => featuredSlugs.some((slug) => slug === asset.slug)) : assets;
  const matches = pool.filter((asset) =>
    (category === "all" || asset.categoryId === category) &&
    (information === "all" || asset.status === information) &&
    (!normalizedQuery || [asset.name, asset.symbol, asset.issuer, asset.issuerShort, asset.exposure, asset.structure].some((value) => value.toLowerCase().includes(normalizedQuery)))
  );
  const displayed = featured ? matches.slice(0, 4) : matches;

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setInformation("all");
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <label htmlFor={`${controlId}-search`} className={styles.srOnly}>Search assets or issuers</label>
            <input id={`${controlId}-search`} type="search" placeholder="Search assets or issuers" value={query} onChange={(event) => setQuery(event.target.value)} />
            {query !== "" && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className={styles.clearSearch}><X size={15} aria-hidden="true" /></button>}
          </div>
          <div className={styles.selectWrapper}>
            <label htmlFor={`${controlId}-category`} className={styles.srOnly}>Asset category</label>
            <select id={`${controlId}-category`} value={category} onChange={(event) => setCategory(event.target.value as CategoryId | "all")}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
          {!featured && <div className={styles.selectWrapper}>
            <label htmlFor={`${controlId}-information`} className={styles.srOnly}>Information status</label>
            <select id={`${controlId}-information`} value={information} onChange={(event) => setInformation(event.target.value as InformationFilter)}>
              <option value="all">All information</option>
              <option value="snapshot">Saved snapshot</option>
              <option value="research">Research only</option>
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>}
        </div>
      </div>

      <div className={styles.resultLine} aria-live="polite" aria-atomic="true">
        <p>{featured && !hasFilters ? "Four products to get to know" : `${matches.length} ${matches.length === 1 ? "reference" : "references"}${displayed.length < matches.length ? ` · Showing ${displayed.length}` : ""}`}</p>
        {hasFilters && <button type="button" onClick={clearFilters} className={styles.clearFilters}>Clear filters</button>}
      </div>

      {displayed.length > 0 ? <div className={styles.assetGrid}>{displayed.map((asset) => <AssetCard key={asset.slug} asset={asset} />)}</div> : <div className={styles.empty}>
        <Search size={27} strokeWidth={1.5} aria-hidden="true" />
        <h3>No matching products</h3>
        <p>Try another name, issuer or category.</p>
        <button type="button" className="button secondary" onClick={clearFilters}>Clear filters</button>
      </div>}

      <p className={styles.disclosure}>Historical references and product information. No live quotes or connected trading.</p>
    </div>
  );
}

export default AssetExplorer;
