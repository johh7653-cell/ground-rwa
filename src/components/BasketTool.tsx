"use client";

import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { addBasketAssets, BASKET_STORAGE_KEY, basketToDraft, createBasketDraft, decodeBasket, equalBasketWeights, evaluateBasket, positiveAmount, prepareBasket, snapshotUnits, toolMoney, toolQuantity, unitPrice, type BasketDraft, type CatalogueToolProps } from "@/lib/catalogue-tools";
import { ArchiveToolNote, AssetObservation, AssetPicker, STORAGE_BLOCKED, ToolLinks, useLocalRecord, writeLocalRecord } from "./CatalogueTools";
import styles from "./CatalogueTools.module.css";

export function BasketTool({ assets, networks, snapshotAt, initialAssetSlugs = [], initialBudget }: CatalogueToolProps & { initialAssetSlugs?: string[]; initialBudget?: string }) {
  const id = useId(), bySlug = useMemo(() => new Map(assets.map((asset) => [asset.slug, asset])), [assets]);
  const stored = useLocalRecord(BASKET_STORAGE_KEY);
  const saved = typeof stored === "string" ? decodeBasket(stored, (slug) => bySlug.has(slug)) : null;
  const starting = saved ? basketToDraft(saved) : createBasketDraft(["spyx", "nvdax", "usdy"].filter((slug) => bySlug.has(slug)));
  const linkedBudgetIsValid = Boolean(initialBudget && positiveAmount(initialBudget, 50000000, 2) !== null);
  if (initialBudget && linkedBudgetIsValid) starting.budget = initialBudget;
  const base = addBasketAssets(starting, initialAssetSlugs.filter((slug) => bySlug.has(slug)));
  const [edited, setEdited] = useState<BasketDraft | null>(null), [picker, setPicker] = useState("");
  const [feedback, setFeedback] = useState(""), [failed, setFailed] = useState(false);
  const draft = edited ?? base, result = evaluateBasket(draft);
  const priced = draft.slugs.filter((slug) => unitPrice(bySlug.get(slug)!) !== null).length;
  const amountAssigned = result.budget !== null && result.totalBps !== null ? result.budget * result.totalBps / 10000 : null;
  function update(change: (current: BasketDraft) => BasketDraft) { setEdited((current) => change(current ?? base)); setFeedback(""); setFailed(false); }
  function add() { if (picker && bySlug.has(picker)) { update((current) => addBasketAssets(current, [picker])); setFeedback("Asset added. The selection is split equally; you can edit the weights."); } }
  function remove(slug: string) { update((current) => { const slugs = current.slugs.filter((value) => value !== slug); return { ...current, slugs, weights: equalBasketWeights(slugs) }; }); }
  function save() {
    const next = prepareBasket(draft, (slug) => bySlug.has(slug));
    if (!next) { setFeedback("Enter a valid budget and weights totaling 100% before saving."); setFailed(true); return; }
    try { writeLocalRecord(BASKET_STORAGE_KEY, JSON.stringify(next)); setFeedback("Basket saved on this device."); setFailed(false); } catch { setFeedback("This browser could not save the basket. It has not been saved."); setFailed(true); }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${draft.name || "My basket"} · dated catalogue calculation\nSample budget: ${toolMoney(result.budget)}\n${draft.slugs.map((slug) => { const asset = bySlug.get(slug)!; const bps = result.weights[slug]; const amount = result.budget !== null && bps !== null ? result.budget * bps / 10000 : null; return `${asset.symbol}: ${draft.weights[slug]}% · ${toolMoney(amount)} · ${amount === null ? "—" : toolQuantity(snapshotUnits(asset, amount))} snapshot units · price observed on ${asset.chain ?? "unrecorded network"}`; }).join("\n")}\nNo trades, live prices or holdings. Snapshot: ${snapshotAt}`);
      setFeedback("Basket calculation copied."); setFailed(false);
    } catch { setFeedback("The browser could not copy this calculation."); setFailed(true); }
  }
  const splitStatus = !draft.slugs.length ? "Add at least one asset." : result.totalBps === null ? "Use percentages from 0 to 100, with up to two decimals." : result.totalBps === 10000 ? `100% allocated across ${draft.slugs.length} assets` : `${result.totalBps / 100}% allocated · ${Math.abs(10000 - result.totalBps) / 100}% ${result.totalBps > 10000 ? "over" : "unassigned"}`;

  return <>
    <ArchiveToolNote snapshotAt={snapshotAt} />
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>Build an asset basket</h2>
        <div className={styles.inputRow}><div className={styles.field}><label htmlFor={`${id}-name`}>Basket name</label><input id={`${id}-name`} maxLength={80} value={draft.name} onChange={(event) => update((current) => ({ ...current, name: event.target.value }))} /></div><div className={styles.field}><label htmlFor={`${id}-budget`}>Sample budget · USD</label><input id={`${id}-budget`} type="number" inputMode="decimal" min="0.01" max={50000000} step="0.01" value={draft.budget} aria-invalid={result.budget === null} aria-describedby={`${id}-validation`} onChange={(event) => update((current) => ({ ...current, budget: event.target.value }))} /></div></div>
        <AssetPicker assets={assets} value={picker} onChange={setPicker} label="Add from the full catalogue" />
        <div className={styles.toolbar}><button className="button secondary" type="button" disabled={!picker || draft.slugs.includes(picker)} onClick={add}>{picker && draft.slugs.includes(picker) ? "Already in basket" : "Add asset"}</button><button className="button secondary" type="button" disabled={!draft.slugs.length} onClick={() => update((current) => ({ ...current, weights: equalBasketWeights(current.slugs) }))}>Equal weights</button><button className="button secondary" type="button" disabled={!draft.slugs.length} onClick={() => update((current) => ({ ...current, slugs: [], weights: {} }))}>Clear selection</button></div>
        <p className={styles.help}>Adding or removing an asset splits the remaining selection equally. Edit percentages for a custom allocation.</p>
        <div className={styles.results}>{draft.slugs.length ? draft.slugs.map((slug) => {
          const asset = bySlug.get(slug)!; const bps = result.weights[slug];
          const amount = result.budget !== null && bps !== null ? result.budget * bps / 10000 : null;
          return <article className={styles.basketRow} key={slug}><div className={styles.rowTop}><div className={styles.rowName}><Link href={`/assets/${slug}/`}><strong>{asset.symbol}</strong></Link><p>{asset.name}</p></div><button className={styles.iconButton} aria-label={`Remove ${asset.symbol} from basket`} type="button" onClick={() => remove(slug)}><Trash2 size={15} aria-hidden="true" /></button></div><div className={styles.rowValues}><div><label htmlFor={`${id}-${slug}-weight`}>Weight · %</label><input className={styles.numberField} id={`${id}-${slug}-weight`} type="number" min="0" max="100" step="0.01" value={draft.weights[slug] ?? ""} aria-invalid={bps === null} aria-describedby={`${id}-validation`} onChange={(event) => update((current) => ({ ...current, weights: { ...current.weights, [slug]: event.target.value } }))} /></div><div><small>Allocation</small><strong>{toolMoney(amount)}</strong></div><div><small>Snapshot units</small><strong>{amount === null ? "—" : toolQuantity(snapshotUnits(asset, amount))}</strong><p className={styles.help}>{unitPrice(asset) === null ? "No saved price" : asset.unitLabel}</p></div></div><AssetObservation asset={asset} networks={networks} /></article>;
        }) : <p className={styles.empty}>Your selection is empty. Search the catalogue and add an asset.</p>}</div>
        <p id={`${id}-validation`} role="status" className={`${styles.status} ${result.valid ? styles.success : ""}`}>{splitStatus}{result.budget === null ? " Enter a budget from $0.01 to $50,000,000, with up to two decimals." : ""}</p>
        <div className={styles.toolbar}><button type="button" className="button primary" disabled={!result.valid || stored === STORAGE_BLOCKED} onClick={save}><Save size={14} aria-hidden="true" />Save on this device</button><button type="button" className="button secondary" disabled={!result.valid} onClick={copy}>Copy calculation</button>{saved ? <button type="button" className="button secondary" onClick={() => { setEdited(basketToDraft(saved)); setFeedback("Saved basket restored from this device."); setFailed(false); }}>Restore saved</button> : null}</div>
        <p role="status" className={`${styles.status} ${failed ? styles.error : ""}`}>{feedback || (stored === STORAGE_BLOCKED ? "Local storage is unavailable. Saving is disabled." : typeof stored === "string" && !saved ? "The saved basket could not be validated and was not loaded." : initialBudget && !linkedBudgetIsValid && edited === null ? "The linked budget was invalid and was not applied. Your saved budget was retained, or the default was used." : linkedBudgetIsValid && edited === null ? "The linked budget is applied to this draft. Your saved record stays unchanged until you save." : edited === null && saved ? "Saved basket loaded from this device." : "Changes stay in the planner until you save.")}</p>
      </section>
      <aside className={styles.stack}><section className={styles.panel}><h2>Basket calculation</h2><dl className={styles.summary}><div><dt>Sample budget</dt><dd>{toolMoney(result.budget)}</dd></div><div><dt>Assigned</dt><dd>{toolMoney(amountAssigned)}</dd></div><div><dt>Total weight</dt><dd>{result.totalBps === null ? "—" : `${result.totalBps / 100}%`}</dd></div><div><dt>Assets selected</dt><dd>{draft.slugs.length}</dd></div><div><dt>Saved prices available</dt><dd>{priced} / {draft.slugs.length}</dd></div><div><dt>Trading fees / gas</dt><dd>Not calculated</dd></div></dl><p className={styles.help}>Unit quantities use the archived price only. Missing prices remain unknown; we do not substitute a price or subtract fictional platform fees.</p></section><section className={styles.panel}><h2>One basket, many networks</h2><p className={styles.help}>Each record retains the network of its saved price. Supported networks and the observed quote network can differ. This plan does not bridge assets or build a transaction.</p><div className={styles.toolbar}><Link href="/swap/" className="button secondary">Compare two assets</Link><Link href="/draw/" className="button secondary">Discover a selection</Link></div></section></aside>
    </div><ToolLinks />
  </>;
}
