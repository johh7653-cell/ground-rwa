"use client";

import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createWalletConnection, isConnectableSolanaWallet, LAMPORTS_PER_SOL, SOLANA_MAINNET, type DetectedWallet } from "@/lib/wallet";
import { WalletDialog } from "./WalletDialog";

export type { DetectedWallet } from "@/lib/wallet";
export interface WalletBalance { status: "idle" | "loading" | "ready" | "error"; lamports: number | null; sol: number | null; error: string | null; observedAt: string | null; contextSlot: number | null; cached: boolean }
export interface WalletContextValue {
  status: "disconnected" | "connecting" | "connected";
  address: string | null; walletName: string | null; wallets: DetectedWallet[]; selectedWallet: DetectedWallet | null;
  account: WalletAccount | null; accounts: readonly WalletAccount[]; supportsMainnet: boolean;
  error: string | null; disconnecting: boolean; dialogOpen: boolean;
  openDialog: () => void; closeDialog: () => void;
  connect: (wallet: DetectedWallet) => Promise<void>; disconnect: () => Promise<void>; selectAccount: (address: string) => void;
  balance: WalletBalance; refreshBalance: () => Promise<void>;
}
const WalletContext = createContext<WalletContextValue | null>(null);
const EMPTY_WALLETS: readonly Wallet[] = [];
const registrySnapshot = () => getWallets().get();
const serverRegistrySnapshot = () => EMPTY_WALLETS;
const EMPTY_BALANCE: WalletBalance = { status: "idle", lamports: null, sol: null, error: null, observedAt: null, contextSlot: null, cached: false };
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
async function readBalance(address: string, signal: AbortSignal): Promise<WalletBalance> {
  const response = await fetch(`/api/wallet/balance?address=${encodeURIComponent(address)}`, { signal, cache: "no-store" });
  const value: unknown = await response.json();
  if (!response.ok) throw new Error(record(value) && typeof value.error === "string" ? value.error : "The balance is currently unavailable.");
  if (!record(value) || value.address !== address || value.network !== SOLANA_MAINNET || typeof value.lamports !== "number" || !Number.isSafeInteger(value.lamports) || value.lamports < 0 || typeof value.sol !== "number" || value.sol !== value.lamports / LAMPORTS_PER_SOL || typeof value.observedAt !== "string" || !Number.isFinite(Date.parse(value.observedAt)) || typeof value.contextSlot !== "number" || !Number.isSafeInteger(value.contextSlot) || value.contextSlot < 0) throw new Error("The balance response could not be verified.");
  return { status: "ready", lamports: value.lamports, sol: value.sol, observedAt: value.observedAt, contextSlot: value.contextSlot, cached: value.cached === true, error: null };
}
function unavailableBalance(error: unknown): WalletBalance { return { ...EMPTY_BALANCE, status: "error", error: error instanceof Error ? error.message : "The balance is currently unavailable." }; }

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(createWalletConnection), [dialogOpen, setDialogOpen] = useState(false);
  const subscribeRegistry = useCallback((callback: () => void) => {
    const registry = getWallets();
    const offRegister = registry.on("register", callback);
    const offUnregister = registry.on("unregister", (...removed) => { removed.forEach(store.walletUnavailable); callback(); });
    return () => { offRegister(); offUnregister(); };
  }, [store]);
  const registered = useSyncExternalStore(subscribeRegistry, registrySnapshot, serverRegistrySnapshot);
  const session = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const wallets = registered.filter(isConnectableSolanaWallet);
  const account = session.status === "connected" ? session.account : null;
  const address = account?.address ?? null, supportsMainnet = Boolean(account?.chains.includes(SOLANA_MAINNET));
  const [balanceRecord, setBalanceRecord] = useState<{ address: string; balance: WalletBalance } | null>(null);
  const balanceRequest = useRef<{ generation: number; controller: AbortController | null }>({ generation: 0, controller: null });

  useEffect(() => {
    const requestState = balanceRequest.current;
    if (address && supportsMainnet) {
      requestState.controller?.abort();
      const controller = new AbortController(), generation = ++requestState.generation;
      requestState.controller = controller;
      void readBalance(address, controller.signal).then(
        (balance) => { if (generation === requestState.generation) setBalanceRecord({ address, balance }); },
        (error: unknown) => { if (!controller.signal.aborted && generation === requestState.generation) setBalanceRecord({ address, balance: unavailableBalance(error) }); },
      );
    }
    return () => { requestState.generation++; requestState.controller?.abort(); };
  }, [address, supportsMainnet]);
  useEffect(() => () => store.release(), [store]);

  const refreshBalance = useCallback(async () => {
    if (!address || !supportsMainnet) return;
    const requestState = balanceRequest.current;
    requestState.controller?.abort();
    const controller = new AbortController(), generation = ++requestState.generation;
    requestState.controller = controller;
    setBalanceRecord({ address, balance: { ...EMPTY_BALANCE, status: "loading" } });
    try { const balance = await readBalance(address, controller.signal); if (generation === requestState.generation) setBalanceRecord({ address, balance }); }
    catch (error) { if (!controller.signal.aborted && generation === requestState.generation) setBalanceRecord({ address, balance: unavailableBalance(error) }); }
  }, [address, supportsMainnet]);
  const connect = useCallback(async (wallet: DetectedWallet) => {
    if (!getWallets().get().includes(wallet)) { store.setError("This wallet is no longer available in the current browser."); return; }
    await store.connect(wallet);
  }, [store]);
  const balance = !address || !supportsMainnet ? EMPTY_BALANCE : balanceRecord?.address === address ? balanceRecord.balance : { ...EMPTY_BALANCE, status: "loading" as const };
  const value: WalletContextValue = { status: session.status, address, walletName: session.pendingWalletName ?? session.wallet?.name ?? null, wallets, selectedWallet: session.wallet, account, accounts: session.accounts, supportsMainnet, error: session.error, disconnecting: session.disconnecting, dialogOpen, openDialog: () => setDialogOpen(true), closeDialog: () => setDialogOpen(false), connect, disconnect: store.disconnect, selectAccount: store.selectAccount, balance, refreshBalance };
  return <WalletContext.Provider value={value}>{children}<WalletDialog /></WalletContext.Provider>;
}
export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
