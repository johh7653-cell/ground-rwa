# GROUND content contract

The user requested a new RWA narrative for Solana while keeping the reference's simple dark style and broad content. The complete source catalogue is part of the product, not a curated subset.

## Narrative and appearance

Brand: GROUND. Hero: “Your wallet. A real-world side.” Explore real-world asset references and give each part of a sample wallet allocation a purpose. Keep black backgrounds, charcoal panels, gray text and green actions. The new wordmark, composition, copy and planning layer distinguish the site without a large style change.

## Complete content

- Restore all 1,936 original asset records, 50 issuers, 16 categories and 16 supported networks.
- Keep third-party asset addresses, issuer websites, product links, market-source references and original identity images.
- Preserve nullable prices, market fields, quote networks, listed networks, archive marks, curves and probe provenance.
- Home includes the budget comparison, featured research, all-category navigation, category shelves, saved-depth ranking, source groups, issuers and tool links.
- Routes include Trade, Watchlist, Assets, Markets, Issuers, Sources, Stats, Blueprint, Basket, Compare, Discover, Workspace, Docs, Thesis and Approach.
- Eleven assets retain an additional official-product research layer. The full archive remains available regardless of that research layer.

## Data meanings

The snapshot date is 23 September 2026. Prices, liquidity and samples are dated saved observations, not live quotes. `chain` belongs to the saved observation; `chains` describes recorded deployments. Do not relabel an Ethereum or BNB quote as Solana. Missing values remain unavailable.

Source groups: 55 DEX-pair observations, 145 Jupiter price observations, 805 issuer product prices, 3 issuer NAV references and 928 records with no saved price. A token-index link does not establish a pool or trade route. Record descriptions are preserved issuer context, not a new verification of rights.

The archive stores some metal prices per troy ounce and display units in grams. Label these prices `/ troy oz`; quantity tools use 31.1034768 grams per troy ounce. xStock reference quantities do not establish raw wallet balances or apply an unsupplied display multiplier.

Saved OPEN/THIN/WATCH marks and probe observations retain their date and original method. Chart lines connect saved samples; they do not create new quotes. Statistics are computed from archive coverage rather than copied original-project fees, wallets or trading activity.

Saved data APIs use the archive. The complete JSON endpoint preserves its schema; filtered responses identify `mode: archive`. A separate quotes API fetches indexed market prices using saved addresses. It matches the base token on the correct network and never substitutes a quote-token price. Fetch time is not a provider quote time. Unknown markets and failures remain unavailable; Trade uses these as estimates before fees/impact, without execution.

## Tools and project identity

Blueprint computes a category allocation from the entered budget. Basket searches the entire catalogue, accepts exact weights and saves a validated plan locally. Compare calculates price-reference units or uses an exact archived target sample; unmatched samples stay unavailable. Discover draws distinct research records without paid entry, prizes or issuance. Workspace shows actual local plans and supports validated JSON import/export; deleting plans requires a clear in-product confirmation. Watchlist persists device-local asset choices, and catalogue filters survive refresh and history navigation through their URL. Wallet Standard requests access to public Solana accounts, supports wallet/account switching and disconnect, and reads SOL balance separately. It does not sign or submit transactions. Trade provides an asset selector, sample USDC amount, market reference and indicative quantity; buying remains disabled until a genuine execution integration is added.

Remove the original project's CA, name/logo promotion, X/social channels and purchase/bridge redirects. `src/lib/project.ts` now identifies the owner’s GROUND GitHub repository; other project channels remain empty until supplied. Ordinary issuer names, logos and third-party token addresses remain useful catalogue information; they do not imply a GROUND partnership.

No invented wallet connection, executed trade, membership, yield, return, TVL, user count or guarantee. GROUND does not issue these third-party assets, and any future GROUND community token does not grant their ownership or income. Every visible action must do what its label describes.
