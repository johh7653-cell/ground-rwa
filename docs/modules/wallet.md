<p align="center"><img src="../github/assets/ground-mark.png" alt="GROUND" width="64" /></p>

# ground-wallet

**Connect your public account.**

[GROUND](../../README.md) · [Workspace](workspace.md) · [Catalogue](catalogue.md) · [Markets](market.md) · [Wallet](wallet.md) · [API](interface.md) · [Canon](canon.md)

---

Compatible Solana wallets connect through Wallet Standard. GROUND reads the selected public account and queries its native SOL balance on mainnet.

## The connection lifecycle

| Event | Behavior |
| --- | --- |
| Connect | Ask the selected wallet to expose its authorized public accounts |
| Account change | Update the selected account and balance |
| Lost authorization | Return to a disconnected state |
| Disconnect | Request disconnection and clear the session view |
| No detected wallet | Show supported-wallet installation links |
| Balance | Read actual lamports from mainnet RPC, with a 15-second cache and observation time |

Wallet sessions and addresses are not written into allocation files. The implementation contains no transaction-signing or submission calls; connecting does not enable buying.

## Inspect the implementation

[Integration specification](../wallet-integration.md) · [Wallet contract](../../src/lib/wallet.ts) · [Wallet provider](../../src/components/WalletProvider.tsx) · [Balance endpoint](../../src/app/api/wallet/balance/route.ts)
