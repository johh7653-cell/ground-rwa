"use client";

import Link from "next/link";
import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { addBasketAssets, BASKET_STORAGE_KEY, basketToDraft, createBasketDraft, decodeBasket, filterToolAssets, prepareBasket, sampleWithoutReplacement, toolPrice, unitPrice, type CatalogueToolProps, type ToolAsset } from "@/lib/catalogue-tools";
import { ArchiveToolNote, AssetObservation, STORAGE_BLOCKED, ToolLinks, useLocalRecord, writeLocalRecord } from "./CatalogueTools";
import styles from "./CatalogueTools.module.css";

export function DrawTool({ assets, categories, networks, snapshotAt }: CatalogueToolProps) {
  const [query, setQuery] = useState(""), [category, setCategory] = useState(""), [network, setNetwork] = useState("");
  const [count, setCount] = useState("3"), [pricedOnly, setPricedOnly] = useState(false);
  const [drawn, setDrawn] = useState<ToolAsset[]>([]), [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState(""), [failed, setFailed] = useState(false);
  const bySlug = useMemo(() => new Map(assets.map((asset) => [asset.slug, asset])), [assets]);
  const pool = useMemo(() => filterToolAssets(assets, query, category, network, pricedOnly), [assets, query, category, network, pricedOnly]);
  const stored = useLocalRecord(BASKET_STORAGE_KEY);
  const saved = typeof stored === "string" ? decodeBasket(stored, (slug) => bySlug.has(slug)) : null;
  const drawCount = /^\d+$/.test(count) ? Number(count) : NaN;
  const canDraw = Number.isInteger(drawCount) && drawCount >= 1 && drawCount <= 12 && drawCount <= pool.length;

  function draw() {
    if (!canDraw) return;
    const result = sampleWithoutReplacement(pool, drawCount);
    setDrawn(result); setSelected(result.map((asset) => asset.slug)); setFeedback(`Selected ${result.length} distinct assets from a pool of ${pool.length}.`); setFailed(false);
  }
  function addToBasket() {
    if (!selected.length) return;
    if (typeof stored === "string" && !saved) { setFeedback("The existing saved basket could not be validated. Open Basket to review it before saving another selection."); setFailed(true); return; }
    const starting = saved ? basketToDraft(saved) : createBasketDraft([]);
    const nextDraft = addBasketAssets(starting, selected);
    if (nextDraft === starting) { setFeedback("All selected assets are already in your saved basket. Its weights were kept."); setFailed(false); return; }
    const next = prepareBasket(nextDraft, (slug) => bySlug.has(slug));
    if (!next) { setFeedback("This selection could not be saved as a valid basket."); setFailed(true); return; }
    try { writeLocalRecord(BASKET_STORAGE_KEY, JSON.stringify(next)); setFeedback(`${selected.length} selected assets added to the saved basket. The full basket is split equally; its budget was retained.`); setFailed(false); }
    catch { setFeedback("This browser could not save the basket. The selection has not been saved."); setFailed(true); }
  }

  return <><ArchiveToolNote snapshotAt={snapshotAt} /><div className={styles.layout}>
    <section className={styles.panel} aria-labelledby="draw-heading"><h2 id="draw-heading">Choose the pool</h2><div className={styles.filters}>
      <label>Search<input type="search" placeholder="Symbol, name or issuer" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
      <label>Supported network<select value={network} onChange={(event) => setNetwork(event.target.value)}><option value="">All networks</option>{networks.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
      <label>Number of assets<input type="number" min="1" max="12" step="1" value={count} onChange={(event) => setCount(event.target.value)} aria-invalid={!canDraw} aria-describedby="draw-validation" /></label>
    </div><label className={styles.checkRow}><input className={styles.check} type="checkbox" checked={pricedOnly} onChange={(event) => setPricedOnly(event.target.checked)} />Only assets with a saved price</label>
    <p className={styles.help}>The network filter uses recorded supported networks. Each result separately shows where its price was observed.</p>
    <div className={styles.toolbar}><button type="button" className="button primary" disabled={!canDraw} onClick={draw}><Shuffle size={15} aria-hidden="true" />{drawn.length ? "Draw again" : "Draw a selection"}</button><button type="button" className="button secondary" onClick={() => { setQuery(""); setCategory(""); setNetwork(""); setPricedOnly(false); setCount("3"); }}>Reset filters</button></div>
    <p className={styles.status} id="draw-validation" role="status">{pool.length.toLocaleString("en-US")} assets in this pool.{!canDraw ? " Choose a whole number from 1 to 12, no larger than the pool." : " Each asset can appear once per draw."}</p>
    </section>
    <aside className={styles.panel}><h2>A different starting point</h2><p className={styles.help}>A random selection can help you discover an issuer or asset you have not explored. It is not a recommendation, prize, paid entry or allocation strategy.</p><dl className={styles.summary}><div><dt>Full catalogue</dt><dd>{assets.length.toLocaleString("en-US")}</dd></div><div><dt>Filtered pool</dt><dd>{pool.length.toLocaleString("en-US")}</dd></div><div><dt>Entry cost</dt><dd>None</dd></div><div><dt>Saved basket</dt><dd>{saved ? `${saved.items.length} assets` : "No valid saved basket"}</dd></div></dl></aside>
  </div>
  {drawn.length ? <><div className={styles.drawResults}>{drawn.map((asset) => <article className={styles.drawCard} key={asset.slug}><div className={styles.rowTop}><div className={styles.rowName}><strong>{asset.symbol}</strong></div><label className={styles.checkRow} style={{ marginTop: 0 }}><input className={styles.check} type="checkbox" checked={selected.includes(asset.slug)} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, asset.slug])] : current.filter((slug) => slug !== asset.slug))} aria-label={`Select ${asset.symbol} for basket`} />Select</label></div><p>{asset.name}</p><p>{asset.issuer} · {categories.find((item) => item.id === asset.category)?.label ?? asset.category}</p><p>Saved unit price: {toolPrice(unitPrice(asset))}{unitPrice(asset) !== null ? ` / ${asset.unitLabel}` : " · unavailable"}</p><AssetObservation asset={asset} networks={networks} /><Link href={`/assets/${asset.slug}/`}>View asset record →</Link></article>)}</div>
    <div className={styles.toolbar}><button className="button secondary" type="button" onClick={() => setSelected(drawn.map((asset) => asset.slug))}>Select all</button><button className="button secondary" type="button" onClick={() => setSelected([])}>Deselect all</button><button className="button primary" type="button" disabled={!selected.length || stored === STORAGE_BLOCKED} onClick={addToBasket}>Add {selected.length} to saved basket</button><Link className="button secondary" href="/basket/">Open basket</Link></div><p className={styles.help}>Adding new assets splits all basket weights equally. Your saved name and budget are retained. A new basket starts with a $1,000 sample budget.</p></> : <p className={styles.empty}>Choose a pool, then draw a selection to explore actual catalogue records.</p>}
  <p className={`${styles.status} ${failed ? styles.error : ""}`} role="status">{feedback || (stored === STORAGE_BLOCKED ? "Local storage is unavailable. You can draw assets, but saving is disabled." : "")}</p><ToolLinks /></>;
}
