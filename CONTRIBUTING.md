# Contributing to GROUND

GROUND is a black-and-green RWA research site built with Next.js App Router, React and TypeScript. The complete saved directory contains 1,936 asset records, 50 issuers, 16 categories and 16 supported networks. Wallet connection and native SOL balance reads are available; Trade shows price references and sample quantities. No signing, order submission or trade execution is implemented.

## Local setup

Use Node.js 22 or later and npm. CI checks the latest Node 22 and Node 24 releases.

```sh
npm ci
npm run dev
```

The development site runs at `http://127.0.0.1:4345`. Read [AGENTS.md](AGENTS.md) before editing and use the documentation bundled with the installed Next.js version when working on framework APIs.

No environment file is required for catalogue discovery, planning, watchlists or the saved APIs. For an optional Solana mainnet RPC override, copy `.env.example` to `.env.local` and set `SOLANA_RPC_URL`. This variable is server-only. Custom HTTPS RPCs must support JSON-RPC batches and pass the implemented mainnet genesis check. Keep real provider URLs containing credentials in local environment files or deployment secrets. The CI archive verification does not call a wallet or external quote provider.

## Checks

Before opening a pull request, run:

```sh
npm run check
npm test
node scripts/verify-production.mjs 4351
```

`check` runs lint, TypeScript checking and a production build. `test` runs the unit tests under `src/lib`. The production verifier starts that build on the selected local port, waits up to 30 seconds for the saved API, runs `scripts/verify-catalogue-api.mjs`, and stops its own server on success or failure. It refuses to reuse or stop a server already occupying the port. Its default port is 4345; using 4351 keeps a development server on 4345 separate.

The API verification checks every paginated archive record against the local JSON, plus category/source/issuer filters, representative details, exact counts, null values, pagination errors, download headers and the distinction between observed and supported networks. To verify an already running server instead, run `node scripts/verify-catalogue-api.mjs http://127.0.0.1:4345`.

GitHub Actions runs `npm ci`, `npm run check`, `npm test` and the production verifier for pushes, pull requests and manual runs. Action revisions are pinned to commits from the official [actions/checkout](https://github.com/actions/checkout) and [actions/setup-node](https://github.com/actions/setup-node) repositories. CI does not publish the application.

For interface changes, check a narrow mobile viewport and a desktop viewport. Exercise keyboard focus, filtering, pagination, list/grid views, copied filter URLs and browser back/forward. For watchlist or workspace changes, check refresh persistence, storage denied/corrupt states and cross-tab updates without discarding unknown saved references. Actual wallet connection approval needs a compatible browser wallet; unit fixtures are not real wallet sessions.

## Preserve data meaning

- `src/data/catalogue.json` is the supplied 23 September 2026 archive. Keep all 1,936 records and their original fields unless a documented data change is intentional. Record import and audit changes in `docs/original-data-audit.md`.
- Keep unknown values as `null` or unavailable. The archive is not a live feed. Separately fetched DEX Screener references retain their provider and observation time and do not replace saved observations.
- An asset's `chain` is its recorded quote network. Its `chains` list describes saved supported deployments. A deployment entry does not supply a price or executable route on that chain.
- Metal prices marked `perOz` are per troy ounce; quantity tools convert them to grams. Display reference units, particularly xStocks, are not raw wallet token quantities.
- Preserve third-party asset addresses, issuer/source links, identity images and their provenance. Add project channels through `src/lib/project.ts`; do not restore the original project's CA, social links or purchase/bridge redirects.
- GROUND discovery and planning do not create ownership or redemption rights. Do not describe a GROUND token as backed by the catalogue or present sample baskets as executed portfolios.
- Wallet operations remain read-only after user-initiated connection. A future trading integration needs its own reviewed implementation, executable routes, token-unit handling, simulation and explicit transaction approval. Connecting a wallet currently does not enable buying.

## Pull requests

Describe the concrete behavior changed, the reason and the checks you ran. Include a small-screen screenshot when layout changes and explain any data or API compatibility change. Keep changes focused and retain the existing simple black-and-green visual direction.

Commit the lockfile when dependencies change. Keep `node_modules`, build output, real `.env` files, personal planning exports and credentials out of commits. The archive's MIT licence is retained in `LICENSE`; issuer product names and identity images do not imply affiliation.
