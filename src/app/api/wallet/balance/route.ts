import { decodeSolanaAddress, LAMPORTS_PER_SOL, parseBalanceRpc, SOLANA_MAINNET, SOLANA_MAINNET_GENESIS } from "@/lib/wallet";

export const runtime = "nodejs";
const OFFICIAL_RPC = "https://api.mainnet-beta.solana.com";
const CACHE_MS = 15_000;
interface BalanceResult { address: string; network: string; lamports: number; sol: number; contextSlot: number; observedAt: string; source: string }
const cache = new Map<string, { readAt: number; data: BalanceResult }>();
function error(message: string, status: number, code: string) { return Response.json({ error: message, code }, { status, headers: { "Cache-Control": "no-store", ...(status === 503 ? { "Retry-After": "15" } : {}) } }); }
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address") ?? "";
  if (!decodeSolanaAddress(address)) return error("Enter a base58 Solana address that decodes to exactly 32 bytes.", 400, "INVALID_ADDRESS");
  let endpoint: URL;
  try { endpoint = new URL(process.env.SOLANA_RPC_URL || OFFICIAL_RPC); if (endpoint.protocol !== "https:") throw new Error("Invalid scheme"); }
  catch { return error("The Solana RPC configuration is unavailable.", 503, "RPC_CONFIGURATION"); }
  const key = `${endpoint.href}:${address}`, previous = cache.get(key);
  if (previous && Date.now() - previous.readAt < CACHE_MS) return Response.json({ ...previous.data, cached: true }, { headers: { "Cache-Control": "private, max-age=15" } });
  try {
    const balanceRequest = { jsonrpc: "2.0", id: "balance", method: "getBalance", params: [address, { commitment: "confirmed" }] };
    const officialMainnet = endpoint.origin === OFFICIAL_RPC && endpoint.pathname === "/";
    // A configured provider must prove that it is mainnet; never label devnet funds as mainnet SOL.
    const body = officialMainnet ? balanceRequest : [{ jsonrpc: "2.0", id: "network", method: "getGenesisHash", params: [] }, balanceRequest];
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]) });
    if (response.status === 429) return error("The Solana RPC rate limit was reached. Try again shortly.", 503, "RPC_RATE_LIMIT");
    if (!response.ok) return error("The Solana RPC is temporarily unavailable.", 502, "RPC_UNAVAILABLE");
    const decoded: unknown = await response.json();
    let balanceResponse = decoded;
    if (!officialMainnet) {
      if (!Array.isArray(decoded)) return error("The configured RPC could not verify Solana mainnet.", 502, "RPC_NETWORK_UNVERIFIED");
      const network = decoded.find((value) => record(value) && value.id === "network");
      if (!record(network) || network.result !== SOLANA_MAINNET_GENESIS) return error("The configured RPC is not verified as Solana mainnet.", 503, "RPC_WRONG_NETWORK");
      balanceResponse = decoded.find((value) => record(value) && value.id === "balance");
    }
    const balance = parseBalanceRpc(balanceResponse);
    if (!balance) return error("The Solana RPC returned an unavailable or unsupported balance. No balance was substituted.", 502, "RPC_INVALID_RESPONSE");
    const data: BalanceResult = { address, network: SOLANA_MAINNET, lamports: balance.lamports, sol: balance.lamports / LAMPORTS_PER_SOL, contextSlot: balance.contextSlot, observedAt: new Date().toISOString(), source: "Solana mainnet RPC" };
    if (cache.size >= 256) cache.delete(cache.keys().next().value!);
    cache.set(key, { readAt: Date.now(), data });
    return Response.json({ ...data, cached: false }, { headers: { "Cache-Control": "private, max-age=15" } });
  } catch (caught) {
    const timedOut = caught instanceof Error && ["AbortError", "TimeoutError"].includes(caught.name);
    return error(timedOut ? "The balance request timed out or was cancelled. Try again." : "The balance could not be read from Solana. Try again.", timedOut ? 504 : 502, timedOut ? "RPC_TIMEOUT" : "RPC_UNAVAILABLE");
  }
}
