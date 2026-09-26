"use client";

import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { categories as blueprintCategories, getAsset } from "@/lib/assets";
import { BLUEPRINT_CATEGORY_IDS, BLUEPRINT_STORAGE_KEY, decodeSavedBlueprint } from "@/lib/blueprint";
import { BASKET_STORAGE_KEY, decodeBasket, snapshotUnits, TOOL_STORAGE_EVENT, toolDate, toolMoney, toolQuantity, type CatalogueToolProps } from "@/lib/catalogue-tools";
import { ArchiveToolNote, STORAGE_BLOCKED, ToolLinks, useLocalRecord } from "./CatalogueTools";
import styles from "./CatalogueTools.module.css";
import { ImportPlans } from "./ImportPlans";

export function AccountTool({ assets, snapshotAt }: CatalogueToolProps) {
  const bySlug = useMemo(() => new Map(assets.map((asset) => [asset.slug, asset])), [assets]);
  const basketRaw = useLocalRecord(BASKET_STORAGE_KEY), blueprintRaw = useLocalRecord(BLUEPRINT_STORAGE_KEY);
  const basket = typeof basketRaw === "string" ? decodeBasket(basketRaw, (slug) => bySlug.has(slug)) : null;
  const blueprint = typeof blueprintRaw === "string" ? decodeSavedBlueprint(blueprintRaw, (category, slug) => getAsset(slug)?.categoryId === category) : null;
  const [confirming, setConfirming] = useState(false), [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState(""), [failed, setFailed] = useState(false);
  const blocked = basketRaw === STORAGE_BLOCKED || blueprintRaw === STORAGE_BLOCKED;
  const hasRecord = typeof basketRaw === "string" || typeof blueprintRaw === "string";

  function clear() {
    if (!confirmed || !confirming) return;
    try {
      window.localStorage.removeItem(BASKET_STORAGE_KEY);
      window.localStorage.removeItem(BLUEPRINT_STORAGE_KEY);
      if (window.localStorage.getItem(BASKET_STORAGE_KEY) !== null || window.localStorage.getItem(BLUEPRINT_STORAGE_KEY) !== null) throw new Error("A record was retained");
      setFeedback("The saved basket and Blueprint were removed from this browser."); setFailed(false); setConfirming(false); setConfirmed(false);
    } catch { setFeedback("This browser could not finish removing the saved plans. The records shown above reflect the storage that is still available."); setFailed(true); }
    finally { window.dispatchEvent(new Event(TOOL_STORAGE_EVENT)); }
  }
  function planExport() {return { product: "GROUND", schemaVersion:1, exportedAt: new Date().toISOString(), kind: "local-plans-not-holdings", catalogueSnapshotAt: snapshotAt, basket, blueprint };}
  async function copyPlans() {
    try {await navigator.clipboard.writeText(JSON.stringify(planExport(),null,2));setFeedback("Validated plans JSON copied.");setFailed(false);}
    catch {setFeedback("The browser could not copy the plans. Try exporting a file.");setFailed(true);}
  }
  function exportPlans() {
    const data = planExport();
    let url: string | null = null;
    try {
      url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "ground-local-plans.json"; document.body.appendChild(link); link.click(); link.remove();
      setFeedback("A JSON download was requested for the validated local plans."); setFailed(false);
    } catch { setFeedback("This browser could not export the local plans."); setFailed(true); }
    finally { if (url) window.setTimeout(() => URL.revokeObjectURL(url!), 1000); }
  }

  return <><ArchiveToolNote snapshotAt={snapshotAt} /><div className={styles.localGrid}>
    <section className={styles.panel} aria-labelledby="account-basket-heading"><h2 id="account-basket-heading">Saved basket</h2>{basket ? <><p className={styles.label}>{basket.name}</p><p className={styles.bigValue}>{toolMoney(basket.budgetUsd)}</p><p className={styles.unit}>Sample budget · {basket.items.length} assets · saved {toolDate(basket.savedAt)}</p><div className={styles.recordScroll}><ul className={styles.list}>{basket.items.map((item) => { const asset = bySlug.get(item.slug)!; const amount = basket.budgetUsd * item.weightBps / 10000; return <li key={item.slug}><div><Link className="text-link" href={`/assets/${item.slug}/`}>{asset.symbol}</Link><p className={styles.help}>{toolMoney(amount)} · {toolQuantity(snapshotUnits(asset, amount))} {asset.unitLabel} · saved-price estimate</p></div><span>{item.weightBps / 100}%</span></li>; })}</ul></div><div className={styles.toolbar}><Link href="/basket/" className="button primary">Open saved basket</Link></div></> : <><p className={styles.empty}>{basketRaw === STORAGE_BLOCKED ? "Local storage is unavailable in this browser." : typeof basketRaw === "string" ? "A basket record exists, but it could not be validated. It was not loaded or deleted." : "No basket is saved in this browser yet."}</p><Link href="/basket/" className="button secondary">Build a basket</Link></>}</section>
    <section className={styles.panel} aria-labelledby="account-blueprint-heading"><h2 id="account-blueprint-heading">Saved Blueprint</h2>{blueprint ? <><p className={styles.label}>Category allocation</p><p className={styles.bigValue}>{toolMoney(blueprint.budgetUsd)}</p><p className={styles.unit}>Sample budget · 4 exposure categories</p><ul className={styles.list}>{BLUEPRINT_CATEGORY_IDS.map((id) => { const reference = blueprint.references[id] ? getAsset(blueprint.references[id]!) : null; return <li key={id}><div>{blueprintCategories.find((category) => category.id === id)?.name}<p className={styles.help}>{toolMoney(blueprint.budgetUsd * blueprint.weights[id] / 100)}{reference ? ` · ${reference.symbol} reference` : " · no product selected"}</p></div><span>{blueprint.weights[id]}%</span></li>; })}</ul><div className={styles.toolbar}><Link href="/blueprint/" className="button primary">Open saved Blueprint</Link></div></> : <><p className={styles.empty}>{blueprintRaw === STORAGE_BLOCKED ? "Local storage is unavailable in this browser." : typeof blueprintRaw === "string" ? "A Blueprint record exists, but it could not be validated. It was not loaded or deleted." : "No Blueprint is saved in this browser yet."}</p><Link href="/blueprint/" className="button secondary">Create a Blueprint</Link></>}</section>
  </div>
  <section className={`${styles.panel} ${styles.deletePanel}`} aria-labelledby="local-record-heading"><h2 id="local-record-heading">Your local records</h2><p className={styles.help}>These are planning records stored in this browser. They do not show wallet balances, token ownership, account membership or completed trades. Plans are not synchronized across devices; clearing browser data can remove them.</p><div className={styles.toolbar}><button type="button" className="button secondary" disabled={!basket && !blueprint} onClick={exportPlans}><Download size={14} aria-hidden="true" />Export validated plans</button><button type="button" className="button secondary" disabled={!basket && !blueprint} onClick={copyPlans}>Copy plans JSON</button><button type="button" className={styles.dangerButton} disabled={!hasRecord || blocked} onClick={() => { setConfirming(true); setConfirmed(false); setFeedback(""); }}><Trash2 size={14} aria-hidden="true" /> Clear saved local plans</button></div>
    {confirming ? <div className={styles.confirmation}><p>This removes both GROUND planning records from this browser, including any personal plans you saved. Other browser data is untouched. Export the plans first if you want to keep a copy.</p><label className={styles.checkRow}><input className={styles.check} type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I want to remove my saved basket and Blueprint from this browser.</label><div className={styles.toolbar}><button type="button" className={styles.dangerButton} disabled={!confirmed || blocked} onClick={clear}>Confirm removal</button><button type="button" className="button secondary" onClick={() => { setConfirming(false); setConfirmed(false); }}>Cancel</button></div></div> : null}
    <p className={`${styles.status} ${failed ? styles.error : ""}`} role="status">{feedback || (blocked ? "Local storage is unavailable. Removal is disabled." : "")}</p>
  </section><ImportPlans knownSlugs={assets.map(asset=>asset.slug)} storageBlocked={blocked}/><ToolLinks /></>;
}
