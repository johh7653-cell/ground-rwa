"use client";

import { useState } from "react";
import { project } from "@/lib/project";
import styles from "./ProjectContractCard.module.css";

const shortcuts = [
  { label: "Explorer", detail: "Verify the contract", url: project.explorerUrl },
  { label: "DEX Screener", detail: "Pairs and charts", url: project.dexScreenerUrl },
  { label: "Jupiter", detail: "Solana swaps", url: project.jupiterUrl },
];

export function ProjectContractCard() {
  const [feedback, setFeedback] = useState("");
  const address = project.contractAddress.trim();
  const buyAvailable = Boolean(address) && /^https:\/\//.test(project.buyUrl);

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setFeedback("Address copied.");
    } catch {
      setFeedback("Copy unavailable. Select and copy the address above.");
    }
  }

  return (
    <section className={styles.card} id="ground-contract" aria-labelledby="ground-contract-heading">
      <div className={styles.header}>
        <h2 id="ground-contract-heading">Contract address <span>· ${project.name} · Solana only</span></h2>
        <span className={styles.status}>{address ? "ADDRESS SET" : "TBA"}</span>
      </div>
      <div className={styles.addressRow}>
        <input className={styles.address} aria-label="GROUND Solana contract address" value={address || "TBA"} readOnly spellCheck={false} />
        <button className={`button secondary ${styles.copyButton}`} type="button" onClick={copyAddress} disabled={!address} title={address ? "Copy the Solana contract address" : "Contract address to be announced"}>Copy</button>
        {buyAvailable ? <a className={`button primary ${styles.buyButton}`} href={project.buyUrl} target="_blank" rel="noopener noreferrer">Buy ${project.name}</a> : <button className={`button primary ${styles.buyButton}`} type="button" disabled title="Buying is not available yet">Buy ${project.name}</button>}
      </div>
      <p className={styles.note}>{address ? "Verify the Solana token address before using the trading links." : "The contract address and trading links are to be announced."}</p>
      <div className={styles.shortcuts}>
        {shortcuts.map((item) => {
          const available = Boolean(address) && /^https:\/\//.test(item.url);
          const content = <><strong>{item.label}</strong><span>{available ? item.detail : `${item.detail} · TBA`}</span></>;
          return available ? <a key={item.label} className={styles.shortcut} href={item.url} target="_blank" rel="noopener noreferrer">{content}</a> : <button key={item.label} className={styles.shortcut} type="button" disabled title={`${item.label} link to be announced`}>{content}</button>;
        })}
      </div>
      <span className={styles.feedback} role="status">{feedback}</span>
    </section>
  );
}
