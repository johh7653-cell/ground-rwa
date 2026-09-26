import test from "node:test";
import assert from "node:assert/strict";
import { chooseSolanaAccount, createWalletConnection, decodeSolanaAddress, isConnectableSolanaWallet, parseBalanceRpc, SOLANA_MAINNET, solanaAccounts } from "./wallet.ts";

const addressA = "1".repeat(32), addressB = "1".repeat(31) + "2";
const keyA = new Uint8Array(32), keyB = new Uint8Array([...new Array(31).fill(0), 1]);
const accountA = { address: addressA, publicKey: keyA, chains: [SOLANA_MAINNET], features: [] };
const accountB = { address: addressB, publicKey: keyB, chains: [SOLANA_MAINNET], features: [] };
const evm = { address: "0x1234567890123456789012345678901234567890", publicKey: new Uint8Array(20), chains: ["ethereum:1"], features: [] };

// Test fixture only: no mock wallets are registered or included in the application.
function fixture({ accounts = [accountA], connect, disconnect, withDisconnect = true } = {}) {
  const listeners = new Set(), calls = { connect: 0, disconnect: 0, sign: 0, send: 0 };
  let authorized = accounts, chains = ["ethereum:1", SOLANA_MAINNET, "solana:devnet"];
  const features = {
    "standard:connect": { version: "1.0.0", async connect() { calls.connect++; return connect ? connect() : { accounts: authorized }; } },
    "standard:events": { version: "1.0.0", on(event, listener) { assert.equal(event, "change"); listeners.add(listener); return () => listeners.delete(listener); } },
    "solana:signTransaction": { version: "1.0.0", async signTransaction() { calls.sign++; throw new Error("Signing must never be called"); } },
    "solana:signAndSendTransaction": { version: "1.0.0", async signAndSendTransaction() { calls.send++; throw new Error("Sending must never be called"); } },
  };
  if (withDisconnect) features["standard:disconnect"] = { version: "1.0.0", async disconnect() { calls.disconnect++; if (disconnect) await disconnect(); else emit({ accounts: [] }); } };
  // Wallet properties are commonly prototype getters, rather than enumerable fields.
  const wallet = new class {
    get version() { return "1.0.0"; }
    get name() { return "Fixture Solana Wallet"; }
    get icon() { return "data:image/png;base64,"; }
    get accounts() { return authorized; }
    get chains() { return chains; }
    get features() { return features; }
  }();
  function emit(change) {
    if (change.accounts) authorized = change.accounts;
    if (change.chains) chains = change.chains;
    listeners.forEach((listener) => listener(change));
  }
  return { wallet, emit, calls, listeners };
}

test("addresses require valid base58 and exactly 32 decoded bytes, including leading zeros", () => {
  assert.deepEqual(decodeSolanaAddress(addressA), keyA);
  assert.deepEqual(decodeSolanaAddress(addressB), keyB);
  assert.equal(decodeSolanaAddress("So11111111111111111111111111111111111111112")?.length, 32);
  for (const invalid of ["", "1".repeat(31), "1".repeat(33), "z".repeat(44), "2".repeat(32), ` ${addressA}`, `${addressA}\n`, "0".repeat(32), "O".repeat(32), evm.address]) assert.equal(decodeSolanaAddress(invalid), null, invalid);
});

test("Solana account selection rejects EVM and mismatched address/public-key accounts", () => {
  const mismatched = { ...accountA, publicKey: keyB };
  const evmWithSolanaAddress = { ...accountA, chains: ["ethereum:1"] };
  assert.deepEqual(solanaAccounts([evm, mismatched, evmWithSolanaAddress, accountB, accountA]), [accountB, accountA]);
  assert.deepEqual(solanaAccounts([accountA], ["solana:devnet"]), []);
  assert.deepEqual(solanaAccounts([{ ...accountA, publicKey: null }]), []);
  const devnet = { ...accountB, chains: ["solana:devnet"] };
  assert.equal(chooseSolanaAccount([devnet, accountA]), accountA);
  assert.equal(chooseSolanaAccount([devnet, accountA], devnet.address), devnet);
  assert.equal(chooseSolanaAccount([]), null);
});

test("wallet detection requires Solana chains and usable connect/events standard features", () => {
  const { wallet } = fixture();
  assert.equal(isConnectableSolanaWallet(wallet), true);
  const plain = { version: wallet.version, name: wallet.name, icon: wallet.icon, accounts: wallet.accounts, chains: wallet.chains, features: wallet.features };
  assert.equal(isConnectableSolanaWallet({ ...plain, chains: ["ethereum:1"] }), false);
  assert.equal(isConnectableSolanaWallet({ ...plain, features: { "standard:connect": plain.features["standard:connect"] } }), false);
  assert.equal(isConnectableSolanaWallet({ ...plain, features: { ...plain.features, "standard:connect": { version: "1.0.0", connect: false } } }), false);
});

test("connect uses actual authorized output, chooses Solana and never invokes signing or sending", async () => {
  const setup = fixture({ accounts: [evm, accountA] }), store = createWalletConnection();
  assert.equal(store.getSnapshot().status, "disconnected");
  assert.equal(setup.calls.connect, 0, "discovery does not automatically prompt for authorization");
  await store.connect(setup.wallet);
  assert.equal(store.getSnapshot().status, "connected");
  assert.equal(store.getSnapshot().account, accountA);
  assert.deepEqual(store.getSnapshot().accounts, [accountA]);
  assert.equal(setup.calls.connect, 1);
  assert.equal(setup.calls.sign, 0);
  assert.equal(setup.calls.send, 0);
  store.release();
});

test("rejected connect and EVM-only authorized output stay disconnected", async () => {
  for (const setup of [fixture({ connect: async () => { throw new Error("User rejected"); } }), fixture({ accounts: [evm] }), fixture({ connect: async () => ({ accounts: [] }) }), fixture({ accounts: [], connect: async () => ({ accounts: [accountA] }) })]) {
    const store = createWalletConnection();
    await store.connect(setup.wallet);
    assert.equal(store.getSnapshot().status, "disconnected");
    assert.equal(store.getSnapshot().account, null);
    assert.equal(store.getSnapshot().wallet, null);
    assert.ok(store.getSnapshot().error);
    assert.equal(setup.listeners.size, 0);
  }
});

test("account changes update the actual account, and lost authorization removes connected state", async () => {
  const setup = fixture(), store = createWalletConnection();
  await store.connect(setup.wallet);
  setup.emit({ accounts: [evm, accountB] });
  assert.equal(store.getSnapshot().account, accountB);
  assert.equal(store.getSnapshot().status, "connected");
  setup.emit({ accounts: [evm] });
  assert.equal(store.getSnapshot().account, null);
  assert.equal(store.getSnapshot().status, "disconnected");
  setup.emit({ accounts: [accountA, accountB] });
  store.selectAccount(accountB.address);
  assert.equal(store.getSnapshot().account, accountB);
  store.selectAccount("not-authorized");
  assert.equal(store.getSnapshot().account, accountB);
  setup.emit({ chains: ["ethereum:1"] });
  assert.equal(store.getSnapshot().status, "disconnected");
  assert.equal(store.getSnapshot().account, null);
  assert.equal(setup.listeners.size, 0);
});

test("standard disconnect clears the session; a rejected disconnect preserves actual authorization", async () => {
  const success = fixture(), store = createWalletConnection();
  await store.connect(success.wallet);
  await store.disconnect();
  assert.equal(success.calls.disconnect, 1);
  assert.equal(store.getSnapshot().status, "disconnected");
  assert.equal(store.getSnapshot().account, null);
  assert.equal(success.listeners.size, 0);
  const rejected = fixture({ disconnect: async () => { throw new Error("Disconnection rejected"); } });
  await store.connect(rejected.wallet);
  await store.disconnect();
  assert.equal(store.getSnapshot().status, "connected");
  assert.equal(store.getSnapshot().account, accountA);
  assert.equal(store.getSnapshot().disconnecting, false);
  assert.ok(store.getSnapshot().error);
  store.release();
});

test("wallets without standard disconnect can be detached from the site without pretending to revoke permissions", async () => {
  const setup = fixture({ withDisconnect: false }), store = createWalletConnection();
  await store.connect(setup.wallet);
  await store.disconnect();
  assert.equal(store.getSnapshot().status, "disconnected");
  assert.deepEqual(setup.wallet.accounts, [accountA], "authorized wallet accounts remain under wallet control");
  assert.equal(setup.calls.sign, 0);
  assert.equal(setup.calls.send, 0);
});

test("removed wallets and released sessions cannot complete a late connection request", async () => {
  for (const action of ["remove", "release"]) {
    let resolve;
    const setup = fixture({ connect: () => new Promise((finish) => { resolve = finish; }) }), store = createWalletConnection();
    const pending = store.connect(setup.wallet);
    assert.equal(store.getSnapshot().status, "connecting");
    await store.connect(setup.wallet);
    assert.equal(setup.calls.connect, 1, "concurrent button presses do not create a second authorization prompt");
    if (action === "remove") store.walletUnavailable(setup.wallet); else store.release();
    resolve({ accounts: [accountA] });
    await pending;
    assert.equal(store.getSnapshot().status, "disconnected");
    assert.equal(store.getSnapshot().account, null);
    assert.equal(setup.listeners.size, 0);
  }
});

test("failed wallet switching retains the previous real connection and successful switching drops old listeners", async () => {
  const first = fixture(), failure = fixture({ connect: async () => { throw new Error("Rejected"); } }), second = fixture({ accounts: [accountB] });
  const store = createWalletConnection();
  await store.connect(first.wallet);
  await store.connect(failure.wallet);
  assert.equal(store.getSnapshot().wallet, first.wallet);
  assert.equal(store.getSnapshot().status, "connected");
  assert.equal(first.listeners.size, 1);
  await store.connect(second.wallet);
  assert.equal(store.getSnapshot().account, accountB);
  assert.equal(first.listeners.size, 0);
  assert.equal(second.listeners.size, 1);
  store.walletUnavailable(second.wallet);
  assert.equal(store.getSnapshot().status, "disconnected");
  assert.equal(second.listeners.size, 0);
});

test("RPC parsing accepts real zero but refuses absent, negative or unsafe-precision balances", () => {
  const rpc = (value, slot = 42) => ({ jsonrpc: "2.0", result: { value, context: { slot } }, id: "balance" });
  assert.deepEqual(parseBalanceRpc(rpc(0)), { lamports: 0, contextSlot: 42 });
  assert.deepEqual(parseBalanceRpc(rpc(1234567890)), { lamports: 1234567890, contextSlot: 42 });
  for (const value of [null, -1, .5, "0", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.equal(parseBalanceRpc(rpc(value)), null);
  assert.equal(parseBalanceRpc(rpc(0, -1)), null);
  assert.equal(parseBalanceRpc({ error: { code: -32000 }, result: { value: 0, context: { slot: 42 } } }), null);
  assert.equal(parseBalanceRpc({}), null);
});
