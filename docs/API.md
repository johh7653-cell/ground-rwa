# GROUND read-only API

This document describes the routes implemented in `src/app/api`. All endpoints below implement `GET` and return JSON. They do not require an application account or wallet connection. No order, signing, redemption or transaction-submission endpoint is implemented.

The development and production scripts listen at `http://127.0.0.1:4345`. Start the application before running the examples. The examples only read data; the market and balance routes may make read-only requests to their upstream providers.

| Endpoint | Purpose | Explicit cache policy |
| --- | --- | --- |
| `/api/catalogue` | Complete saved catalogue | `public, max-age=3600` |
| `/api/assets` | Filtered, paginated saved records | No custom cache header |
| `/api/assets/[slug]` | One complete saved record | No custom cache header |
| `/api/issuers` | Saved issuer directory | No custom cache header |
| `/api/sources` | Price-source groups and counts | No custom cache header |
| `/api/quotes` | Fetched DEX Screener market references | HTTP `no-store`; server cache up to 30 seconds |
| `/api/wallet/balance` | Native SOL balance on mainnet | `private, max-age=15`; server cache up to 15 seconds |

Response contracts below use TypeScript notation. They describe field types, not sample live prices or balances. For implementation types, see [catalogue.ts](../src/lib/catalogue.ts), [live-market.ts](../src/lib/live-market.ts) and [wallet.ts](../src/lib/wallet.ts).

## Saved data semantics

The bundled snapshot is dated `2026-09-23T13:00:28.464Z`, with a separate global probe time of `2026-09-23T13:02:53.192Z`. It contains 1,936 unique asset slugs, 50 issuers, 16 categories and 16 networks. Of those assets, 1,008 have saved prices and 928 have no saved price. Eighty records have saved probe/curve data.

`chain` identifies the network of the saved observation. `chains` lists recorded supported deployments. Filtering the asset API by `network=solana` matches `chain`, producing 1,042 records; 1,048 records have Solana somewhere in `chains`. USDY retains its Ethereum observation even though its supported deployments include Solana.

Missing values remain `null`; optional fields may be absent. A missing price is not zero. A saved issuer product price or NAV is not a secondary-market execution quote. Some saved `pairUrl` values index a token rather than an established trading pair. `OPEN`, `THIN`, `WATCH`, route counts and probe sizes are historical classifications, not current safety or exit-liquidity guarantees.

`curve[].impact` is a ratio: `0.02` means 2%. When `perOz` is true, saved `priceUsd` is per troy ounce. The planning tools divide that price by `31.1034768` to calculate gram-equivalent quantities where appropriate; the raw API does not rewrite it. Quantities calculated from these references are not wallet token balances.

## GET /api/catalogue

Returns the complete bundled JSON, including all asset fields and nulls. The only special parameter is `download=1`, which adds:

```text
Content-Disposition: attachment; filename=ground-catalogue-2026-09-23.json
```

Response shape:

```ts
{
  snapshotAt: string;
  probedAt: string;
  rule: {
    impactCap: number;
    openMinUsd: number;
    thinMinReservesUsd: number;
    quoteReserves: string;
    ladder: number[];
    engineVersion: string;
    method: string;
    measuredAssets: number;
  };
  stats: {
    assets: number;
    issuers: number;
    networks: number;
    open: number;
    thin: number;
    watch: number;
  };
  categories: { id: string; label: string; count: number }[];
  issuers: ArchivedIssuer[];
  networks: string[];
  assets: ArchivedAsset[];
}
```

The current `stats` values are `assets: 1936`, `issuers: 50`, `networks: 16`, `open: 59`, `thin: 88`, `watch: 1789`. Category count comes from `categories.length`, not an extra `stats.categories` field. The saved rule text describes how the original observations were made; requesting this endpoint does not run those probes.

```sh
curl -sS 'http://127.0.0.1:4345/api/catalogue'
curl -sS -D - -o /dev/null 'http://127.0.0.1:4345/api/catalogue?download=1'
```

## GET /api/assets

Filters the saved catalogue and returns a page in original catalogue order.

| Parameter | Default | Behavior |
| --- | --- | --- |
| `q` | Empty | Trimmed, case-insensitive substring search across name, symbol, issuer and slug |
| `category` | All | Exact category ID; `all` also removes the filter |
| `network` | All | Exact `chain` value, not membership in `chains`; `all` removes the filter |
| `issuer` | All | Exact, case-sensitive issuer name; `all` removes the filter |
| `source` | All | Exact `priceSource`; `unknown` matches null sources; `all` removes the filter |
| `limit` | `24` | Whole decimal integer from 1 through 100 |
| `offset` | `0` | Whole decimal, non-negative safe integer |

Filters combine with AND. Empty filters behave as all records. An unrecognized filter value returns a successful empty result; it is not a 404. `limit` and `offset` reject signs, decimals, empty strings and unsafe integers. An offset beyond the result count returns an empty `assets` array while retaining `total`.

The page UI has additional coverage, sorting, view and page controls. These are client-page features; the asset API does not implement `coverage`, `sort`, `view` or `page`. Parameters not used by this handler are ignored.

```ts
{
  snapshotAt: string;
  mode: "archive";
  total: number; // count after filters, before pagination
  limit: number;
  offset: number;
  assets: ArchivedAsset[];
}
```

Invalid pagination returns HTTP 400 with `{ error: string }`. The implemented messages are `limit and offset must be whole non-negative numbers` or `limit must be 1–100 and offset must be a safe non-negative integer`.

```sh
curl -sS 'http://127.0.0.1:4345/api/assets?network=solana&limit=24&offset=0'
curl -sS -G 'http://127.0.0.1:4345/api/assets' --data-urlencode 'source=unknown' --data-urlencode 'limit=100'
curl -sS -G 'http://127.0.0.1:4345/api/assets' --data-urlencode 'issuer=RealT' --data-urlencode 'limit=10'
curl -sS -G 'http://127.0.0.1:4345/api/assets' --data-urlencode 'source=issuer price' --data-urlencode 'limit=10'
curl -sS -i 'http://127.0.0.1:4345/api/assets?limit=0'
```

Current useful counts are 1,042 Solana observations, 928 `unknown` price sources and 805 `issuer price` records. `issuer=RealT` returns 806 records because it also includes the RealT Holdings catalogue entry; that count is different from the 805 issuer-priced property records.

Category IDs are `treasuries`, `money-markets`, `bonds`, `equities`, `etfs`, `private-credit`, `private-equity`, `real-estate`, `precious-metals`, `commodities`, `carbon`, `art-collectibles`, `trading-cards`, `royalties`, `trade-finance` and `infrastructure`.

Network IDs are `algorand`, `arbitrum`, `avalanche`, `base`, `bsc`, `celo`, `ethereum`, `gnosis`, `mantle`, `plume`, `polygon`, `robinhood`, `solana`, `stellar`, `sui` and `xdc`. A supported deployment can exist in `chains` even when no row uses that network as its primary `chain`.

## GET /api/assets/[slug]

Looks up the exact saved slug and returns:

```ts
{ snapshotAt: string; mode: "archive"; asset: ArchivedAsset }
```

Unknown slugs return HTTP 404 with `{ "error": "Asset not found" }`.

```sh
curl -sS 'http://127.0.0.1:4345/api/assets/spyx'
curl -sS 'http://127.0.0.1:4345/api/assets/usdy'
curl -sS -i 'http://127.0.0.1:4345/api/assets/ground-api-test-not-a-real-asset'
```

The same `ArchivedAsset` structure is returned by the paginated API and the complete catalogue:

```ts
interface ArchivedAsset {
  slug: string; name: string; symbol: string; issuer: string;
  category: string; backing: string; desc: string;
  unit: string; unitLabel: string; perOz: boolean;
  priceUsd: number | null; priceSource: string | null;
  chain: string | null; chains: string[]; address: string | null;
  pairUrl: string | null; dex: string | null; quote: string | null;
  liquidityUsd: number | null; quoteReservesUsd: number | null;
  fdv: number | null; marketCap: number | null;
  routes: number; imageUrl: string | null;
  stamp: {
    state: "OPEN" | "THIN" | "WATCH";
    cleanToUsd: number | null;
    reason: string;
    quoteReservesUsd?: number;
    method?: string;
    atLeast?: boolean;
    partial?: boolean;
  };
  curve?: { sizeUsd: number; impact: number | null; filled: boolean }[];
  probe?: {
    engine: string; engineVersion: string; coverage: string;
    venue: string | null; hops: number | null;
    blockRef: number | string | null; probedAt: string;
    filledRungs: number; kneeUsd: number; atLeast: boolean;
  };
  holders?: number | null;
  source?: string;
  permalink?: string;
}
```

`source` is an optional discovery/provenance marker, separate from `priceSource`. `imageUrl` is the original saved reference; local UI identity images are resolved separately from the bundled media map.

## GET /api/issuers

Returns `{ snapshotAt: string, mode: "archive", issuers: ArchivedIssuer[] }` with the full 50-record issuer directory:

```ts
interface ArchivedIssuer {
  name: string;
  site: string;
  count: number;
  categories: string[];
  open: number;
}
```

`count` is the number of catalogue records attributed to the issuer. `open` is its saved OPEN classification count, not currently tradable assets or a platform balance.

```sh
curl -sS 'http://127.0.0.1:4345/api/issuers'
```

## GET /api/sources

Returns `{ snapshotAt: string, mode: "archive", sources: SourceGroup[] }`:

```ts
interface SourceGroup {
  id: "dex pair" | "jupiter price" | "issuer price" | "issuer NAV" | "unknown";
  label: string;
  count: number;
  url: string | null;
  description: string;
}
```

These counts are calculated from `priceSource`: 55 `dex pair`, 145 `jupiter price`, 805 `issuer price`, 3 `issuer NAV` and 928 `unknown`, totaling 1,936. They describe saved price coverage, not currently active provider connections.

```sh
curl -sS 'http://127.0.0.1:4345/api/sources'
```

## GET /api/quotes

Accepts exactly one query parameter, `slugs`, containing 1–24 comma-separated catalogue slugs. Each entry is trimmed and must match `[a-z0-9-]+`; the raw value is limited to 2,048 characters. Duplicate slugs are removed after the maximum entry count is checked. Results preserve the resulting input order.

Raw addresses, external URLs, repeated `slugs` parameters and additional query keys are not accepted. The route resolves every slug against the bundled catalogue before contacting DEX Screener. One unknown slug rejects the whole request.

```sh
curl -sS 'http://127.0.0.1:4345/api/quotes?slugs=spyx,usdy'
curl -sS -i 'http://127.0.0.1:4345/api/quotes?slugs=spyx&address=anything'
curl -sS -i 'http://127.0.0.1:4345/api/quotes?slugs=ground-api-test-not-a-real-asset'
```

HTTP 200 shape:

```ts
{
  provider: "dexscreener";
  mode: "market-reference";
  requestedAt: string;
  fetchedAt: string | null;
  cacheTtlSeconds: 30;
  quotes: MarketQuote[];
}

interface MarketQuote {
  slug: string; symbol: string; chain: string | null;
  status: "available" | "unavailable" | "unsupported" | "error";
  reason: null | "no_address" | "invalid_address" | "no_matching_pair"
    | "unsupported_network" | "provider_timeout" | "provider_rate_limit"
    | "provider_error" | "invalid_response";
  priceUsd: number | null;
  liquidityUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  dexId: string | null;
  pairAddress: string | null;
  pairUrl: string | null;
  fetchedAt: string | null;
  providerQuoteAt: null;
  error: string | null;
}
```

Always check each quote's `status`. HTTP 200 means the batch was processed, not that every asset has a price. No saved token address, an unsupported network, an unmatched pair or an upstream failure produces an explicit per-asset state with null price fields. The archive is not substituted into an unavailable market quote.

| HTTP status | Error body | Meaning |
| --- | --- | --- |
| 400 | `{ code: "invalid_query", error: string }` | Missing/repeated `slugs` or an additional query key |
| 400 | `{ code: "invalid_slugs", error: string }` | Invalid slug syntax, empty entries, excess length or more than 24 entries |
| 404 | `{ code: "unknown_asset", error: string, unknownSlugs: string[] }` | At least one slug is outside the catalogue |

The server requests `/tokens/v1/{chain}/{addresses}` from `https://api.dexscreener.com`, grouped by recorded network. Enabled provider networks are Solana, Ethereum, Arbitrum, Avalanche, Base, BNB Chain, Celo, Gnosis, Mantle, Polygon, Sui, Plume and XDC. The current adapter does not enable Algorand, Robinhood Chain or Stellar.

Only pairs with the requested token as the base token on its recorded network qualify. Solana token-address matching is case-sensitive. Among matching pairs with a positive finite price, the highest reported liquidity is selected. A pair source URL is returned only when it matches the expected HTTPS DEX Screener chain/pair path.

Upstream requests time out after eight seconds, run at a maximum concurrency of four and reject oversized or invalid provider JSON. The process cache is keyed by network/address and coalesces concurrent requests for the same identity. Its 30-second TTL begins when a batch finishes and also applies to cached error results. Process restarts and development reloads reset that cache.

`requestedAt` describes this request; `fetchedAt` can be earlier because a cached reference was reused. The top-level `fetchedAt` is the latest non-null quote fetch time in the batch. `providerQuoteAt` is always null because the provider's actual quote timestamp is unavailable. The UI marks market references about two minutes old as stale. None of these fields establishes an executable price, trade route, fee quote or future exit capacity.

## GET /api/wallet/balance

Requires an `address` query value containing a valid base58 address that decodes to exactly 32 bytes. This reads a public address; wallet ownership is not proved by this endpoint.

```sh
curl -sS 'http://127.0.0.1:4345/api/wallet/balance?address=So11111111111111111111111111111111111111112'
curl -sS -i 'http://127.0.0.1:4345/api/wallet/balance?address=not-a-solana-address'
```

The first example queries the public wrapped-SOL mint account's native SOL balance. It does not report a user's wrapped-SOL holdings.

```ts
{
  address: string;
  network: "solana:mainnet";
  lamports: number;
  sol: number; // lamports / 1_000_000_000
  contextSlot: number;
  observedAt: string;
  source: "Solana mainnet RPC";
  cached: boolean;
}
```

The default server endpoint is `https://api.mainnet-beta.solana.com`. Optional server-only `SOLANA_RPC_URL` must use HTTPS. A non-default provider must support a JSON-RPC batch containing `getGenesisHash` and `getBalance`; the returned genesis hash must match Solana mainnet. Requests use `confirmed` commitment and an eight-second timeout. RPC URLs and credentials are not exposed in the response.

Only a non-negative safe-integer lamport value and a valid slot are accepted. A successful zero balance is retained as zero; a failed request does not become zero. Successful readings use a bounded process cache of up to 256 identities, with a 15-second TTL and the original reading timestamp. All error responses use `Cache-Control: no-store`; HTTP 503 responses also send `Retry-After: 15`.

| HTTP status | `code` | Meaning |
| --- | --- | --- |
| 400 | `INVALID_ADDRESS` | Missing, malformed or incorrectly sized decoded address |
| 503 | `RPC_CONFIGURATION` | Invalid server RPC URL or non-HTTPS scheme |
| 503 | `RPC_RATE_LIMIT` | Upstream HTTP 429 |
| 503 | `RPC_WRONG_NETWORK` | Configured provider did not prove the expected mainnet genesis |
| 502 | `RPC_NETWORK_UNVERIFIED` | Configured provider did not return the expected batch shape |
| 502 | `RPC_INVALID_RESPONSE` | Missing/invalid balance, slot or unsupported integer precision |
| 502 | `RPC_UNAVAILABLE` | Provider HTTP failure, network failure or unreadable response |
| 504 | `RPC_TIMEOUT` | Timeout or cancelled request |

Errors have `{ error: string, code: string }`. This route reads native SOL only. It does not read token balances, build transactions, authenticate a user, check asset eligibility or reserve funds. See [wallet integration](wallet-integration.md) for connection behavior and official references.

## Verification

With the server running, use:

```sh
node scripts/verify-catalogue-api.mjs
```

The script compares the full HTTP catalogue to the local JSON, checks every asset through pagination, samples detail endpoints across categories, verifies issuer/source counts and tests pagination errors, unknown slugs and download headers. It makes read-only requests. It does not assert that an external market provider will remain available or that a wallet extension is installed.
