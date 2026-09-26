import type { Wallet, WalletAccount } from "@wallet-standard/base";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const SOLANA_MAINNET = "solana:mainnet";
export const SOLANA_MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Validate decoded byte length, not just the apparent length of a base58 string. */
export function decodeSolanaAddress(address: string): Uint8Array | null {
  if (typeof address !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return null;
  let value = 0n;
  for (const character of address) value = value * 58n + BigInt(BASE58.indexOf(character));
  const bytes: number[] = [];
  while (value > 0n) { bytes.unshift(Number(value & 255n)); value >>= 8n; }
  let zeros = 0;
  while (address[zeros] === "1") zeros++;
  const decoded = new Uint8Array([...new Array<number>(zeros).fill(0), ...bytes]);
  return decoded.length === 32 ? decoded : null;
}
export function isSolanaChain(chain: string): boolean { return /^solana:[a-zA-Z0-9_-]+$/.test(chain); }
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

export interface ConnectFeature { version: "1.0.0"; connect: () => Promise<{ accounts: readonly WalletAccount[] }> }
export interface WalletChange { accounts?: readonly WalletAccount[]; chains?: Wallet["chains"]; features?: Wallet["features"] }
export interface EventsFeature { version: "1.0.0"; on: (event: "change", listener: (change: WalletChange) => void) => () => void }
export type DetectedWallet = Wallet & { features: Wallet["features"] & { "standard:connect": ConnectFeature; "standard:events": EventsFeature } };

export function isConnectableSolanaWallet(wallet: Wallet): wallet is DetectedWallet {
  const connect = wallet.features["standard:connect"], events = wallet.features["standard:events"];
  return wallet.version === "1.0.0" && wallet.chains.some(isSolanaChain) && record(connect) && connect.version === "1.0.0" && typeof connect.connect === "function" && record(events) && events.version === "1.0.0" && typeof events.on === "function";
}
export function solanaAccounts(accounts: readonly WalletAccount[], walletChains?: readonly string[]): WalletAccount[] {
  if (!Array.isArray(accounts)) return [];
  return accounts.filter((account) => {
    if (!account || typeof account !== "object" || !Array.isArray(account.chains)) return false;
    if (!account.chains.some((chain: unknown) => typeof chain === "string" && isSolanaChain(chain) && (!walletChains || walletChains.includes(chain)))) return false;
    const bytes = decodeSolanaAddress(account.address);
    return bytes !== null && account.publicKey?.length === 32 && bytes.every((byte, index) => account.publicKey[index] === byte);
  });
}
export function chooseSolanaAccount(accounts: readonly WalletAccount[], preferredAddress?: string | null): WalletAccount | null {
  return accounts.find((account) => account.address === preferredAddress) ?? accounts.find((account) => account.chains.includes(SOLANA_MAINNET)) ?? accounts[0] ?? null;
}
export function shortenAddress(address: string): string { return `${address.slice(0, 4)}…${address.slice(-4)}`; }
export function parseBalanceRpc(value: unknown): { lamports: number; contextSlot: number } | null {
  if (!record(value) || value.error || !record(value.result) || !record(value.result.context)) return null;
  const lamports = value.result.value, contextSlot = value.result.context.slot;
  return typeof lamports === "number" && Number.isSafeInteger(lamports) && lamports >= 0 && typeof contextSlot === "number" && Number.isSafeInteger(contextSlot) && contextSlot >= 0 ? { lamports, contextSlot } : null;
}

export interface WalletSession {
  status: "disconnected" | "connecting" | "connected";
  wallet: DetectedWallet | null;
  account: WalletAccount | null;
  accounts: readonly WalletAccount[];
  pendingWalletName: string | null;
  disconnecting: boolean;
  error: string | null;
}
const initialSession: WalletSession = { status: "disconnected", wallet: null, account: null, accounts: [], pendingWalletName: null, disconnecting: false, error: null };

/** An external store keeps authorization events and pending connect requests in one place. */
export function createWalletConnection() {
  let session: WalletSession = initialSession, active: DetectedWallet | null = null, pending: DetectedWallet | null = null;
  let offWallet: (() => void) | null = null, generation = 0;
  const listeners = new Set<() => void>();
  function publish(patch: Partial<WalletSession>) { session = { ...session, ...patch }; listeners.forEach((listener) => listener()); }
  function unsubscribeWallet() { offWallet?.(); offWallet = null; }
  function clear(error: string | null = null) { generation++; unsubscribeWallet(); active = null; pending = null; publish({ ...initialSession, error }); }
  function watch(wallet: DetectedWallet) {
    unsubscribeWallet(); active = wallet;
    offWallet = wallet.features["standard:events"].on("change", (change) => {
      if (active !== wallet) return;
      const chains = change.chains ?? wallet.chains;
      const features = change.features ?? wallet.features;
      if (!isConnectableSolanaWallet({ version: wallet.version, name: wallet.name, icon: wallet.icon, accounts: change.accounts ?? wallet.accounts, chains, features })) { clear("The wallet no longer exposes a supported Solana connection."); return; }
      const accounts = solanaAccounts(change.accounts ?? wallet.accounts, chains);
      const account = chooseSolanaAccount(accounts, session.account?.address);
      publish({ accounts, account, status: pending ? "connecting" : account ? "connected" : "disconnected", error: account ? null : "The wallet no longer authorizes a Solana account. Connect again in your wallet." });
    });
  }
  return {
    getSnapshot: () => session,
    getServerSnapshot: () => initialSession,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
    async connect(wallet: DetectedWallet) {
      if (pending || session.disconnecting) return;
      if (!isConnectableSolanaWallet(wallet)) { publish({ error: "This wallet does not expose a supported Solana connection." }); return; }
      const request = ++generation;
      pending = wallet; publish({ status: "connecting", pendingWalletName: wallet.name, error: null });
      try {
        // Authorization only. Signing features are deliberately never invoked.
        const output = await wallet.features["standard:connect"].connect();
        if (request !== generation) return;
        const authorized = solanaAccounts(output.accounts, wallet.chains);
        // Authorization may be withdrawn while the connect promise is resolving.
        const accounts = solanaAccounts(wallet.accounts, wallet.chains).filter((candidate) => authorized.some((given) => given.address === candidate.address));
        const account = chooseSolanaAccount(accounts);
        if (!account) throw new Error("NO_SOLANA_ACCOUNT");
        watch(wallet);
        pending = null;
        publish({ status: "connected", wallet, account, accounts, pendingWalletName: null, disconnecting: false, error: null });
      } catch (error) {
        if (request !== generation) return;
        pending = null;
        publish({ status: session.account ? "connected" : "disconnected", pendingWalletName: null, error: error instanceof Error && error.message === "NO_SOLANA_ACCOUNT" ? "The wallet did not authorize a valid Solana account. An EVM account cannot be used here." : "The wallet connection was not approved or could not be completed. You are not connected to the selected wallet." });
      }
    },
    async disconnect() {
      if (pending || session.disconnecting) return;
      const wallet = active, request = ++generation;
      publish({ disconnecting: true, error: null });
      try {
        const feature = wallet?.features["standard:disconnect"];
        if (record(feature) && typeof feature.disconnect === "function") await feature.disconnect();
        if (request !== generation) return;
        clear();
      } catch {
        if (request === generation) publish({ disconnecting: false, error: "The wallet did not complete disconnection. Check the connection in your wallet." });
      }
    },
    selectAccount(address: string) {
      if (pending || session.disconnecting) return;
      const account = session.accounts.find((candidate) => candidate.address === address);
      if (account) publish({ account, status: "connected", error: null });
    },
    walletUnavailable(wallet: Wallet) {
      if (active === wallet) clear("The connected wallet is no longer available in this browser.");
      else if (pending === wallet) { generation++; pending = null; publish({ status: session.account ? "connected" : "disconnected", pendingWalletName: null, error: "The selected wallet is no longer available in this browser." }); }
    },
    setError(error: string) { publish({ error }); },
    release() { clear(); },
  };
}
