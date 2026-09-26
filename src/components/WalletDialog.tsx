"use client";

import { Copy, ExternalLink, RefreshCw, Wallet as WalletIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shortenAddress } from "@/lib/wallet";
import { useWallet } from "./WalletProvider";
import styles from "./Wallet.module.css";

const balanceFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 9 });
const dateFormatter = new Intl.DateTimeFormat("en-GB", { timeStyle: "short", dateStyle: "medium", timeZone: "UTC" });

export function WalletDialog() {
  const wallet = useWallet(), dialog = useRef<HTMLDialogElement>(null);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (wallet.dialogOpen && !node.open) node.showModal();
    if (!wallet.dialogOpen && node.open) node.close();
  }, [wallet.dialogOpen]);
  useEffect(() => {
    if (!wallet.dialogOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [wallet.dialogOpen]);
  async function copyAddress() {
    if (!wallet.address) return;
    try { await navigator.clipboard.writeText(wallet.address); setFeedback("Wallet address copied."); }
    catch { setFeedback("This browser could not copy the address. You can select it below."); }
  }
  const busy = wallet.status === "connecting" || wallet.disconnecting;
  return <dialog ref={dialog} id="ground-wallet-dialog" className={styles.dialog} aria-labelledby="wallet-dialog-title" onCancel={(event) => { event.preventDefault(); wallet.closeDialog(); }} onClick={(event) => { if (event.target === event.currentTarget) wallet.closeDialog(); }}><div className={styles.dialogContent}>
    <div className={styles.dialogHeading}><div><p className={styles.eyebrow}>SOLANA WALLET</p><h2 id="wallet-dialog-title">{wallet.status === "connected" ? "Your connected wallet" : "Connect your wallet"}</h2></div><button type="button" className={styles.closeButton} onClick={wallet.closeDialog} aria-label="Close wallet dialog"><X size={19} aria-hidden="true" /></button></div>
    {wallet.status === "connected" && wallet.address ? <section className={styles.accountPanel} aria-label="Connected Solana account"><div className={styles.accountHeader}><WalletIcon size={17} aria-hidden="true" /><strong>{wallet.walletName}</strong><span className={styles.connectedBadge}>Connected</span></div>
      {wallet.accounts.length > 1 ? <label className={styles.accountSelect}>Authorized Solana account<select value={wallet.address} onChange={(event) => { wallet.selectAccount(event.target.value); setFeedback(""); }} disabled={busy}>{wallet.accounts.map((account) => <option value={account.address} key={account.address}>{account.label ? `${account.label} · ` : ""}{shortenAddress(account.address)}</option>)}</select></label> : null}
      <code className={styles.address}>{wallet.address}</code><div className={styles.actions}><button type="button" className={styles.smallButton} onClick={copyAddress}><Copy size={13} aria-hidden="true" />Copy address</button><a href={`https://solscan.io/account/${wallet.address}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} aria-hidden="true" />Solscan</a></div>
      <div className={styles.balanceRow}><div><p>Mainnet SOL balance</p><strong aria-live="polite">{wallet.balance.status === "ready" && wallet.balance.sol !== null ? `${balanceFormatter.format(wallet.balance.sol)} SOL` : wallet.balance.status === "loading" ? "Loading…" : "Unavailable"}</strong></div><button type="button" className={styles.refreshButton} disabled={!wallet.supportsMainnet || wallet.balance.status === "loading"} onClick={() => void wallet.refreshBalance()} aria-label="Refresh mainnet SOL balance"><RefreshCw size={15} aria-hidden="true" /></button></div>
      <p className={styles.note}>{wallet.balance.status === "ready" && wallet.balance.observedAt ? `Read ${dateFormatter.format(new Date(wallet.balance.observedAt))} UTC · confirmed slot ${wallet.balance.contextSlot?.toLocaleString("en-US")}${wallet.balance.cached ? " · cached for up to 15 seconds" : ""}.` : wallet.balance.error ?? (!wallet.supportsMainnet ? "This account does not authorize Solana mainnet. Choose a mainnet account to read its balance." : "Only native SOL is read. Token balances are not loaded.")}</p>
      <div className={styles.actions}><button type="button" className={styles.smallButton} onClick={() => void wallet.disconnect()} disabled={busy}>{wallet.disconnecting ? "Disconnecting…" : "Disconnect from site"}</button></div><p className={styles.note}>Wallet permissions can also be managed inside your wallet.</p>
    </section> : <p className={styles.description}>Choose a Solana wallet to authorize access to its public account. Connecting does not request a signature or send a transaction.</p>}
    {wallet.wallets.length ? <section className={styles.walletList} aria-label="Detected compatible Solana wallets"><h3>{wallet.status === "connected" ? "Other detected wallets" : "Detected wallets"}</h3>{wallet.wallets.map((candidate) => { const current = wallet.status === "connected" && candidate === wallet.selectedWallet; return <button type="button" className={styles.walletOption} key={candidate.name} disabled={busy || current} onClick={() => { setFeedback(""); void wallet.connect(candidate); }}><span><WalletIcon size={17} aria-hidden="true" />{candidate.name}</span><small>{current ? "Connected" : wallet.status === "connecting" && wallet.walletName === candidate.name ? "Awaiting wallet…" : "Connect →"}</small></button>; })}</section> : <section className={styles.installPanel}><h3>No compatible Solana wallet detected</h3><p>Wallet extensions may be unavailable in an embedded browser. Open this site in the browser where your wallet is installed, or get a wallet from its official site.</p><div className={styles.installLinks}><a href="https://phantom.com/download" target="_blank" rel="noopener noreferrer">Get Phantom <ExternalLink size={12} aria-hidden="true" /></a><a href="https://www.solflare.com/download/" target="_blank" rel="noopener noreferrer">Get Solflare <ExternalLink size={12} aria-hidden="true" /></a></div><p className={styles.note}>Installing a wallet is optional and starts on the wallet provider’s website.</p></section>}
    {wallet.status === "connecting" ? <p className={styles.status} role="status">Approve or decline the connection request in {wallet.walletName ?? "your wallet"}. No account is selected until the wallet authorizes it.</p> : null}
    <p className={styles.error} role="status">{wallet.error}</p><p className={styles.status} role="status">{feedback}</p><p className={styles.footerNote}>Connection and balance viewing are available. Buying and transaction submission will be connected later.</p>
  </div></dialog>;
}
