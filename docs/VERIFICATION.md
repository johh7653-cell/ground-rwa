# Verification — 26 September 2026

## Automated checks

`npm run check` passed: ESLint across the source, strict TypeScript, and an optimized Next.js 16.3.5 production build. Static pages and the eleven research-enriched detail paths are prebuilt; other catalogue details are available dynamically, rather than limited to those eleven paths.

`npm test` passed **52 tests** across allocation, catalogue tools, URL filters, watchlist storage/recovery, market matching/cache/concurrency, plan import/rollback and Wallet Standard connection behavior. Node.js 22 prints an informational module-type warning; all tests pass.

Against the production application, `scripts/verify-catalogue-api.mjs` passed **83 actual HTTP requests**. Every paginated record matched the original archive; 23 detail samples, filters, errors, issuer/source counts and JSON download headers were checked. Counts are 1,936 assets, 50 issuers, 16 categories and 16 networks, with 1,042 primary Solana records and 928 unknown saved prices.

The imported catalogue SHA-256 remains `38260d846d8d00077e3d563106c3facebb13491cc64e8eae1733c1cf34bb6df1`. Original identity media are locally mapped to the complete directory.

The isolated production verification wrapper passed the same API checks on port 4351 and closed its own process afterward. An occupied-port check refused to take over another server. The GitHub Actions workflow checks Node.js 22 and 24. Hosted results are recorded in the repository’s [Actions page](https://github.com/johh7653-cell/ground-rwa/actions); the local results above are independent of any hosted run.

## Actual provider requests

Production `/api/quotes` returned available references for SPYx and NVDAx, with correct Solana addresses, venue, pair links and fetched timestamps. A missing-address OUSG request independently returned unavailable with a null price; it did not reuse another asset or chain's quote. Cache behavior and 400/404 boundaries were verified.

Production `/api/wallet/balance` read the public wrapped-SOL address from the official Solana mainnet RPC and returned its actual lamports, context slot and observation time. Invalid addresses returned 400. The balance integration preserves real zero, rejects invalid precision/missing fields and keeps the original observation time in cache.

## Browser verification

The Codex browser was used against the implemented app and then its production build:

- Complete directory: default Solana 1,042, clear filters 1,936, all-network pagination 81 pages, list/grid views, unmatched searches and issuer/category/source/coverage controls.
- Generic asset details, original local logos, saved source fields, historical marks and curves, plus eleven official-product research descriptions.
- Sources, market/category pages, computed archive statistics and issuer search links.
- Watchlist save/remove, refresh persistence and bidirectional updates between two real tabs.
- Filter copying to the browser clipboard, refresh restoration, back/forward navigation and pagination in the URL.
- Basket unknown-price state, exact weight validation, remove/rebalance, local save and restore; discovery returns distinct category/network references and adds them to the basket.
- Comparisons use only exact archived sizes: a matched $500 rung returns saved output; $501 stays unavailable. Missing-price targets remain unavailable.
- Workspace displays actual local plans; removal asks for an explicit confirmation and can be cancelled. Plan JSON copy was read back, invalid pasted JSON disabled import, valid JSON showed amounts before import, and importing the same export succeeded with records retained.
- Trade loaded an actual market reference, updated indicative quantities for sample amounts, rejected fractional-cent amounts and showed an unavailable price for a saved record without an address.
- Trade deep links initialized the requested Solana asset and amount. Asset switching cleared all prior price/source/venue fields before loading the next reference.
- Asset details fetched market data through their manual action and linked into Trade.
- Wallet selection opens a real dialog. With no extension in the embedded browser it shows an honest disconnected state and official wallet links. Escape and Close dismiss the dialog; focus returns to its opening button.
- Phone checks at 320px: Trade and wallet dialog fit, the asset table scrolls within its own container, and the page itself does not overflow. Navigation works at phone/tablet widths; desktop navigation fits at 1024px.

Allocation saving boundaries, equal weights, keyboard sliders and restore behavior were also verified during the earlier planner checks. The current build preserves the planner implementation and its tests.

The production navigation produced no application console errors. Earlier development Fast Refresh warnings are retained in the browser's log history and are not production exceptions.

## Practical limits

An actual wallet-extension authorization was not available in the embedded browser. The real standard connection implementation has contract/transition tests, including rejection, account changes, lost authorization, disconnect errors, wallet removal and late requests; signing and sending calls remain zero. An owner/user should connect in a browser with their compatible wallet installed.

The file export button requested a download, but the embedded browser did not return a completed download event. Clipboard export and pasted-plan validation/import were verified; a completed native file-picker import/download was not claimed. Storage-denial/corruption and failed-write rollback were tested at the storage layer, without deliberately corrupting user browser records.

No buy service, transaction execution, live five-point probe, executed-trade scoreboard or burn service exists. Buying remains disabled as requested. Original project CA, social and purchase/bridge promotion are absent; legitimate third-party issuer/token information remains in the full catalogue. The owner’s GitHub repository is configured in `src/lib/project.ts`; X temporarily points to the platform homepage at the owner's request. CA, explorer and buy links remain empty.

## Brand and GitHub presentation update

The owner-supplied 512px PNG is preserved byte-for-byte in the website logo, site/Apple icons and GitHub brand mark (SHA-256 `3fcc265cb28537a7c5d64f95a8dbdd9f7d961d3f722d1033e25e543d136efc04`). Production browser checks confirmed a loaded 29px desktop navigation logo, 24px mobile logo at 320px without horizontal overflow, and a loaded 24px footer logo. The production document points to the new PNG site and Apple icons.

The repository README has a brand cover, six real component reading paths, product screenshots and a concise current-stage description. Developer details are retained in `docs/DEVELOPMENT.md`. The owner-requested account profile is published at [johh7653-cell](https://github.com/johh7653-cell), with its README and original logo in the account’s same-name repository.

## Header links and CA placement update

`npm run check` passed after adding the project links and shared contract display. Production browser verification confirmed X opens `https://x.com/` and GitHub opens the project repository in separate tabs. Desktop navigation fits at 1001px; the 320px mobile menu contains both links without horizontal overflow. Both external links have `noopener noreferrer`.

The homepage hero shows `Solana CA: TBA` above its primary actions, fully inside the first viewport on desktop and mobile. The footer repeats the same display. No contract copy button exists while the real address configuration is empty; the owner's original project CA has not been restored.
