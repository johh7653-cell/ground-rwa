# GROUND roadmap

This roadmap records implemented work separately from proposed integrations. It does not assign unapproved launch dates, token supply or economic terms.

## Available in this repository

- Full 1,936-asset archive, 50 issuers, 16 categories and every asset detail.
- Source provenance, original asset identity media, historical market fields and probe curves.
- Search, list/grid views, filters, pagination and shareable URLs with browser-history restoration.
- Local watchlist, category Blueprint, asset Basket, archived comparisons and random discovery.
- Plan validation, local saving, JSON export/copy/import and explicit removal controls.
- Wallet Standard public-account connection, account changes, disconnect and mainnet SOL balance.
- Independently fetched market references, timeouts, source links, cache and missing-data states.
- Solana Trade preview with sample amount and indicative units; execution disabled.
- Implemented public APIs, tests, production verification and GitHub CI.

## Repository and owner

The owner account is [johh7653-cell](https://github.com/johh7653-cell). The public source repository is [johh7653-cell/ground-rwa](https://github.com/johh7653-cell/ground-rwa), containing the application, catalogue, identity media, documentation and CI configuration. Hosted check results are recorded in [GitHub Actions](https://github.com/johh7653-cell/ground-rwa/actions); local verification does not establish the result of a hosted run.

## Next: website publishing and project channels

The website domain, X URL and Solana contract address remain undecided. Publish the reviewed application to the owner's chosen hosting destination and configure those channels when supplied. The GitHub channel uses the actual source repository; other empty project channels remain hidden. The repository's CI checks code and archive APIs but does not deploy the website.

## Next: real buy execution

Choose an execution provider and establish which products/routes are actually supported. Obtain executable quotes, token decimals and display conversion, route identity, slippage limits, fee breakdown and minimum received amount. Simulate the proposed transaction and request explicit wallet approval before submission.

Completion means a real supported route can be quoted, simulated, authorized, submitted and checked for confirmation; rejection and failures must remain visible. Enabling a cosmetic button is not this milestone.

## Later: reproducible market measurements

If active probing is required, add a separate block-aware quote/probe service. Publish its algorithm version, addresses, route, slot/time, order sizes and measurement basis. Never overwrite the historical archive's marks with an unrelated current price lookup.

## Later: fill verification

Once genuine execution exists, associate quotes with actual transactions and publish quoted-versus-realized differences, including failed records and the measurement method. There is currently no executed-trade scoreboard, routing-revenue total or buyback/burn service.

## Optional: cross-device plans

If the owner requests account-backed synchronization, define identity, storage and restore behavior. Current watchlists and plans remain useful without requiring an account or wallet.
