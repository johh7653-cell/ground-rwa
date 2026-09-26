"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { filterToolAssets, safeMarketUrl, toolDate, TOOL_STORAGE_EVENT, type ToolAsset } from "@/lib/catalogue-tools";
import styles from "./CatalogueTools.module.css";

export const STORAGE_BLOCKED = Symbol("storage-blocked");
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(TOOL_STORAGE_EVENT, callback);
  window.addEventListener("ground-blueprint-storage", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(TOOL_STORAGE_EVENT, callback); window.removeEventListener("ground-blueprint-storage", callback); };
}
const serverSnapshot = () => null;
export function useLocalRecord(key: string) {
  return useSyncExternalStore(subscribe, () => { try { return window.localStorage.getItem(key); } catch { return STORAGE_BLOCKED; } }, serverSnapshot);
}
export function writeLocalRecord(key: string, value: string) {
  window.localStorage.setItem(key, value);
  if (window.localStorage.getItem(key) !== value) throw new Error("This browser did not retain the saved record");
  window.dispatchEvent(new Event(TOOL_STORAGE_EVENT));
}
export function AssetPicker({ assets, value, onChange, label }: { assets: ToolAsset[]; value: string; onChange: (slug: string) => void; label: string }) {
  const id = useId(), [query, setQuery] = useState("");
  const matches = filterToolAssets(assets, query), visible = matches.slice(0, 100);
  const current = assets.find((asset) => asset.slug === value);
  if (current && !visible.some((asset) => asset.slug === value)) visible.unshift(current);
  return <div className={styles.picker}>
    <label htmlFor={`${id}-search`}>{label}</label>
    <input id={`${id}-search`} type="search" placeholder="Search symbol, name or issuer" value={query} onChange={(event) => setQuery(event.target.value)} aria-label={`Search ${label.toLowerCase()}`} />
    <select aria-label={`Select ${label.toLowerCase()}`} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Choose an asset</option>{visible.map((asset) => <option value={asset.slug} key={asset.slug}>{asset.symbol} · {asset.name}</option>)}</select>
    <p className={styles.help}>{matches.length.toLocaleString("en-US")} matches{matches.length > 100 ? " · showing the first 100; refine your search" : ""}</p>
  </div>;
}
export function AssetObservation({ asset, networks }: { asset: ToolAsset; networks: { id: string; label: string }[] }) {
  const observedNetwork = networks.find((network) => network.id === asset.chain)?.label ?? asset.chain ?? "Not recorded";
  const url = safeMarketUrl(asset.pairUrl);
  return <div className={styles.observation}><span>Saved price network: {observedNetwork}</span><span>Quote asset: {asset.quote ?? "Not recorded"}{asset.dex ? ` · ${asset.dex}` : ""}</span>{url ? <a href={url} target="_blank" rel="noopener noreferrer">Saved source ↗</a> : null}</div>;
}
export function ArchiveToolNote({ snapshotAt }: { snapshotAt: string }) {
  return <p className={styles.archiveNote}>Catalogue snapshot · {toolDate(snapshotAt)}. Saved observations, not live quotes. No wallet, order, fee or transaction is created.</p>;
}
export function ToolLinks() {
  return <nav className={styles.toolLinks} aria-label="Catalogue tools"><Link href="/basket/">Basket</Link><Link href="/draw/">Draw</Link><Link href="/swap/">Compare assets</Link><Link href="/account/">Local account</Link><Link href="/blueprint/">Blueprint</Link></nav>;
}
