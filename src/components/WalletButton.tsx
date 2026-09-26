"use client";

import { Wallet as WalletIcon } from "lucide-react";
import { shortenAddress } from "@/lib/wallet";
import { useWallet } from "./WalletProvider";
import styles from "./Wallet.module.css";

export function WalletButton({ className = "" }: { className?: string }) {
  const { status, address, openDialog } = useWallet();
  const label = status === "connected" && address ? shortenAddress(address) : status === "connecting" ? "Connecting…" : "Connect wallet";
  const accessibleLabel = status === "connected" ? "Open connected wallet" : status === "connecting" ? "Connecting wallet" : "Connect wallet";
  return <button type="button" className={`${styles.walletButton} ${className}`} onClick={openDialog} aria-label={accessibleLabel} title={accessibleLabel} aria-haspopup="dialog" aria-controls="ground-wallet-dialog" data-connected={status === "connected"} disabled={status === "connecting"}><WalletIcon size={16} aria-hidden="true" /><span className={styles.buttonLabel}>{label}</span></button>;
}
