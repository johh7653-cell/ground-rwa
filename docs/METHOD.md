# GROUND data and calculation method

Version: 1 · 26 September 2026

## The archive is preserved

`src/data/catalogue.json` is the supplied catalogue, unchanged. Its snapshot is `2026-09-23T13:00:28.464Z`; aggregate probing time is `2026-09-23T13:02:53.192Z`. Individual records may carry their own probe time, venue, engine version and block number.

The archive has 1,936 assets, 50 issuers, 16 categories and 16 supported networks. Source groups contain 55 DEX-pair prices, 145 Jupiter prices, 805 issuer product prices, 3 issuer NAV references and 928 records without a saved price. These source types are displayed separately.

The SHA-256 of the imported catalogue is `38260d846d8d00077e3d563106c3facebb13491cc64e8eae1733c1cf34bb6df1`.

## Identity and network

`slug` identifies an entry. `chain` is the network of its recorded market observation; `chains` contains recorded deployments. Filtering by quote network uses `chain`. Discovery's supported-network filter uses `chains`, without relabelling the saved price.

Issuer descriptions are preserved source context. Product and issuer links help the reader inspect the original claims. GROUND does not turn those descriptions into a new backing verification.

## Historical marks and curves

OPEN, THIN and WATCH are inherited historical classifications: 59 OPEN, 88 THIN and 1,789 WATCH records. They are not recalculated from a current market-reference response.

The archived rule includes a 2% impact cap, $1,000 OPEN clean-size threshold and $25,000 thin-reserve threshold. Its reference ladder is $100, $500, $2,000, $10,000 and $50,000. The archived quote-reserve estimate uses liquidity divided by two. Read each record's method and reason: some results are measured, partial or estimated.

Eighty records contain probe data, with 429 saved ladder points. Chart lines connect observations for display. The comparison tool uses an exact saved size only, without creating intermediate fills. Archived `impact` is a ratio: 0.02 displays as 2%.

The application does not reproduce the original routing engine, rerun its five-point probe or certify that a historically OPEN asset is currently tradable.

## Independently fetched market references

`/api/quotes` resolves addresses from catalogue slugs and calls DEX Screener. A usable pair must match the base-token address and network and have a finite positive USD price. Among those pairs, the highest reported liquidity supplies the reference. A matching quote-token address alone is insufficient.

Responses preserve the price, venue, pair link, liquidity, volume, change and actual fetch time. The provider does not supply an observation timestamp for that price, so `providerQuoteAt` remains null. Requests use an 8-second timeout, a 30-second server cache and at most four concurrent upstream requests. The UI labels references older than two minutes stale and provides manual refresh.

Missing addresses, unsupported networks, unmatched pairs and provider failures have explicit statuses. They do not inherit the archive price or become zero. References are not executable orders and include no guaranteed receive amount or fees.

Provider contract: [DEX Screener API](https://docs.dexscreener.com/api/reference).

## Planning quantities

Budget and weight inputs are validated without silently clamping or normalizing invalid values. Saved weights must total 100%. Amounts support whole cents up to $50,000,000; weights use basis points for exact two-decimal percentages.

An indicative quantity is assigned USD divided by the applicable reference unit price. Unknown prices produce an unavailable quantity. For `perOz` metals, a saved price is per troy ounce while tool output is in grams: grams = USD / price-per-ounce × 31.1034768.

xStock display units are reference quantities. An unsupplied display multiplier is not applied, and the result is not a raw mint-token wallet balance. The Trade preview currently supports only primary Solana records and uses USD/USDC reference parity for its sample input; it does not exchange funds.

## Public account balance

Wallet Standard connection authorizes the public Solana account. Valid account addresses must decode to 32 bytes and match their supplied public key. The balance endpoint reads mainnet SOL via `getBalance`, with the context slot and observation time retained. A 15-second cache retains the original read time. Errors stay unavailable; zero is shown only when the RPC returns an actual zero balance.

Plans and watchlists are local browser records, separate from connected accounts. Import validates product/schema, identities, amounts and weights, and replaces only included plans. Failed writes attempt to restore prior records. No signature, transaction, custody or executed holding is inferred from a saved plan.
