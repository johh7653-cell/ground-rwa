<p align="center"><img src="../github/assets/ground-mark.png" alt="GROUND" width="64" /></p>

# ground-interface

**A public interface to the same records.**

[GROUND](../../README.md) · [Workspace](workspace.md) · [Catalogue](catalogue.md) · [Markets](market.md) · [Wallet](wallet.md) · [API](interface.md) · [Canon](canon.md)

---

The website and public endpoints share the preserved catalogue and market-reference layer. The endpoints below are implemented read-only interfaces.

## Endpoints

| Endpoint | Result |
| --- | --- |
| `GET /api/catalogue` | Complete dated source archive |
| `GET /api/assets` | Search, filters and pagination |
| `GET /api/assets/[slug]` | One asset’s full saved record |
| `GET /api/issuers` | Issuers and archive counts |
| `GET /api/sources` | Provenance and coverage |
| `GET /api/quotes?slugs=spyx,nvdax` | Indexed market references for up to 24 known assets |
| `GET /api/wallet/balance?address=...` | Public mainnet native SOL balance |

Asset and quote requests validate their inputs. Market lookups use catalogue identity rather than accepting arbitrary upstream URLs. Errors and unavailable states are part of the contract.

## Inspect the implementation

[Complete API reference](../API.md) · [Endpoint source](../../src/app/api) · [Production verification](../../scripts/verify-catalogue-api.mjs) · [Architecture](../ARCHITECTURE.md)
