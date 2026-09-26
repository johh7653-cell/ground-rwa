# Solana wallet connection

GROUND discovers compatible wallets through `@wallet-standard/app`. It requests `standard:connect` only after a user selects a detected wallet. No signing, transaction submission or automatic connection request is implemented.

`WalletProvider` owns the native dialog and exports `useWallet()`. `WalletButton` can be placed in the header; on screens up to 450 px it is an accessible 44 px icon button. Accounts are filtered to authorized Solana chains, valid base58 addresses with exactly 32 decoded bytes and matching 32-byte public keys. EVM accounts are never selected. Changes and revoked authorization are tracked through `standard:events`; unregistering the wallet clears its connection.

`standard:disconnect` is requested when available. Otherwise the site detaches locally. Wallet permissions remain under wallet control. No wallet selection or address is persisted in local storage.

## Read-only balance

`GET /api/wallet/balance?address=<public-address>` reads native SOL at confirmed commitment. The default endpoint is the official `https://api.mainnet-beta.solana.com`. An optional server-only `SOLANA_RPC_URL` must use HTTPS and support JSON-RPC batches; its `getGenesisHash` result is checked against Solana mainnet before its balance can be displayed. RPC URLs and credentials are never returned to the client.

Requests time out after eight seconds. Successful readings retain their timestamp and slot, with a bounded process cache and private HTTP cache of up to 15 seconds. Missing or invalid addresses return 400. Rate limits, wrong-network endpoints, invalid responses and network failures return explicit errors. A zero balance is displayed only when returned as a valid RPC balance. Token balances, asset eligibility, quotes and purchasing are not connected.

## Sources and verification

- [Wallet discovery API](https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/app/src/wallets.ts)
- [Connect feature](https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/features/src/connect.ts)
- [Account and chain contract](https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/base/src/wallet.ts)
- [Authorization change events](https://github.com/wallet-standard/wallet-standard/blob/master/packages/core/features/src/events.ts)
- [Solana getBalance RPC](https://solana.com/docs/rpc/http/getbalance)
- [Official Phantom download](https://phantom.com/download), [official Solflare download](https://www.solflare.com/download/)

Run `node --experimental-strip-types --test src/lib/wallet.test.mjs` for account boundaries and connection lifecycle checks. Fixtures exist only in the tests and are never registered by the application. Actual extension approval must be verified in a browser with the wallet installed; embedded browsers without extensions correctly remain disconnected.
