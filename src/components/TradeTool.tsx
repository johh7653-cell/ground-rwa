"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";
import { useWallet } from "./WalletProvider";
import type { MarketQuote, MarketResponse } from "@/lib/live-market";
import { MAX_TOOL_BUDGET, positiveAmount, toolMoney, toolPrice, toolQuantity } from "@/lib/catalogue-tools";
import styles from "./TradeTool.module.css";

export interface TradeAsset {slug:string;name:string;symbol:string;issuer:string;address:string|null;image:string|null;unitLabel:string;perOz:boolean;snapshotPrice:number|null;}

export function TradeTool({assets,initialSlug,initialAmount,snapshotAt}:{assets:TradeAsset[];initialSlug?:string;initialAmount?:string;snapshotAt:string}) {
  const id = useId();
  const wallet = useWallet();
  const bySlug = useMemo(()=>new Map(assets.map(asset=>[asset.slug,asset])),[assets]);
  const firstSlug = initialSlug && bySlug.has(initialSlug) ? initialSlug : bySlug.has("spyx") ? "spyx" : assets[0]?.slug ?? "";
  const [slug,setSlug] = useState(firstSlug);
  const [query,setQuery] = useState("");
  const [amount,setAmount] = useState(initialAmount && positiveAmount(initialAmount,MAX_TOOL_BUDGET,2)!==null ? initialAmount : "100");
  const [slippage,setSlippage] = useState("0.5");
  const [quoteRecord,setQuote] = useState<MarketQuote|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [refresh,setRefresh] = useState(0);
  const [now,setNow] = useState(()=>Date.now());
  const requestRef = useRef(0);
  const asset = bySlug.get(slug);
  const quote = quoteRecord?.slug===slug ? quoteRecord : null;
  const text = query.trim().toLowerCase();
  const matches = assets.filter(item=>!text || [item.name,item.symbol,item.issuer,item.slug].some(value=>value.toLowerCase().includes(text)));
  const options = matches.slice(0,100);
  if(asset && !options.some(item=>item.slug===slug)) options.unshift(asset);
  const budget = positiveAmount(amount,MAX_TOOL_BUDGET,2);
  const validSlippage = positiveAmount(slippage,50,2);
  const marketAvailable = quote?.slug===slug && quote.status==="available" && quote.priceUsd!==null && quote.priceUsd>0;
  const indicativeQuantity = marketAvailable && budget!==null ? budget / quote.priceUsd! : null;
  const age = quote?.fetchedAt ? now-Date.parse(quote.fetchedAt) : null;
  const stale = age!==null && age>120000;

  useEffect(()=>{
    if(!asset) return;
    const controller = new AbortController();
    const request = ++requestRef.current;
    async function load() {
      setLoading(true); setError(null); setQuote(null);
      try {
        const response = await fetch("/api/quotes?slugs="+encodeURIComponent(asset!.slug),{signal:controller.signal});
        const data = await response.json() as MarketResponse & {error?:string};
        if(!response.ok) throw new Error(data.error ?? "Market data could not be loaded.");
        const result = data.quotes?.find(item=>item.slug===asset!.slug);
        if(!result) throw new Error("No market response was returned for this asset.");
        if(request===requestRef.current) { setQuote(result); setNow(Date.now()); }
      } catch(caught) {
        if(!controller.signal.aborted && request===requestRef.current) setError(caught instanceof Error ? caught.message : "Market data could not be loaded.");
      } finally { if(!controller.signal.aborted && request===requestRef.current) setLoading(false); }
    }
    void load();
    return ()=>controller.abort();
  },[asset,refresh]);
  useEffect(()=>{ const timer=window.setInterval(()=>setNow(Date.now()),30000); return ()=>window.clearInterval(timer); },[]);

  const marketStatus = loading ? "Fetching market reference…" : error ? error : marketAvailable ? stale ? "Reference is older than 2 minutes. Refresh before using it." : "Recently fetched DEX Screener market reference." : quote?.status==="error" ? quote.error ?? "The data provider is unavailable. Try again." : "No matching Solana market price is available for this record.";

  return <div className={styles.layout}>
    <section className={styles.panel} aria-labelledby={id+"-heading"}>
      <div className={styles.panelHeading}><h2 id={id+"-heading"}>Buy an asset</h2><span>Solana mainnet</span></div>
      <div className={styles.notice}>Buy preview · execution is not connected yet</div>
      <div className={styles.field}><label htmlFor={id+"-search"}>Find an asset</label><input id={id+"-search"} type="search" placeholder="Search Solana assets, symbols or issuers" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="Trade asset" value={slug} onChange={event=>setSlug(event.target.value)}>{options.map(item=><option key={item.slug} value={item.slug}>{item.symbol} · {item.name}</option>)}</select><p className={styles.help}>{matches.length.toLocaleString("en-US")} matches{matches.length>100 ? " · showing the first 100; refine your search" : ""}</p></div>
      <div className={styles.amountBox}><label htmlFor={id+"-amount"}>You pay · sample amount</label><div><input id={id+"-amount"} type="number" inputMode="decimal" min="0.01" max={MAX_TOOL_BUDGET} step="0.01" value={amount} aria-invalid={budget===null} onChange={event=>setAmount(event.target.value)}/><strong>USDC</strong></div><span>USD reference only · no funds reserved</span></div>
      <div className={styles.arrow}><ArrowDown size={17}/></div>
      <div className={styles.receiveBox}><span>Indicative receive</span><div><strong aria-live="polite">{toolQuantity(indicativeQuantity)}</strong>{asset ? <span>{asset.symbol}</span> : null}</div><p>{asset?.unitLabel ?? "Reference units"}</p><small>Market-price estimate before fees and impact. Token display multipliers are not applied.</small></div>
      <div className={styles.slippage}><label htmlFor={id+"-slippage"}>Slippage preference</label><div><input id={id+"-slippage"} type="number" inputMode="decimal" min="0.01" max="50" step="0.01" value={slippage} aria-invalid={validSlippage===null} onChange={event=>setSlippage(event.target.value)}/><span>%</span></div></div><p className={styles.help}>This preference will apply when buying is enabled. It does not turn the market reference into an execution quote.</p>
      {budget===null || validSlippage===null ? <p className={styles.validation} role="status">{budget===null ? "Enter a sample amount from $0.01 to $50,000,000 with up to two decimals. " : ""}{validSlippage===null ? "Enter a slippage preference above 0 and up to 50%, with up to two decimals." : ""}</p> : null}
      <div className={styles.walletState}><Wallet size={15}/>{wallet.address ? <span>{wallet.walletName} · {wallet.address.slice(0,4)}…{wallet.address.slice(-4)}</span> : <span>Wallet not connected</span>}</div>
      <button type="button" className="button primary" disabled={wallet.status!=="disconnected"} onClick={wallet.openDialog}>{wallet.status==="connecting" ? "Connecting wallet…" : wallet.status==="connected" ? "Buying not enabled yet" : "Connect wallet"}</button><p className={styles.help}>A buy becomes available after the execution service is connected. This preview does not sign, submit or confirm an order.</p>
      {asset ? <Link href={"/basket/?asset="+asset.slug+(budget===null ? "" : "&budget="+budget)} className="text-link">Plan this asset in a basket<ArrowUpRight size={14}/></Link> : null}
    </section>
    <aside className={styles.side}>
      <section className={styles.panel} aria-labelledby={id+"-market"}>
        <div className={styles.identity}>{asset?.image ? <Image src={asset.image} alt="" width={37} height={37}/> : null}<div><h2 id={id+"-market"}>{asset?.symbol ?? "Select an asset"}</h2><p>{asset?.name}</p><small>{asset?.issuer}</small></div></div>
        <p className={styles.marketLabel}>Solana market reference</p><p className={styles.price}>{marketAvailable ? toolPrice(quote.priceUsd) : "—"}</p>
        <p className={styles.help} role="status">{marketStatus}</p>
        {quote?.fetchedAt ? <p className={styles.help}>Fetched <time dateTime={quote.fetchedAt}>{new Date(quote.fetchedAt).toLocaleString("en-GB",{timeZone:"UTC",hour12:false})} UTC</time>. The provider does not supply a quote timestamp.</p> : null}
        <button type="button" className={styles.refresh} disabled={loading} onClick={()=>setRefresh(value=>value+1)}><RefreshCw size={13}/>{loading ? "Loading" : "Refresh market data"}</button>
        <dl className={styles.facts}><div><dt>Quote network</dt><dd>Solana</dd></div><div><dt>Indexed venue</dt><dd>{quote?.dexId ?? "—"}</dd></div><div><dt>Pair liquidity</dt><dd>{toolMoney(quote?.liquidityUsd ?? null)}</dd></div><div><dt>24h volume</dt><dd>{toolMoney(quote?.volume24h ?? null)}</dd></div><div><dt>24h price change</dt><dd>{quote?.change24h==null ? "—" : new Intl.NumberFormat("en-US",{maximumFractionDigits:2,signDisplay:"exceptZero"}).format(quote.change24h)+"%"}</dd></div><div><dt>Trading fee</dt><dd>Not quoted</dd></div><div><dt>Network fee</dt><dd>Not quoted</dd></div></dl>
        {quote?.pairUrl ? <a href={quote.pairUrl} className="text-link" target="_blank" rel="noopener noreferrer">View indexed pair<ArrowUpRight size={14}/></a> : null}
      </section>
      {asset ? <section className={styles.panel}><h2>Identity before action</h2><p className={styles.help}>Recorded Solana address</p><code className={styles.address}>{asset.address ?? "No Solana address saved"}</code><p className={styles.help}>Original catalogue reference: {toolPrice(asset.snapshotPrice)} · <time dateTime={snapshotAt}>23 Sep 2026</time>. Saved data and fetched market data are separate.</p><Link href={"/assets/"+asset.slug+"/"} className="text-link">Read product and source details<ArrowUpRight size={14}/></Link></section> : null}
    </aside>
  </div>;
}
