"use client";

import { useId, useRef, useState } from "react";
import { getAsset } from "@/lib/assets";
import { BLUEPRINT_STORAGE_KEY, decodeSavedBlueprint } from "@/lib/blueprint";
import { BASKET_STORAGE_KEY, decodeBasket, TOOL_STORAGE_EVENT, toolMoney } from "@/lib/catalogue-tools";
import { decodePlanBundle, MAX_PLAN_FILE_BYTES, storePlanBundle, type PlanBundle } from "@/lib/plan-io";
import styles from "./CatalogueTools.module.css";

export function ImportPlans({knownSlugs,storageBlocked=false}:{knownSlugs:string[];storageBlocked?:boolean}) {
  const id=useId();
  const [plans,setPlans]=useState<PlanBundle|null>(null);
  const [feedback,setFeedback]=useState("");
  const [failed,setFailed]=useState(false);
  const [reading,setReading]=useState(false);
  const [filename,setFilename]=useState("");
  const [pasted,setPasted]=useState("");
  const request=useRef(0);
  function validate(raw:string) {
    const slugs=new Set(knownSlugs);
    return decodePlanBundle(raw,{basket:value=>decodeBasket(value,slug=>slugs.has(slug)),blueprint:value=>decodeSavedBlueprint(value,(category,slug)=>getAsset(slug)?.categoryId===category)});
  }
  async function read(file:File|undefined) {
    const attempt=++request.current;setPlans(null);setFeedback("");setFailed(false);setReading(false);setFilename(file?.name ?? "");
    if(!file) return;
    if(file.size>MAX_PLAN_FILE_BYTES) {setFeedback("Choose a GROUND plans JSON file no larger than 1 MB.");setFailed(true);return;}
    setReading(true);
    try {
      const decoded=validate(await file.text());
      if(attempt!==request.current) return;
      setPlans(decoded.plans);setFailed(decoded.error!==null);setFeedback(decoded.error ?? "Plans validated. Review the amounts below before importing.");
    } catch {if(attempt===request.current) {setFeedback("This file could not be read. No plans were imported.");setFailed(true);}}
    finally {if(attempt===request.current) setReading(false);}
  }
  function save() {
    if(!plans) return;
    let result={ok:false,partial:false};
    try {result=storePlanBundle(window.localStorage,plans,{basket:BASKET_STORAGE_KEY,blueprint:BLUEPRINT_STORAGE_KEY});} catch { /* Storage can be unavailable before a write is attempted. */ }
    setFailed(!result.ok);setFeedback(result.ok ? "Validated plans imported on this device." : result.partial ? "Storage failed and some changes could not be restored. Check the saved records above." : "This browser could not save the imported plans. Your previous records were retained.");
    window.dispatchEvent(new Event(TOOL_STORAGE_EVENT));
    if(result.ok) setPlans(null);
  }
  return <section className={styles.panel} style={{marginTop:22}} aria-labelledby={id+"-heading"}><h2 id={id+"-heading"}>Bring your plans with you</h2><p className={styles.help}>Choose a GROUND plans export from another browser. The file is read on this device; it is not uploaded. Importing replaces only the plans included in the file. Export your current plans first to keep a copy.</p><div className={styles.field} style={{marginTop:18}}><label htmlFor={id+"-file"}>GROUND plans · JSON, up to 1 MB</label><input id={id+"-file"} type="file" accept="application/json,.json" onChange={event=>void read(event.target.files?.[0])}/></div><details style={{marginTop:18}}><summary style={{fontSize:12,cursor:"pointer",color:"var(--muted)"}}>Or paste an exported JSON plan</summary><div className={styles.field} style={{marginTop:12}}><label htmlFor={id+"-paste"}>Exported plans JSON</label><textarea id={id+"-paste"} rows={5} maxLength={MAX_PLAN_FILE_BYTES} value={pasted} onChange={event=>{++request.current;setReading(false);setFilename("");setFailed(false);setPasted(event.target.value);setPlans(null);setFeedback("");}} style={{width:"100%",resize:"vertical",background:"var(--bg)",color:"var(--text)",border:"1px solid var(--line)",borderRadius:5,padding:12,fontSize:11}}/></div><div className={styles.toolbar}><button type="button" className="button secondary" disabled={!pasted.trim() || reading} onClick={()=>{ ++request.current;const decoded=validate(pasted);setPlans(decoded.plans);setFilename("Pasted JSON");setFailed(decoded.error!==null);setFeedback(decoded.error ?? "Plans validated. Review the amounts below before importing."); }}>Validate pasted JSON</button></div></details>{plans ? <dl className={styles.summary} style={{marginTop:18}}><div><dt>File</dt><dd style={{overflowWrap:"anywhere"}}>{filename}</dd></div>{plans.basket ? <div><dt>Basket · {plans.basket.items.length} assets</dt><dd>{toolMoney(plans.basket.budgetUsd)}</dd></div> : null}{plans.blueprint ? <div><dt>Blueprint · 4 categories</dt><dd>{toolMoney(plans.blueprint.budgetUsd)}</dd></div> : null}</dl> : null}<div className={styles.toolbar}><button type="button" className="button secondary" disabled={!plans || reading || storageBlocked} onClick={save}>Import validated plans</button></div><p role="status" className={styles.status+" "+(failed ? styles.error : "")}>{reading ? "Reading file…" : storageBlocked ? "Local storage is unavailable. Plans cannot be imported in this browser." : feedback}</p></section>;
}
