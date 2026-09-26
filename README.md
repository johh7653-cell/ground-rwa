# GROUND

**Your wallet. A real-world side.**

GROUND is a Solana-first workspace for understanding tokenized real-world assets. Start with what a product represents, follow its issuer and data sources, and build a plan with your own budget. The interface stays simple and dark while keeping the complete catalogue visible.

This repository contains the working Next.js application, its data layer, public APIs, wallet connection, research tools and documentation.

[GitHub repository](https://github.com/johh7653-cell/ground-rwa) · [Project profile copy](docs/github/PROFILE.md)

![GROUND website](docs/preview-home.png)

## Project map

| Component | Implementation | Purpose |
| --- | --- | --- |
| Website | `src/app`, `src/components` | Asset discovery, issuer/source pages, watchlist, planning tools and Trade preview |
| Catalogue | `src/data`, `src/lib/catalogue.ts` | Complete dated records and original identity media |
| Market references | `src/lib/live-market*.ts` | Validated indexed market data, provenance, timeouts and cache |
| Wallet access | `src/lib/wallet.ts`, `WalletProvider.tsx` | Public Solana accounts and read-only mainnet SOL balance |
| Public API | `src/app/api` | Actual archive, market-reference and balance endpoints |
| Methods & product | `docs` | Thesis, data meanings, API contract, architecture and roadmap |
| Verification | `src/lib/*.test.mjs`, `scripts`, `.github/workflows` | Boundary tests, production checks and continuous integration |

## Read the project

- [Thesis](docs/THESIS.md) — the GROUND narrative.
- [Method](docs/METHOD.md) — historical observations, current references and unit calculations.
- [API](docs/API.md) — implemented endpoints and errors.
- [Architecture](docs/ARCHITECTURE.md) — how the running application fits together.
- [Roadmap](docs/ROADMAP.md) — completed work and future execution milestones.
- [Verification](docs/VERIFICATION.md) — checks and practical limits.
- [GitHub profile copy](docs/github/PROFILE.md) — account/organization introduction ready to adapt.
- [GitHub publishing notes](docs/github/README.md) — prepared materials and publication setup.
- [Contributing](CONTRIBUTING.md) — development and review workflow.

## Run locally

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4345. For a production build, run `npm run build` followed by `npm start`.

## Included

- All 1,936 asset records, 50 issuers, 16 categories and 16 supported networks, preserved from the archive.
- Search, pagination, list/grid views, category/network/issuer/source/coverage filters, shareable filter URLs, and a persistent device-local watchlist.
- Every asset detail, with saved backing descriptions, addresses, source links, market fields, archive marks and available probe curves.
- Original asset and issuer identity images, copied locally through the archive's media map.
- Home category shelves, historical liquidity ranking, source counts, issuer links and a sample-budget calculator.
- Markets, issuers, data sources and archive coverage/statistics pages.
- Blueprint, full-catalogue baskets, random discovery, saved-price/sample comparisons and a device-local workspace with validated JSON plan import/export.
- Wallet Standard connection, account selection/disconnection and read-only Solana mainnet SOL balance.
- Solana Trade preview with actual DEX Screener market references; buy execution is deliberately disabled until the user connects their own service.
- Documentation, the GROUND thesis, complete JSON download and working read-only data APIs.

The catalogue is dated 23 September 2026. It is a saved archive. Separately fetched DEX Screener references are labelled with their actual fetch time and provenance; they do not replace historical observations. A record's `chain` is its observed quote network; `chains` lists saved supported deployments. Unknown prices stay null. Metal prices marked `perOz` remain labelled per troy ounce, while quantity tools convert them to grams. Displayed xStock reference quantities are not raw wallet token balances.

Eleven references additionally retain researched product-rights descriptions for the Blueprint and featured cards. These do not limit the full directory. USDY and XAUm have no saved Solana quote in that layer; their original Ethereum/BNB historical records remain available separately.

The site connects compatible Solana wallets to their public accounts and reads SOL balances. It does not request signatures, execute trades, issue assets or claim that a GROUND token owns the listed assets. Platform trades, fees and user counts from the original project's hardcoded statistics were not reused as GROUND statistics.

## Data APIs

`/api/catalogue`, `/api/assets`, `/api/assets/[slug]`, `/api/issuers`, `/api/sources` serve the saved archive. The assets endpoint supports `q`, `category`, `network`, `issuer`, `source`, `limit` (1–100) and `offset`. See `/docs/` for the fields and methods.

`/api/quotes?slugs=spyx,nvdax` fetches indexed market references for up to 24 catalogue assets. Server requests use catalogue addresses, match the base token and network, and cache for 30 seconds. No matching market, missing address and provider failures stay unavailable. These are not executable quotes.

`/api/wallet/balance?address=...` reads the public mainnet SOL balance, caching for 15 seconds with its original observation time. The optional server-only `SOLANA_RPC_URL` must resolve to Solana mainnet. See `/docs/` for usage.

Wallet connection needs a compatible wallet in the browser. The embedded preview displays installation links if no wallet is detected. Wallet sessions and addresses are not stored in planning files.

## Connect buying later

Trade currently calculates price-reference quantities from USD sample amounts, with a future slippage preference. A production execution integration must obtain executable routes and fees, apply token decimals/display multipliers, simulate and request an explicit wallet transaction. No transaction-signing or order-submission implementation is present; connecting a wallet does not enable buying.

## Add your own project channels

`src/lib/project.ts` points to this project’s GitHub repository. Add your own Solana contract address, X, explorer and purchase URLs when ready. Empty fields are hidden. The original project's CA, social channels and purchase/bridge redirects are removed; third-party asset addresses and issuer research links are retained.

## Check

```sh
npm run check
npm test
node scripts/verify-catalogue-api.mjs
# Or launch a separate production server, verify it, and cleanly stop it:
node scripts/verify-production.mjs 4351
```

The catalogue API command needs the app running on port 4345. An optional first argument overrides the base URL. The production wrapper requires a completed build and uses an isolated port; it refuses to take over an occupied port. GitHub Actions runs the checks on Node.js 22 and 24 for pushes and pull requests. The workflow does not deploy the website.

Design rules, source auditing and verification evidence are in `docs`. The downloaded ZIP remains unchanged. Its MIT licence is retained in `LICENSE`. Product names and logos identify their respective issuers and do not imply a partnership.
