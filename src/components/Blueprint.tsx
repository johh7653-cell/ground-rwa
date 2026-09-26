"use client";

import Link from "next/link";
import { ArrowRight, Check, RotateCcw, Save } from "lucide-react";
import { useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import { assets, categories, formatUsd, getAsset, type CategoryId } from "@/lib/assets";
import {
  allocationGradient, BLUEPRINT_CATEGORY_IDS, BLUEPRINT_STORAGE_KEY, CATEGORY_COLORS, createDefaultDraft,
  decodeSavedBlueprint, DEFAULT_WEIGHTS, evaluateDraft, MAX_BUDGET_USD, parseBudget, prepareSavedBlueprint,
  savedToDraft, type BlueprintDraft,
} from "@/lib/blueprint";
import styles from "./Blueprint.module.css";

const STORAGE_UNAVAILABLE = Symbol("storage-unavailable");
const STORAGE_EVENT = "ground-blueprint-storage";
const orderedCategories = BLUEPRINT_CATEGORY_IDS.map((id) => categories.find((category) => category.id === id)!);

function referenceIsValid(categoryId: CategoryId, slug: string) { return getAsset(slug)?.categoryId === categoryId; }
function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(STORAGE_EVENT, onChange); };
}
function readStorage() {
  try { return window.localStorage.getItem(BLUEPRINT_STORAGE_KEY); } catch { return STORAGE_UNAVAILABLE; }
}
function serverStorage() { return null; }

export function Blueprint({ initialAssetSlug }: { initialAssetSlug?: string }) {
  const fieldId = useId();
  const stored = useSyncExternalStore(subscribeToStorage, readStorage, serverStorage);
  const saved = typeof stored === "string" ? decodeSavedBlueprint(stored, referenceIsValid) : null;
  const requestedAsset = initialAssetSlug ? getAsset(initialAssetSlug) : undefined;
  const baseDraft = saved ? savedToDraft(saved) : createDefaultDraft();
  if (requestedAsset) baseDraft.references[requestedAsset.categoryId] = requestedAsset.slug;
  const [editedDraft, setEditedDraft] = useState<BlueprintDraft | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackKind, setFeedbackKind] = useState<"success" | "error" | "neutral">("neutral");
  const draft = editedDraft ?? baseDraft;
  const result = evaluateDraft(draft);
  const invalidStored = typeof stored === "string" && saved === null;

  function updateDraft(update: (current: BlueprintDraft) => BlueprintDraft) {
    setEditedDraft((current) => update(current ?? baseDraft));
    setFeedback("");
  }
  function updateWeight(id: CategoryId, value: string) {
    updateDraft((current) => ({ ...current, weights: { ...current.weights, [id]: value } }));
  }
  function reset() {
    const resetDraft = createDefaultDraft();
    if (requestedAsset) resetDraft.references[requestedAsset.categoryId] = requestedAsset.slug;
    setEditedDraft(resetDraft);
    setFeedback("Reset to the sample budget and allocation.");
    setFeedbackKind("neutral");
  }
  function equalWeights() {
    updateDraft((current) => ({ ...current, weights: { companies: "25", indices: "25", gold: "25", treasuries: "25" } }));
  }
  function save() {
    const snapshot = prepareSavedBlueprint(draft, referenceIsValid);
    if (!snapshot) { setFeedback("Check the budget and make the total allocation 100% before saving."); setFeedbackKind("error"); return; }
    try {
      const serialized = JSON.stringify(snapshot);
      window.localStorage.setItem(BLUEPRINT_STORAGE_KEY, serialized);
      if (window.localStorage.getItem(BLUEPRINT_STORAGE_KEY) !== serialized) throw new Error("Storage did not retain the blueprint");
      window.dispatchEvent(new Event(STORAGE_EVENT));
      setFeedback("Blueprint saved on this device.");
      setFeedbackKind("success");
    } catch {
      setFeedback("This browser could not save your blueprint. You can keep planning here, but this change has not been saved.");
      setFeedbackKind("error");
    }
  }
  function restore() {
    if (!saved) return;
    setEditedDraft(savedToDraft(saved));
    setFeedback("Restored the saved blueprint from this device.");
    setFeedbackKind("success");
  }

  const allocationStatus = result.status === "invalid" ? "Enter valid allocation percentages." : result.status === "empty" ? "Add an allocation to begin." : result.status === "under" ? `${100 - result.total!}% left to allocate` : result.status === "over" ? `${result.total! - 100}% over your budget` : "100% allocated";
  const chartLabel = result.status === "complete" ? "Your blueprint" : result.status === "over" ? "Over 100%" : result.status === "invalid" ? "Check allocation" : `${result.total ?? 0}% allocated`;
  const chartDescription = result.status === "invalid" || result.status === "over" ? "Allocation chart unavailable. Set valid percentages totaling no more than 100%." : `Illustrative allocation: ${orderedCategories.map((category) => `${category.name} ${result.weights[category.id]}%`).join(", ")}${result.total! < 100 ? `, unallocated ${100 - result.total!}%` : ""}.`;
  const assignedAmount = result.budget !== null && result.total !== null ? result.budget * result.total / 100 : null;
  const restoredAutomatically = editedDraft === null && saved !== null && !requestedAsset;

  return <div className={styles.full}>
    {initialAssetSlug && !requestedAsset ? <p className={`note ${styles.topNote}`}>That reference product is not in this catalogue. Choose a product below.</p> : null}
    {requestedAsset && draft.references[requestedAsset.categoryId] === requestedAsset.slug ? <p className={`note ${styles.topNote}`}><Check size={15} aria-hidden="true" /><span><strong>{requestedAsset.symbol}</strong> is selected as a reference for {orderedCategories.find((category) => category.id === requestedAsset.categoryId)?.name.toLowerCase()}. No asset has been purchased.</span></p> : null}
    <div className={styles.grid}>
      <section className={styles.planner} aria-labelledby={`${fieldId}-planner-title`}>
        <div className={styles.panelHeader}><h2 id={`${fieldId}-planner-title`}>Allocation planner</h2><span className={styles.simulation}>Simulation</span></div>
        <label className={styles.budgetLabel} htmlFor={`${fieldId}-budget`}>Sample budget</label>
        <div className={`${styles.budgetField} ${result.budgetError ? styles.fieldInvalid : ""}`}>
          <input id={`${fieldId}-budget`} type="number" inputMode="decimal" min="0.01" max={MAX_BUDGET_USD} step="0.01" value={draft.budget} aria-invalid={result.budgetError !== null} aria-describedby={`${fieldId}-budget-help${result.budgetError ? ` ${fieldId}-budget-error` : ""}`} onChange={(event) => updateDraft((current) => ({ ...current, budget: event.target.value }))} />
          <span>USD</span>
        </div>
        <p className={styles.fieldHelp} id={`${fieldId}-budget-help`}>For planning only. This is not a wallet balance.</p>
        {result.budgetError ? <p className={styles.fieldError} id={`${fieldId}-budget-error`}>{result.budgetError}</p> : null}
        <div className={styles.allocations}>
          {orderedCategories.map((category) => {
            const id = category.id;
            const numericWeight = result.weights[id];
            const fieldError = result.weightErrors[id];
            const categoryAssets = assets.filter((asset) => asset.categoryId === id);
            const amount = result.budget !== null && numericWeight !== null ? result.budget * numericWeight / 100 : null;
            return <div className={styles.allocationRow} key={id}>
              <div className={styles.rowHeading}><label htmlFor={`${fieldId}-${id}-number`}>{category.name}</label><span className={styles.categoryAmount}>{amount === null ? "—" : formatUsd(amount)}</span></div>
              <div className={styles.weightControls}>
                <input className={styles.slider} type="range" min="0" max="100" step="1" value={numericWeight ?? 0} style={{ "--slider-fill": `${numericWeight ?? 0}%` } as CSSProperties} aria-label={`${category.name} allocation slider`} aria-describedby={fieldError ? `${fieldId}-${id}-error` : undefined} onChange={(event) => updateWeight(id, event.target.value)} />
                <div className={`${styles.percentField} ${fieldError ? styles.fieldInvalid : ""}`}><input id={`${fieldId}-${id}-number`} type="number" inputMode="numeric" min="0" max="100" step="1" value={draft.weights[id]} aria-label={`${category.name} allocation percentage`} aria-invalid={fieldError !== null} aria-describedby={fieldError ? `${fieldId}-${id}-error` : undefined} onChange={(event) => updateWeight(id, event.target.value)} /><span>%</span></div>
              </div>
              {fieldError ? <p id={`${fieldId}-${id}-error`} className={styles.fieldError}>{fieldError}</p> : null}
              <label className={styles.referenceLabel} htmlFor={`${fieldId}-${id}-reference`}>Reference product <span>optional</span></label>
              <select className={styles.referenceSelect} id={`${fieldId}-${id}-reference`} value={draft.references[id] ?? ""} onChange={(event) => {
                const slug = event.target.value;
                updateDraft((current) => {
                  const references = { ...current.references };
                  if (slug) references[id] = slug; else delete references[id];
                  return { ...current, references };
                });
              }}><option value="">Category only</option>{categoryAssets.map((asset) => <option key={asset.slug} value={asset.slug}>{asset.symbol} · {asset.name}</option>)}</select>
            </div>;
          })}
        </div>
        <div className={styles.plannerFooter}><p className={result.status === "complete" ? styles.complete : styles.allocationStatus} aria-live="polite">{allocationStatus}</p><button className={styles.resetButton} type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" />Reset</button></div>
        <div className={styles.actions}><button type="button" className="button secondary" onClick={equalWeights}>Equal weights</button><button type="button" className="button primary" disabled={!result.isValid || stored === STORAGE_UNAVAILABLE} onClick={save}><Save size={15} aria-hidden="true" />Save on this device</button></div>
      </section>

      <section className={styles.overview} aria-labelledby={`${fieldId}-overview-title`}>
        <div className={styles.panelHeader}><h2 id={`${fieldId}-overview-title`}>Allocation overview</h2></div>
        <figure className={styles.chartFigure}>
          <div className={styles.donut} role="img" aria-label={chartDescription} style={{ background: allocationGradient(result.weights, result.total) }}><div className={styles.donutHole} aria-hidden="true"><span>{chartLabel}</span><small>{result.status === "complete" ? "100% allocated" : result.status === "over" ? "Adjust your percentages" : "Illustrative allocation"}</small></div></div>
          <figcaption>Illustrative allocation. No trades placed.</figcaption>
        </figure>
        <ul className={styles.legend}>{orderedCategories.map((category) => <li key={category.id}><span className={styles.legendLabel}><i aria-hidden="true" style={{ background: CATEGORY_COLORS[category.id] }} />{category.shortName}</span><span>{result.weights[category.id] === null ? "—" : `${result.weights[category.id]}%`}</span></li>)}</ul>
        <dl className={styles.summary}><div><dt>Sample budget</dt><dd>{result.budget === null ? "—" : formatUsd(result.budget)}</dd></div><div><dt>Assigned</dt><dd>{assignedAmount === null ? "—" : formatUsd(assignedAmount)}</dd></div>{result.budget !== null && result.total !== null && result.total !== 100 ? <div><dt>{result.total > 100 ? "Over budget" : "Unallocated"}</dt><dd>{formatUsd(result.budget * Math.abs(100 - result.total) / 100)}</dd></div> : null}</dl>
        {result.status === "over" ? <p className={styles.overviewNote}>The allocation is over 100%. Adjust the percentages to show the chart and enable saving.</p> : null}
        <p className={styles.overviewNote}>Reference products are labels for research. These amounts do not use asset prices or represent token quantities.</p>
      </section>
    </div>
    <div className={styles.storageFeedback}>
      <p className={feedbackKind === "error" ? styles.feedbackError : feedbackKind === "success" ? styles.feedbackSuccess : ""} role="status" aria-live="polite">{feedback || (stored === STORAGE_UNAVAILABLE ? "Local storage is unavailable in this browser. Saving and restoring are disabled." : invalidStored ? "The saved blueprint could not be validated and was not restored. You can create a new one." : restoredAutomatically ? "Your saved blueprint has been restored from this device." : "Your blueprint stays in this browser. No account or wallet is connected.")}</p>
      {saved ? <button type="button" className={styles.restoreButton} onClick={restore}>Restore saved blueprint</button> : null}
    </div>
    <p className={styles.disclosure}>This blueprint is a planning simulation, not a trade or investment recommendation. Amounts come from your entered budget and allocation; no live asset prices are used. Displayed amounts are rounded to cents.</p>
  </div>;
}

export function BlueprintPreview() {
  const fieldId = useId();
  const [budget, setBudget] = useState("1000");
  const numericBudget = parseBudget(budget);
  return <aside className={styles.preview} aria-labelledby={`${fieldId}-title`}>
    <div className={styles.previewHeader}><h2 id={`${fieldId}-title`}>My blueprint</h2><span>Simulation</span></div>
    <label className={styles.previewBudgetLabel} htmlFor={`${fieldId}-budget`}>Sample budget</label>
    <div className={`${styles.previewBudget} ${numericBudget === null ? styles.fieldInvalid : ""}`}><span>$</span><input id={`${fieldId}-budget`} aria-label="Preview sample budget in USD" aria-invalid={numericBudget === null} aria-describedby={`${fieldId}-help`} type="number" inputMode="decimal" min="0.01" max={MAX_BUDGET_USD} step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} /><small>USD</small></div>
    <p className={styles.previewHelp} id={`${fieldId}-help`}>{numericBudget === null ? "Enter $0.01–$10,000,000 with up to two decimals." : "For planning only. Not a wallet balance."}</p>
    <div className={styles.segmentBar} role="img" aria-label="Sample allocation: indices 40%, companies 25%, gold 20%, Treasury-linked 15%.">{orderedCategories.map((category) => <span key={category.id} style={{ flexBasis: `${DEFAULT_WEIGHTS[category.id]}%`, background: CATEGORY_COLORS[category.id] }} />)}</div>
    <ul className={styles.previewLegend}>{orderedCategories.map((category) => <li key={category.id}><span><i style={{ background: CATEGORY_COLORS[category.id] }} aria-hidden="true" />{category.shortName}</span><strong>{DEFAULT_WEIGHTS[category.id]}%</strong><small>{numericBudget === null ? "—" : formatUsd(numericBudget * DEFAULT_WEIGHTS[category.id] / 100)}</small></li>)}</ul>
    <Link href="/blueprint/" className={`text-link ${styles.previewLink}`}>Build my blueprint<ArrowRight size={16} aria-hidden="true" /></Link>
    <p className={styles.previewNote}>Illustrative allocation. No trades placed.</p>
  </aside>;
}
