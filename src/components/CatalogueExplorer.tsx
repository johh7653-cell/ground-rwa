"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Copy, Grid2X2, List, Search, Star } from "lucide-react";
import { defaultCatalogueFilters, readCatalogueFilters, serializeCatalogueFilters, type CatalogueFilters } from "@/lib/catalogue-filters";
import { WatchlistButton, WatchlistNotice, useWatchlist } from "./WatchlistButton";
import styles from "./CatalogueExplorer.module.css";

export interface CatalogueRow {
  slug: string; name: string; symbol: string; issuer: string; category: string;
  chain: string | null; chains: string[]; priceUsd: number | null; perOz: boolean;
  priceSource: string | null; liquidityUsd: number | null; routes: number;
  hasProbe: boolean; stamp: string; image: string | null;
}
export type { CatalogueFilters } from "@/lib/catalogue-filters";
interface Props {
  rows: CatalogueRow[];
  categories: { id: string; label: string; count: number }[];
  networks: { id: string; label: string }[];
  issuers: string[];
  sources: { id: string; label: string }[];
  snapshotLabel: string;
  initialFilters: CatalogueFilters;
  mode?: "catalogue" | "watchlist";
}

const URL_EVENT = "ground-catalogue-url";
function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_EVENT, onChange);
  return () => { window.removeEventListener("popstate", onChange); window.removeEventListener(URL_EVENT, onChange); };
}
function readUrlSearch() { return window.location.search; }

const usd = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1 ? 2 : 6 }).format(value);
const compact = (value: number | null) => value === null ? "—" : "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export function CatalogueExplorer({ rows, categories, networks, issuers, sources, snapshotLabel, initialFilters, mode = "catalogue" }: Props) {
  const id = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchEditRef = useRef<{ active: boolean; search: string }>({ active: false, search: "" });
  const [copyFeedback, setCopyFeedback] = useState<{ search: string; message: string; url?: string } | null>(null);
  const initialSearch = `?${serializeCatalogueFilters(initialFilters)}`;
  const search = useSyncExternalStore(subscribeToUrl, readUrlSearch, () => initialSearch);
  const options = { categories: categories.map((item) => item.id), networks: networks.map((item) => item.id), issuers, sources: sources.map((item) => item.id), defaultNetwork: mode === "watchlist" ? "all" : "solana" };
  const filters = readCatalogueFilters(new URLSearchParams(search), options);
  const { q: query, category, network, issuer, source, coverage, sort, view, page } = filters;
  const watchlist = useWatchlist();
  const savedSlugs = new Set(watchlist.slugs);
  const pool = mode === "watchlist" ? rows.filter((row) => savedSlugs.has(row.slug)) : rows;
  const unknownSavedCount = mode === "watchlist" ? watchlist.slugs.length - pool.length : 0;
  const pageSize = 24;
  const text = query.trim().toLowerCase();
  const matches = pool.filter((row) =>
    (category === "all" || row.category === category) &&
    (network === "all" || row.chain === network) &&
    (issuer === "all" || row.issuer === issuer) &&
    (source === "all" || (row.priceSource ?? "unknown") === source) &&
    (coverage === "all" || (coverage === "priced" ? row.priceUsd !== null : coverage === "unpriced" ? row.priceUsd === null : row.hasProbe)) &&
    (!text || [row.name, row.symbol, row.issuer, row.slug].some((value) => value.toLowerCase().includes(text)))
  );
  if (sort === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "liquidity") matches.sort((a, b) => (b.liquidityUsd ?? -1) - (a.liquidityUsd ?? -1));
  else if (sort === "price") matches.sort((a, b) => (b.priceUsd ?? -1) - (a.priceUsd ?? -1));
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = matches.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const categoryName = (value: string) => categories.find((item) => item.id === value)?.label ?? value;
  const networkName = (value: string | null) => networks.find((item) => item.id === value)?.label ?? "—";
  const sourceName = (value: string | null) => sources.find((item) => item.id === (value ?? "unknown"))?.label ?? "Unavailable";
  function updateFilters(patch: Partial<CatalogueFilters>, historyMode: "push" | "replace" = "push") {
    const current = readCatalogueFilters(new URLSearchParams(window.location.search), options);
    const nextSearch = `?${serializeCatalogueFilters({ ...current, ...patch })}`;
    if (nextSearch !== window.location.search) {
      const url = window.location.pathname + nextSearch + window.location.hash;
      if (historyMode === "push") window.history.pushState(null, "", url); else window.history.replaceState(null, "", url);
      window.dispatchEvent(new Event(URL_EVENT));
    }
    return nextSearch;
  }
  function setQuery(value: string) {
    const continuing = searchEditRef.current.active && searchEditRef.current.search === window.location.search;
    const nextSearch = updateFilters({ q: value, page: 1 }, continuing ? "replace" : "push");
    searchEditRef.current = { active: true, search: nextSearch };
  }
  const setCategory = (value: string) => updateFilters({ category: value, page: 1 });
  const setNetwork = (value: string) => updateFilters({ network: value, page: 1 });
  const setIssuer = (value: string) => updateFilters({ issuer: value, page: 1 });
  const setSource = (value: string) => updateFilters({ source: value, page: 1 });
  const setCoverage = (value: string) => updateFilters({ coverage: value as CatalogueFilters["coverage"], page: 1 });
  const setSort = (value: string) => updateFilters({ sort: value as CatalogueFilters["sort"], page: 1 });
  const setView = (value: "list" | "grid") => updateFilters({ view: value, page: currentPage });
  const setPage = (value: number) => updateFilters({ page: value });
  const change = (setter: (value: string) => void, value: string) => setter(value);
  function reset() { updateFilters({ ...defaultCatalogueFilters("all"), view }); }
  const filtered = text !== "" || category !== "all" || network !== "all" || issuer !== "all" || source !== "all" || coverage !== "all";
  const priceLabel = (row: CatalogueRow) => usd(row.priceUsd) + (row.perOz && row.priceUsd !== null ? " / troy oz" : "");
  function goToPage(next: number) { setPage(next); resultsRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",block:"start"}); }
  async function copyFilteredLink() {
    const url = new URL(`/assets/?${serializeCatalogueFilters({ ...filters, page: currentPage })}`, window.location.origin).toString();
    try { await navigator.clipboard.writeText(url); setCopyFeedback({ search, message: mode === "watchlist" ? "Catalogue filter link copied. Your local saved list is not included." : "Filtered link copied." }); }
    catch { setCopyFeedback({ search, message: "Copy is unavailable in this browser. Open this catalogue link and copy its address.", url }); }
  }
  const isWatchlist = mode === "watchlist";
  const emptyTitle = isWatchlist && watchlist.status === "loading" ? "Loading your watchlist" : isWatchlist && (watchlist.status === "invalid" || watchlist.status === "unavailable") ? "Your saved list cannot be read" : isWatchlist && pool.length === 0 ? "No saved assets to show" : "No matching assets";
  const emptyDescription = isWatchlist && watchlist.status === "loading" ? "Reading the references saved on this device." : isWatchlist && (watchlist.status === "invalid" || watchlist.status === "unavailable") ? "See the storage status above. Your original saved data has not been deliberately removed." : isWatchlist && pool.length === 0 ? "Use the star beside an asset to save it here for later research." : "Change a category, network or search term.";

  return <div className={styles.explorer}>
    <div className={styles.topActions}><p>{mode === "watchlist" ? `${watchlist.slugs.length} saved ${watchlist.slugs.length === 1 ? "reference" : "references"} on this device` : "Save any asset to your local watchlist."}</p><Link href={mode === "watchlist" ? "/assets/?network=all" : "/watchlist/"} className="text-link">{mode === "watchlist" ? "Browse all assets" : "My watchlist"}<Star size={14} aria-hidden="true" /></Link></div>
    <WatchlistNotice />
    {unknownSavedCount > 0 ? <p className={styles.storageNote}>{unknownSavedCount} saved {unknownSavedCount === 1 ? "reference is" : "references are"} outside this catalogue. They remain saved on this device.</p> : null}
    <div className={styles.search}><Search size={18} aria-hidden="true" /><label className={styles.srOnly} htmlFor={id + "-query"}>{isWatchlist ? "Search your saved assets" : "Search the full catalogue"}</label><input id={id + "-query"} type="search" value={query} placeholder={isWatchlist ? "Search saved assets, symbols or issuers" : "Search 1,936 assets, symbols or issuers"} onChange={(event) => change(setQuery, event.target.value)} onBlur={() => { searchEditRef.current.active = false; }} /></div>
    <div className={styles.filters}>
      <label>Category<select value={category} onChange={(event) => change(setCategory, event.target.value)} aria-label="Catalogue category"><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.count}</option>)}</select></label>
      <label>Quote network<select value={network} onChange={(event) => change(setNetwork, event.target.value)} aria-label="Quote network"><option value="all">All networks</option>{networks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Issuer<select value={issuer} onChange={(event) => change(setIssuer, event.target.value)} aria-label="Catalogue issuer"><option value="all">All issuers</option>{issuers.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Price source<select value={source} onChange={(event) => change(setSource, event.target.value)} aria-label="Price source"><option value="all">All sources</option>{sources.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Coverage<select value={coverage} onChange={(event) => change(setCoverage, event.target.value)} aria-label="Data coverage"><option value="all">All records</option><option value="priced">With saved prices</option><option value="unpriced">Price unavailable</option><option value="probe">With probe samples</option></select></label>
      <label>Sort by<select value={sort} onChange={(event) => change(setSort, event.target.value)} aria-label="Sort catalogue"><option value="catalogue">Catalogue order</option><option value="name">Name A–Z</option><option value="liquidity">Saved liquidity</option><option value="price">Saved price</option></select></label>
    </div>
    <div className={styles.resultLine} ref={resultsRef}><p aria-live="polite">{matches.length.toLocaleString("en-US")} {matches.length === 1 ? "record" : "records"}{visible.length > 0 ? " · Showing " + ((currentPage - 1) * pageSize + 1) + "–" + Math.min(currentPage * pageSize, matches.length) : ""}</p><div>{filtered ? <button type="button" onClick={reset}>Clear all filters</button> : null}<button type="button" onClick={copyFilteredLink}><Copy size={13} aria-hidden="true" />Copy filtered link</button><button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={18} aria-hidden="true" /></button><button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 size={17} aria-hidden="true" /></button></div></div>
    {copyFeedback?.search === search ? <p className={styles.copyFeedback} role="status">{copyFeedback.message}{copyFeedback.url ? <> <Link href={copyFeedback.url}>Open filtered catalogue</Link></> : null}</p> : null}
    <p className={styles.date}>Saved catalogue · {snapshotLabel}. Network refers to the recorded quote. A price on one chain is not a quote on another.</p>
    {visible.length === 0 ? <div className={styles.empty}><Search size={25} /><h2>{emptyTitle}</h2><p>{emptyDescription}</p>{isWatchlist && pool.length === 0 ? <Link className="button secondary" href="/assets/?network=all">Browse assets</Link> : <button type="button" className="button secondary" onClick={reset}>Clear all filters</button>}</div> : view === "list" ? <div className={styles.tableScroll}><table className={styles.table}><caption className={styles.srOnly}>Archived asset records</caption><thead><tr><th scope="col">Asset</th><th scope="col">Issuer</th><th scope="col">Saved price</th><th scope="col">Saved liquidity</th><th scope="col">Quote network</th><th scope="col">Price source</th><th scope="col"><span className={styles.srOnly}>Watchlist and details</span></th></tr></thead><tbody>{visible.map((row) => <tr key={row.slug}><td><Link href={"/assets/" + row.slug + "/"}><div className={styles.identity}>{row.image ? <Image src={row.image} alt="" width={32} height={32} /> : null}<strong>{row.symbol}</strong></div><small>{row.name}</small><span>{categoryName(row.category)}</span></Link></td><td>{row.issuer}</td><td className={styles.numeric}>{priceLabel(row)}</td><td className={styles.numeric}>{compact(row.liquidityUsd)}</td><td>{networkName(row.chain)}</td><td>{sourceName(row.priceSource)}{row.hasProbe ? <small>Jupiter samples</small> : null}</td><td><div className={styles.rowActions}><WatchlistButton slug={row.slug} symbol={row.symbol} compact /><Link href={"/assets/" + row.slug + "/"} aria-label={"View " + row.symbol + " archive details"}><ArrowUpRight size={18} aria-hidden="true" /></Link></div></td></tr>)}</tbody></table></div> : <div className={styles.grid}>{visible.map((row) => <article key={row.slug}><div className={styles.cardTop}><span>{categoryName(row.category)}</span><span>{networkName(row.chain)}</span></div><div className={styles.identity}>{row.image ? <Image src={row.image} alt="" width={35} height={35} /> : null}<h3>{row.symbol}</h3></div><p>{row.name}</p><small>{row.issuer}</small><dl><div><dt>Saved price</dt><dd>{priceLabel(row)}</dd></div><div><dt>Saved liquidity</dt><dd>{compact(row.liquidityUsd)}</dd></div><div><dt>Source</dt><dd>{sourceName(row.priceSource)}</dd></div></dl><div className={styles.cardActions}><Link className="text-link" href={"/assets/" + row.slug + "/"}>View details<ArrowUpRight size={15} aria-hidden="true" /></Link><WatchlistButton slug={row.slug} symbol={row.symbol} compact /></div></article>)}</div>}
    {isWatchlist ? <p className={styles.storageNote}>Saved on this browser, with no account or wallet connection. A filtered link shares catalogue filters; your local saved list stays on this device.</p> : null}
    {matches.length > pageSize ? <nav className={styles.pagination} aria-label="Catalogue pagination"><button type="button" className="button secondary" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}><ArrowLeft size={15} />Previous</button><span>Page {currentPage} of {pageCount}</span><button type="button" className="button secondary" disabled={currentPage === pageCount} onClick={() => goToPage(currentPage + 1)}>Next<ArrowRight size={15} /></button></nav> : null}
  </div>;
}
