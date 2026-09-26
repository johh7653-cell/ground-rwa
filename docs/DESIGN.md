# GROUND design direction

The final user direction is a restrained black website with green actions, close to the reference's simplicity. The earlier light stone and terracotta concepts were rejected and are not implementation references.

Design read: a Solana RWA discovery and allocation-planning website for retail crypto users, with familiar dark financial UI and a new GROUND narrative.

DESIGN_VARIANCE: 4. MOTION_INTENSITY: 3. VISUAL_DENSITY: 7. Native CSS and the existing Lucide icon family; this is a custom visual system, not a claimed third-party design system. Dark-only is intentional because the user explicitly requested the simple black appearance.

## Reference extraction

- Hero: one-line 72px header, two-column 52/48 composition, restrained heading and one actual sample-allocation component. No original category ticker or contract block. A new Wallet Standard button supports public-account connection. The generated glow is omitted to follow the user's explicit simple black preference.
- Asset discovery: four category cards with small glyphs and short sentences. Separate product cards show symbols, issuer, saved/reference status and dated prices. No current-liquidity or safety stamps.
- Blueprint: a flat planner and allocation summary. Budget is user input; four amounts are budget times user weights. Under/over allocation is visible and saving requires a valid total. No asset return assumptions.
- Approach: sparse accordion explaining exposure, issuer backing and eligibility. The footer contains internal navigation and no original project social channels.

## Tokens

- Background #101214; surface #181c1f; elevated surface #1d2226.
- Primary text #f0f2ef; secondary text #a1a9ae; subdued text #8b949b.
- Hairline #2b3337; accent #28c487, with near-black button text.
- Corner radius 10px for cards, 7px for controls. No large wrapper panels or background glow.
- Manrope, self-hosted from Fontsource. Numeric values use tabular figures.
- Container width 1152px. Desktop gutters 40px, mobile 20px. Header height 72px.
- Typography: heading 60px desktop, 38px phone; body 15-16px. Desktop hero has two lines.

## Scope and behavior

Home, the complete 1,936-record directory, all asset details, 16 markets and networks, 50 issuers, source and coverage pages, blueprint, asset basket, comparison, random discovery, device workspace, documentation and thesis. Search, pagination, source/category/issuer/network/coverage filters, local plans and read-only JSON APIs are implemented. Home restores category shelves, original asset identity media, historical ranking, source counts and issuer links. Keep the simple black-green design while restoring information density. Watchlist, URL filters, plan import/export, Wallet Standard connection and Solana Trade preview extend the usable product. Current market references remain separate from dated archive data; actual buying is not integrated.

All original project contract addresses, token branding and project-channel links are absent from the application. Project details are held in one configuration object. The owner’s GitHub repository is configured; other channels remain empty. Official third-party asset information is kept separate.

## Brand logo and GitHub presentation

The owner-supplied orange and grey character PNG is the exact brand mark. Its original pixels are used for navigation, footer, browser/Apple icons, GitHub avatar, account profile and repository cover. The simple black interface and green action palette remain. GitHub uses centered branding, compact status badges, a short thesis and six real component reading paths. Developer detail remains in `docs/DEVELOPMENT.md`; the full source and catalogue are preserved.
