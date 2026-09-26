"use client";

import Link from "next/link";
import { ArrowDownUp } from "lucide-react";
import { useMemo, useState } from "react";
import { exactProbe, MAX_TOOL_BUDGET, positiveAmount, recordedSampleUnits, snapshotUnits, toolDate, toolMoney, toolPrice, toolQuantity, unitPrice, type CatalogueToolProps } from "@/lib/catalogue-tools";
import { ArchiveToolNote, AssetObservation, AssetPicker, ToolLinks } from "./CatalogueTools";
import styles from "./CatalogueTools.module.css";

export function SwapTool({ assets, networks, snapshotAt, initialAssetSlug }: CatalogueToolProps & { initialAssetSlug?: string }) {
  const bySlug = useMemo(() => new Map(assets.map((asset) => [asset.slug, asset])), [assets]);
  const defaultSource = initialAssetSlug && bySlug.has(initialAssetSlug) ? initialAssetSlug : bySlug.has("usdy") ? "usdy" : assets[0]?.slug ?? "";
  const defaultTarget = defaultSource !== "spyx" && bySlug.has("spyx") ? "spyx" : assets.find((asset) => asset.slug !== defaultSource)?.slug ?? "";
  const [sourceSlug, setSourceSlug] = useState(defaultSource), [targetSlug, setTargetSlug] = useState(defaultTarget);
  const [amount, setAmount] = useState("100"), [basis, setBasis] = useState<"usd" | "units">("usd"), [mode, setMode] = useState<"price" | "sample">("price");
  const source = bySlug.get(sourceSlug), target = bySlug.get(targetSlug);
  const numericAmount = positiveAmount(amount, MAX_TOOL_BUDGET, basis === "usd" ? 2 : 8);
  const sourcePrice = source ? unitPrice(source) : null, targetPrice = target ? unitPrice(target) : null;
  const rawBudget = numericAmount === null ? null : basis === "usd" ? numericAmount : sourcePrice === null ? null : numericAmount * sourcePrice;
  const budgetUsd = rawBudget !== null && Number.isFinite(rawBudget) && rawBudget > 0 && rawBudget <= MAX_TOOL_BUDGET ? rawBudget : null;
  const sourceUnits = source && budgetUsd !== null ? snapshotUnits(source, budgetUsd) : null;
  const priceOnlyUnits = target && budgetUsd !== null ? snapshotUnits(target, budgetUsd) : null;
  const sample = target && budgetUsd !== null ? exactProbe(target, budgetUsd) : null;
  const sampleUnits = target && budgetUsd !== null ? recordedSampleUnits(target, budgetUsd) : null;
  const targetUnits = mode === "sample" ? sampleUnits : priceOnlyUnits;
  const recordedPoints = target?.measured && target.probeAt ? target.curve : [];
  const sameAsset = Boolean(source && target && source.slug === target.slug);
  const inputError = numericAmount === null ? `Enter a positive ${basis === "usd" ? "USD amount with up to two decimals" : "reference quantity with up to eight decimals"}, no larger than 50,000,000.` : basis === "units" && sourcePrice === null ? "This source asset has no saved price. Its reference units cannot be valued in USD." : budgetUsd === null ? "The resulting USD value exceeds this tool’s $50,000,000 limit." : "";
  const sampleMessage = !target ? "Choose a target asset." : !recordedPoints.length ? "This target has no recorded execution samples." : !sample ? "No saved sample exists at this exact USD size. Choose a recorded size below." : !sample.filled ? "The saved probe was not filled at this size. An output amount is unavailable." : sampleUnits === null ? "The saved sample has no usable price-impact value." : `Target-side sample recorded ${toolDate(target.probeAt)}. Source-side execution costs are unavailable.`;

  function reverse() { setSourceSlug(targetSlug); setTargetSlug(sourceSlug); setBasis("usd"); setMode("price"); }
  return <><ArchiveToolNote snapshotAt={snapshotAt} /><div className={styles.layout}>
    <section className={styles.panel} aria-labelledby="compare-heading"><h2 id="compare-heading">Compare two assets</h2><div className={styles.modes} aria-label="Calculation method"><button type="button" aria-pressed={mode === "price"} onClick={() => setMode("price")}>Saved prices</button><button type="button" aria-pressed={mode === "sample"} onClick={() => setMode("sample")}>Recorded target sample</button></div>
      <div className={styles.swapFields}><div><AssetPicker assets={assets} value={sourceSlug} onChange={setSourceSlug} label="Source asset" />{source ? <AssetObservation asset={source} networks={networks} /> : null}</div>
      <button type="button" className={styles.directionButton} onClick={reverse} aria-label="Reverse source and target assets"><ArrowDownUp size={16} aria-hidden="true" /></button>
      <div><AssetPicker assets={assets} value={targetSlug} onChange={setTargetSlug} label="Target asset" />{target ? <AssetObservation asset={target} networks={networks} /> : null}</div>
      <div className={styles.inputRow}><label className={styles.field}>Amount basis<select value={basis} onChange={(event) => setBasis(event.target.value as "usd" | "units")}><option value="usd">Sample budget · USD</option><option value="units">Source reference units</option></select></label><label className={styles.field}>{basis === "usd" ? "USD amount" : "Source reference units"}<input type="number" inputMode="decimal" min={basis === "usd" ? "0.01" : "0.00000001"} max={MAX_TOOL_BUDGET} step={basis === "usd" ? "0.01" : "any"} value={amount} onChange={(event) => setAmount(event.target.value)} aria-invalid={Boolean(inputError)} aria-describedby="compare-validation" /></label></div>
      </div><p id="compare-validation" className={`${styles.status} ${inputError ? styles.error : ""}`} role="status">{inputError || (sameAsset ? "The source and target are the same asset. Choose another asset to compare." : "USD value is calculated from dated catalogue prices.")}</p>
      <p className={styles.help}>Saved-price mode divides the USD value by each saved unit price. Recorded-sample mode only uses an exact archived target-side probe size; it never interpolates a fresh quote.</p>
    </section>
    <aside className={styles.stack}><section className={styles.panel}><h2>{mode === "price" ? "At the saved prices" : "At this recorded size"}</h2><p className={styles.label}>Target quantity · {target?.symbol ?? "Choose target"}</p><p className={styles.bigValue} aria-live="polite">{toolQuantity(targetUnits)}</p><p className={styles.unit}>{target?.unitLabel ?? "Units"}{mode === "sample" ? " · archived sample estimate" : " · price-only calculation"}</p>
      <dl className={styles.summary}><div><dt>USD value used</dt><dd>{toolMoney(budgetUsd)}</dd></div><div><dt>Source reference quantity</dt><dd>{toolQuantity(sourceUnits)} {source?.symbol}</dd></div><div><dt>Source saved unit price</dt><dd>{toolPrice(sourcePrice)}</dd></div><div><dt>Target saved unit price</dt><dd>{toolPrice(targetPrice)}</dd></div><div><dt>Target sampled impact</dt><dd>{mode === "sample" && sample?.filled && sample.impact !== null && Number.isFinite(sample.impact) ? `${toolQuantity(sample.impact * 100)}%` : "Not applied"}</dd></div><div><dt>Fees / gas / source exit</dt><dd>Not calculated</dd></div></dl>
      <p className={styles.help} role="status">{mode === "sample" ? sampleMessage : "This comparison excludes spreads, price impact, execution fees and gas. It is not a conversion route or a redeemable amount."}</p><p className={styles.help}>Quantities are price-reference units, not wallet token balances. Ounce-priced metal references are converted to grams.</p>
      {target && budgetUsd !== null && budgetUsd >= .01 ? <div className={styles.toolbar}><Link className="button secondary" href={`/basket/?asset=${encodeURIComponent(target.slug)}&budget=${budgetUsd.toFixed(2)}`}>Plan target in a basket</Link><Link className="text-link" href={`/assets/${target.slug}/`}>Asset record →</Link></div> : null}
    </section><section className={styles.panel}><h2>Network context</h2><p className={styles.help}>Prices may come from different networks. The labels above show the observed quote network, even when the asset also supports Solana. Comparing values does not establish a bridge, redemption path or executable swap.</p></section></aside>
  </div>
  {target ? <section className={`${styles.panel} ${styles.deletePanel}`} aria-labelledby="sample-heading"><h2 id="sample-heading">Saved target-side samples · {target.symbol}</h2>{recordedPoints.length ? <><p className={styles.help}>{toolDate(target.probeAt)} · {target.probeEngine ?? "Engine not recorded"}. Output uses the saved impact and unit price. Unfilled or missing observations remain unavailable.</p><div className={styles.tableScroll}><table className={styles.sampleTable}><thead><tr><th scope="col">USD size</th><th scope="col">Saved impact</th><th scope="col">Probe state</th><th scope="col">Use size</th></tr></thead><tbody>{recordedPoints.map((point, index) => <tr key={`${point.sizeUsd}-${index}`} data-selected={mode === "sample" && budgetUsd === point.sizeUsd}><td>{toolMoney(point.sizeUsd)}</td><td>{point.filled && point.impact !== null && Number.isFinite(point.impact) ? `${toolQuantity(point.impact * 100)}%` : "—"}</td><td>{point.filled ? "Filled then" : "Unfilled then"}</td><td><button type="button" onClick={() => { setBasis("usd"); setAmount(String(point.sizeUsd)); setMode("sample"); }} aria-label={`Use saved ${toolMoney(point.sizeUsd)} sample for ${target.symbol}`}>Use</button></td></tr>)}</tbody></table></div></> : <p className={styles.help}>No measured sample ladder is saved for this asset. Its saved price, when available, can still be used for a price-only comparison.</p>}</section> : null}<ToolLinks /></>;
}
