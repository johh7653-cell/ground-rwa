<div align="center">

<img src="https://raw.githubusercontent.com/johh7653-cell/ground-rwa/main/docs/github/assets/ground-mark.png" alt="GROUND" width="104" />

# GROUND

### Your wallet. A real-world side.

A Solana-first workspace for the real world behind your tokens.<br />
Explore the asset, follow its sources and build a plan with your own budget.

<a href="https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/wallet.md"><img src="https://img.shields.io/badge/Solana-Wallet_Standard-28c487?style=flat-square&amp;labelColor=101214" alt="Solana · Wallet Standard" /></a>
<a href="https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/catalogue.md"><img src="https://img.shields.io/badge/Catalogue-1%2C936_assets-101214?style=flat-square&amp;labelColor=1d2226" alt="Catalogue · 1,936 assets" /></a>
<a href="https://github.com/johh7653-cell/ground-rwa/actions/workflows/ci.yml"><img src="https://github.com/johh7653-cell/ground-rwa/actions/workflows/ci.yml/badge.svg" alt="Build and tests" /></a>
<a href="https://github.com/johh7653-cell/ground-rwa/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-101214?style=flat-square&amp;labelColor=1d2226" alt="MIT license" /></a>

**[Source](https://github.com/johh7653-cell/ground-rwa)** · **[Thesis](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/THESIS.md)** · **[Method](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/METHOD.md)** · **[API](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/API.md)** · **[Roadmap](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/ROADMAP.md)**

</div>

---

## What is GROUND

A ticker tells you what a token is called. It rarely tells you what sits behind it. GROUND connects tokenized assets to their issuers, source trails and market references, then gives you tools to turn that research into a plan.

Stocks, funds, metals, property and credit belong in the same library. Solana is the starting point, with the wider source archive kept available.

- **The product behind the symbol.** Backing, issuer, addresses and source links stay attached to each record.
- **The complete library.** All 1,936 assets remain visible, including records without a saved price.
- **Time stays visible.** Historical observations and independently fetched market references are separate.
- **Your plan, your budget.** Blueprint and Basket validate allocations and save them on your device.
- **Your public account.** Connect a compatible Solana wallet and read its native SOL balance.

## Core mechanics

| Component | What it does |
| :--- | :--- |
| **Explore** | Search, filter and compare the complete asset directory |
| **Trace** | Read product descriptions, issuer information, source fields and available historical curves |
| **Blueprint** | Allocate a sample budget across real-world asset categories |
| **Basket** | Select specific products, validate weights and save a local plan |
| **Watchlist** | Keep a device-local research list with cross-tab updates |
| **Wallet** | Connect through Wallet Standard and read a public account’s SOL balance |
| **Trade preview** | Inspect current indexed market references and indicative quantities for a chosen amount |

## From discovery to a plan

<img src="https://raw.githubusercontent.com/johh7653-cell/ground-rwa/main/docs/github/assets/architecture.png" alt="Explore → Trace → Plan → Connect → Preview. Buying is not enabled." width="100%" />

Research and planning work without a wallet. Trade is a reference preview; buying and transaction signing are not enabled.

## The GROUND system

The [ground-rwa source repository](https://github.com/johh7653-cell/ground-rwa) contains the working application and six connected components.

| Component | Role | Published material |
| :--- | :--- | :--- |
| [**ground-workspace**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/workspace.md) | Web app | Discovery, details, watchlists, allocation tools and Trade preview |
| [**ground-catalogue**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/catalogue.md) | Source library | Complete dated records, issuer information and original identity media |
| [**ground-market**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/market.md) | Market context | Indexed references, identity matching, cache and historical curves |
| [**ground-wallet**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/wallet.md) | Public account | Wallet connection, account changes and native SOL balance |
| [**ground-interface**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/interface.md) | Public API | Implemented catalogue, asset, issuer, source, reference and balance endpoints |
| [**ground-canon**](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/modules/canon.md) | Published method | Thesis, calculation rules, data provenance, architecture and roadmap |

## The library at a glance

| Coverage | Preserved record |
| :--- | :--- |
| Assets | **1,936** |
| Issuers | **50** |
| Categories | **16** |
| Networks in the source archive | **16** |
| Primary Solana quote-network records | **1,042** |
| Archive date | **23 September 2026** |

Unknown values stay unknown. Metals keep their labelled units. Current market references show their own source and fetch time. [Read the method →](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/METHOD.md)

## Technology

| Layer | Implementation |
| :--- | :--- |
| Web | Next.js 16 · React 19 · TypeScript · CSS Modules |
| Wallet | Solana Wallet Standard · Public account · Mainnet SOL balance |
| Data | Preserved JSON archive · Local identity media · Validated server requests |
| Planning | Device-local storage · Weight validation · JSON import/export |
| Verification | Node.js 22 and 24 · Unit tests · Production archive API checks |

## Roadmap

| Phase | Stage | Scope |
| :--- | :--- | :--- |
| **The library** | Available | Complete catalogue, issuers, sources and historical records |
| **The workspace** | Available | Discovery, watchlists, budget planning and local plan restore |
| **The connection** | Available | Wallet Standard public accounts, SOL balance and market references |
| **The preview** | Available | Solana asset selection, sample amount and indicative units |
| **Execution** | Next integration | Executable routes, fees, token units, simulation and wallet approval |
| **Measurement** | Future | Reproducible live probes and verification of actual fills |

[Read the implementation roadmap →](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/ROADMAP.md)

## Reference links

| Resource | Link |
| :--- | :--- |
| Full application source | [ground-rwa](https://github.com/johh7653-cell/ground-rwa) |
| Project thesis | [The GROUND thesis](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/THESIS.md) |
| Data and calculations | [Published method](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/METHOD.md) |
| Builder interface | [API reference](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/API.md) |
| Verification | [Check record](https://github.com/johh7653-cell/ground-rwa/blob/main/docs/VERIFICATION.md) · [GitHub Actions](https://github.com/johh7653-cell/ground-rwa/actions) |

---

<div align="center">
<sub>GROUND is a project identity. Listed assets retain their own issuers and product structures.<br />
The workspace reads public data and accounts. Buying and transaction signing are not enabled.</sub>
</div>
