"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import { MARKET_STALE_MS, marketReferenceStale, providerChainFor, type MarketQuote, type MarketResponse } from "@/lib/live-market";
import styles from "./LiveMarket.module.css";

export interface LiveMarketProps { slug: string; symbol: string; chain: string | null; addressAvailable: boolean }
function money(value: number | null): string {
  if (value === null) return "—";
  return value >= 1 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value) : "$" + new Intl.NumberFormat("en-US", { maximumSignificantDigits: 5 }).format(value);
}
function fetchedDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(value)) + " UTC";
}

export function LiveMarket({ slug, symbol, chain, addressAvailable }: LiveMarketProps) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [failure, setFailure] = useState<{ slug: string; message: string } | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const requestRef = useRef<{ controller: AbortController; id: number } | null>(null);
  const requestId = useRef(0);
  const current = quote?.slug === slug ? quote : null;
  const error = failure?.slug === slug ? failure.message : null;
  const loading = loadingSlug === slug;
  const supported = providerChainFor(chain) !== null;
  const disabled = loading || !addressAvailable || !supported;
  const available = current?.status === "available";
  const stale = available && marketReferenceStale(current.fetchedAt, now);

  useEffect(() => () => requestRef.current?.controller.abort(), []);
  useEffect(() => {
    if (!current?.fetchedAt || current.status !== "available") return;
    const delay = Math.max(0, Date.parse(current.fetchedAt) + MARKET_STALE_MS - Date.now());
    const timer = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [current?.fetchedAt, current?.status]);

  async function load() {
    if (disabled) return;
    requestRef.current?.controller.abort();
    const id = ++requestId.current;
    const controller = new AbortController();
    requestRef.current = { controller, id };
    setLoadingSlug(slug);
    setFailure(null);
    try {
      const response = await fetch(`/api/quotes?slugs=${encodeURIComponent(slug)}`, { signal: controller.signal, cache: "no-store" });
      const result: MarketResponse & { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Market data could not be loaded.");
      const next = result.quotes?.find((item) => item.slug === slug);
      if (!next) throw new Error("No market-data result was returned for this asset.");
      if (requestRef.current?.id !== id) return;
      setNow(Date.now());
      if (next.status === "error") setFailure({ slug, message: next.error ?? "The market-data source is temporarily unavailable." });
      else setQuote(next);
    } catch (caught) {
      if (controller.signal.aborted || requestRef.current?.id !== id) return;
      setFailure({ slug, message: caught instanceof Error ? caught.message : "Market data could not be loaded. Try again." });
      setNow(Date.now());
    } finally { if (requestRef.current?.id === id) setLoadingSlug(null); }
  }

  return <section className={styles.panel} aria-label={`${symbol} recently fetched market reference`}>
    <div className={styles.heading}><div><p>Market data · {chain ?? "Network not recorded"}</p><h2>{available ? error ? "Previous fetched market reference" : "Recently fetched market reference" : "Look at the current market source."}</h2></div><button className="button secondary" type="button" disabled={disabled} onClick={load}>{loading ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}{loading ? "Loading…" : error ? "Retry" : current ? "Refresh" : "Load market data"}</button></div>
    <div role="status" aria-live="polite">
      {!addressAvailable ? <p className={styles.message}>No token address is saved for this record. Market loading is unavailable; the archive remains below.</p> : !supported ? <p className={styles.message}>This network is not enabled for this market-data source. The saved archive remains available.</p> : !current && !error ? <p className={styles.message}>Load a reference for {symbol} on its recorded network. Loading is manual; no automatic refresh runs.</p> : null}
      {error ? <p className={styles.error}>{error}{available ? " The previous fetched reference is retained." : " Historical data is unchanged."}</p> : null}
      {current && !available ? <p className={styles.message}>{current.error ?? "No matching market reference is available."}</p> : null}
      {available ? <><div className={styles.priceLine}><strong>{money(current.priceUsd)}</strong><span>{stale ? <><Clock3 size={13} aria-hidden="true" />Stale · refresh to check</> : "Fetched market reference"}</span></div><dl className={styles.facts}><div><dt>Pair liquidity</dt><dd>{money(current.liquidityUsd)}</dd></div><div><dt>24h change</dt><dd>{current.change24h === null ? "—" : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, signDisplay: "exceptZero" }).format(current.change24h)}%`}</dd></div><div><dt>24h volume</dt><dd>{money(current.volume24h)}</dd></div><div><dt>Venue</dt><dd>{current.dexId ?? "—"}</dd></div></dl>{current.fetchedAt ? <p className={styles.timestamp}>Fetched <time dateTime={current.fetchedAt}>{fetchedDate(current.fetchedAt)}</time></p> : null}{current.pairUrl ? <a href={current.pairUrl} target="_blank" rel="noopener noreferrer" className="text-link">DEX Screener pair source<ArrowUpRight size={14} aria-hidden="true" /></a> : null}</> : null}
    </div>
    <p className={styles.note}>Source: DEX Screener. This is a base-token market reference, not an executable order quote or a promise of liquidity. Fetch time is when this app received the data; the provider’s quote timestamp is unavailable. Refreshes may reuse a result for 30 seconds.</p>
  </section>;
}

export default LiveMarket;
