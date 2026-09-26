"use client";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { parseBudget } from "@/lib/blueprint";
import styles from "./AssetBudgetCalculator.module.css";

export interface BudgetReference { slug:string;symbol:string;name:string;price:number|null;network:string;unit:string;image:string|null; }
export function AssetBudgetCalculator({ references }: {references:BudgetReference[]}) {
  const id = useId();
  const [budget,setBudget] = useState("1000");
  const amount = parseBudget(budget);
  return <section className={"container " + styles.calculator} aria-labelledby={id + "-heading"}>
    <div className={styles.heading}><div><p>One budget, different possibilities</p><h2 id={id + "-heading"}>The same money, in real things.</h2></div><label htmlFor={id + "-budget"}>Sample budget<div className={styles.input}><span>$</span><input id={id + "-budget"} aria-label="Asset comparison sample budget" type="number" inputMode="decimal" min="0.01" max="10000000" step="0.01" value={budget} aria-invalid={amount === null} onChange={(event) => setBudget(event.target.value)} /><small>USD</small></div></label></div>
    {amount === null ? <p className="note" role="status">Enter a budget from $0.01 to $10,000,000 with up to two decimal places.</p> : null}
    <div className={styles.grid}>{references.map((asset) => <article key={asset.slug}><div className={styles.top}>{asset.image ? <Image src={asset.image} alt="" width={31} height={31} /> : null}<span>{asset.network}</span></div><h3>{asset.symbol}</h3><p>{asset.name}</p><strong>{amount === null || asset.price === null || asset.price <= 0 ? "—" : new Intl.NumberFormat("en-US", {maximumFractionDigits:4}).format(amount / asset.price)}</strong><small>{asset.unit}</small><Link href={"/basket/?asset=" + asset.slug + (amount === null ? "" : "&budget=" + amount)}>Build a basket<ArrowUpRight size={14} /></Link></article>)}</div>
    <p className="note">Unit estimates use saved prices from 23 Sep 2026 on the labelled quote network. They exclude fees, slippage and token display multipliers; no purchase or raw wallet balance is implied.</p>
  </section>;
}
