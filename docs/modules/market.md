<p align="center"><img src="../github/assets/ground-mark.png" alt="GROUND" width="64" /></p>

# ground-market

**A price needs context.**

[GROUND](../../README.md) · [Workspace](workspace.md) · [Catalogue](catalogue.md) · [Markets](market.md) · [Wallet](wallet.md) · [API](interface.md) · [Canon](canon.md)

---

GROUND separates saved market observations from independently fetched current references. Archive marks and curves keep their dates; a fresh lookup never rewrites those historical measurements.

## Reference handling

| Check | Behavior |
| --- | --- |
| Asset identity | Server requests use catalogue addresses, with exact base-token and network matching |
| Venue selection | Matching indexed pairs are ranked by available liquidity |
| Time | References carry fetch time, venue and pair source |
| Cache | Current references use a 30-second cache |
| Failure | Missing addresses, unmatched markets and provider failures stay unavailable |
| Units | USD quantity references and metal conversions are explicit; raw wallet token units are not assumed |

Current indexed prices are not executable quotes. Historical five-point probes do not represent an active live probe service.

## Inspect the implementation

[Market service](../../src/lib/live-market-server.ts) · [Market matching](../../src/lib/live-market.ts) · [Quote endpoint](../../src/app/api/quotes/route.ts) · [Calculation method](../METHOD.md) · [Trade component](../../src/components/TradeTool.tsx)
